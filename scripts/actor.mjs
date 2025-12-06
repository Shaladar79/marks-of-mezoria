// systems/marks-of-mezoria/scripts/actor.mjs
import { MezoriaConfig } from "../config.mjs";

export class MezoriaActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system || {};
    system.details = system.details || {};
    system.attributes = system.attributes || {};

    const groups = ["body", "mind", "soul"];
    const groupKeys = {
      body: ["might", "swiftness", "endurance"],
      mind: ["insight", "focus", "willpower"],
      soul: ["presence", "grace", "resolve"]
    };

    // Ensure each sub-attribute node exists and is numeric
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

    // -----------------------------
    // Apply BASE RACE bonuses
    // -----------------------------
    const raceKey     = system.details.race;
    const raceBonuses = MezoriaConfig.raceBonuses || {};

    // Clear existing race bonuses
    for (const g of groups) {
      for (const key of groupKeys[g]) {
        system.attributes[g][key].race = 0;
      }
    }

    // Map flat keys -> (group, key)
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

    // TODO: later add Mythrian tribe / Draconian clan / Scion aspect here.

    // -----------------------------
    // Recalculate totals
    // -----------------------------
    for (const g of groups) {
      for (const key of groupKeys[g]) {
        const node  = system.attributes[g][key];
        const base  = Number(node.base  ?? 0);
        const race  = Number(node.race  ?? 0);
        const misc  = Number(node.misc  ?? 0);

        node.total = base + race + misc;
        // node.mod = Math.floor((node.total - 10) / 2); // later if you want
      }
    }
  }
}
