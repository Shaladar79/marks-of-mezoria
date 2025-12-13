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
          effectiveCost = baseCost * (rankIndex + 1);
        } else if (extraPerRank) {
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

        return;
      }

      // -------------------------------
      // Whisper of the Grove (Sylvan)
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

        const baseDiameter    = Number(effect.areaDiameterBase ?? 10) || 10;
        const perRankDiameter = Number(effect.areaDiameterPerRank ?? 5) || 5;

        const diameter = baseDiameter + (perRankDiameter * rankIndex);

        await actor.setFlag("marks-of-mezoria", "whisperOfTheGrove", {
          remainingRounds: duration,
          diameter
        });

        ui.notifications?.info(
          `Whisper of the Grove activated: heightened natural awareness in a ${diameter} ft diameter around you for ${duration} rounds.`
        );

        return;
      }

      // -------------------------------
      // Call of the Wild (Mythrian) - Group Aura Buff
      // -------------------------------
      if (effect.type === "buff" &&
          effect.appliesTo === "partyAura" &&
          racialKey === "mythrian-call-of-the-wild") {

        const cfg       = CONFIG["marks-of-mezoria"] || {};
        const rankOrder = cfg.ranks || [];
        const charRank  = normalizeRankKey(actor.system?.details?.rank || "");
        let rankIndex   = rankOrder.indexOf(charRank);
        if (rankIndex < 0) rankIndex = 0;

        const duration = Number(effect.durationRounds ?? 3) || 3;

        const bonusPerRank = Number(effect.bonusPerRank ?? 1) || 1;
        const bonus = bonusPerRank * (rankIndex + 1);

        const tribeKey = String(actor.system?.details?.mythrianTribe ?? "").trim().toLowerCase();

        const tribeToCategory = {
          // Feline
          lion: "feline",
          tiger: "feline",
          leopard: "feline",
          panther: "feline",

          // Lupine
          wolf: "lupine",
          fox: "lupine",

          // Ursine
          bear: "ursine",
          badger: "ursine",

          // Avian
          falcon: "avian",
          owl: "avian",
          crow: "avian",

          // Cervine
          stag: "cervine",
          goat: "cervine",
          bull: "cervine",
          boar: "cervine",

          // Serpentine / “other buckets” (temporary)
          serpent: "serpentine",
          toad: "serpentine",
          cuttlefish: "serpentine",
          shark: "serpentine",
          mantis: "serpentine"
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
          buff: {
            group: targetAttr.group,
            sub: targetAttr.sub,
            label: targetAttr.label,
            bonus
          },
          auraRadiusFt: null // TODO: define aura radius later
        });

        ui.notifications?.info(
          `Call of the Wild activated: allies near you gain +${bonus} ${targetAttr.label} for ${duration} rounds. ` +
          `(TODO: wire aura radius + Reaction system later)`
        );

        return;
      }

      // -------------------------------
      // Elemental Bolt (Scion)
      // -------------------------------
      if (effect.type === "damage" &&
          effect.appliesTo === "singleTarget" &&
          racialKey === "scion-elemental-bolt") {

        const cfg       = CONFIG["marks-of-mezoria"] || {};
        const rankOrder = cfg.ranks || [];
        const charRank  = normalizeRankKey(actor.system?.details?.rank || "");
        let rankIndex   = rankOrder.indexOf(charRank);
        if (rankIndex < 0) rankIndex = 0;

        const targets = Array.from(game.user?.targets ?? []);
        if (targets.length !== 1) {
          ui.notifications?.warn("Elemental Bolt requires exactly 1 targeted token.");
          return;
        }

        const targetToken = targets[0];
        const targetActor = targetToken?.actor;
        if (!targetActor) {
          ui.notifications?.warn("Target has no actor.");
          return;
        }

        const baseRange = Number(effect.rangeBase ?? 20) || 20;
        const perRank   = Number(effect.rangePerRank ?? 5) || 5;
        const rangeFt   = baseRange + (perRank * rankIndex);

        const sourceToken = actor.getActiveTokens()?.[0];
        if (!sourceToken) {
          ui.notifications?.warn("You must have an active token to use Elemental Bolt.");
          return;
        }

        const dist = canvas.grid.measureDistance(sourceToken, targetToken);
        if (dist > rangeFt) {
          ui.notifications?.warn(`Target is out of range (${dist.toFixed(0)}ft > ${rangeFt}ft).`);
          return;
        }

        const dicePerRank = Number(effect.dicePerRank ?? 1) || 1;
        const dieType     = effect.dieType || "d6";
        const diceCount   = Math.max(1, dicePerRank * (rankIndex + 1));

        const aspectKey = String(actor.system?.details?.scionAspect ?? "").toLowerCase();
        const damageType = aspectKey || "elemental";

        const roll = new Roll(`${diceCount}${dieType}`);
        await roll.evaluate({ async: true });

        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor }),
          flavor: `Elemental Bolt (${damageType}) → ${targetActor.name}`
        });

        return;
      }

      // -------------------------------
      // Reflection Cloak (Prismatic)
      // -------------------------------
      if (effect.type === "buff" &&
          effect.appliesTo === "magicalDefense" &&
          racialKey === "prismatic-reflection-cloak") {

        const cfg       = CONFIG["marks-of-mezoria"] || {};
        const rankOrder = cfg.ranks || [];
        const charRank  = normalizeRankKey(actor.system?.details?.rank || "");
        let rankIndex   = rankOrder.indexOf(charRank);
        if (rankIndex < 0) rankIndex = 0;

        const duration     = Number(effect.durationRounds ?? 3) || 3;
        const baseBonus    = Number(effect.baseBonus ?? 2) || 2;
        const perRankBonus = Number(effect.bonusPerRank ?? 1) || 1;

        const bonus = baseBonus + (perRankBonus * rankIndex);

        await actor.setFlag("marks-of-mezoria", "reflectionCloak", {
          remainingRounds: duration,
          magicalDefenseBonus: bonus
        });

        ui.notifications?.info(
          `Reflection Cloak activated: +${bonus} Magical Defense for ${duration} rounds.`
        );

        return;
      }

      // -------------------------------
      // Flame Imbuement (Embergiest)
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

        const extraDice   = Math.max(0, rankIndex) * extraDicePerRank;
        const damageType  = effect.damageType || "fire";

        await actor.setFlag("marks-of-mezoria", "flameImbuement", {
          remainingRounds: duration,
          extraDice,
          extraDieType,
          damageType
        });

        const bonusText = extraDice > 0 ? ` and +${extraDice}${extraDieType}` : "";
        ui.notifications?.info(
          `Flame Imbuement activated: your physical weapon attacks deal ${damageType}${bonusText} ` +
          `for the next ${duration} rounds.`
        );

        return;
      }

      // -------------------------------
      // Pixie Dust (Sprite) - Single Target Daze
      // -------------------------------
      if (effect.type === "debuff" &&
          effect.appliesTo === "daze" &&
          racialKey === "sprite-pixie-dust") {

        const cfg       = CONFIG["marks-of-mezoria"] || {};
        const rankOrder = cfg.ranks || [];
        const charRank  = normalizeRankKey(actor.system?.details?.rank || "");
        let rankIndex   = rankOrder.indexOf(charRank);
        if (rankIndex < 0) rankIndex = 0;

        const targets = Array.from(game.user?.targets ?? []);
        if (targets.length !== 1) {
          ui.notifications?.warn("Pixie Dust requires exactly 1 targeted token.");
          return;
        }

        const targetToken = targets[0];
        const targetActor = targetToken?.actor;
        if (!targetActor) {
          ui.notifications?.warn("Target has no actor.");
          return;
        }

        const baseRange = Number(effect.rangeBase ?? 20) || 20;
        const perRank   = Number(effect.rangePerRank ?? 5) || 5;
        const rangeFt   = baseRange + (perRank * rankIndex);

        const sourceToken = actor.getActiveTokens()?.[0];
        if (!sourceToken) {
          ui.notifications?.warn("You must have an active token to use Pixie Dust.");
          return;
        }

        const dist = canvas?.grid?.measureDistance(sourceToken, targetToken);
        if (dist == null) {
          ui.notifications?.warn("Could not measure distance to target.");
          return;
        }
        if (dist > rangeFt) {
          ui.notifications?.warn(`Target is out of range (${dist.toFixed(0)}ft > ${rangeFt}ft).`);
          return;
        }

        const reactionDropPerRank = Number(effect.reactionDropPerRank ?? 2) || 2;
        const reactionDropIncrease = reactionDropPerRank * rankIndex;

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

        return;
      }

      // -------------------------------
      // Chest of the Depths (Anthazoan)
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

        return;
      }

      // -------------------------------
      // Normal ability roll
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

      const baseDice    = Number(btn.dataset.dice   || 1)  || 1;
      const baseDieType =        btn.dataset.dietype      || "d8";
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
