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

export const MezoriaConfig = {};

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
MezoriaConfig.ranks = RankData.order;
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
