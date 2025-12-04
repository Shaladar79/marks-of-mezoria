Hooks.once("init", () => {
  console.log("Your system | Initializing minimal system");

  // Register sheet
  Actors.registerSheet("your-system", MinimalActorSheet, {
    types: ["pc"],
    makeDefault: true
  });
});

class MinimalActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["your-system", "sheet", "actor"],
      template: "systems/your-system/templates/actors/actor-sheet.hbs",
      width: 600,
      height: 400
    });
  }
}
