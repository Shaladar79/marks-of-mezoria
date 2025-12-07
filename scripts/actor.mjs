// scripts/actor.mjs
// Custom Actor class for Marks of Mezoria

import { MezoriaConfig } from "../config.mjs";

export class MezoriaActor extends Actor {

  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system || {};
    system.details    = system.details    || {};
    system.attributes = system.attributes || {};
    system.status     = system.status     || {};

    // Ensure status sub-objects exist
    system.status.vitality = system.status.vitality || {};
    system.status.mana     = system.status.mana     || {};
    system.status.stamina  = system.status.stamina  || {};
    system.status.trauma   = system.status.trauma   || {};
    system.status.armor    = system.status.armor    || {};
    system.status.shielding = system.status.shielding || {};
    system.status.defense  = system.status.defense  || {};

    // ---------- ATTRIBUTE SETUP ----------
    const groups = ["body", "mind", "soul"];
    const groupKeys = {
      body: ["might", "swiftness", "endurance"],
      mind: ["insight", "focus", "willpower"],
      soul: ["presence", "grace", "resolve"]
    };

    // Ensure each sub-attribute object + numeric fields exist
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

      // Container for the main save value (Body/Mind/Soul save)
      system.attributes[g].saveValue = Number(system.attributes[g].saveValue ?? 0);
    }

    // -------------------------------
    // Clear all race-derived bonuses
    // -------------------------------
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

    const raceBonuses       = MezoriaConfig.raceBonuses || {};
    const tribeBonuses      = MezoriaConfig.mythrianTribeBonuses || {};
    const clanBonuses       = MezoriaConfig.draconianClanBonuses || {};
    const scionAspectBonus  = MezoriaConfig.scionAspectBonuses || {};
    const raceStatusTable   = MezoriaConfig.raceStatus || {};

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

    // ---------- RACE STATUS (pace, natural armor) ----------
    // These are the things that visually changed in your screenshots.
    if (raceKey && raceStatusTable[raceKey]) {
      const rStatus = raceStatusTable[raceKey];

      // Pace default from race (do not overwrite if you've manually set something later, if you prefer)
      system.status.pace = Number(rStatus.pace ?? system.status.pace ?? 0);

      // Natural armor from race
      system.status.naturalArmor = Number(rStatus.naturalArmor ?? 0);
    } else {
      // fallback defaults
      system.status.pace = Number(system.status.pace ?? 0);
      system.status.naturalArmor = Number(system.status.naturalArmor ?? 0);
    }

    // ---------- Recalculate totals & saves ----------
    for (const g of groups) {
      let sum = 0;
      let count = 0;

      for (const key of groupKeys[g]) {
        const node  = system.attributes[g][key];

        const base       = Number(node.base       ?? 0);
        const race       = Number(node.race       ?? 0);
        const background = Number(node.background ?? 0);
        const mark       = Number(node.mark       ?? 0);
        const misc       = Number(node.misc       ?? 0);

        node.total = base + race + background + mark + misc;

        sum += node.total;
        count++;
      }

      // Save value = average of the three substats (rounded down)
      const avg = count > 0 ? Math.floor(sum / count) : 0;
      system.attributes[g].saveValue = avg;
    }

    // ---------- DEFENSE CALCULATION ----------
    const natArmor = Number(system.status.naturalArmor ?? 0);

    // Base 10 across the board for now
    const baseTouch    = 10;
    const basePhysical = 10;
    const baseMagical  = 10;

    // Touch: ignores natural armor
    system.status.defense.touch    = baseTouch;

    // Physical: base + natural armor (ONLY place natural armor applies)
    system.status.defense.physical = basePhysical + natArmor;

    // Magical: base only for now
    system.status.defense.magical  = baseMagical;
  }
}
