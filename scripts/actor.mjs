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

    /* ---------------------------------------------------------------------- */
    /* ATTRIBUTE SETUP                                                        */
    /* ---------------------------------------------------------------------- */

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

    /* ---------------------------------------------------------------------- */
    /* CLEAR RACE BUCKET BEFORE REAPPLYING BONUSES                            */
    /* ---------------------------------------------------------------------- */

    for (const g of groups) {
      for (const key of groupKeys[g]) {
        system.attributes[g][key].race = 0;
      }
    }

    /* ---------------------------------------------------------------------- */
    /* RACIAL / TRIBAL / CLAN / ASPECT BONUSES                                */
    /* ---------------------------------------------------------------------- */

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

    const raceBonuses         = MezoriaConfig.raceBonuses            || {};
    const tribeBonuses        = MezoriaConfig.mythrianTribeBonuses   || {};
    const clanBonuses         = MezoriaConfig.draconianClanBonuses   || {};
    const scionAspectBonuses  = MezoriaConfig.scionAspectBonuses     || {};
    const raceStatusTable     = MezoriaConfig.raceStatus             || {};

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
    if (raceKey === "scion" && aspectKey && scionAspectBonuses[aspectKey]) {
      applyToRace(scionAspectBonuses[aspectKey]);
    }

    /* ---------------------------------------------------------------------- */
    /* RECALCULATE TOTALS & SAVE VALUES                                       */
    /* ---------------------------------------------------------------------- */

    for (const g of groups) {
      let sum = 0;
      let count = 0;

      for (const key of groupKeys[g]) {
        const node = system.attributes[g][key];

        const base       = Number(node.base       ?? 0);
        const race       = Number(node.race       ?? 0);
        const background = Number(node.background ?? 0);
        const mark       = Number(node.mark       ?? 0);
        const misc       = Number(node.misc       ?? 0);

        node.total = base + race + background + mark + misc;

        sum   += node.total;
        count += 1;
      }

      // Save value = average of the three substats (rounded down)
      const avg = count > 0 ? Math.floor(sum / count) : 0;
      system.attributes[g].saveValue = avg;
    }

    /* ---------------------------------------------------------------------- */
    /* STATUS: RACE DEFAULTS (PACE, NATURAL ARMOR, DEFENSES)                  */
    /* ---------------------------------------------------------------------- */

    const status = system.status;

    // Ensure core status structure exists
    status.vitality = status.vitality || { current: 0, max: 0, regen: 0 };
    status.mana     = status.mana     || { current: 0, max: 0, regen: 0 };
    status.stamina  = status.stamina  || { current: 0, max: 0, regen: 0 };
    status.trauma   = status.trauma   || { current: 0, max: 0 };

    status.armor    = status.armor    || { current: 0, max: 0 };
    status.shielding = status.shielding || { current: 0 };

    status.defense  = status.defense  || {
      touch: 0,
      physical: 0,
      magical: 0
    };

    // Apply race default pace & natural armor, if defined
    const baseStatus = raceKey ? raceStatusTable[raceKey] : null;
    if (baseStatus) {
      status.pace         = Number(baseStatus.pace         ?? 0);
      status.naturalArmor = Number(baseStatus.naturalArmor ?? 0);
    } else {
      status.pace         = Number(status.pace         ?? 0);
      status.naturalArmor = Number(status.naturalArmor ?? 0);
    }

    // Simple default defenses based on natural armor (can be changed later)
    const baseDef = 10 + Number(status.naturalArmor ?? 0);
    status.defense.touch    = baseDef;
    status.defense.physical = baseDef;
    status.defense.magical  = baseDef;

    // Reaction stays manual for now
    status.reaction = Number(status.reaction ?? 0);
  }
}
