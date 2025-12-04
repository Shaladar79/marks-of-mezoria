Hooks.once("init", () => {
  console.log("Marks of Mezoria | Initializing minimal system");

  // Optional: remove the default core sheet so only ours shows
  // Actors.unregisterSheet("core", ActorSheet);

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
}
