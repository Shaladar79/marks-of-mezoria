// systems/marks-of-mezoria/scripts/actor.mjs

import { MezoriaConfig } from "../config.mjs";

export class MezoriaActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system ?? {};

    // Ensure attribute structure exists
    system.attributes ??= {};
    const attrs = system.attributes;

    const groups = ["body", "mind", "soul"];
    const subsByGroup = {
      body: ["might", "swiftness", "endurance"],
      mind: ["insight", "focus", "willpower"],
      soul: ["presence", "grace", "resolve"]
    };

    // Ensure each attribute node has base/race/misc/total
    for (const group of groups) {
      const groupNode = (attrs[group] ??= {});

      for (const sub of subsByGroup[group]) {
        const node = (groupNode[sub] ??= {});
        node.base ??= 0;
        node.race ??= 0;
        node.misc ??= 0;
        node.total ??= 0;
      }
    }

    // Map subattribute keys to their location
    const subMap = {
      might:     ["body", "might"],
      swiftness: ["body", "swiftness"],
      endurance: ["body", "endurance"],
      insight:   ["mind", "insight"],
      focus:     ["mind", "focus"],
      willpower: ["mind", "willpower"],
      presence:  ["soul", "presence"],
      grace:     ["soul", "grace"],
      resolve:   ["soul", "resolve"]
    };

    // Clear existing race bonuses
    for (const [subKey, [group, key]] of Object.entries(subMap)) {
      const node = attrs[group]?.[key];
      if (!node) continue;
      node.race = 0;
    }

    // Apply race bonuses
    const raceKey     = system.details?.race;
    const raceBonuses = MezoriaConfig.raceBonuses || {};

    if (raceKey && raceBonuses[raceKey]) {
      const bonusSet = raceBonuses[raceKey];

      for (const [subKey, value] of Object.entries(bonusSet)) {
        const map = subMap[subKey];
        if (!map) continue;

        const [group, key] = map;
        const node = attrs[group][key];
        node.race = (node.race ?? 0) + Number(value ?? 0);
      }
    }

    // Recalculate totals
    for (const group of groups) {
      const groupNode = attrs[group];
      for (const sub of subsByGroup[group]) {
        const node = groupNode[sub];
        const base = Number(node.base ?? 0);
        const race = Number(node.race ?? 0);
        const misc = Number(node.misc ?? 0);

        node.total = base + race + misc;
      }
    }

    // Optional: debug in console
    // console.log("Mezoria | Derived attributes:", this.name, system.attributes);
  }
}
