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

    // ---------- STATUS SETUP ----------
    const ensureResource = (key, withRegen = true) => {
      system.status[key] = system.status[key] || {};
      const r = system.status[key];
      r.current = Number(r.current ?? 0);
      r.max     = Number(r.max     ?? 0);
      if (withRegen) r.regen = Number(r.regen ?? 0);
      return r;
    };

    const vit     = ensureResource("vitality", true);
    const mana    = ensureResource("mana", true);
    const stam    = ensureResource("stamina", true);
    const trauma  = ensureResource("trauma", false);
    system.status.armor     = system.status.armor     || {};
    system.status.shielding = system.status.shielding || {};
    system.status.defense   = system.status.defense   || {};

    // ---------- ATTRIBUTE SETUP ----------
    const groups = ["body", "mind", "soul"];
    const groupKeys = {
      body: ["might", "swiftness", "endurance"],
      mind: ["insight", "focus", "willpower"],
      soul: ["presence", "grace", "resolve"]
    };

    for (const g of groups) {
      system.attributes[g] = system.attributes[g] || {};
      for (const key of groupKeys[g]) {
        const node = system.attributes[g][key] || {};

        node.base       = Number(node.base       ?? 0);
        node.race       = Number(node.race       ?? 0);
        node.background = Number(node.background ?? 0);
        node.mark       = Number(node.mark       ?? 0);
        node.misc       = Number(node.misc       ?? 0);
        node.total      = Number(node.total      ?? 0);
        node.mod        = Number(node.mod        ?? 0);

        system.attributes[g][key] = node;
      }

      // container for Body/Mind/Soul save value
      system.attributes[g].saveValue = Number(system.attributes[g].saveValue ?? 0);
    }

    // Clear all race-derived bonuses
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

    const raceBonuses      = MezoriaConfig.raceBonuses || {};
    const tribeBonuses     = MezoriaConfig.mythrianTribeBonuses || {};
    const clanBonuses      = MezoriaConfig.draconianClanBonuses || {};
    const scionAspectBonus = MezoriaConfig.scionAspectBonuses || {};
    const raceStatusTable  = MezoriaConfig.raceStatus || {};

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

    // 2) Mythrian tribe bonuses
    if (raceKey === "mythrian" && tribeKey && tribeBonuses[tribeKey]) {
      applyToRace(tribeBonuses[tribeKey]);
    }

    // 3) Draconian clan bonuses
    if (raceKey === "draconian" && clanKey && clanBonuses[clanKey]) {
      applyToRace(clanBonuses[clanKey]);
    }

    // 4) Scion aspect bonuses
    if (raceKey === "scion" && aspectKey && scionAspectBonus[aspectKey]) {
      applyToRace(scionAspectBonus[aspectKey]);
    }

    // ---------- RACE STATUS (pace, natural armor, core max) ----------
    if (raceKey && raceStatusTable[raceKey]) {
      const rStatus = raceStatusTable[raceKey];

      // Pace & natural armor
      system.status.pace         = Number(rStatus.pace         ?? system.status.pace ?? 0);
      system.status.naturalArmor = Number(rStatus.naturalArmor ?? system.status.naturalArmor ?? 0);

      // Helper: pull max from raceStatus if present
      const applyMaxFromConfig = (cfgVal, resourceObj) => {
        if (cfgVal === undefined || cfgVal === null) return;
        if (typeof cfgVal === "number") {
          resourceObj.max = Number(cfgVal);
        } else if (typeof cfgVal === "object") {
          if (cfgVal.max !== undefined) {
            resourceObj.max = Number(cfgVal.max);
          }
        }
      };

      applyMaxFromConfig(rStatus.vitality, vit);
      applyMaxFromConfig(rStatus.mana,     mana);
      applyMaxFromConfig(rStatus.stamina,  stam);
      applyMaxFromConfig(rStatus.trauma,   trauma);
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

      const avg = count > 0 ? Math.floor(sum / count) : 0;
      system.attributes[g].saveValue = avg;
    }

    // ---------- DEFENSE CALCULATION ----------
    const natArmor = Number(system.status.naturalArmor ?? 0);

    const baseTouch    = 10;
    const basePhysical = 10;
    const baseMagical  = 10;

    system.status.defense.touch    = baseTouch;
    system.status.defense.physical = basePhysical + natArmor; // only here
    system.status.defense.magical  = baseMagical;
  }
}
