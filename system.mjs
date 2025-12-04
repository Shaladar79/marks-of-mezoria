// system.mjs
import { MezoriaConfig } from "./config.mjs";

class MinimalActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["marks-of-mezoria", "sheet", "actor"],
      template: "systems/marks-of-mezoria/templates/actor/actor-sheet.hbs",
      width: 600,
      height: 400
    });
  }

  /** Supply config to the template */
  getData(options) {
    const data = super.getData(options);
    data.config = CONFIG["marks-of-mezoria"];
    return data;
  }
}

Hooks.once("init", async () => {
  console.log("Marks of Mezoria | Initializing minimal system");

  // Expose config
  CONFIG["marks-of-mezoria"] = MezoriaConfig;

  // 🔹 PRELOAD PARTIAL TEMPLATES 🔹
  await loadTemplates([
  "systems/marks-of-mezoria/templates/actor/parts/header.hbs",
  "systems/marks-of-mezoria/templates/actor/parts/drops/racedrop.hbs",
  "systems/marks-of-mezoria/templates/actor/parts/drops/rankdrop.hbs",
  "systems/marks-of-mezoria/templates/actor/parts/drops/backtype.hbs",
  "systems/marks-of-mezoria/templates/actor/parts/drops/backdrop.hbs",
   "systems/marks-of-mezoria/templates/actor/parts/cinfo.hbs",
  "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/rankinfo.hbs",
  "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/raceinfo.hbs",
  "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/backinfo.hbs",
  "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/markinfo.hbs"
]);


  // Optional: remove core sheet so only ours shows
  // Actors.unregisterSheet("core", ActorSheet);

  Actors.registerSheet("marks-of-mezoria", MinimalActorSheet, {
    types: ["pc"],
    makeDefault: true
  });
});
