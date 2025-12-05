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
      submitOnChange: true
    });
  }

  getData(options) {
    const data = super.getData(options);

    // 🔹 Make sure templates have {{system}} pointing at the actor's system data
    data.system = this.actor.system;

    // 🔹 Also give them config
    data.config = CONFIG["marks-of-mezoria"];

    return data;
  }

  async _updateObject(event, formData) {
    console.log("Marks of Mezoria | _updateObject called with:", formData);
    const expanded = foundry.utils.expandObject(formData);
    console.log("Marks of Mezoria | Expanded formData:", expanded);
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
