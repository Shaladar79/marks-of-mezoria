// scripts/abilities/rolls.mjs

/**
 * Build an ability roll formula based on the ability's effect.roll configuration.
 *
 * RULES:
 * - If details.syncWithRank === true  -> scale by CHARACTER rank (actor.system.details.rank using CONFIG.ranks)
 * - Else                              -> scale by ABILITY rank delta (details.currentRank - details.rankReq using CONFIG.abilityRankOrder)
 * - If rank data is missing/invalid    -> no scaling
 */
export function buildAbilityRollFormula(actor, item) {
  const hasActor = !!actor;

  const cfg     = CONFIG["marks-of-mezoria"] || {};
  const system  = item.system || {};
  const details = system.details || {};
  const effect  = details.effect || {};
  const rollCfg = effect.roll || {};

  const dieType  = rollCfg.dieType || "";
  const diceBase = Number(rollCfg.diceBase) || 0;

  // If no roll-builder is configured, fall back to legacy string fields
  if (!dieType || !diceBase) {
    const legacy = effect.rollFormula || effect.roll || details.effectRoll;
    return legacy || "";
  }

  // ------------------------------------------------------------
  // DICE SCALING
  // ------------------------------------------------------------
  const dicePerRank   = Number(rollCfg.dicePerRank ?? 1) || 1;
  const syncWithRank  = !!details.syncWithRank;

  let extraDice = 0;

  // A) Character-rank scaling (racial/background/rank abilities)
  if (syncWithRank && hasActor) {
    const rankOrder = cfg.ranks || []; // character rank ladder keys
    const rawCharRank = actor.system?.details?.rank ?? "";
    const charRankKey = String(rawCharRank).trim().toLowerCase();

    if (rankOrder.length && charRankKey) {
      let idx = rankOrder.indexOf(charRankKey);

      // If stored as numeric rank index ("0","1"...), support it too
      if (idx === -1 && /^[0-9]+$/.test(charRankKey)) {
        const n = parseInt(charRankKey, 10);
        if (!Number.isNaN(n) && n >= 0 && n < rankOrder.length) idx = n;
      }

      // Normal index 0 => +0, Quartz index 1 => +dicePerRank, etc.
      if (idx >= 0) extraDice = Math.max(0, idx) * dicePerRank;
    }
  }

  // B) Ability-rank delta scaling (mark abilities)
  if (!syncWithRank) {
    const baseRankKey    = details.rankReq || "";
    const currentRankKey = details.currentRank || baseRankKey || "";
    const rankOrder      = cfg.abilityRankOrder || [];

    if (baseRankKey && currentRankKey && rankOrder.length) {
      const baseIdx = rankOrder.indexOf(baseRankKey);
      const curIdx  = rankOrder.indexOf(currentRankKey);

      // Each step beyond base adds dicePerRank dice
      if (baseIdx !== -1 && curIdx !== -1) {
        extraDice = Math.max(0, (curIdx - baseIdx)) * dicePerRank;
      }
    }
  }

  const totalDice = diceBase + extraDice;
  if (totalDice <= 0) return "";

  // ---------- Effect Type -> allowed modifier attribute ----------
  const effectType  = effect.type || details.effectType || "";
  let selectedAttr  = rollCfg.modAttribute || "";

  function normalizeModAttr(effectType, selected) {
    switch (effectType) {
      case "healing":
        return "grace";
      case "shielding":
        return "presence";
      case "damage":
      case "drain":
        if (selected === "might" || selected === "insight") return selected;
        return "might";
      default:
        return selected || "";
    }
  }

  const modAttr = normalizeModAttr(effectType, selectedAttr);

  // ---------- Attribute modifier ----------
  function getAttrMod(attrRoot) {
    if (!hasActor) return 0;
    const attr = foundry.utils.getProperty(actor.system, attrRoot) || {};
    let mod = Number(attr.mod ?? 0);
    if (!mod) mod = Number(attr.total ?? 0);
    return mod || 0;
  }

  let modValue = 0;

  switch (modAttr) {
    // BODY
    case "might":      modValue = getAttrMod("attributes.body.might");      break;
    case "swiftness":  modValue = getAttrMod("attributes.body.swiftness");  break;
    case "endurance":  modValue = getAttrMod("attributes.body.endurance");  break;

    // MIND
    case "insight":    modValue = getAttrMod("attributes.mind.insight");    break;
    case "focus":      modValue = getAttrMod("attributes.mind.focus");      break;
    case "willpower":  modValue = getAttrMod("attributes.mind.willpower");  break;

    // SOUL
    case "presence":   modValue = getAttrMod("attributes.soul.presence");   break;
    case "grace":      modValue = getAttrMod("attributes.soul.grace");      break;
    case "resolve":    modValue = getAttrMod("attributes.soul.resolve");    break;

    default:
      modValue = 0;
  }

  // ---------- Build final formula ----------
  let formula = `${totalDice}${dieType}`;

  if (modAttr) {
    if (modValue >= 0) formula += ` + ${modValue}`;
    else formula += ` - ${Math.abs(modValue)}`;
  }

  return formula;
}

/**
 * Build a weapon damage formula, aware of Embergiest Flame Imbuement.
 * baseDice/baseDieType come from the weapon (e.g. 1 and "d8").
 */
export async function buildWeaponDamageFormula(actor, baseDice, baseDieType, isPhysicalAttack = true) {
  let formula    = `${baseDice}${baseDieType}`;
  let damageType = "physical";

  if (!actor) {
    return { formula, damageType };
  }

  // Check for Embergiest Flame Imbuement buff
  let flame = await actor.getFlag("marks-of-mezoria", "flameImbuement");
  if (flame && isPhysicalAttack) {
    // Convert damage type to fire (or configured type)
    damageType = flame.damageType || "fire";

    const extraDice    = Number(flame.extraDice ?? 0)    || 0;
    const extraDieType =          flame.extraDieType     || "d4";

    if (extraDice > 0) {
      formula += ` + ${extraDice}${extraDieType}`;
    }

    // Tick down remaining rounds
    let remaining = Number(flame.remainingRounds ?? 0) || 0;
    remaining = Math.max(remaining - 1, 0);

    if (remaining <= 0) {
      await actor.unsetFlag("marks-of-mezoria", "flameImbuement");
      ui.notifications?.info("Flame Imbuement has ended.");
    } else {
      flame.remainingRounds = remaining;
      await actor.setFlag("marks-of-mezoria", "flameImbuement", flame);
    }
  }

  return { formula, damageType };
}
