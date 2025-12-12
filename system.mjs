// system.mjs
import { MezoriaConfig } from "./config.mjs";
import { RaceData } from "./scripts/races.mjs";
import { MezoriaActor } from "./scripts/actor.mjs";
import { RaceAbilityPack } from "./scripts/packs/raceabilitypack.mjs";

/* ------------------------------------
 * PC Actor Sheet
 * ----------------------------------*/
class MinimalActorSheet extends ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["marks-of-mezoria", "sheet", "actor"],
      template: "systems/marks-of-mezoria/templates/actor/actor-sheet.hbs",
      width: 600,
      height: 400,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "cinfo"
        },
        {
          navSelector: ".skills-tabs",
          contentSelector: ".skills-panels",
          initial: "skills-body"
        }
      ],
      submitOnChange: true
    });
  }

  async getData(options) {
    const data = await super.getData(options);

    data.system   = this.actor.system;
    data.config   = CONFIG["marks-of-mezoria"];
    data.raceData = RaceData || {};
    data.user     = game.user;

    // Backgrounds
    const bgType = data.system?.details?.backgroundType ?? "";
    const allBackgrounds = MezoriaConfig.backgroundsByType || {};
    let availableBackgrounds = {};
    if (bgType && allBackgrounds[bgType]) {
      availableBackgrounds = allBackgrounds[bgType];
    }
    data.availableBackgrounds = availableBackgrounds;

    // Abilities grouped by sourceType
    const allAbilities = (data.items || []).filter(i => i.type === "ability");
    const grouped = {
      racial:     [],
      rank:       [],
      background: [],
      mark:       [],
      generic:    [],
      other:      []
    };

    for (const ab of allAbilities) {
      const src = ab.system?.details?.sourceType || "generic";
      if (grouped[src]) grouped[src].push(ab);
      else grouped.other.push(ab);
    }

    data.abilities         = allAbilities;
    data.abilitiesBySource = grouped;

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    const actor = this.actor;

    // Save rolls
    html.find(".save-roll").on("click", async (event) => {
      event.preventDefault();
      const btn  = event.currentTarget;
      const attr = btn.dataset.attr;
      if (!attr) return;

      const saveValue =
        foundry.utils.getProperty(actor.system, `attributes.${attr}.saveValue`) ?? 0;

      const roll = new Roll("1d20 + @save", { save: saveValue });
      await roll.evaluate({ async: true });

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: `${attr.charAt(0).toUpperCase() + attr.slice(1)} Save`
      });
    });

    // Generic skill rolls
    html.find(".roll-any").on("click", async (event) => {
      event.preventDefault();
      const btn  = event.currentTarget;
      const path = btn.dataset.path;
      if (!path) return;

      const basePath = `skills.${path}`;
      const total =
        foundry.utils.getProperty(actor.system, `${basePath}.total`) ?? 0;
      const label =
        foundry.utils.getProperty(actor.system, `${basePath}.label`) || "Skill Check";

      let mod = total;

      // Versatility bonus (Human racial ability)
      let versatilityBonus = await actor.getFlag("marks-of-mezoria", "versatilityBonus");
      const isTrained =
        !!foundry.utils.getProperty(actor.system, `${basePath}.trained`);

      if (versatilityBonus && isTrained) {
        versatilityBonus = Number(versatilityBonus) || 0;
        mod += versatilityBonus;

        await actor.unsetFlag("marks-of-mezoria", "versatilityBonus");
        ui.notifications?.info(`Versatility bonus (+${versatilityBonus}) applied to ${label}.`);
      }

      const roll = new Roll("1d20 + @mod", { mod });
      await roll.evaluate({ async: true });

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: label
      });
    });

    // Ability editing
    html.find(".item-edit").on("click", (event) => {
      event.preventDefault();
      const li = event.currentTarget.closest(".ability-item");
      if (!li) return;
      const itemId = li.dataset.itemId;
      if (!itemId) return;

      const item = actor.items.get(itemId);
      if (item) item.sheet.render(true);
    });

    // Ability effect rolls
    html.find(".ability-roll").on("click", async (event) => {
      event.preventDefault();

      const btn = event.currentTarget;
      const itemId = btn.dataset.itemId;
      if (!itemId) return;

      const item = actor.items.get(itemId);
      if (!item) return;

      const sys     = item.system || {};
      const details = sys.details || {};
      const effect  = details.effect || {};
      const costCfg = details.cost || {};

      // -------------------------------
      // 1) Compute effective resource cost
      // -------------------------------
       const costType      = costCfg.type || "";    // "stamina" or "mana"
  const baseCost      = Number(costCfg.value ?? 0) || 0;
  const perRank       = !!costCfg.perRank;
  const extraPerRank  = Number(costCfg.extraPerRank ?? 0) || 0;

  let effectiveCost = baseCost;

  if (perRank || extraPerRank) {
    const cfg       = CONFIG["marks-of-mezoria"] || {};
    const rankOrder = cfg.ranks || [];
    const charRank  = actor.system?.details?.rank || "";
    let rankIndex   = rankOrder.indexOf(charRank);
    if (rankIndex < 0) rankIndex = 0;

    if (perRank) {
      // Normal = index 0 => 1×base, Quartz = index 1 => 2×base, etc.
      effectiveCost = baseCost * (rankIndex + 1);
    } else if (extraPerRank) {
      // Normal = index 0 => baseCost
      // Quartz = index 1 => baseCost + extraPerRank
      effectiveCost = baseCost + (extraPerRank * rankIndex);
    }
  }

      // -------------------------------
      // 2) Deduct resource (stamina/mana)
      // -------------------------------
      if (costType && effectiveCost > 0) {
        let pathCurrent = "";
        if (costType === "stamina") pathCurrent = "status.stamina.current";
        else if (costType === "mana") pathCurrent = "status.mana.current";

        if (pathCurrent) {
          const current = Number(foundry.utils.getProperty(actor.system, pathCurrent) ?? 0);
          if (current < effectiveCost) {
            ui.notifications?.warn(`Not enough ${costType} to use ${item.name}.`);
            return;
          }

          const updateData = {};
          updateData[`system.${pathCurrent}`] = current - effectiveCost;
          await actor.update(updateData);
        }
      }

      // -------------------------------
      // 3) Versatility special activation
      // -------------------------------
      const racialKey = details.racialKey || null;
      if (effect.type === "buff" &&
          effect.appliesTo === "nextTrainedSkill" &&
          racialKey === "human-versatility") {

        const cfg       = CONFIG["marks-of-mezoria"] || {};
        const rankOrder = cfg.ranks || [];
        const charRank  = actor.system?.details?.rank || "";
        let rankIndex   = rankOrder.indexOf(charRank);
        if (rankIndex < 0) rankIndex = 0;

        const baseBonus    = Number(effect.skillBonusBase ?? 2) || 2;
        const perRankBonus = Number(effect.skillBonusPerRank ?? 1) || 1;

        const bonus = baseBonus + perRankBonus * rankIndex;

        await actor.setFlag("marks-of-mezoria", "versatilityBonus", bonus);
        ui.notifications?.info(`Versatility activated: +${bonus} to your next trained skill roll.`);

        return; // No dice roll for Versatility
      }

            // -------------------------------
      // 3b) Flame Imbuement – Embergiest racial buff
      // -------------------------------
      if (effect.type === "buff" &&
          effect.appliesTo === "weaponAttacks" &&
          racialKey === "embergiest-flame-imbuement") {

        const cfg       = CONFIG["marks-of-mezoria"] || {};
        const rankOrder = cfg.ranks || [];
        const charRank  = actor.system?.details?.rank || "";
        let rankIndex   = rankOrder.indexOf(charRank);
        if (rankIndex < 0) rankIndex = 0;

        // At Normal (index 0): conversion only, no bonus dice.
        // Each rank above Normal: +1d4 (or whatever extraDieType is).
        const duration   = Number(effect.durationRounds ?? 3) || 3;
        const extraDieType   = effect.extraDieType || "d4";
        const extraDicePerRank = Number(effect.extraDicePerRank ?? 1) || 1;
        const extraDice   = Math.max(0, rankIndex) * extraDicePerRank;
        const damageType  = effect.damageType || "fire";

        const payload = {
          remainingRounds: duration,
          extraDice,
          extraDieType,
          damageType
        };

        await actor.setFlag("marks-of-mezoria", "flameImbuement", payload);

        const bonusText = extraDice > 0 ? ` and +${extraDice}${extraDieType}` : "";
        ui.notifications?.info(
          `Flame Imbuement activated: your physical weapon attacks deal ${damageType}${bonusText} ` +
          `for the next ${duration} rounds.`
        );

        // No direct roll for this ability – it's a buff.
        return;
      }

       // -------------------------------
      // 3b) Chest of the Depths special activation
      // -------------------------------
      if (effect.type === "storage" &&
          details.racialKey === "anthazoan-chest-depths") {

        const cfg       = CONFIG["marks-of-mezoria"] || {};
        const rankOrder = cfg.ranks || [];
        const charRank  = actor.system?.details?.rank || "";
        let rankIndex   = rankOrder.indexOf(charRank);
        if (rankIndex < 0) rankIndex = 0;

        const baseSlots     = Number(effect.storageBaseSlots ?? 40) || 40;
        const slotsPerRank  = Number(effect.storageSlotsPerRank ?? 5) || 5;
        const totalSlots    = baseSlots + (slotsPerRank * rankIndex);

        // TODO: once-per-day tracking to be wired when we have a day/rest model
        ui.notifications?.info(
          `Chest of the Depths opened. Vault capacity: ${totalSlots} item types (no encumbrance).`
        );

        return; // No dice roll for Chest of the Depths
      }
      
      // -------------------------------
      // 4) Normal ability roll
      // -------------------------------
      const formula = buildAbilityRollFormula(actor, item);
      if (!formula) {
        ui.notifications?.warn("This ability does not have a valid roll configuration.");
        return;
      }

      const roll = new Roll(formula);
      await roll.evaluate({ async: true });

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: `${item.name} Effect`
      });
    });

    // Ability removal
    html.find(".item-delete").on("click", async (event) => {
      event.preventDefault();
      const li = event.currentTarget.closest(".ability-item");
      if (!li) return;
      const itemId = li.dataset.itemId;
      if (!itemId) return;

      await actor.deleteEmbeddedDocuments("Item", [itemId]);
    });
  }

      // Weapon damage rolls (uses Flame Imbuement if active)
    html.find(".weapon-damage-roll").on("click", async (event) => {
      event.preventDefault();
      const btn = event.currentTarget;

      // Read base damage from data attributes on the button
      const baseDice    = Number(btn.dataset.dice   || 1)  || 1;   // e.g. 1
      const baseDieType =          btn.dataset.dietype      || "d8"; // e.g. "d8"
      const label       =          btn.dataset.label        || "Weapon Damage";

      const { formula, damageType } =
        await buildWeaponDamageFormula(actor, baseDice, baseDieType, true);

      const roll = new Roll(formula);
      await roll.evaluate({ async: true });

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: `${label} (${damageType})`
      });
    });

  async _updateObject(event, formData) {
    const expanded = foundry.utils.expandObject(formData);
    await this.object.update(expanded);
  }
}

