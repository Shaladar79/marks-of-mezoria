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
        },
        {
          // Skills sub-tabs (Body / Mind / Soul)
          navSelector: ".skills-tabs",
          contentSelector: ".skills-panels",
          initial: "skills-body"
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

    // -----------------------------
    // Save roll buttons: 1d20 + saveValue
    // -----------------------------
    html.find(".save-roll").o
