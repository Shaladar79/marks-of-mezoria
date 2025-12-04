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
      // 🔹 This makes dropdowns and inputs save immediately on change
      submitOnChange: true
    });
  }

  getData(options) {
    const data = super.getData(options);
    // expose our config to templates as {{config}}
    data.config = CONFIG["marks-of-mezoria"];
    return data;
  }

  /**
   * Ensure that form data actually updates the Actor.
   * This is the "save" for everything named like system.details.* etc.
   */
  async _updateObject(event, formData) {
    // Debug log (optional but useful while testing)
    console.log("Marks of Mezoria | Updating actor with form data:", formData);

    // formData is a flat object: { "system.details.race": "sprite", ... }
    // Actor.update happily accepts that format.
    await this.actor.update(formData);
  }
}

Hooks.once("init", async () => {
  console.log("Marks of Mezoria | Initializing minimal system");

  // Make config globally available
  CONFIG["marks-of-mezoria"] = MezoriaConfig;

  // Preload all partials
  await loadTemplates([
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
