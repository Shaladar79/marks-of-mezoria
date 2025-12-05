// system.mjs
import { MezoriaConfig } from "./config.mjs";
import { RaceData } from "./scripts/races.mjs";   // ✅ ADD THIS

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

  // Make sure templates get system + config + raceData
  async getData(options) {
    const data = await super.getData(options);

    // {{system}} in templates
    data.system = this.actor.system;

    // {{config}} in templates
    data.config = CONFIG["marks-of-mezoria"];

    // ✅ Add raceData so raceinfo.hbs can use it
    data.raceData = RaceData;

    return data;
  }

  // Save all form changes back to the actor
  async _updateObject(event, formData) {
    console.log("Marks of Mezoria | _updateObject called with:", formData);
    const expanded = foundry.utils.expandObject(formData);
    console.log("Marks of Mezoria | Expanded formData:", expanded);
    await this.object.update(expanded);
  }
}

Hooks.once("init", async () => {
  console.log("Marks of Mezoria | Initializing system");

  // Make our config globally available
  CONFIG["marks-of-mezoria"] = MezoriaConfig;

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

    // Character Info tab + subparts
    "systems/marks-of-mezoria/templates/actor/parts/cinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/rankinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/raceinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/backinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/markinfo.hbs",

    // Attributes & Status tab + subparts  ✅ NEW
    "systems/marks-of-mezoria/templates/actor/parts/astats.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/body.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/mind.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/soul.hbs"
  ]);

  // Register our custom sheet for PCs
  Actors.registerSheet("marks-of-mezoria", MinimalActorSheet, {
    types: ["pc"],
    makeDefault: true
  });
});
