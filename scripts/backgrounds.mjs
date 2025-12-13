// scripts/backgrounds.mjs
// ========================================================
// Background Type Bonuses + Individual Background Bonuses
// ========================================================

// -------------------------------------
// TYPE BONUSES
// Each background TYPE grants:
//  • +1 to an attribute (group + subattribute)
//  • +1 to a skill (path)
// -------------------------------------

export const BackgroundTypeBonuses = {
  common: {
    attribute: { group: "body", sub: "endurance", value: 1 },
    skill:     { path: "body.endurance.fortitude", value: 1 }
  },

  skilled: {
    attribute: { group: "mind", sub: "focus", value: 1 },
    skill:     { path: "mind.focus.research", value: 1 }
  },

  street: {
    attribute: { group: "body", sub: "swiftness", value: 1 },
    skill:     { path: "soul.presence.streetwise", value: 1 }
  },

  social: {
    attribute: { group: "soul", sub: "presence", value: 1 },
    skill:     { path: "soul.presence.persuasion", value: 1 }
  }
};

// -------------------------------------
// HELPERS
// -------------------------------------

function titleCaseFromKey(key) {
  const raw = String(key ?? "").trim();
  if (!raw) return "";

  // Custom fixes for your known abbreviations / legacy keys
  const overrides = {
    blacksmith_app: "Blacksmith Apprentice",
    street_perf: "Street Performer",
    cook_skilled: "Cook",
    noble_courtier: "Noble Courtier",
    temple_acolyte: "Temple Acolyte",
    clan_heir: "Clan Heir",
    diplomatic_envoy: "Diplomatic Envoy",
    wandering_pilgrim: "Wandering Pilgrim",
    tribal_nomad: "Tribal Nomad",
    scholars_ward: "Scholar’s Ward",
    exiled_bloodline: "Exiled Bloodline",
    cultural_artisan: "Cultural Artisan",
    temple_foundling: "Temple Foundling",
    cult_survivor: "Cult Survivor",
    diplomatic_hostage: "Diplomatic Hostage",
    festival_child: "Festival Child",
    marked_prophecy: "Marked by Prophecy",
    monastic_disciple: "Monastic Disciple",
    political_dissident: "Political Dissident",
    archivists_kin: "Archivist’s Kin",
    hearth_storykeeper: "Hearth Storykeeper",
    oath_retainer: "Oath Retainer"
  };

  if (overrides[raw]) return overrides[raw];

  return raw
    .split("_")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// -------------------------------------
// INDIVIDUAL BACKGROUND BONUSES (VALUES)
// Each background gives:
//  • +1 to a sub-attribute
//  • +1 to one skill
// -------------------------------------

const values = {
  // ---------- COMMON ----------
  farmer:      { attribute: { group: "body", sub: "endurance", value: 1 }, skill: { path: "body.endurance.fortitude", value: 1 } },
  hunter:      { attribute: { group: "mind", sub: "insight",   value: 1 }, skill: { path: "mind.insight.tracking",    value: 1 } },
  fisher:      { attribute: { group: "mind", sub: "insight",   value: 1 }, skill: { path: "mind.insight.awareness",   value: 1 } },
  laborer:     { attribute: { group: "body", sub: "might",     value: 1 }, skill: { path: "body.might.athletics",     value: 1 } },
  merchant:    { attribute: { group: "soul", sub: "presence",  value: 1 }, skill: { path: "soul.presence.persuasion", value: 1 } },
  shepherd:    { attribute: { group: "mind", sub: "insight",   value: 1 }, skill: { path: "mind.insight.perception",  value: 1 } },
  gravedigger: { attribute: { group: "body", sub: "endurance", value: 1 }, skill: { path: "soul.resolve.composure",   value: 1 } },
  stable_hand: { attribute: { group: "body", sub: "swiftness", value: 1 }, skill: { path: "body.might.athletics",     value: 1 } },
  messenger:   { attribute: { group: "body", sub: "swiftness", value: 1 }, skill: { path: "body.might.athletics",     value: 1 } },
  woodcutter:  { attribute: { group: "body", sub: "might",     value: 1 }, skill: { path: "body.might.heft",          value: 1 } },
  milkmaid:    { attribute: { group: "body", sub: "endurance", value: 1 }, skill: { path: "soul.grace.poise",         value: 1 } },
  field_hand:  { attribute: { group: "body", sub: "might",     value: 1 }, skill: { path: "body.endurance.fortitude", value: 1 } },
  field_guide: { attribute: { group: "mind", sub: "insight",   value: 1 }, skill: { path: "mind.insight.tracking",    value: 1 } },
  cook:        { attribute: { group: "mind", sub: "focus",     value: 1 }, skill: { path: "soul.grace.improvisation", value: 1 } },

  // ---------- SKILLED ----------
  blacksmith_app:  { attribute: { group: "body", sub: "might",     value: 1 }, skill: { path: "body.might.heft",              value: 1 } },
  herbalist:       { attribute: { group: "mind", sub: "insight",   value: 1 }, skill: { path: "mind.insight.investigation",  value: 1 } },
  scribe:          { attribute: { group: "mind", sub: "focus",     value: 1 }, skill: { path: "mind.focus.logic",            value: 1 } },
  tanner:          { attribute: { group: "body", sub: "endurance", value: 1 }, skill: { path: "body.endurance.fortitude",    value: 1 } },
  glassblower:     { attribute: { group: "soul", sub: "grace",     value: 1 }, skill: { path: "soul.grace.poise",            value: 1 } },
  weaver:          { attribute: { group: "soul", sub: "grace",     value: 1 }, skill: { path: "soul.grace.mimicry",          value: 1 } },
  potter:          { attribute: { group: "soul", sub: "grace",     value: 1 }, skill: { path: "soul.grace.improvisation",    value: 1 } },
  chandler:        { attribute: { group: "mind", sub: "focus",     value: 1 }, skill: { path: "mind.focus.research",         value: 1 } },
  mason:           { attribute: { group: "body", sub: "might",     value: 1 }, skill: { path: "body.might.athletics",        value: 1 } },
  bowyer_fletcher: { attribute: { group: "mind", sub: "focus",     value: 1 }, skill: { path: "mind.focus.tactics",          value: 1 } },
  brewer:          { attribute: { group: "mind", sub: "insight",   value: 1 }, skill: { path: "mind.focus.research",         value: 1 } },
  tailor:          { attribute: { group: "soul", sub: "grace",     value: 1 }, skill: { path: "soul.grace.performance",      value: 1 } },
  shipwright:      { attribute: { group: "mind", sub: "focus",     value: 1 }, skill: { path: "mind.focus.logic",            value: 1 } },
  jeweler:         { attribute: { group: "soul", sub: "grace",     value: 1 }, skill: { path: "soul.grace.poise",            value: 1 } },
  carpenter:       { attribute: { group: "body", sub: "might",     value: 1 }, skill: { path: "body.might.athletics",        value: 1 } },
  calligrapher:    { attribute: { group: "mind", sub: "focus",     value: 1 }, skill: { path: "mind.willpower.concentration",value: 1 } },
  miner:           { attribute: { group: "body", sub: "endurance", value: 1 }, skill: { path: "body.endurance.fortitude",    value: 1 } },
  tinker:          { attribute: { group: "mind", sub: "focus",     value: 1 }, skill: { path: "mind.focus.useMagicDevice",   value: 1 } },
  butcher:         { attribute: { group: "body", sub: "might",     value: 1 }, skill: { path: "soul.resolve.composure",      value: 1 } },
  cobbler:         { attribute: { group: "soul", sub: "grace",     value: 1 }, skill: { path: "soul.grace.improvisation",    value: 1 } },
  bookbinder:      { attribute: { group: "mind", sub: "focus",     value: 1 }, skill: { path: "mind.focus.research",         value: 1 } },
  painter:         { attribute: { group: "soul", sub: "grace",     value: 1 }, skill: { path: "soul.grace.performance",      value: 1 } },
  ropemaker:       { attribute: { group: "body", sub: "endurance", value: 1 }, skill: { path: "body.might.athletics",        value: 1 } },
  armorer:         { attribute: { group: "body", sub: "might",     value: 1 }, skill: { path: "body.might.heft",             value: 1 } },
  perfumer:        { attribute: { group: "mind", sub: "insight",   value: 1 }, skill: { path: "mind.insight.perception",     value: 1 } },
  cook_skilled:    { attribute: { group: "mind", sub: "focus",     value: 1 }, skill: { path: "soul.grace.performance",      value: 1 } },

  // ---------- STREET ----------
  urchin:          { attribute: { group: "body", sub: "swiftness", value: 1 }, skill: { path: "body.swiftness.stealth",        value: 1 } },
  beggar:          { attribute: { group: "soul", sub: "presence",  value: 1 }, skill: { path: "soul.presence.deception",       value: 1 } },
  street_perf:     { attribute: { group: "soul", sub: "grace",     value: 1 }, skill: { path: "soul.grace.performance",        value: 1 } },
  drudge:          { attribute: { group: "body", sub: "endurance", value: 1 }, skill: { path: "body.endurance.fortitude",     value: 1 } },
  pickpocket:      { attribute: { group: "body", sub: "swiftness", value: 1 }, skill: { path: "body.swiftness.sleightOfHand", value: 1 } },
  lookout:         { attribute: { group: "mind", sub: "insight",   value: 1 }, skill: { path: "mind.insight.perception",       value: 1 } },
  runner:          { attribute: { group: "body", sub: "swiftness", value: 1 }, skill: { path: "body.might.athletics",          value: 1 } },
  fence:           { attribute: { group: "soul", sub: "presence",  value: 1 }, skill: { path: "soul.presence.streetwise",      value: 1 } },
  rat_catcher:     { attribute: { group: "body", sub: "swiftness", value: 1 }, skill: { path: "body.swiftness.stealth",        value: 1 } },
  dockhand:        { attribute: { group: "body", sub: "might",     value: 1 }, skill: { path: "body.might.heft",              value: 1 } },
  scavenger:       { attribute: { group: "mind", sub: "insight",   value: 1 }, skill: { path: "mind.insight.investigation",   value: 1 } },
  alley_healer:    { attribute: { group: "mind", sub: "insight",   value: 1 }, skill: { path: "mind.insight.intuition",       value: 1 } },
  street_preacher: { attribute: { group: "soul", sub: "presence",  value: 1 }, skill: { path: "soul.presence.oratory",        value: 1 } },

  // ---------- SOCIAL ----------
  noble_courtier:      { attribute: { group: "soul", sub: "presence",  value: 1 }, skill: { path: "soul.presence.etiquette",      value: 1 } },
  temple_acolyte:      { attribute: { group: "mind", sub: "willpower", value: 1 }, skill: { path: "mind.willpower.concentration", value: 1 } },
  clan_heir:           { attribute: { group: "soul", sub: "resolve",   value: 1 }, skill: { path: "soul.resolve.conviction",     value: 1 } },
  diplomatic_envoy:    { attribute: { group: "soul", sub: "presence",  value: 1 }, skill: { path: "soul.presence.persuasion",     value: 1 } },
  wandering_pilgrim:   { attribute: { group: "body", sub: "endurance", value: 1 }, skill: { path: "mind.insight.awareness",      value: 1 } },
  tribal_nomad:        { attribute: { group: "body", sub: "swiftness", value: 1 }, skill: { path: "mind.insight.tracking",       value: 1 } },
  scholars_ward:       { attribute: { group: "mind", sub: "focus",     value: 1 }, skill: { path: "mind.focus.research",         value: 1 } },
  exiled_bloodline:    { attribute: { group: "soul", sub: "resolve",   value: 1 }, skill: { path: "soul.resolve.composure",      value: 1 } },
  cultural_artisan:    { attribute: { group: "soul", sub: "grace",     value: 1 }, skill: { path: "soul.grace.performance",      value: 1 } },
  temple_foundling:    { attribute: { group: "soul", sub: "resolve",   value: 1 }, skill: { path: "soul.resolve.conviction",     value: 1 } },
  guildborn:           { attribute: { group: "soul", sub: "presence",  value: 1 }, skill: { path: "soul.presence.streetwise",    value: 1 } },
  cult_survivor:       { attribute: { group: "mind", sub: "willpower", value: 1 }, skill: { path: "mind.willpower.mentalFortitude", value: 1 } },
  diplomatic_hostage:  { attribute: { group: "soul", sub: "presence",  value: 1 }, skill: { path: "soul.presence.etiquette",     value: 1 } },
  festival_child:      { attribute: { group: "soul", sub: "grace",     value: 1 }, skill: { path: "soul.grace.performance",      value: 1 } },
  marked_prophecy:     { attribute: { group: "soul", sub: "resolve",   value: 1 }, skill: { path: "soul.resolve.auraControl",    value: 1 } },
  monastic_disciple:   { attribute: { group: "body", sub: "might",     value: 1 }, skill: { path: "body.might.athletics",        value: 1 } },
  political_dissident: { attribute: { group: "soul", sub: "presence",  value: 1 }, skill: { path: "soul.presence.oratory",        value: 1 } },
  archivists_kin:      { attribute: { group: "mind", sub: "focus",     value: 1 }, skill: { path: "mind.focus.research",         value: 1 } },
  hearth_storykeeper:  { attribute: { group: "soul", sub: "grace",     value: 1 }, skill: { path: "soul.presence.oratory",        value: 1 } },
  oath_retainer:       { attribute: { group: "soul", sub: "resolve",   value: 1 }, skill: { path: "soul.resolve.conviction",     value: 1 } }
};

// -------------------------------------
// BACKGROUND KEYS BY TYPE (for dropdowns)
// -------------------------------------

const commonKeys = [
  "farmer","hunter","fisher","laborer","merchant","shepherd","gravedigger",
  "stable_hand","messenger","woodcutter","milkmaid","field_hand","field_guide","cook"
];

const skilledKeys = [
  "blacksmith_app","herbalist","scribe","tanner","glassblower","weaver","potter","chandler",
  "mason","bowyer_fletcher","brewer","tailor","shipwright","jeweler","carpenter","calligrapher",
  "miner","tinker","butcher","cobbler","bookbinder","painter","ropemaker","armorer","perfumer","cook_skilled"
];

const streetKeys = [
  "urchin","beggar","street_perf","drudge","pickpocket","lookout","runner","fence",
  "rat_catcher","dockhand","scavenger","alley_healer","street_preacher"
];

const socialKeys = [
  "noble_courtier","temple_acolyte","clan_heir","diplomatic_envoy","wandering_pilgrim",
  "tribal_nomad","scholars_ward","exiled_bloodline","cultural_artisan","temple_foundling",
  "guildborn","cult_survivor","diplomatic_hostage","festival_child","marked_prophecy",
  "monastic_disciple","political_dissident","archivists_kin","hearth_storykeeper","oath_retainer"
];

function buildNames(keys) {
  const out = {};
  for (const k of keys) out[k] = titleCaseFromKey(k);
  return out;
}

function buildDescriptions(keys) {
  // Lightweight placeholder descriptions so your backinfo.hbs lookup works.
  // Replace/expand later when you want richer text.
  const out = {};
  for (const k of keys) out[k] = `${titleCaseFromKey(k)} background.`;
  return out;
}

// -------------------------------------
// EXPORT: BackgroundBonuses (expected by config.mjs)
// -------------------------------------

export const BackgroundBonuses = {
  values,

  commonNames:  buildNames(commonKeys),
  skilledNames: buildNames(skilledKeys),
  streetNames:  buildNames(streetKeys),
  socialNames:  buildNames(socialKeys),

  descriptions: {
    ...buildDescriptions(commonKeys),
    ...buildDescriptions(skilledKeys),
    ...buildDescriptions(streetKeys),
    ...buildDescriptions(socialKeys)
  }
};
