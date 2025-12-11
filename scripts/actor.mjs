// scripts/actor.mjs
// Custom Actor class for Marks of Mezoria

import { MezoriaConfig } from "../config.mjs";
import { RaceAbilityPack } from "./packs/raceabilitypack.mjs";

export class MezoriaActor extends Actor {

  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system || {};
    system.details    = system.details    || {};
    system.attributes = system.attributes || {};
    system.status     = system.status     || {};
    system.skills     = system.skills     || {};

    /* ====================================================================== */
    /* MARK OF PURPOSE                                                        */
    /* ====================================================================== */

    {
      const markLabels = MezoriaConfig.markOfPurpose             || {};
      const markDescs  = MezoriaConfig.markOfPurposeDescriptions || {};
      const markKey    = system.details.markOfPurpose || "none";

      const markLabel = markLabels[markKey] ?? "";
      const markDesc  = markDescs[markKey]  ?? "";

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

    // Ensure attribute objects and numeric fields exist
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
      system.attributes[g].saveValue = Number(system.attributes[g].saveValue ?? 0);
    }

    // Clear race & background every prepare so they don't stack
    for (const g of groups) {
      for (const key of groupKeys[g]) {
        const node = system.attributes[g][key];
        node.race       = 0;
        node.background = 0;
      }
    }

    // Mapping for attribute bonus configs
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

    const raceKey   = system.details.race           || "";
    const tribeKey  = system.details.mythrianTribe  || "";
    const clanKey   = system.details.draconianClan  || "";
    const aspectKey = system.details.scionAspect    || "";

    const raceBonuses           = MezoriaConfig.raceBonuses           || {};
    const tribeBonuses          = MezoriaConfig.mythrianTribeBonuses  || {};
    const clanBonuses           = MezoriaConfig.draconianClanBonuses  || {};
    const scionAspectBonuses    = MezoriaConfig.scionAspectBonuses    || {};
    const backgroundTypeBonuses = MezoriaConfig.backgroundTypeBonuses || {};
    const backgroundBonuses     = MezoriaConfig.backgroundBonuses     || {};

    // Helper: apply an attribute bonus set into .race
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

    // Helper: apply background attribute entry into .background
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

    // Race / tribe / clan / aspect bonuses
    if (raceKey && raceBonuses[raceKey]) {
      applyToRace(raceBonuses[raceKey]);
    }
    if (raceKey === "mythrian" && tribeKey && tribeBonuses[tribeKey]) {
      applyToRace(tribeBonuses[tribeKey]);
    }
    if (raceKey === "draconian" && clanKey && clanBonuses[clanKey]) {
      applyToRace(clanBonuses[clanKey]);
    }
    if (raceKey === "scion" && aspectKey && scionAspectBonuses[aspectKey]) {
      applyToRace(scionAspectBonuses[aspectKey]);
    }

    // Background type attribute bonus
    const backTypeKey = system.details.backgroundType || "";
    if (backTypeKey &&
        backgroundTypeBonuses[backTypeKey] &&
        backgroundTypeBonuses[backTypeKey].attribute) {
      applyBackgroundAttribute(backgroundTypeBonuses[backTypeKey].attribute);
    }

    // Individual background attribute bonus
    const backKey = system.details.background || "";
    if (backKey &&
        backgroundBonuses[backKey] &&
        backgroundBonuses[backKey].attribute) {
      applyBackgroundAttribute(backgroundBonuses[backKey].attribute);
    }

