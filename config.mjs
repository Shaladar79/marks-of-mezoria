// config.mjs – Marks of Mezoria config

// -------------------------------------
// IMPORTS
// -------------------------------------
import { RaceData } from "./scripts/races.mjs";
import { RaceBonuses } from "./scripts/races.mjs";
import { RaceStatus } from "./scripts/races.mjs";
import { RankData } from "./scripts/rank.mjs";
import { RaceSkillData } from "./scripts/raceSkills.mjs";
import { BackgroundTypeBonuses, BackgroundBonuses } from "./scripts/backgrounds.mjs";
import { MarkPurposeData } from "./scripts/mark-purpose.mjs";
import { AbilityData } from "./scripts/abilities.mjs";

// IMPORTANT: These should match where the files actually live.
// If your marks are still in /scripts/ (root), change these back to "./scripts/marks-of-power.mjs" etc.
import { MarksOfPower } from "./scripts/marks-of-power.mjs";
import { MarksOfConcept } from "./scripts/marks-of-concept.mjs";
export const MezoriaConfig = {};

// ============================================================================
//                               HELPERS
// ============================================================================

/**
 * Flatten grouped mark objects { groupName: ["A","B"] } -> ["A","B",...]
 */
function flattenMarkGroups(grouped) {
  const out = [];
  for (const arr of Object.values(grouped || {})) {
    if (Array.isArray(arr)) out.push(...arr);
  }
  return Array.from(new Set(out));
}

/**
 * Convert a labels map { key: "Label" } into dropdown options object { key: "Label" }.
 */
function labelsMapToOptions(map) {
  const out = {};
  for (const [k, v] of Object.entries(map || {})) {
    const key = String(k).trim();
    if (!key) continue;
    out[key] = String(v);
  }
  return out;
}

/**
 * Convert an array of labels ["Fire","Ice"] into dropdown options object { "fire":"Fire", "ice":"Ice" }.
 * Keys are normalized to lowercase for stable storage.
 */
function labelArrayToOptions(arr) {
  const out = {};
  for (const label of (arr || [])) {
    const raw = String(label ?? "").trim();
    if (!raw) continue;
    out[raw.toLowerCase()] = raw;
  }
  return out;
}

// -------------------------------------
// RACES
// -------------------------------------
MezoriaConfig.races            = RaceData.labels;
MezoriaConfig.raceDescriptions = RaceData.descriptions;
MezoriaConfig.raceBonuses      = RaceBonuses;
MezoriaConfig.raceStatus       = RaceStatus;

// -------------------------------------
// Racial skill bonuses
// -------------------------------------
MezoriaConfig.raceSkillData = RaceSkillData;

// -------------------------------------
// MYTHRIAN TRIBES / CLANS / ASPECTS
// -------------------------------------
MezoriaConfig.mythrianTribes       = RaceData.mythrianTribes;
MezoriaConfig.draconianClans       = RaceData.draconianClans;
MezoriaConfig.scionAspects         = RaceData.scionAspects;

MezoriaConfig.mythrianTribeBonuses = RaceData.mythrianTribeBonuses;
MezoriaConfig.draconianClanBonuses = RaceData.draconianClanBonuses;
MezoriaConfig.scionAspectBonuses   = RaceData.scionAspectBonuses;

// -------------------------------------
// RANKS
// -------------------------------------
MezoriaConfig.ranks            = RankData.order;
MezoriaConfig.rankSkillBonuses = RankData.trainedSkillBonus;

// -------------------------------------
// BACKGROUND TYPES
// -------------------------------------
MezoriaConfig.backgroundTypes = {
  common:  "Common Professions",
  skilled: "Skilled Trades & Crafts",
  street:  "Street-Level Backgrounds",
  social:  "Social & Cultural Backgrounds"
};

// -------------------------------------
// BACKGROUNDS BY TYPE
// -------------------------------------
MezoriaConfig.backgroundsByType = {
  common:  BackgroundBonuses.commonNames,
  skilled: BackgroundBonuses.skilledNames,
  street:  BackgroundBonuses.streetNames,
  social:  BackgroundBonuses.socialNames
};

// -------------------------------------
// BACKGROUND DESCRIPTIONS
// -------------------------------------
MezoriaConfig.backgroundDescriptions = BackgroundBonuses.descriptions;