/* ------------------------------------
 * Ability Item Sheet
 * ----------------------------------*/
class MezoriaAbilitySheet extends ItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["marks-of-mezoria", "sheet", "item", "ability"],
      template: "systems/marks-of-mezoria/templates/items/ability-sheet.hbs",
      width: 600,
      height: 500,
      tabs: [],
      submitOnChange: true
    });
  }

  async getData(options) {
    const data   = await super.getData(options);
    const config = CONFIG["marks-of-mezoria"];

    data.config = config;

    const system = data.item.system || {};
    data.system  = system;

    // Parent actor (if this ability is on a character)
    const actor = data.item.parent ?? null;
    data.actor  = actor || null;

    // ---------------------------------
    // Source Key options based on Source Type
    // ---------------------------------
    const sourceType = system?.details?.sourceType ?? "";
    let sourceKeyOptions = {};

    const races        = (config && config.races)            || {};
    const backgrounds  = (config && config.backgrounds)      || {};
    const markPurposes = (config && config.markOfPurpose)    || {};
    const rankLabels   = (config && config.abilityRanks)     || {};
    const rankOrder    = (config && config.abilityRankOrder) || [];

    if (sourceType === "racial") {
      sourceKeyOptions = races;
    }
    else if (sourceType === "background") {
      sourceKeyOptions = backgrounds;
    }
    else if (sourceType === "mark") {
      sourceKeyOptions = markPurposes;
    }
    else if (sourceType === "rank") {
      const out = {};
      for (const key of rankOrder) {
        out[key] = rankLabels[key] || (key.charAt(0).toUpperCase() + key.slice(1));
      }
      sourceKeyOptions = out;
    }
    else {
      sourceKeyOptions = {};
    }

    data.sourceKeyOptions = sourceKeyOptions;

    // ---------------------------------
    // Filtered mod-attribute options based on Effect Type
    // ---------------------------------
    const allModAttrs = config.abilityModAttributes || {};
    const effectType  = system?.details?.effect?.type ?? "";

    let filtered = allModAttrs;

    if (effectType === "healing") {
      filtered = {};
      if (allModAttrs.grace) filtered.grace = allModAttrs.grace;
    }
    else if (effectType === "shielding") {
      filtered = {};
      if (allModAttrs.presence) filtered.presence = allModAttrs.presence;
    }
    else if (effectType === "damage" || effectType === "drain") {
      filtered = {};
      if (allModAttrs.might)   filtered.might   = allModAttrs.might;
      if (allModAttrs.insight) filtered.insight = allModAttrs.insight;
    }

    data.modAttributeOptions = filtered;

    // ---------------------------------
    // Consolidation / Upgrade Cost
    // ---------------------------------
    const rankCostsCfg = config.abilityRankCosts || {};
    const baseCost     = Number(rankCostsCfg.baseCost ?? 100);
    const costByRank   = rankCostsCfg.costByRank || {};
    const multipliers  = rankCostsCfg.multipliers || {};

    const details        = system.details || {};
    const rankOrderAb    = config.abilityRankOrder || [];
    const baseRankKey    = details.rankReq || "";              // treat min char rank as base
    const currentRankKey = details.currentRank || baseRankKey; // default to base if not set

    let upgradeCost    = null;
    let canConsolidate = false;

    if (rankOrderAb.length && currentRankKey) {
      const curIdx  = rankOrderAb.indexOf(currentRankKey);
      const nextIdx = curIdx + 1;

      if (curIdx !== -1 && nextIdx < rankOrderAb.length) {
        const nextRankKey = rankOrderAb[nextIdx];

        let cost = Number(costByRank[nextRankKey]);
        if (!cost || isNaN(cost)) {
          const mult = Number(multipliers[nextRankKey] ?? 1);
          cost = baseCost * (mult || 1);
        }

        upgradeCost = cost;
      }
    }

    if (upgradeCost != null && actor && actor.system && actor.system.spirit) {
      const currentSpirit = Number(actor.system.spirit.current ?? 0);
      canConsolidate = currentSpirit >= upgradeCost;
    }

    data.upgradeCost    = upgradeCost;
    data.canConsolidate = canConsolidate;

    // If this ability is flagged as non-consolidatable, force-disable
    const noConsolidate = !!details.noConsolidate;
    if (noConsolidate) {
      data.upgradeCost    = null;
      data.canConsolidate = false;
    }

    // ---------------------------------
    // Roll Preview
    // ---------------------------------
    data.rollPreview = "";
    try {
      const formula = buildAbilityRollFormula(actor, data.item);
      if (formula) data.rollPreview = formula;
    } catch (err) {
      console.error("Marks of Mezoria | Roll Preview Error:", err);
      data.rollPreview = "";
    }

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Consolidation button on Ability sheet
    html.find(".consolidate-ability").on("click", async (event) => {
      event.preventDefault();

      const button = event.currentTarget;
      const itemId = button.dataset.itemId || this.item.id;
      const actor  = this.item.parent;

      if (!actor) {
        ui.notifications?.warn("Consolidation requires this ability to be on a character.");
        return;
      }

      const item = actor.items.get(itemId);
      if (!item) return;

      const sys = item.system || {};
      if (sys.details?.noConsolidate) {
        ui.notifications?.warn("This ability ranks up automatically and cannot be consolidated.");
        return;
      }

      const cfg         = CONFIG["marks-of-mezoria"] || {};
      const rankOrder   = cfg.abilityRankOrder || [];
      const details     = sys.details || {};
      const baseRankKey = details.rankReq || "";
      const currentRankKey = details.currentRank || baseRankKey;

      if (!currentRankKey || !rankOrder.length) {
        ui.notifications?.warn("This ability does not have a valid rank configuration.");
        return;
      }

      const curIdx  = rankOrder.indexOf(currentRankKey);
      const nextIdx = curIdx + 1;

      if (curIdx === -1 || nextIdx >= rankOrder.length) {
        ui.notifications?.warn("This ability is already at maximum rank.");
        return;
      }

      const nextRankKey = rankOrder[nextIdx];

      const rankCostsCfg = cfg.abilityRankCosts || {};
      const baseCost     = Number(rankCostsCfg.baseCost ?? 100);
      const costByRank   = rankCostsCfg.costByRank || {};
      const multipliers  = rankCostsCfg.multipliers || {};

      let cost = Number(costByRank[nextRankKey]);
      if (!cost || isNaN(cost)) {
        const mult = Number(multipliers[nextRankKey] ?? 1);
        cost = baseCost * (mult || 1);
      }

      const spiritNode    = actor.system.spirit || {};
      const currentSpirit = Number(spiritNode.current ?? 0);
      const spentSpirit   = Number(spiritNode.spent   ?? 0);

      if (currentSpirit < cost) {
        ui.notifications?.warn("Not enough Spirit to consolidate this ability.");
        return;
      }

      const newSpiritCurrent = currentSpirit - cost;
      const newSpiritSpent   = spentSpirit + cost;

      await actor.update({
        "system.spirit.current": newSpiritCurrent,
        "system.spirit.spent":   newSpiritSpent
      });

      await item.update({
        "system.details.currentRank": nextRankKey
      });

      const rankLabels = cfg.abilityRanks || {};
      const rankLabel  = rankLabels[nextRankKey] || nextRankKey;

      ui.notifications?.info(`Consolidated ${item.name} to ${rankLabel}.`);
    });
  }

  async _updateObject(event, formData) {
    const expanded = foundry.utils.expandObject(formData);
    await this.object.update(expanded);
  }
}

