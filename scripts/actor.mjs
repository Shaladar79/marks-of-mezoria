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
    system.skills     = system.skills     || {};

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

        node.base       = Number(node.base       ?? 0);
        node.race       = Number(node.race       ?? 0);
        node.background = Number(node.background ?? 0);
        node.mark       = Number(node.mark       ?? 0);
        node.misc       = Number(node.misc       ?? 0);
        node.total      = Number(node.total      ?? 0);
        node.mod        = Number(node.mod        ?? 0);

        system.attributes[g][key] = node;
      }

      // Body/Mind/Soul save values
      system.attributes[g].saveValue = Number(system.attributes[g].saveValue ?? 0);
    }

    // -------------------------------
    // Clear race- and background-derived attribute bonuses
    // -------------------------------
    for (const g of groups) {
      for (const key of groupKeys[g]) {
        const node = system.attributes[g][key];
        node.race       = 0;
        node.background = 0;
      }
    }

    // Map flat subattribute keys -> (group, key) for attribute bonuses
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

    const raceKey         = system.details.race;
    const tribeKey        = system.details.mythrianTribe;
    const clanKey         = system.details.draconianClan;
    const aspectKey       = system.details.scionAspect;
    const backgroundType  = system.details.backgroundType;
    const backgroundKey   = system.details.background;

    const raceBonuses         = MezoriaConfig.raceBonuses           || {};
    const tribeBonuses        = MezoriaConfig.mythrianTribeBonuses  || {};
    const clanBonuses         = MezoriaConfig.draconianClanBonuses  || {};
    const scionAspectBonuses  = MezoriaConfig.scionAspectBonuses    || {};

    const backgroundTypeData  = MezoriaConfig.backgroundTypeBonuses || {};
    const backgroundData      = MezoriaConfig.backgroundBonuses     || {};

    // Helper to add a bonus set into the "race" bucket (attributes)
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

    // Helper to apply a single background attribute bonus
    const applyBackgroundAttribute = (entry) => {
      if (!entry) return;
      const { group, sub, value } = entry;
      if (!group || !sub) return;
      const node = system.attributes[group]?.[sub];
      if (!node) return;
      node.background = (node.background ?? 0) + Number(value ?? 0);
    };

    // 1) Base race bonuses (attributes)
    if (raceKey && raceBonuses[raceKey]) {
      applyToRace(raceBonuses[raceKey]);
    }

    // 2) Mythrian tribe bonuses (attributes)
    if (raceKey === "mythrian" && tribeKey && tribeBonuses[tribeKey]) {
      applyToRace(tribeBonuses[tribeKey]);
    }

    // 3) Draconian clan bonuses (attributes)
    if (raceKey === "draconian" && clanKey && clanBonuses[clanKey]) {
      applyToRace(clanBonuses[clanKey]);
    }

    // 4) Scion aspect bonuses (attributes)
    if (raceKey === "scion" && aspectKey && scionAspectBonuses[aspectKey]) {
      applyToRace(scionAspectBonuses[aspectKey]);
    }

    // 5) Background TYPE attribute bonus
    if (backgroundType && backgroundTypeData[backgroundType]?.attribute) {
      applyBackgroundAttribute(backgroundTypeData[backgroundType].attribute);
    }

    // 6) Individual BACKGROUND attribute bonus
    if (backgroundKey && backgroundData[backgroundKey]?.attribute) {
      applyBackgroundAttribute(backgroundData[backgroundKey].attribute);
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

      const avg = count > 0 ? Math.floor(sum / count) : 0;
      system.attributes[g].saveValue = avg;
    }

    /* ====================================================================== */
    /* STATUS: CORE RESOURCES, PACE, ARMOR, DEFENSE                           */
    /* ====================================================================== */

    const raceStatusAll = MezoriaConfig.raceStatus || {};
    const rs = raceKey && raceStatusAll[raceKey] ? raceStatusAll[raceKey] : {};

    const coreResources = ["vitality", "mana", "stamina", "trauma"];

    for (const res of coreResources) {
      const node = system.status[res] = system.status[res] || {};

      node.current = Number(node.current ?? 0);

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

    system.status.pace = Number(
      rs.pace ?? system.status.pace ?? 0
    );

    system.status.naturalArmor = Number(
      rs.naturalArmor ?? system.status.naturalArmor ?? 0
    );

    system.status.armor     = system.status.armor     || {};
    system.status.shielding = system.status.shielding || {};
    system.status.defense   = system.status.defense   || {};

    system.status.armor.current = Number(system.status.armor.current ?? 0);
    system.status.armor.max     = Number(system.status.armor.max     ?? 0);
    system.status.shielding.current = Number(system.status.shielding.current ?? 0);

    const def = system.status.defense;

    const baseDefense = Number(def.touch ?? 10);

    def.touch = baseDefense;

    const natArmor  = system.status.naturalArmor || 0;
    const wornArmor = system.status.armor.current || 0;
    def.physical = baseDefense + natArmor + wornArmor;

    def.magical = Number(def.magical ?? baseDefense);

    /* ====================================================================== */
    /* SKILLS: ATTRIBUTES + RANK TRAINED BONUS + RACIAL/BACKGROUND/MISC       */
    /* ====================================================================== */

    const rankKey = system.details.rank || "normal";
    const rankBonusMap = MezoriaConfig.rankSkillBonuses || {};
    const trainedBonus = Number(rankBonusMap[rankKey] ?? 0);

    const raceSkillData = MezoriaConfig.raceSkillData || {};

    // Map skill sub-groups to which attribute sub-stat they use
    const subToAttr = {
      might:      "might",
      swiftness:  "swiftness",
      endurance:  "endurance",
      insight:    "insight",
      focus:      "focus",
      willpower:  "willpower",
      presence:   "presence",
      grace:      "grace",
      resolve:    "resolve",
      lore:       "insight"   // placeholder for future Lore expansion
    };

    const skillsRoot = system.skills;

    // Phase 1: normalize / clear racial & background buckets, keep misc
    for (const [catKey, catObj] of Object.entries(skillsRoot)) {
      if (!catObj || typeof catObj !== "object") continue;

      for (const [subKey, subObj] of Object.entries(catObj)) {
        if (!subObj || typeof subObj !== "object") continue;

        for (const [skillKey, skillNode] of Object.entries(subObj)) {
          if (!skillNode || typeof skillNode !== "object") continue;
          if (skillKey === "expertise") continue;

          skillNode.racialBonus     = 0;
          skillNode.backgroundBonus = 0;
          skillNode.misc            = Number(skillNode.misc ?? 0);
        }
      }
    }

    // Helper to apply racial skill bonuses by path: "body.might.athletics"
    const applyRacialSkillBonus = (path, value) => {
      if (!path) return;
      const fullPath = `skills.${path}`;
      const node = foundry.utils.getProperty(system, fullPath);
      if (!node) return;

      node.racialBonus = Number(node.racialBonus ?? 0) + Number(value ?? 0);

      // Racially boosted skills are always trained
      node.trained = true;
    };

    // Helper to apply background skill bonuses by path
    const applyBackgroundSkillBonus = (path, value) => {
      if (!path) return;
      const fullPath = `skills.${path}`;
      const node = foundry.utils.getProperty(system, fullPath);
      if (!node) return;

      node.backgroundBonus = Number(node.backgroundBonus ?? 0) + Number(value ?? 0);

      // Background-boosted skills are also always trained
      node.trained = true;
    };

    // Phase 2: apply base race skill bonuses
    if (raceKey && raceSkillData.base?.[raceKey]?.skills) {
      for (const entry of raceSkillData.base[raceKey].skills) {
        applyRacialSkillBonus(entry.path, entry.value);
      }
    }

    // Phase 3: apply tribe/clan/aspect racial skill bonuses
    if (raceKey === "mythrian" && tribeKey && raceSkillData.mythrianTribes?.[tribeKey]?.skills) {
      for (const entry of raceSkillData.mythrianTribes[tribeKey].skills) {
        applyRacialSkillBonus(entry.path, entry.value);
      }
    }

    if (raceKey === "draconian" && clanKey && raceSkillData.draconianClans?.[clanKey]?.skills) {
      for (const entry of raceSkillData.draconianClans[clanKey].skills) {
        applyRacialSkillBonus(entry.path, entry.value);
      }
    }

    if (raceKey === "scion" && aspectKey && raceSkillData.scionAspects?.[aspectKey]?.skills) {
      for (const entry of raceSkillData.scionAspects[aspectKey].skills) {
        applyRacialSkillBonus(entry.path, entry.value);
      }
    }

    // Phase 4: apply background TYPE skill bonus
    if (backgroundType && backgroundTypeData[backgroundType]?.skill) {
      const s = backgroundTypeData[backgroundType].skill;
      applyBackgroundSkillBonus(s.path, s.value);
    }

    // Phase 5: apply individual BACKGROUND skill bonus
    if (backgroundKey && backgroundData[backgroundKey]?.skill) {
      const s = backgroundData[backgroundKey].skill;
      applyBackgroundSkillBonus(s.path, s.value);
    }

    // Phase 6: final totals = attribute + rank-trained + racial + background + misc
    for (const [catKey, catObj] of Object.entries(skillsRoot)) {
      if (!catObj || typeof catObj !== "object") continue;

      for (const [subKey, subObj] of Object.entries(catObj)) {
        if (!subObj || typeof subObj !== "object") continue;

        const attrSub = subToAttr[subKey];
        if (!attrSub) continue;

        const attrTotal = Number(
          system.attributes?.[catKey]?.[attrSub]?.total ?? 0
        );

        for (const [skillKey, skillNode] of Object.entries(subObj)) {
          if (!skillNode || typeof skillNode !== "object") continue;
          if (skillKey === "expertise") continue;

          const isTrainedBonus = skillNode.trained ? trainedBonus : 0;

          const racial     = Number(skillNode.racialBonus     ?? 0);
          const background = Number(skillNode.backgroundBonus ?? 0);
          const misc       = Number(skillNode.misc            ?? 0);

          skillNode.total = attrTotal + isTrainedBonus + racial + background + misc;
        }
      }
    }
  }
}
