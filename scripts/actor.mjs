// scripts/actor.mjs
// Custom Actor class for Marks of Mezoria

import { MezoriaConfig } from "../config.mjs";

export class MezoriaActor extends Actor {

  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system || {};
    this.system = system;                    // make sure we keep reference
    system.details   = system.details   || {};
    system.attributes= system.attributes|| {};
    system.status    = system.status    || {};

    const groups = ["body", "mind", "soul"];
    const groupKeys = {
      body: ["might", "swiftness", "endurance"],
      mind: ["insight", "focus", "willpower"],
      soul: ["presence", "grace", "resolve"]
    };

    // --------------------------------------------------
    // Ensure each sub-attribute node + numeric fields
    // --------------------------------------------------
    for (const g of groups) {
      system.attributes[g] = system.attributes[g] || {};
      for (const key of groupKeys[g]) {
        const node = system.attributes[g][key] || {};

        // Base stays for future scaling, but effectively 0 in this system
        node.base       = Number(node.base       ?? 0);
        node.race       = Number(node.race       ?? 0);
        node.background = Number(node.background ?? 0);
        node.mark       = Number(node.mark       ?? 0);
        node.misc       = Number(node.misc       ?? 0);
        node.total      = Number(node.total      ?? 0);
        node.mod        = Number(node.mod        ?? 0);

        system.attributes[g][key] = node;
      }
    }

    // --------------------------------------------------
    // Clear all race-derived bonuses
    // --------------------------------------------------
    for (const g of groups) {
      for (const key of groupKeys[g]) {
        system.attributes[g][key].race = 0;
      }
    }

    // Map flat subattribute keys -> (group, key)
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

    const raceKey   = system.details.race;
    const tribeKey  = system.details.mythrianTribe;
    const clanKey   = system.details.draconianClan;
    const aspectKey = system.details.scionAspect;

    const raceBonuses      = MezoriaConfig.raceBonuses          || {};
    const tribeBonuses     = MezoriaConfig.mythrianTribeBonuses || {};
    const clanBonuses      = MezoriaConfig.draconianClanBonuses || {};
    const scionAspectBonus = MezoriaConfig.scionAspectBonuses   || {};

    // Helper to add a bonus set into the "race" bucket
    const applyToRace = (bonusSet) => {
      if (!bonusSet) return;
      for (const [subKey, value] of Object.entries(bonusSet)) {
        const map = subMap[subKey];
        if (!map) continue;
        const [group, key] = map;
        const node = system.attributes[group][key];
        node.race = (node.race ?? 0) + Number(value ?? 0);
      }
    };

    // 1) Base race bonuses
    if (raceKey && raceBonuses[raceKey]) {
      applyToRace(raceBonuses[raceKey]);
    }

    // 2) Mythrian tribe bonuses (only if race is Mythrian)
    if (raceKey === "mythrian" && tribeKey && tribeBonuses[tribeKey]) {
      applyToRace(tribeBonuses[tribeKey]);
    }

    // 3) Draconian clan bonuses (only if race is Draconian)
    if (raceKey === "draconian" && clanKey && clanBonuses[clanKey]) {
      applyToRace(clanBonuses[clanKey]);
    }

    // 4) Scion aspect bonuses (only if race is Scion)
    if (raceKey === "scion" && aspectKey && scionAspectBonus[aspectKey]) {
      applyToRace(scionAspectBonus[aspectKey]);
    }

    // --------------------------------------------------
    // Recalculate attribute totals
    // --------------------------------------------------
    for (const g of groups) {
      for (const key of groupKeys[g]) {
        const node  = system.attributes[g][key];

        const base       = Number(node.base       ?? 0);
        const race       = Number(node.race       ?? 0);
        const background = Number(node.background ?? 0);
        const mark       = Number(node.mark       ?? 0);
        const misc       = Number(node.misc       ?? 0);

        node.total = base + race + background + mark + misc;

        // Mod stays manual for now
        // node.mod = Math.floor((node.total - 10) / 2);
      }
    }

    // --------------------------------------------------
    // Race-based STATUS defaults (pace, armor, defenses)
    // --------------------------------------------------
    const raceStatus     = MezoriaConfig.raceStatus || {};
    const statusDefaults = raceStatus[raceKey] || {};

    // Ensure status sub-objects exist
    system.status.vitality = system.status.vitality || {};
    system.status.stamina  = system.status.stamina  || {};
    system.status.mana     = system.status.mana     || {};
    system.status.trauma   = system.status.trauma   || {};
    system.status.defense  = system.status.defense  || {};

    if (statusDefaults.pace !== undefined)
      system.status.pace = Number(statusDefaults.pace);

    if (statusDefaults.naturalArmor !== undefined)
      system.status.naturalArmor = Number(statusDefaults.naturalArmor);

    if (statusDefaults.vitalityMax !== undefined)
      system.status.vitality.max = Number(statusDefaults.vitalityMax);

    if (statusDefaults.staminaMax !== undefined)
      system.status.stamina.max = Number(statusDefaults.staminaMax);

    if (statusDefaults.manaMax !== undefined)
      system.status.mana.max = Number(statusDefaults.manaMax);

    if (statusDefaults.traumaMax !== undefined)
      system.status.trauma.max = Number(statusDefaults.traumaMax);

    if (statusDefaults.defPhysical !== undefined)
      system.status.defense.physical = Number(statusDefaults.defPhysical);

    if (statusDefaults.defMagical !== undefined)
      system.status.defense.magical = Number(statusDefaults.defMagical);

    // NEW: Touch Defense from race defaults
    if (statusDefaults.defTouch !== undefined)
      system.status.defense.touch = Number(statusDefaults.defTouch);
  }
}
