import { MezoriaConfig } from "./config.mjs";

Hooks.once("init", () => {
  console.log("Marks of Mezoria | Initializing minimal system");

  // Expose config so other code can reach it if needed
  CONFIG["marks-of-mezoria"] = MezoriaConfig;

  Actors.registerSheet("marks-of-mezoria", MinimalActorSheet, {
    types: ["pc"],
    makeDefault: true
  });
});

class MinimalActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["marks-of-mezoria", "sheet", "actor"],
      template: "systems/marks-of-mezoria/templates/actors/actor-sheet.hbs",
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