// -------------------------------------
// Optional flat background map
// -------------------------------------
MezoriaConfig.backgrounds = {
  ...BackgroundBonuses.commonNames,
  ...BackgroundBonuses.skilledNames,
  ...BackgroundBonuses.streetNames,
  ...BackgroundBonuses.socialNames
};

// -------------------------------------
// BACKGROUND BONUSES
// -------------------------------------
MezoriaConfig.backgroundTypeBonuses = BackgroundTypeBonuses;
MezoriaConfig.backgroundBonuses     = BackgroundBonuses.values;

// -------------------------------------
// MARKS OF PURPOSE
// -------------------------------------
MezoriaConfig.markOfPurpose             = MarkPurposeData.labels;
MezoriaConfig.markOfPurposeDescriptions = MarkPurposeData.descriptions;

// -------------------------------------
// Skill Specialties placeholder
// -------------------------------------
MezoriaConfig.skillSpecialties = {
  default: ["Under Construction"]
};

// ============================================================================
//                         ABILITY SYSTEM CONFIG
// ============================================================================

// -------------------------------------
// Ability Rank ladder
// -------------------------------------
MezoriaConfig.abilityRanks     = AbilityData.ranks.labels;
MezoriaConfig.abilityRankOrder = AbilityData.ranks.order;

// -------------------------------------
// Ability Action Types
// -------------------------------------
MezoriaConfig.abilityActionTypes = AbilityData.actionTypes;

// -------------------------------------
// Ability Source Types
// -------------------------------------
MezoriaConfig.abilitySourceTypes = AbilityData.sourceTypes;

// -------------------------------------
// Ability Effect Types
// -------------------------------------
MezoriaConfig.abilityEffectTypes = AbilityData.effectTypes;

// -------------------------------------
// Ability Effect Resources
// -------------------------------------
MezoriaConfig.abilityEffectResources = AbilityData.effectResources;

// -------------------------------------
// Ability Damage Types
// -------------------------------------
MezoriaConfig.abilityDamageTypes = AbilityData.damageTypes;

// -------------------------------------
// Scaling Modes
// -------------------------------------
MezoriaConfig.abilityScalingModes = AbilityData.scalingModes;

// -------------------------------------
// Roll-builder config
// -------------------------------------
MezoriaConfig.abilityDieTypes      = AbilityData.rollBuilder.dieTypes;
MezoriaConfig.abilityDiceBase      = AbilityData.rollBuilder.diceBase;
MezoriaConfig.abilityModAttributes = AbilityData.rollBuilder.modAttributes;

// -------------------------------------
// Cost Types (for Activation cost)
// -------------------------------------
MezoriaConfig.abilityCostTypes = AbilityData.costTypes;

// -------------------------------------
// Ability Rank Upgrade Costs (Spirit consolidation)
// -------------------------------------
MezoriaConfig.abilityRankCosts = {
  baseCost:    AbilityData.rankCosts.baseCost,      // 100
  multipliers: AbilityData.rankCosts.multipliers,   // rank -> multiplier
  costByRank:  AbilityData.rankCosts.costByRank     // rank -> total cost
};

// ============================================================================
//                           MARK SYSTEM REGISTRY
// ============================================================================

/**
 * Drives the Ability sheet "Mark System" dropdown.
 */
MezoriaConfig.markSystems = {
  purpose:  "Mark of Purpose",
  power:    "Mark of Power",
  concept:  "Mark of Concept",
  eldritch: "Eldritch Mark"
};

/**
 * IMPORTANT FIX:
 * Your mark files are shaped like:
 *   MarksOfPower = { categories: { ... } }
 *   MarksOfConcept = { categories: { ... } }
 * So we must flatten MarksOfPower.categories / MarksOfConcept.categories.
 */
const powerLabels   = flattenMarkGroups(MarksOfPower?.categories);
const conceptLabels = flattenMarkGroups(MarksOfConcept?.categories);

/**
 * Drives the Ability sheet "Mark Required" dropdown.
 * - purpose uses your real keys from MarkPurposeData.labels (guardian, defender, etc.)
 * - power / concept use flattened label lists with lowercase keys
 * - eldritch is an empty placeholder until designed
 */
MezoriaConfig.marksBySystem = {
  purpose:  labelsMapToOptions(MezoriaConfig.markOfPurpose),
  power:    labelArrayToOptions(powerLabels),
  concept:  labelArrayToOptions(conceptLabels),
  eldritch: {}
};
