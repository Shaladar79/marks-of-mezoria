// scripts/sheets/pc-sheet.mjs
import { MezoriaConfig } from "../../config.mjs";
import { RaceData } from "../races.mjs";
import {
  buildAbilityRollFormula,
  buildWeaponDamageFormula
} from "../abilities/rolls.mjs";

function normalizeRankKey(raw) {
  if (!raw) return "";
  return String(raw).trim().toLowerCase();
}

export class MinimalActorSheet extends ActorSheet {

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

    // -----------------------------
    // Background dropdowns
    // -----------------------------
    const bgType = data.system?.details?.backgroundType ?? "";
    const allBackgrounds = MezoriaConfig.backgroundsByType || {};

    // IMPORTANT:
    // - {} is truthy in Handlebars, so your template's {{#if availableBackgrounds}}
    //   would render even when there are no options.
    // - Use null unless we have real keys to show.
    let availableBackgrounds = null;
    if (bgType && allBackgrounds[bgType] && Object.keys(allBackgrounds[bgType]).length > 0) {
      availableBackgrounds = allBackgrounds[bgType];
    }
    data.availableBackgrounds = availableBackgrounds;

    // -----------------------------
    // Abilities grouped by sourceType
    // -----------------------------
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

    // ---------------------------------
    // Save rolls
    // ---------------------------------
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

    // ---------------------------------
    // Generic skill rolls (uses Versatility when flagged)
    // ---------------------------------
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

    // ---------------------------------
    // Ability editing
    // ---------------------------------
    html.find(".item-edit").on("click", (event) => {
      event.preventDefault();
      const li = event.currentTarget.closest(".ability-item");
      if (!li) return;
      const itemId = li.dataset.itemId;
      if (!itemId) return;

      const item = actor.items.get(itemId);
      if (item) item.sheet.render(true);
    });

    // ---------------------------------
    // Ability use / effect / buff handling
    // ---------------------------------
    html.find(".ability-roll").on("click", async (event) => {
      event.preventDefault();

      const btn    = event.currentTarget;
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
        const charRank  = normalizeRankKey(actor.system?.details?.rank || "");
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

      const racialKey = details.racialKey || null;

      // -------------------------------
      // 3a) Versatility (Human)
      // -------------------------------
      if (effect.type === "buff" &&
          effect.appliesTo === "nextTrainedSkill" &&
          racialKey === "human-versatility") {

        const cfg       = CONFIG["marks-of-mezoria"] || {};
        const rankOrder = cfg.ranks || [];
        const charRank  = normalizeRankKey(actor.system?.details?.rank || "");
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
// 3c) Whisper of the Grove (Sylvan)
// -------------------------------
if (effect.type === "buff" &&
    effect.appliesTo === "awareness" &&
    racialKey === "sylvan-whisper-grove") {

  const cfg       = CONFIG["marks-of-mezoria"] || {};
  const rankOrder = cfg.ranks || [];
  const charRank  = normalizeRankKey(actor.system?.details?.rank || "");
  let rankIndex   = rankOrder.indexOf(charRank);
  if (rankIndex < 0) rankIndex = 0;

  const duration = Number(effect.durationRounds ?? 3) || 3;

  const baseDiameter   = Number(effect.areaDiameterBase ?? 10) || 10;
  const perRankDiameter = Number(effect.areaDiameterPerRank ?? 5) || 5;

  const diameter = baseDiameter + (perRankDiameter * rankIndex);

  const payload = {
    remainingRounds: duration,
    diameter
  };

  await actor.setFlag("marks-of-mezoria", "whisperOfTheGrove", payload);

  ui.notifications?.info(
    `Whisper of the Grove activated: heightened natural awareness in a ${diameter} ft diameter around you for ${duration} rounds.`
  );

  return; // Buff only (no roll)
}

      // -------------------------------
      // 3b) Flame Imbuement (Embergiest)
      // -------------------------------
      if (effect.type === "buff" &&
          effect.appliesTo === "weaponAttacks" &&
          racialKey === "embergiest-flame-imbuement") {

        const cfg       = CONFIG["marks-of-mezoria"] || {};
        const rankOrder = cfg.ranks || [];
        const charRank  = normalizeRankKey(actor.system?.details?.rank || "");
        let rankIndex   = rankOrder.indexOf(charRank);
        if (rankIndex < 0) rankIndex = 0;

        const duration         = Number(effect.durationRounds ?? 3) || 3;
        const extraDieType     = effect.extraDieType || "d4";
        const extraDicePerRank = Number(effect.extraDicePerRank ?? 1) || 1;

        // Rank scaling: Normal index 0 => 0 extra dice; Topaz index 2 => +2*extraDicePerRank dice
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

        return; // Buff only
      }

      // -------------------------------
      // 3c) Chest of the Depths (Anthazoan)
      // -------------------------------
      if (effect.type === "storage" &&
          racialKey === "anthazoan-chest-depths") {

        const cfg       = CONFIG["marks-of-mezoria"] || {};
        const rankOrder = cfg.ranks || [];
        const charRank  = normalizeRankKey(actor.system?.details?.rank || "");
        let rankIndex   = rankOrder.indexOf(charRank);
        if (rankIndex < 0) rankIndex = 0;

        const baseSlots    = Number(effect.storageBaseSlots ?? 40) || 40;
        const slotsPerRank = Number(effect.storageSlotsPerRank ?? 5) || 5;
        const totalSlots   = baseSlots + (slotsPerRank * rankIndex);

        ui.notifications?.info(
          `Chest of the Depths opened. Vault capacity: ${totalSlots} item types (no encumbrance).`
        );

        return; // No roll
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

    // ---------------------------------
    // Ability removal
    // ---------------------------------
    html.find(".item-delete").on("click", async (event) => {
      event.preventDefault();
      const li = event.currentTarget.closest(".ability-item");
      if (!li) return;
      const itemId = li.dataset.itemId;
      if (!itemId) return;

      await actor.deleteEmbeddedDocuments("Item", [itemId]);
    });

    // ---------------------------------
    // Weapon damage roll (uses Flame Imbuement if active)
    // ---------------------------------
    html.find(".weapon-damage-roll").on("click", async (event) => {
      event.preventDefault();
      const btn = event.currentTarget;

      const baseDice    = Number(btn.dataset.dice   || 1)  || 1;   // e.g. 1
      const baseDieType =        btn.dataset.dietype      || "d8"; // e.g. "d8"
      const label       =        btn.dataset.label        || "Weapon Damage";

      const { formula, damageType } =
        await buildWeaponDamageFormula(actor, baseDice, baseDieType, true);

      const roll = new Roll(formula);
      await roll.evaluate({ async: true });

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: `${label} (${damageType})`
      });
    });
  }

  async _updateObject(event, formData) {
    const expanded = foundry.utils.expandObject(formData);
    await this.object.update(expanded);
  }
}
