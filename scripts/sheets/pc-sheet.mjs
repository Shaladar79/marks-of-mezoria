// scripts/sheets/pc-sheet.mjs
import { MezoriaConfig } from "../../config.mjs";
import { RaceData } from "../races.mjs";
import { handleSpecialAbilityEffect } from "../abilities/special-effects.mjs";
import {
  buildAbilityRollFormula,
  buildWeaponDamageFormula
} from "../abilities/rolls.mjs";

function normalizeRankKey(raw) {
  if (!raw) return "";
  return String(raw).trim().toLowerCase();
}

/**
 * Recursively search actor.system.skills for a leaf skill object by key.
 * Returns { skill, path } where skill is the object containing {label,total,...}
 * and path is the dot path from "skills" (e.g. "body.might.combatHeavy").
 */
function findSkillByKey(skillsRoot, targetKey) {
  if (!skillsRoot || !targetKey) return null;
  const key = String(targetKey);

  const walk = (node, pathParts) => {
    if (!node || typeof node !== "object") return null;

    // If this node has a direct property matching the key and it looks like a skill leaf, return it
    if (Object.prototype.hasOwnProperty.call(node, key)) {
      const candidate = node[key];
      if (candidate && typeof candidate === "object" && ("total" in candidate || "label" in candidate)) {
        return { skill: candidate, path: pathParts.concat([key]).join(".") };
      }
    }

    // Otherwise recurse
    for (const [k, v] of Object.entries(node)) {
      if (!v || typeof v !== "object") continue;

      // Skip booleans like "expertise" and other non-skill markers
      if (k === "expertise") continue;

      const res = walk(v, pathParts.concat([k]));
      if (res) return res;
    }

    return null;
  };

  return walk(skillsRoot, []);
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
        },
        {
          navSelector: ".treasure-tabs",
          contentSelector: ".treasure-panels",
          initial: "treasure-riches"
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

    // -----------------------------
    // Treasure tab data
    // -----------------------------
    const sys = data.system ?? {};
    sys.treasure ??= {};
    sys.treasure.currency ??= {};
    sys.treasure.cores ??= {};

    // Dimensional storage availability (preferred: flag; fallback: racial ability key check)
    let hasStorage = await this.actor.getFlag("marks-of-mezoria", "hasDimensionalStorage");
    if (hasStorage === undefined) {
      hasStorage = allAbilities.some(a => a.system?.details?.racialKey === "anthazoan-chest-depths");
    }
    data.hasDimensionalStorage = !!hasStorage;

    // -----------------------------
    // Riches (Gold + Cores)
    // -----------------------------
    data.treasureCurrency = [{ key: "gold", label: "Gold", conversion: "= 1 Gold" }];

    const coreOrder = Array.isArray(data.config?.coreOrder) && data.config.coreOrder.length
      ? data.config.coreOrder
      : ["quartz","topaz","garnet","emerald","sapphire","ruby","diamond","mythrite","celestite"];

    const coreLabel = (k) => `${k.charAt(0).toUpperCase() + k.slice(1)} Core`;

    data.treasureCores = coreOrder.map((key, idx) => {
      let conversion = "";
      if (key === "quartz") conversion = "= 1,000 Gold";
      else if (idx > 0) conversion = `= 100 ${coreLabel(coreOrder[idx - 1]).replace(" Core","")} Cores`;
      return { key, label: coreLabel(key), conversion };
    });

    // -----------------------------
    // Equipment / Consumables / Storage items
    // -----------------------------
    const allItems = (data.items || []).filter(i => i.type !== "ability");

    const isStored     = (i) => (i.system?.location || "carried") === "dimensional";
    const isEquipment  = (i) => i.type === "equipment";
    const isConsumable = (i) => i.type === "consumable";

    const equipType = (i) => String(i.system?.equipType || "misc").toLowerCase();

    const carriedEquipment = allItems.filter(i => isEquipment(i) && !isStored(i));

    data.treasureEquipment = {
      weapons: carriedEquipment.filter(i => equipType(i) === "weapon"),
      armor:   carriedEquipment.filter(i => equipType(i) === "armor"),
      misc:    carriedEquipment.filter(i => equipType(i) === "misc")
    };

    data.treasureConsumables = allItems.filter(i => isConsumable(i) && !isStored(i));
    data.treasureStorage     = allItems.filter(i => isStored(i));

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    const actor = this.actor;

    // ---------------------------------
    // Treasure: weapon ATTACK roll (1d20 + skill total)
    // ---------------------------------
    html.find(".equipment-weapon-attack-roll").on("click", async (event) => {
      event.preventDefault();

      const btn = event.currentTarget;
      const li = btn.closest(".treasure-item");
      if (!li) return;

      const itemId = li.dataset.itemId;
      if (!itemId) return;

      const item = actor.items.get(itemId);
      if (!item) return;

      const skillKey = String(item.system?.weapon?.skillKey || "").trim();
      if (!skillKey) {
        ui.notifications?.warn(`Weapon "${item.name}" has no Combat Skill selected.`);
        return;
      }

      const found = findSkillByKey(actor.system?.skills, skillKey);
      if (!found?.skill) {
        ui.notifications?.warn(`Could not find a skill matching "${skillKey}" on this actor.`);
        return;
      }

      const skillTotal = Number(found.skill.total ?? 0) || 0;
      const skillLabel = String(found.skill.label || skillKey);

      const roll = new Roll("1d20 + @mod", { mod: skillTotal });
      await roll.evaluate({ async: true });

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: `${item.name} — Attack (${skillLabel})`
      });
    });

    // ---------------------------------
    // Treasure: weapon DAMAGE roll (uses equipment config + buildWeaponDamageFormula)
    // ---------------------------------
    html.find(".equipment-weapon-damage-roll").on("click", async (event) => {
      event.preventDefault();

      const btn = event.currentTarget;
      const li = btn.closest(".treasure-item");
      if (!li) return;

      const itemId = li.dataset.itemId;
      if (!itemId) return;

      const item = actor.items.get(itemId);
      if (!item) return;

      const dice = Number(item.system?.weapon?.damageDice ?? 1) || 1;
      const die  = String(item.system?.weapon?.damageDie || "d6");

      const { formula, damageType } =
        await buildWeaponDamageFormula(actor, dice, die, true);

      const roll = new Roll(formula);
      await roll.evaluate({ async: true });

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: `${item.name} — Damage (${damageType})`
      });
    });

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
      const costCfg = details.cost || {};

      // 1) Compute effective resource cost
      const costType      = costCfg.type || "";
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

      // 2) Deduct resource (stamina/mana)
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

      // 3) Special-case ability handling
      const handled = await handleSpecialAbilityEffect(actor, item);
      if (handled) return;

      // 4) Normal ability roll
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
    // Treasure: equip toggle
    // ---------------------------------
    html.find(".treasure-equip-toggle").on("change", async (event) => {
      const checkbox = event.currentTarget;
      const li = checkbox.closest(".treasure-item");
      if (!li) return;

      const itemId = li.dataset.itemId;
      if (!itemId) return;

      await actor.updateEmbeddedDocuments("Item", [
        { _id: itemId, "system.equipped": !!checkbox.checked }
      ]);
    });

    // ---------------------------------
    // Treasure: move to/from dimensional storage
    // ---------------------------------
    html.find(".treasure-move-storage").on("click", async (event) => {
      event.preventDefault();
      const btn = event.currentTarget;
      const li = btn.closest(".treasure-item");
      if (!li) return;

      const itemId = li.dataset.itemId;
      if (!itemId) return;
      const item = actor.items.get(itemId);
      if (!item) return;

      const current = String(item.system?.location || "carried");
      const next = current === "dimensional" ? "carried" : "dimensional";

      await actor.updateEmbeddedDocuments("Item", [
        { _id: itemId, "system.location": next }
      ]);
    });

    // ---------------------------------
    // Treasure: item removal
    // ---------------------------------
    html.find(".treasure-item-delete").on("click", async (event) => {
      event.preventDefault();
      const li = event.currentTarget.closest(".treasure-item");
      if (!li) return;

      const itemId = li.dataset.itemId;
      if (!itemId) return;

      await actor.deleteEmbeddedDocuments("Item", [itemId]);
    });

    // ---------------------------------
    // Legacy weapon damage roll (kept intact)
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
