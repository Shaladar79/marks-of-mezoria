// scripts/abilities/special-effects.mjs

function normalizeRankKey(raw) {
  if (raw === null || raw === undefined) return "";
  const s = String(raw).trim().toLowerCase();
  return s;
}

/**
 * Returns rank index using CONFIG.ranks, supporting:
 * - stored string keys ("normal", "quartz")
 * - stored numeric indices ("0", "1")
 */
export function getCharacterRankIndex(actor) {
  const cfg = CONFIG["marks-of-mezoria"] || {};
  const rankOrder = cfg.ranks || [];
  const raw = actor?.system?.details?.rank ?? "";
  const key = normalizeRankKey(raw);

  if (!rankOrder.length || !key) return 0;

  let idx = rankOrder.indexOf(key);
  if (idx === -1 && /^[0-9]+$/.test(key)) {
    const n = parseInt(key, 10);
    if (!Number.isNaN(n) && n >= 0 && n < rankOrder.length) idx = n;
  }

  return Math.max(0, idx);
}

/**
 * Handle “special” abilities that do NOT use the generic roll builder.
 * Returns true if handled (meaning: stop normal roll flow).
 */
export async function handleSpecialAbilityEffect(actor, item) {
  if (!actor || !item) return false;

  const sys     = item.system || {};
  const details = sys.details || {};
  const effect  = details.effect || {};
  const racialKey = details.racialKey || null;

  const cfg = CONFIG["marks-of-mezoria"] || {};
  const rankIndex = getCharacterRankIndex(actor);

  // -------------------------------
  // Versatility (Human)
  // -------------------------------
  if (effect.type === "buff" &&
      effect.appliesTo === "nextTrainedSkill" &&
      racialKey === "human-versatility") {

    const baseBonus    = Number(effect.skillBonusBase ?? 2) || 2;
    const perRankBonus = Number(effect.skillBonusPerRank ?? 1) || 1;
    const bonus = baseBonus + perRankBonus * rankIndex;

    await actor.setFlag("marks-of-mezoria", "versatilityBonus", bonus);
    ui.notifications?.info(`Versatility activated: +${bonus} to your next trained skill roll.`);
    return true;
  }

  // -------------------------------
  // Whisper of the Grove (Sylvan)
  // -------------------------------
  if (effect.type === "buff" &&
      effect.appliesTo === "awareness" &&
      racialKey === "sylvan-whisper-grove") {

    const duration = Number(effect.durationRounds ?? 3) || 3;
    const baseDiameter     = Number(effect.areaDiameterBase ?? 10) || 10;
    const perRankDiameter  = Number(effect.areaDiameterPerRank ?? 5) || 5;
    const diameter = baseDiameter + (perRankDiameter * rankIndex);

    await actor.setFlag("marks-of-mezoria", "whisperOfTheGrove", { remainingRounds: duration, diameter });

    ui.notifications?.info(
      `Whisper of the Grove activated: heightened natural awareness in a ${diameter} ft diameter around you for ${duration} rounds.`
    );
    return true;
  }

  // -------------------------------
  // Call of the Wild (Mythrian) - Group Aura Buff
  // -------------------------------
  if (effect.type === "buff" &&
      effect.appliesTo === "partyAura" &&
      racialKey === "mythrian-call-of-the-wild") {

    const duration = Number(effect.durationRounds ?? 3) || 3;

    const bonusPerRank = Number(effect.bonusPerRank ?? 1) || 1;
    const bonus = bonusPerRank * (rankIndex + 1);

    const tribeKey = String(actor.system?.details?.mythrianTribe ?? "").trim().toLowerCase();

    const tribeToCategory = {
      lion: "feline", tiger: "feline", leopard: "feline", panther: "feline",
      wolf: "lupine", fox: "lupine",
      bear: "ursine", badger: "ursine",
      falcon: "avian", owl: "avian", crow: "avian",
      stag: "cervine", goat: "cervine", bull: "cervine", boar: "cervine",
      serpent: "serpentine", toad: "serpentine", cuttlefish: "serpentine", shark: "serpentine", mantis: "serpentine"
    };

    const tribeCategory = tribeToCategory[tribeKey] ?? "lupine";

    const categoryToSubAttr = {
      feline:     { group: "body", sub: "swiftness", label: "Swiftness" },
      lupine:     { group: "soul", sub: "resolve",   label: "Resolve"   },
      ursine:     { group: "body", sub: "endurance", label: "Endurance" },
      avian:      { group: "mind", sub: "insight",   label: "Insight"   },
      cervine:    { group: "soul", sub: "grace",     label: "Grace"     },
      serpentine: { group: "mind", sub: "focus",     label: "Focus"     }
    };

    const targetAttr = categoryToSubAttr[tribeCategory] ?? categoryToSubAttr.lupine;

    await actor.setFlag("marks-of-mezoria", "callOfTheWild", {
      remainingRounds: duration,
      tribeCategory,
      buff: { group: targetAttr.group, sub: targetAttr.sub, label: targetAttr.label, bonus },
      auraRadiusFt: null
    });

    ui.notifications?.info(
      `Call of the Wild activated: allies near you gain +${bonus} ${targetAttr.label} for ${duration} rounds. ` +
      `(TODO: wire aura radius + Reaction system later)`
    );

    return true;
  }

  // -------------------------------
  // Elemental Bolt (Scion)
  // -------------------------------
  if (effect.type === "damage" &&
      effect.appliesTo === "singleTarget" &&
      racialKey === "scion-elemental-bolt") {

    const targets = Array.from(game.user?.targets ?? []);
    if (targets.length !== 1) {
      ui.notifications?.warn("Elemental Bolt requires exactly 1 targeted token.");
      return true;
    }

    const targetToken = targets[0];
    const targetActor = targetToken?.actor;
    if (!targetActor) {
      ui.notifications?.warn("Target has no actor.");
      return true;
    }

    const baseRange = Number(effect.rangeBase ?? 20) || 20;
    const perRank   = Number(effect.rangePerRank ?? 5) || 5;
    const rangeFt   = baseRange + (perRank * rankIndex);

    const sourceToken = actor.getActiveTokens()?.[0];
    if (!sourceToken) {
      ui.notifications?.warn("You must have an active token to use Elemental Bolt.");
      return true;
    }

    const dist = canvas.grid.measureDistance(sourceToken, targetToken);
    if (dist > rangeFt) {
      ui.notifications?.warn(`Target is out of range (${dist.toFixed(0)}ft > ${rangeFt}ft).`);
      return true;
    }

    const dicePerRank = Number(effect.dicePerRank ?? 1) || 1;
    const dieType     = effect.dieType || "d6";
    const diceCount   = Math.max(1, dicePerRank * (rankIndex + 1));

    const aspectKey  = String(actor.system?.details?.scionAspect ?? "").toLowerCase();
    const damageType = aspectKey || "elemental";

    const roll = new Roll(`${diceCount}${dieType}`);
    await roll.evaluate({ async: true });

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `Elemental Bolt (${damageType}) → ${targetActor.name}`
    });

    return true;
  }

  // -------------------------------
  // Reflection Cloak (Prismatic)
  // -------------------------------
  if (effect.type === "buff" &&
      effect.appliesTo === "magicalDefense" &&
      racialKey === "prismatic-reflection-cloak") {

    const duration     = Number(effect.durationRounds ?? 3) || 3;
    const baseBonus    = Number(effect.baseBonus ?? 2) || 2;
    const perRankBonus = Number(effect.bonusPerRank ?? 1) || 1;
    const bonus = baseBonus + (perRankBonus * rankIndex);

    await actor.setFlag("marks-of-mezoria", "reflectionCloak", { remainingRounds: duration, magicalDefenseBonus: bonus });
    ui.notifications?.info(`Reflection Cloak activated: +${bonus} Magical Defense for ${duration} rounds.`);
    return true;
  }

  // -------------------------------
  // Flame Imbuement (Embergiest)
  // -------------------------------
  if (effect.type === "buff" &&
      effect.appliesTo === "weaponAttacks" &&
      racialKey === "embergiest-flame-imbuement") {

    const duration         = Number(effect.durationRounds ?? 3) || 3;
    const extraDieType     = effect.extraDieType || "d4";
    const extraDicePerRank = Number(effect.extraDicePerRank ?? 1) || 1;

    const extraDice  = Math.max(0, rankIndex) * extraDicePerRank;
    const damageType = effect.damageType || "fire";

    await actor.setFlag("marks-of-mezoria", "flameImbuement", {
      remainingRounds: duration,
      extraDice,
      extraDieType,
      damageType
    });

    const bonusText = extraDice > 0 ? ` and +${extraDice}${extraDieType}` : "";
    ui.notifications?.info(
      `Flame Imbuement activated: your physical weapon attacks deal ${damageType}${bonusText} for the next ${duration} rounds.`
    );

    return true;
  }

  // -------------------------------
  // Pixie Dust (Sprite) - Single Target Daze
  // -------------------------------
  if (effect.type === "debuff" &&
      effect.appliesTo === "daze" &&
      racialKey === "sprite-pixie-dust") {

    const targets = Array.from(game.user?.targets ?? []);
    if (targets.length !== 1) {
      ui.notifications?.warn("Pixie Dust requires exactly 1 targeted token.");
      return true;
    }

    const targetToken = targets[0];
    const targetActor = targetToken?.actor;
    if (!targetActor) {
      ui.notifications?.warn("Target has no actor.");
      return true;
    }

    const baseRange = Number(effect.rangeBase ?? 20) || 20;
    const perRank   = Number(effect.rangePerRank ?? 5) || 5;
    const rangeFt   = baseRange + (perRank * rankIndex);

    const sourceToken = actor.getActiveTokens()?.[0];
    if (!sourceToken) {
      ui.notifications?.warn("You must have an active token to use Pixie Dust.");
      return true;
    }

    const dist = canvas?.grid?.measureDistance(sourceToken, targetToken);
    if (dist == null) {
      ui.notifications?.warn("Could not measure distance to target.");
      return true;
    }
    if (dist > rangeFt) {
      ui.notifications?.warn(`Target is out of range (${dist.toFixed(0)}ft > ${rangeFt}ft).`);
      return true;
    }

    const reactionDropPerRank   = Number(effect.reactionDropPerRank ?? 2) || 2;
    const reactionDropIncrease  = reactionDropPerRank * rankIndex;

    await targetActor.setFlag("marks-of-mezoria", "pixieDustDaze", {
      remainingRounds: 1,
      loseNextAction: !!effect.loseNextAction,
      reactionDropIncrease,
      sourceActorId: actor.id,
      sourceItemId: item.id
    });

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content:
        `<b>Pixie Dust</b> dazes <b>${targetActor.name}</b>.<br>` +
        `They lose their next action.<br>` +
        `Reaction drop increase: <b>+${reactionDropIncrease}</b> (TODO: wire into Reaction system).`
    });

    return true;
  }

  // -------------------------------
  // Chest of the Depths (Anthazoan)
  // -------------------------------
  if (effect.type === "storage" &&
      racialKey === "anthazoan-chest-depths") {

    const baseSlots    = Number(effect.storageBaseSlots ?? 40) || 40;
    const slotsPerRank = Number(effect.storageSlotsPerRank ?? 5) || 5;
    const totalSlots   = baseSlots + (slotsPerRank * rankIndex);

    ui.notifications?.info(`Chest of the Depths opened. Vault capacity: ${totalSlots} item types (no encumbrance).`);
    return true;
  }

  return false; // not handled
}
