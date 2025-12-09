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

    /* ====================================================================== */
    /* MARK OF PURPOSE                                                         */
    /* ====================================================================== */

    {
      const markLabels = MezoriaConfig.markOfPurpose             || {};
      const markDescs  = MezoriaConfig.markOfPurposeDescriptions || {};
      const markKey    = system.details.markOfPurpose || "none";

      const markLabel = markLabels[markKey] ?? "";
      const markDesc  = markDescs[markKey]  ?? "";

      // These are what the header and info panels use
      system.details.purpose                  = markLabel;
      system.details.markOfPurposeLabel       = markLabel;
      system.details.markOfPurposeDescription = markDesc;
    }

    /* ====================================================================== */
    /* ATTRIBUTES + SAVES                                                     */
    /* ====================================================================== */

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
    // Clear all race & background bonuses
    // -------------------------------
    for (const g of groups) {
      for (const key of groupKeys[g]) {
        const node = system.attributes[g][key];
        node.race       = 0;
        node.background = 0;
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

    const backgroundTypeBonuses = MezoriaConfig.backgroundTypeBonuses || {};
    const backgroundBonuses     = MezoriaConfig.backgroundBonuses      || {};

    const backTypeKey = system.details.backgroundType || "";
    const backKey     = system.details.background     || "";

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

    // Helper to add a background attribute bonus into the "background" bucket
    const applyBackgroundAttribute = (entry) => {
      if (!entry) return;
      const g   = entry.group;
      const sub = entry.sub;
      const val = Number(entry.value ?? 0);
      if (!g || !sub) return;
      const attrGroup = system.attributes[g];
      if (!attrGroup || !attrGroup[sub]) return;
      attrGroup[sub].background = (attrGroup[sub].background ?? 0) + val;
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

    // 5) Background Type attribute bonus
    if (backTypeKey &&
        backgroundTypeBonuses[backTypeKey] &&
        backgroundTypeBonuses[backTypeKey].attribute) {
      applyBackgroundAttribute(backgroundTypeBonuses[backTypeKey].attribute);
    }

    // 6) Individual Background attribute bonus
    if (backKey &&
        backgroundBonuses[backKey] &&
        backgroundBonuses[backKey].attribute) {
      applyBackgroundAttribute(backgroundBonuses[backKey].attribute);
    }

    // -------------------------------
    // Recalculate totals & saves
    // -------------------------------
    for (const g of groups) {
      let sum   = 0;
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
    /* SKILLS: ATTRIBUTES + RACE + BACKGROUND + RANK + MISC                   */
    /* ====================================================================== */

    const skills = system.skills;

    // Which attribute group each skill group uses
    const skillGroups = {
      body: ["might", "swiftness", "endurance"],
      mind: ["insight", "focus", "willpower"],
      soul: ["presence", "grace", "resolve"]
    };

    // Normalise skills and reset racial/background bonuses
    for (const group in skillGroups) {
      if (!Object.prototype.hasOwnProperty.call(skillGroups, group)) continue;
      const subs = skillGroups[group];
      skills[group] = skills[group] || {};
      const groupSkills = skills[group];

      for (const sub of subs) {
        groupSkills[sub] = groupSkills[sub] || {};
        const subSkills = groupSkills[sub];

        for (const [skillKey, rawNode] of Object.entries(subSkills)) {
          if (skillKey === "expertise") continue; // skip flag entries

          const node = rawNode || {};
          // Ensure fields exist; misc is preserved (manual / future item bonuses)
          node.label           = node.label ?? "";
          node.trained         = !!node.trained;
          node.racialBonus     = 0; // recalculated every time
          node.backgroundBonus = 0; // recalculated every time
          node.misc            = Number(node.misc ?? 0); // do NOT overwrite misc
          node.total           = Number(node.total ?? 0); // will be overwritten

          subSkills[skillKey] = node;
        }
      }
    }

    // Shortcuts to config data
    const raceSkillData         = MezoriaConfig.raceSkillData         || {};
    const bgTypeBonusesSkills   = MezoriaConfig.backgroundTypeBonuses || {};
    const bgBonusesSkills       = MezoriaConfig.backgroundBonuses     || {};
    const rankSkillBonuses      = MezoriaConfig.rankSkillBonuses      || {};

    // Rank-based trained skill bonus
    const rankKeySkill = system.details.rank || "normal";
    const rankBonus    = Number(
      (rankSkillBonuses && rankSkillBonuses[rankKeySkill]) ?
        rankSkillBonuses[rankKeySkill] : 0
    );

    // Race keys for skills
    const raceKeySkill   = system.details.race          || "";
    const tribeKeySkill  = system.details.mythrianTribe || "";
    const clanKeySkill   = system.details.draconianClan || "";
    const aspectKeySkill = system.details.scionAspect   || "";

    const backTypeKeySkill = system.details.backgroundType || "";
    const backKeySkill     = system.details.background     || "";

    // Helper to apply skill bonuses from an array:
    //   [{ path: "body.might.athletics", value: 1 }, ...]
    const applySkillArray = (arr, targetField) => {
      if (!Array.isArray(arr)) return;
      for (const entry of arr) {
        if (!entry || !entry.path) continue;
        const value = Number(entry.value ?? 0);
        const parts = entry.path.split(".");
        if (parts.length !== 3) continue;

        const [g, sub, skillName] = parts;
        const groupSkills = skills[g];
        if (!groupSkills) continue;
        const subSkills = groupSkills[sub];
        if (!subSkills) continue;
        const node = subSkills[skillName];
        if (!node) continue;

        node[targetField] = Number(node[targetField] ?? 0) + value;
      }
    };

    // -----------------------------
    // Racial skill bonuses
    // -----------------------------
    if (raceSkillData.base &&
        raceKeySkill &&
        raceSkillData.base[raceKeySkill] &&
        Array.isArray(raceSkillData.base[raceKeySkill].skills)) {
      applySkillArray(raceSkillData.base[raceKeySkill].skills, "racialBonus");
    }

    // Mythrian tribe skill bonuses
    if (raceKeySkill === "mythrian" &&
        raceSkillData.mythrianTribes &&
        tribeKeySkill &&
        raceSkillData.mythrianTribes[tribeKeySkill] &&
        Array.isArray(raceSkillData.mythrianTribes[tribeKeySkill].skills)) {
      applySkillArray(raceSkillData.mythrianTribes[tribeKeySkill].skills, "racialBonus");
    }

    // Draconian clan skill bonuses
    if (raceKeySkill === "draconian" &&
        raceSkillData.draconianClans &&
        clanKeySkill &&
        raceSkillData.draconianClans[clanKeySkill] &&
        Array.isArray(raceSkillData.draconianClans[clanKeySkill].skills)) {
      applySkillArray(raceSkillData.draconianClans[clanKeySkill].skills, "racialBonus");
    }

    // Scion aspect skill bonuses
    if (raceKeySkill === "scion" &&
        raceSkillData.scionAspects &&
        aspectKeySkill &&
        raceSkillData.scionAspects[aspectKeySkill] &&
        Array.isArray(raceSkillData.scionAspects[aspectKeySkill].skills)) {
      applySkillArray(raceSkillData.scionAspects[aspectKeySkill].skills, "racialBonus");
    }

    // -----------------------------
    // Background type skill bonus
    // -----------------------------
    if (backTypeKeySkill &&
        bgTypeBonusesSkills[backTypeKeySkill] &&
        bgTypeBonusesSkills[backTypeKeySkill].skill) {
      applySkillArray([bgTypeBonusesSkills[backTypeKeySkill].skill], "backgroundBonus");
    }

    // Individual background skill bonus
    if (backKeySkill &&
        bgBonusesSkills[backKeySkill] &&
        bgBonusesSkills[backKeySkill].skill) {
      applySkillArray([bgBonusesSkills[backKeySkill].skill], "backgroundBonus");
    }

    // -----------------------------
    // Final pass: calculate skill totals
    // -----------------------------
    for (const group in skillGroups) {
      if (!Object.prototype.hasOwnProperty.call(skillGroups, group)) continue;
      const subs = skillGroups[group];

      const attrGroup   = system.attributes[group] || {};
      const groupSkills = skills[group] || {};

      for (const sub of subs) {
        const attrTotal  = Number(attrGroup[sub]?.total ?? 0);
        const subSkills  = groupSkills[sub] || {};

        for (const [skillKey, node] of Object.entries(subSkills)) {
          if (skillKey === "expertise") continue;

          const trainedBonus = node.trained ? rankBonus : 0;
          const racial       = Number(node.racialBonus     ?? 0);
          const background   = Number(node.backgroundBonus ?? 0);
          const misc         = Number(node.misc            ?? 0); // manual / items / abilities

          node.total = attrTotal + trainedBonus + racial + background + misc;
        }
      }
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

    system.status.armor.current     = Number(system.status.armor.current     ?? 0);
    system.status.armor.max         = Number(system.status.armor.max         ?? 0);
    system.status.shielding.current = Number(system.status.shielding.current ?? 0);

    // ---- Defenses: natural armor only applies to Physical ----
    const def = system.status.defense;

    const baseDefense = Number(def.touch ?? 10); // base Touch; change if desired

    // Touch is the base
    def.touch = baseDefense;

    // Physical gets natural armor + worn armor
    const natArmor  = system.status.naturalArmor || 0;
    const wornArmor = system.status.armor.current || 0;
    def.physical = baseDefense + natArmor + wornArmor;

    // Magical: currently just uses base (extend later if needed)
    def.magical = Number(def.magical ?? baseDefense);
  }
}
