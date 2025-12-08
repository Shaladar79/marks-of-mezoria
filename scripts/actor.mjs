// scripts/actor.mjs
// Custom Actor class for Marks of Mezoria

import { MezoriaConfig } from "../config.mjs";
import { RankData } from "./rank.mjs";

export class MezoriaActor extends Actor {

  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system || {};
    system.details    = system.details    || {};
    system.attributes = system.attributes || {};
    system.status     = system.status     || {};

    const groups = ["body", "mind", "soul"];
    const groupKeys = {
      body: ["might", "swiftness", "endurance"],
      mind: ["insight", "focus", "willpower"],
      soul: ["presence", "grace", "resolve"]
    };

    /* ====================================================================== */
    /* ATTRIBUTES + SAVES                                                     */
    /* ====================================================================== */

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

    // -------------------------------
    // Recalculate totals & saves
    // -------------------------------
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

    /* ====================================================================== */
    /* STATUS: CORE RESOURCES, PACE, ARMOR, DEFENSE                           */
    /* ====================================================================== */

    const raceStatusAll = MezoriaConfig.raceStatus || {};
    const rs = raceKey && raceStatusAll[raceKey] ? raceStatusAll[raceKey] : {};

    // ---- Core resources: Vitality, Mana, Stamina, Trauma ----
    const coreResources = ["vitality", "mana", "stamina", "trauma"];

    for (const res of coreResources) {
      const node = system.status[res] = system.status[res] || {};

      node.current = Number(node.current ?? 0);

      // RaceStatus may have keys like "vitalityMax", "manaMax", etc.
      const raceMaxKey = `${res}Max`;
      if (rs[raceMaxKey] !== undefined) {
        node.max = Number(rs[raceMaxKey] ?? 0);
      } else {
        node.max = Number(node.max ?? 0);
      }

      if (res !== "trauma") {
        node.regen = Number(node.regen ?? 0);
      }
    }

    // ---- Pace & Natural Armor from race ----
    system.status.pace = Number(
      rs.pace ?? system.status.pace ?? 0
    );

    system.status.naturalArmor = Number(
      rs.naturalArmor ?? system.status.naturalArmor ?? 0
    );

    // Ensure armor & shielding nodes exist
    system.status.armor     = system.status.armor     || {};
    system.status.shielding = system.status.shielding || {};
    system.status.defense   = system.status.defense   || {};

    system.status.armor.current = Number(system.status.armor.current ?? 0);
    system.status.armor.max     = Number(system.status.armor.max     ?? 0);
    system.status.shielding.current = Number(system.status.shielding.current ?? 0);

    // ---- Defenses: natural armor only applies to Physical ----
    const def = system.status.defense;

    const baseDefense = Number(def.touch ?? 10); // base Touch defense

    // Touch is the base
    def.touch = baseDefense;

    // Physical gets natural armor + worn armor
    const natArmor = system.status.naturalArmor || 0;
    const wornArmor = system.status.armor.current || 0;
    def.physical = baseDefense + natArmor + wornArmor;

    // Magical: currently just uses base (you can add other bonuses later)
    def.magical = Number(def.magical ?? baseDefense);

    /* ====================================================================== */
    /* SKILLS: TRAINED / BONUSES / TOTALS                                     */
    /* ====================================================================== */

    const skills = system.skills || {};
    const skillGroups = ["body", "mind", "soul"];

    // Rank-based trained bonus from RankData
    const rankKey  = system.details?.rank || "normal";
    const trainedBase =
      RankData.trainedSkillBonus?.[rankKey] ?? 0;

    for (const group of skillGroups) {
      if (!skills[group]) continue;

      for (const [subKey, subData] of Object.entries(skills[group])) {
        if (!subData || typeof subData !== "object") continue;

        // Ensure expertise flag exists, even though it currently has no effect
        subData.expertise = !!subData.expertise;

        for (const [skillKey, rawSkill] of Object.entries(subData)) {
          if (skillKey === "expertise") continue; // skip the flag

          const sk = rawSkill || {};

          sk.label      = sk.label ?? "";
          sk.trained    = !!sk.trained;
          sk.specialty  = sk.specialty ?? "";

          // Normalise bonus fields
          sk.racialBonus     = Number(sk.racialBonus ?? 0);
          sk.backgroundBonus = Number(sk.backgroundBonus ?? 0);
          sk.misc            = Number(sk.misc ?? 0);

          // Rank-based trained bonus
          const trainedBonus = sk.trained ? trainedBase : 0;

          // Final total for the sheet
          sk.total = trainedBonus + sk.racialBonus + sk.backgroundBonus + sk.misc;

          subData[skillKey] = sk;
        }
      }
    }

    system.skills = skills;
  }
}
