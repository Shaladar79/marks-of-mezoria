// system.mjs
import { MezoriaConfig } from "./config.mjs";
import { RaceData } from "./scripts/races.mjs";

/* ------------------------------------
 * Custom Actor – handles derived data
 * ----------------------------------*/
class MezoriaActor extends Actor {

  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system || {};
    system.details = system.details || {};

    // Make sure attributes structure exists
    system.attributes = system.attributes || {};

    const groups = ["body", "mind", "soul"];
    const groupKeys = {
      body: ["might", "swiftness", "endurance"],
      mind: ["insight", "focus", "willpower"],
      soul: ["presence", "grace", "resolve"]
    };

    // Ensure each sub-attribute object + numeric fields
    for (const g of groups) {
      system.attributes[g] = system.attributes[g] || {};
      for (const key of groupKeys[g]) {
        const node = system.attributes[g][key] || {};

        node.base  = Number(node.base  ?? 0);
        node.race  = Number(node.race  ?? 0);
        node.misc  = Number(node.misc  ?? 0);
        node.total = Number(node.total ?? 0);
        node.mod   = Number(node.mod   ?? 0);

        system.attributes[g][key] = node;
      }
    }

    // ---------------------------------
    // Apply BASE RACE bonuses
    // ---------------------------------
    const raceKey     = system.details.race;
    const raceBonuses = MezoriaConfig.raceBonuses || {};

    // Clear any existing race bonuses first
    for (const g of groups) {
      for (const key of groupKeys[g]) {
        system.attributes[g][key].race = 0;
      }
    }

    // Map “flat” subattribute keys -> (group, key) in system.attributes
    const subMap = {
      might:      ["body", "might"],
      swiftness:  ["body", "swiftness"],
      endurance:  ["body", "endurance"],
      insight:    ["mind", "insight"],
      focus:      ["mind", "focus"],
      willpower:  ["mind", "willpower"],
      presence:   ["soul", "presence"],
      grace:      ["soul", "grace"],
      resolve:    ["soul", "resolve"]
    };

    if (raceKey && raceBonuses[raceKey]) {
      const bonusSet = raceBonuses[raceKey];

      for (const [subKey, value] of Object.entries(bonusSet)) {
        const map = subMap[subKey];
        if (!map) continue;

        const [group, key] = map;
        const node = system.attributes[group][key];

        node.race = (node.race ?? 0) + Number(value ?? 0);
      }
    }

    // TODO: later we’ll layer Mythrian tribe, Draconian clan,
    //       and Scion aspect bonuses on top of this.

    // ---------------------------------
    // Recalculate totals
    // ---------------------------------
    for (const g of groups) {
      for (const key of groupKeys[g]) {
        const node  = system.attributes[g][key];
        const base  = Number(node.base  ?? 0);
        const race  = Number(node.race  ?? 0);
        const misc  = Number(node.misc  ?? 0);
        const total = base + race + misc;

        node.total = total;

        // Leave mod manual for now, or turn this on when you decide formula:
        // node.mod = Math.floor((total - 10) / 2);
      }
    }
  }
}

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

  async _updateObject(event, formData) {
    console.log("Marks of Mezoria | _updateObject called with:", formData);
    const expanded = foundry.utils.expandObject(formData);
    console.log("Marks of Mezoria | Expanded formData:", expanded);
    await this.object.update(expanded);
  }
}

/* ------------------------------------
 * Init hook
 * ----------------------------------*/
Hooks.once("init", async () => {
  console.log("Marks of Mezoria | Initializing system");

  // Make our config globally available
  CONFIG["marks-of-mezoria"] = MezoriaConfig;

  // Use our custom Actor class
  CONFIG.Actor.documentClass = MezoriaActor;

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
    "systems/marks-of-mezoria/templates/actor/parts/drops/tribedrop.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/clandrop.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/aspectdrop.hbs",

    // Character Info tab + subparts
    "systems/marks-of-mezoria/templates/actor/parts/cinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/rankinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/raceinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/backinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/markinfo.hbs",

    // Attributes & Status tab + subparts
    "systems/marks-of-mezoria/templates/actor/parts/astats.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/body.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/mind.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/soul.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/status.hbs"
  ]);

  // Register our custom sheet for PCs
  Actors.registerSheet("marks-of-mezoria", MinimalActorSheet, {
    types: ["pc"],
    makeDefault: true
  });
});
