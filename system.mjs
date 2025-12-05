// system.mjs
import { MezoriaConfig } from "./config.mjs";
import { RaceData } from "./scripts/races.mjs";

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

  // Ensure context has system + config
  async getData(options) {
    const data = await super.getData(options);

    // Make {{system}} usable in templates
    data.system = this.actor.system;

    // Expose config globally in templates
    data.config = CONFIG["marks-of-mezoria"];

    return data;
  }

  // Save form changes properly
  async _updateObject(event, formData) {
    console.log("Marks of Mezoria | FormData received:", formData);

    const expanded = foundry.utils.expandObject(formData);
    console.log("Marks of Mezoria | Expanded:", expanded);

    await this.object.update(expanded);
  }
}

Hooks.once("init", async () => {
  console.log("Marks of Mezoria | Initializing system");

  // Make config accessible system-wide
  CONFIG["marks-of-mezoria"] = MezoriaConfig;

  // Inject RaceData into config
  CONFIG["marks-of-mezoria"].races = RaceData.labels;
  CONFIG["marks-of-mezoria"].raceDescriptions = RaceData.descriptions;

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

    // Character Info Tab
    "systems/marks-of-mezoria/templates/actor/parts/cinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/rankinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/raceinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/backinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/markinfo.hbs"
  ]);

  // Register sheet for PCs
  Actors.registerSheet("marks-of-mezoria", MinimalActorSheet, {
    types: ["pc"],
    makeDefault: true
  });
});