/* ------------------------------------
 * Helper: build ability roll formula
 * ----------------------------------*/
function buildAbilityRollFormula(actor, item) {
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

  /* ------------------------------------
 * Helper: build weapon damage formula (Flame Imbuement aware)
 * ----------------------------------*/
async function buildWeaponDamageFormula(actor, baseDice, baseDieType, isPhysicalAttack = true) {
  // Base formula (weapon’s own damage)
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

  // ---------- Rank scaling: Base vs Current Ability Rank ----------
  const baseRankKey    = details.rankReq || "";          // Min Character Rank as base
  const currentRankKey = details.currentRank || baseRankKey || "";
  const rankOrder      = cfg.abilityRankOrder || [];

  let extraDice = 0;
  if (baseRankKey && currentRankKey && rankOrder.length) {
    const baseIdx = rankOrder.indexOf(baseRankKey);
    const curIdx  = rankOrder.indexOf(currentRankKey);
    if (baseIdx !== -1 && curIdx !== -1) {
      extraDice = Math.max(0, curIdx - baseIdx);
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
    if (!mod) {
      mod = Number(attr.total ?? 0);
    }
    return mod || 0;
  }

  let modValue = 0;

  switch (modAttr) {
    // BODY
    case "might":
      modValue = getAttrMod("attributes.body.might");
      break;
    case "swiftness":
      modValue = getAttrMod("attributes.body.swiftness");
      break;
    case "endurance":
      modValue = getAttrMod("attributes.body.endurance");
      break;

    // MIND
    case "insight":
      modValue = getAttrMod("attributes.mind.insight");
      break;
    case "focus":
      modValue = getAttrMod("attributes.mind.focus");
      break;
    case "willpower":
      modValue = getAttrMod("attributes.mind.willpower");
      break;

    // SOUL
    case "presence":
      modValue = getAttrMod("attributes.soul.presence");
      break;
    case "grace":
      modValue = getAttrMod("attributes.soul.grace");
      break;
    case "resolve":
      modValue = getAttrMod("attributes.soul.resolve");
      break;

    default:
      modValue = 0;
  }

  // ---------- Build final formula ----------
  let formula = `${totalDice}${dieType}`;

  if (modAttr) {
    if (modValue >= 0) {
      formula += ` + ${modValue}`;
    } else {
      formula += ` - ${Math.abs(modValue)}`;
    }
  }

  return formula;
}

/* ------------------------------------
 * Init hook
 * ----------------------------------*/
Hooks.once("init", async () => {
  console.log("Marks of Mezoria | Initializing system");

  CONFIG["marks-of-mezoria"] = MezoriaConfig;
  CONFIG.Actor.documentClass = MezoriaActor;

  await loadTemplates([
    "systems/marks-of-mezoria/templates/actor/actor-sheet.hbs",

    "systems/marks-of-mezoria/templates/actor/parts/header.hbs",

    // Actor dropdowns
    "systems/marks-of-mezoria/templates/actor/parts/drops/racedrop.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/rankdrop.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/backtype.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/backdrop.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/markpurpose.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/tribedrop.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/clandrop.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/aspectdrop.hbs",

    // Ability dropdowns
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-rank.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-rankreq.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-markreq.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-actiontype.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-sourcetype.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-effecttype.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-effectresource.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-damagetype.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-scalingmode.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-roll-dietype.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-roll-dicebase.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-roll-modattribute.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-rank-current.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-sourcekey.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-costtype.hbs",

    // Cinfo
    "systems/marks-of-mezoria/templates/actor/parts/cinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/rankinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/raceinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/backinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/markinfo.hbs",

    // Attributes & Status
    "systems/marks-of-mezoria/templates/actor/parts/astats.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/body.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/mind.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/soul.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/status.hbs",

    // Skills
    "systems/marks-of-mezoria/templates/actor/parts/skills.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/body-might.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/body-swiftness.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/body-endurance.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/mind-insight.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/mind-focus.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/mind-willpower.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/mind-lore.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/soul-presence.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/soul-grace.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/soul-resolve.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/skills-combat.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/skills-lore.hbs",

    // Abilities tab
    "systems/marks-of-mezoria/templates/actor/parts/abilities.hbs",

    // Ability item sheet
    "systems/marks-of-mezoria/templates/items/ability-sheet.hbs"
  ]);

  Actors.registerSheet("marks-of-mezoria", MinimalActorSheet, {
    types: ["pc"],
    makeDefault: true
  });

  Items.registerSheet("marks-of-mezoria", MezoriaAbilitySheet, {
    types: ["ability"],
    makeDefault: true
  });
});

/* ------------------------------------
 * Auto-grant racial abilities & sync rank-tied abilities
 * ----------------------------------*/
Hooks.on("updateActor", async (actor, changed, options, userId) => {
  if (actor.type !== "pc") return;

  const raceChanged = foundry.utils.getProperty(changed, "system.details.race") !== undefined;
  const rankChanged = foundry.utils.getProperty(changed, "system.details.rank") !== undefined;

  if (raceChanged) {
    await MezoriaActor.applyRacialAbilities(actor);
  }

  if (rankChanged) {
    await MezoriaActor.syncAbilityRanksToActor(actor);
  }
});

/* ------------------------------------
 * Ensure racial ability folders + items
 * ------------------------------------*/
Hooks.once("ready", async () => {
  if (!game.user.isGM) return;

  try {
    /**
     * Ensure an Item folder with a given name and parentId exists.
     * parentId is the *folder id* of the parent folder, or null for root.
     */
    async function ensureFolder(name, parentId = null) {
      // Foundry stores parent by "folder" id, not always via .parent
      let folder = game.folders.find(f => {
        if (f.type !== "Item") return false;
        if (f.name !== name) return false;

        // Root folder: no parentId and no f.folder
        if (parentId === null) {
          return !f.folder;
        }

        // Child folder: f.folder must match parentId
        return f.folder === parentId;
      });

      if (!folder) {
        folder = await Folder.create({
          name,
          type: "Item",
          folder: parentId   // parent folder id
        });
      }

      return folder;
    }

    // Folder structure: Actor / Abilities / Racial / <Race>
    const actorFolder     = await ensureFolder("Actor", null);
    const abilitiesFolder = await ensureFolder("Abilities", actorFolder.id);
    const racialFolder    = await ensureFolder("Racial", abilitiesFolder.id);

    const racialData = RaceAbilityPack.racialAbilityData || {};
    const worldItems = game.items.contents;

    for (const [raceKey, defs] of Object.entries(racialData)) {
      if (!Array.isArray(defs) || !defs.length) continue;

      const raceFolderName = raceKey.charAt(0).toUpperCase() + raceKey.slice(1);
      const raceFolder     = await ensureFolder(raceFolderName, racialFolder.id);

      for (const def of defs) {
        if (!def || !def.key) continue;

        // If a template with this racialKey already exists anywhere, skip
        const exists = worldItems.find(i =>
          i.type === "ability" &&
          i.system?.details?.racialKey === def.key
        );
        if (exists) continue;

        const data = foundry.utils.deepClone(def);

        data.type   = "ability";
        data.folder = raceFolder.id;

        data.system ??= {};
        data.system.details ??= {};
        data.system.details.racialKey = def.key;

        // Template version: not autoGranted
        data.system.details.sourceType  ??= "racial";
        data.system.details.sourceKey   ??= raceKey;
        data.system.details.autoGranted ??= false;

        await Item.create(data, { renderSheet: false });
      }
    }
  } catch (err) {
    console.error("Marks of Mezoria | Folder/Ability seeding error:", err);
  }
});