    // Finalize attribute totals & group saves
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
        sum += node.total;
        count++;
      }
      system.attributes[g].saveValue = count > 0 ? Math.floor(sum / count) : 0;
    }

    /* ====================================================================== */
    /* SKILLS: ATTRIBUTES + RACE + BACKGROUND + RANK + MISC                   */
    /* ====================================================================== */

    system.skills = system.skills || {};
    const skills = system.skills;

    const skillGroups = {
      body: ["might", "swiftness", "endurance"],
      mind: ["insight", "focus", "willpower"],
      soul: ["presence", "grace", "resolve"]
    };

    // Normalize skills & reset racial/background/rank (misc stays)
    for (const group in skillGroups) {
      if (!Object.prototype.hasOwnProperty.call(skillGroups, group)) continue;
      const subs = skillGroups[group];

      skills[group] = skills[group] || {};
      const groupSkills = skills[group];

      for (const sub of subs) {
        groupSkills[sub] = groupSkills[sub] || {};
        const subSkills = groupSkills[sub];

        for (const [skillKey, rawNode] of Object.entries(subSkills)) {
          if (skillKey === "expertise") continue;

          const node = rawNode || {};
          node.label   = node.label ?? "";
          node.trained = !!node.trained;

          // Persist misc, wipe derived parts
          node.racialBonus     = 0;
          node.backgroundBonus = 0;
          node.rankBonus       = 0;
          node.misc            = Number(node.misc ?? 0);
          node.total           = Number(node.total ?? 0);

          subSkills[skillKey] = node;
        }
      }
    }

    // Config data for skills & ranks
    const raceSkillData        = MezoriaConfig.raceSkillData         || {};
    const rawRankSkillBonusMap = MezoriaConfig.rankSkillBonuses      || {};
    const rankOrder            = MezoriaConfig.ranks                 || [];
    const bgTypeForSkills      = MezoriaConfig.backgroundTypeBonuses || {};
    const bgForSkills          = MezoriaConfig.backgroundBonuses     || {};

    // Normalize rankSkillBonuses keys (e.g., "Topaz" → "topaz")
    const rankSkillBonuses = {};
    for (const [key, value] of Object.entries(rawRankSkillBonusMap)) {
      const normKey = String(key).trim().toLowerCase();
      rankSkillBonuses[normKey] = Number(value ?? 0);
    }

    // Rank-based trained skill bonus (full) and half for untrained
    const rawRankValue = system.details.rank ?? "";
    let rankKeySkill = "";

    if (rawRankValue !== "" && rawRankValue !== null && rawRankValue !== undefined) {
      const rawStr = String(rawRankValue).trim();

      // If it's purely numeric (e.g. "2"), treat it as an index into rankOrder
      if (/^[0-9]+$/.test(rawStr)) {
        const idx = parseInt(rawStr, 10);
        const orderKey = rankOrder[idx];
        if (orderKey !== undefined) {
          rankKeySkill = String(orderKey).trim().toLowerCase();
        }
      } else {
        // Otherwise treat it as a rank ID directly
        rankKeySkill = rawStr.toLowerCase();
      }
    }

    const fullRankBonus = Number(
      (rankKeySkill && rankSkillBonuses[rankKeySkill] !== undefined)
        ? rankSkillBonuses[rankKeySkill]
        : 0
    );
    const halfRankBonus = Math.floor(fullRankBonus / 2);

    // Race keys for skill bonuses
    const raceKeySkill   = system.details.race          || "";
    const tribeKeySkill  = system.details.mythrianTribe || "";
    const clanKeySkill   = system.details.draconianClan || "";
    const aspectKeySkill = system.details.scionAspect   || "";

    const backTypeKeySkill = system.details.backgroundType || "";
    const backKeySkill     = system.details.background     || "";

    // Helper: apply skill bonus arrays
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

    // Racial skill bonuses
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

    // Background type skill bonus
    if (backTypeKeySkill &&
        bgTypeForSkills[backTypeKeySkill] &&
        bgTypeForSkills[backTypeKeySkill].skill) {
      applySkillArray([bgTypeForSkills[backTypeKeySkill].skill], "backgroundBonus");
    }

    // Individual background skill bonus
    if (backKeySkill &&
        bgForSkills[backKeySkill] &&
        bgForSkills[backKeySkill].skill) {
      applySkillArray([bgForSkills[backKeySkill].skill], "backgroundBonus");
    }

    // Final skill totals:
    //  - Trained: full rank bonus
    //  - Untrained: half rank bonus (rounded down)
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

          const racial     = Number(node.racialBonus     ?? 0);
          const background = Number(node.backgroundBonus ?? 0);
          const misc       = Number(node.misc            ?? 0);

          const rankComponent = node.trained ? fullRankBonus : halfRankBonus;
          node.rankBonus = rankComponent;

          node.total = attrTotal + racial + background + rankComponent + misc;
        }
      }
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

    system.status.armor.current     = Number(system.status.armor.current     ?? 0);
    system.status.armor.max         = Number(system.status.armor.max         ?? 0);
    system.status.shielding.current = Number(system.status.shielding.current ?? 0);

    const def = system.status.defense;
    const baseDefense = Number(def.touch ?? 10);

    def.touch = baseDefense;

    const natArmor  = system.status.naturalArmor || 0;
    const wornArmor = system.status.armor.current || 0;
    def.physical = baseDefense + natArmor + wornArmor;

    def.magical = Number(def.magical ?? baseDefense);

    /* ====================================================================== */
    /* SPIRIT ADVANCEMENT POOL                                                */
    /* ====================================================================== */

    system.spirit = system.spirit || {};

    const current = Number(system.spirit.current ?? 0);
    const spent   = Number(system.spirit.spent   ?? 0);

    const safeCurrent = isNaN(current) ? 0 : Math.max(0, current);
    const safeSpent   = isNaN(spent)   ? 0 : Math.max(0, spent);

    system.spirit.current = safeCurrent;
    system.spirit.spent   = safeSpent;
    system.spirit.total   = safeCurrent + safeSpent;
  }
}

