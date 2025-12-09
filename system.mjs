// system.mjs
import { MezoriaConfig } from "./config.mjs";
import { RaceData } from "./scripts/races.mjs";
import { MezoriaActor } from "./scripts/actor.mjs";

/* ------------------------------------
 * Actor Sheet
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

    data.system = this.actor.system;
    data.config = CONFIG["marks-of-mezoria"];
    data.raceData = RaceData || {};

    const bgType = data.system?.details?.backgroundType ?? "";
    const allBackgrounds = MezoriaConfig.backgroundsByType || {};

    let availableBackgrounds = {};
    if (bgType && allBackgrounds[bgType]) {
      availableBackgrounds = allBackgrounds[bgType];
    }
    data.availableBackgrounds = availableBackgrounds;

    data.abilities = (data.items || []).filter(i => i.type === "ability");

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    const actor = this.actor;

    // Save rolls
    html.find(".save-roll").on("click", async (event) => {
      event.preventDefault();
      const btn = event.currentTarget;
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
      const btn = event.currentTarget;
      const path = btn.dataset.path;
      if (!path) return;

      const basePath = `skills.${path}`;
      const total =
        foundry.utils.getProperty(actor.system, `${basePath}.total`) ?? 0;
      const label =
        foundry.utils.getProperty(actor.system, `${basePath}.label`) ?? "Skill Check";

      const roll = new Roll("1d20 + @mod", { mod: total });
      await roll.evaluate({ async: true });

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: label
      });
    });

    // Edit Ability items from the Abilities tab
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

      const formula = item.system?.details?.effect?.roll || "";

      if (!formula) {
        ui.notifications?.warn("This ability has no roll formula.");
        return;
      }

      const roll = new Roll(formula);
      await roll.evaluate({ async: true });

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: `${item.name} Effect`
      });
    });
  }

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
      tabs: []
    });
  }

  async getData(options) {
    const data = await super.getData(options);
    data.config = CONFIG["marks-of-mezoria"];
    return data;
  }
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

    // Header
    "systems/marks-of-mezoria/templates/actor/parts/header.hbs",

    // Dropdowns
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

    // Character Info tab + subparts
    "systems/marks-of-mezoria/templates/actor/parts/cinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/rankinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/raceinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/backinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/markinfo.hbs",

    // Attributes & Status tab + subparts
    "systems/marks-of-mezoria/templates/actor/parts/astats.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/body.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/mind.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/soul.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/status.hbs",

    // Skills tab + subparts
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

    // Abilities tab for the actor
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
