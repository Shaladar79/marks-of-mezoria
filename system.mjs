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
        }
      ],
      submitOnChange: true
    });
  }

  async getData(options) {
    const data = await super.getData(options);

    // Actor system data
    data.system = this.actor.system;

    // Global config
    data.config = CONFIG["marks-of-mezoria"];

    // RaceData (labels, descriptions, tribes, etc.)
    data.raceData = RaceData;

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Save roll buttons: 1d20 + saveValue
    html.find(".save-roll").on("click", async (event) => {
      event.preventDefault();
      const btn  = event.currentTarget;
      const attr = btn.dataset.attr;  // "body" | "mind" | "soul"
      if (!attr) return;

      const saveValue = getProperty(this.actor.system, `attributes.${attr}.saveValue`) ?? 0;

      const roll = new Roll("1d20 + @save", { save: saveValue });
      await roll.roll({ async: true });

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `${attr.charAt(0).toUpperCase() + attr.slice(1)} Save`
      });
    });
  }

  async _updateObject(event, formData) {
    console.log("Marks of Mezoria | _updateObject called with:", formData);
    const expanded = foundry.utils.expandObject(formData);
    console.log("Marks of Mezoria | Expanded formData:", expanded);
    await this.object.update(expanded);
  }
}

/* ------------------------------------
 * Init hook
 * ----------------------------------*/
Hooks.once("init", async () => {
  console.log("Marks of Mezoria | Initializing system");

  // Make our config globally available
  CONFIG["marks-of-mezoria"] = MezoriaConfig;

  // Use our custom Actor class
  CONFIG.Actor.documentClass = MezoriaActor;

  // Preload templates used by the sheet
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
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/status.hbs"
  ]);

  // Register our custom sheet for PCs
  Actors.registerSheet("marks-of-mezoria", MinimalActorSheet, {
    types: ["pc"],
    makeDefault: true
  });
});
