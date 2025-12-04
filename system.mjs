// system.mjs
import { MezoriaConfig } from "./config.mjs";

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
      submitOnChange: true   // 🔹 auto-submit whenever an input/select changes
    });
  }

  // Use async + await super.getData to be safe on v13
  async getData(options) {
    const data = await super.getData(options);
    // expose our config as {{config}} in all templates
    data.config = CONFIG["marks-of-mezoria"];
    return data;
  }

  /**
   * This is where ALL changes coming from the form actually get saved.
   * If this doesn't run or throws, nothing will persist.
   */
  async _updateObject(event, formData) {
    console.log("Marks of Mezoria | _updateObject called with:", formData);

    // Expand flat formData into nested object (safe for any Foundry version)
    const expanded = foundry.utils.expandObject(formData);
    console.log("Marks of Mezoria | Expanded formData:", expanded);

    // `this.object` is the canonical document for DocumentSheet (ActorSheet)
    await this.object.update(expanded);
  }
}

Hooks.once("init", async () => {
  console.log("Marks of Mezoria | Initializing minimal system");

  // Make config globally available
  CONFIG["marks-of-mezoria"] = MezoriaConfig;

  // Preload all templates / partials we use
  await loadTemplates([
    "systems/marks-of-mezoria/templates/actor/actor-sheet.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/header.hbs",

    "systems/marks-of-mezoria/templates/actor/parts/drops/racedrop.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/rankdrop.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/backtype.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/backdrop.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/markpurpose.hbs",

    "systems/marks-of-mezoria/templates/actor/parts/cinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/rankinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/raceinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/backinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/markinfo.hbs"
  ]);

  Actors.registerSheet("marks-of-mezoria", MinimalActorSheet, {
    types: ["pc"],
    makeDefault: true
  });
});
