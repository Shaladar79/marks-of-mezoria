// scripts/packs/backgroundabilitypack.mjs

/**
 * BackgroundAbilityPack
 *
 * Phase 7: Real background ability designs (minimum viable pass).
 *
 * Identity (non-duplication):
 *  item.type === "ability" AND
 *  item.system.details.sourceType === "background" AND
 *  item.system.details.sourceKey  === "<backgroundKey>"
 *
 * NOTE: cook_skilled intentionally excluded; Cook remains Common only.
 *
 * UPDATE (Common list trim):
 *  - Removed: milkmaid, field_hand, field_guide
 *  - Added: conscript
 *
 * DESIGN RULE (Common):
 *  - Common background abilities are utility powers, usable 1/scene.
 */

function baseBackgroundAbility({ backgroundKey, backgroundLabel, backgroundType }) {
  return {
    key: `background-${backgroundKey}-ability`,
    name: `${backgroundLabel} — Background Specialty`,
    type: "ability",
    img: "icons/svg/book.svg",
    system: {
      details: {
        short: "",
        description: "",

        rankReq: "normal",
        currentRank: "normal",
        syncWithRank: false,
        noConsolidate: true,

        actionType: "passive",
        actionCost: 0,
        range: "Self",

        cost: { type: "none", value: 0, perRank: false, extraPerRank: 0, recover: "" },
        effect: { type: "utility", notes: "" },
        scaling: { enabled: false, mode: "", value: "" },

        // Identity fields (DO NOT CHANGE)
        sourceType: "background",
        sourceKey: backgroundKey,
        autoGranted: false,

        tags: `background,${backgroundType},${backgroundKey}`
      }
    }
  };
}

// -------------------------
// Pattern Helpers
// -------------------------
function passiveSkillBonus({ bg, abilityName, skill, value = 2, notes }) {
  const a = baseBackgroundAbility(bg);
  a.name = `${bg.backgroundLabel} — ${abilityName}`;
  a.system.details.short = `Passive: +${value} to ${skill}.`;
  a.system.details.description = notes || `You gain a permanent +${value} bonus to ${skill} checks.`;
  a.system.details.actionType = "passive";
  a.system.details.actionCost = 0;
  a.system.details.cost = { type: "none", value: 0, perRank: false, extraPerRank: 0, recover: "" };
  a.system.details.effect = {
    type: "skillBonus",
    skill,
    mode: "add",
    value,
    notes: notes || ""
  };
  return a;
}

function passiveResourceBonus({ bg, abilityName, resource, value = 1, notes }) {
  const a = baseBackgroundAbility(bg);
  a.name = `${bg.backgroundLabel} — ${abilityName}`;
  a.system.details.short = `Passive: +${value} max ${resource}.`;
  a.system.details.description = notes || `Increase your maximum ${resource} by ${value}.`;
  a.system.details.actionType = "passive";
  a.system.details.actionCost = 0;
  a.system.details.cost = { type: "none", value: 0, perRank: false, extraPerRank: 0, recover: "" };
  a.system.details.effect = {
    type: "resourceMax",
    resource,
    mode: "add",
    value,
    notes: notes || ""
  };
  return a;
}

function oncePerSceneUtility({ bg, abilityName, effect, notes }) {
  const a = baseBackgroundAbility(bg);
  a.name = `${bg.backgroundLabel} — ${abilityName}`;
  a.system.details.short = "Active: once per scene.";
  a.system.details.description = notes || "A reliable once-per-scene technique.";
  a.system.details.actionType = "utility";
  a.system.details.actionCost = 1;
  a.system.details.cost = { type: "charges", value: 1, perRank: false, extraPerRank: 0, recover: "scene" };
  a.system.details.effect = {
    ...effect,
    notes: notes || ""
  };
  return a;
}

function oncePerDayUtility({ bg, abilityName, effect, notes }) {
  const a = baseBackgroundAbility(bg);
  a.name = `${bg.backgroundLabel} — ${abilityName}`;
  a.system.details.short = "Active: once per day.";
  a.system.details.description = notes || "A dependable once-per-day technique.";
  a.system.details.actionType = "utility";
  a.system.details.actionCost = 1;
  a.system.details.cost = { type: "charges", value: 1, perRank: false, extraPerRank: 0, recover: "day" };
  a.system.details.effect = {
    ...effect,
    notes: notes || ""
  };
  return a;
}

function reactionTech({ bg, abilityName, effect, notes }) {
  const a = baseBackgroundAbility(bg);
  a.name = `${bg.backgroundLabel} — ${abilityName}`;
  a.system.details.short = "Reaction: defensive technique.";
  a.system.details.description = notes || "A reactive technique used under pressure.";
  a.system.details.actionType = "reaction";
  a.system.details.actionCost = 1;
  a.system.details.cost = { type: "none", value: 0, perRank: false, extraPerRank: 0, recover: "" };
  a.system.details.effect = {
    ...effect,
    notes: notes || ""
  };
  return a;
}

function movementTech({ bg, abilityName, effect, notes }) {
  const a = baseBackgroundAbility(bg);
  a.name = `${bg.backgroundLabel} — ${abilityName}`;
  a.system.details.short = "Movement technique.";
  a.system.details.description = notes || "A mobility and positioning technique.";
  a.system.details.actionType = "movement";
  a.system.details.actionCost = 1;
  a.system.details.cost = { type: "none", value: 0, perRank: false, extraPerRank: 0, recover: "" };
  a.system.details.effect = {
    ...effect,
    notes: notes || ""
  };
  return a;
}

function downtimeEdge({ bg, abilityName, effect, notes }) {
  const a = baseBackgroundAbility(bg);
  a.name = `${bg.backgroundLabel} — ${abilityName}`;
  a.system.details.short = "Downtime edge.";
  a.system.details.description = notes || "Improves outcomes during crafting, trade, or preparation.";
  a.system.details.actionType = "downtime";
  a.system.details.actionCost = 0;
  a.system.details.cost = { type: "none", value: 0, perRank: false, extraPerRank: 0, recover: "" };
  a.system.details.effect = {
    ...effect,
    notes: notes || ""
  };
  return a;
}

function combatTechnique({ bg, abilityName, effect, notes }) {
  const a = baseBackgroundAbility(bg);
  a.name = `${bg.backgroundLabel} — ${abilityName}`;
  a.system.details.short = "Combat technique.";
  a.system.details.description = notes || "A combat-facing technique derived from your background.";
  a.system.details.actionType = "attack";
  a.system.details.actionCost = 1;
  a.system.details.cost = { type: "charges", value: 1, perRank: false, extraPerRank: 0, recover: "scene" };
  a.system.details.effect = {
    ...effect,
    notes: notes || ""
  };
  return a;
}

// -------------------------
// Background List (updated common trim)
// -------------------------
export const BackgroundAbilityPack = {
  backgroundList: [
    // COMMON (12) — trimmed + conscript added
    { backgroundType: "common", backgroundKey: "farmer", backgroundLabel: "Farmer" },
    { backgroundType: "common", backgroundKey: "hunter", backgroundLabel: "Hunter" },
    { backgroundType: "common", backgroundKey: "fisher", backgroundLabel: "Fisher" },
    { backgroundType: "common", backgroundKey: "laborer", backgroundLabel: "Laborer" },
    { backgroundType: "common", backgroundKey: "merchant", backgroundLabel: "Merchant" },
    { backgroundType: "common", backgroundKey: "shepherd", backgroundLabel: "Shepherd" },
    { backgroundType: "common", backgroundKey: "gravedigger", backgroundLabel: "Gravedigger" },
    { backgroundType: "common", backgroundKey: "stable_hand", backgroundLabel: "Stable Hand" },
    { backgroundType: "common", backgroundKey: "messenger", backgroundLabel: "Messenger" },
    { backgroundType: "common", backgroundKey: "woodcutter", backgroundLabel: "Woodcutter" },
    { backgroundType: "common", backgroundKey: "cook", backgroundLabel: "Cook" },
    { backgroundType: "common", backgroundKey: "conscript", backgroundLabel: "Conscript" },

    // SKILLED (25) — cook_skilled excluded
    { backgroundType: "skilled", backgroundKey: "blacksmith_app", backgroundLabel: "Blacksmith Apprentice" },
    { backgroundType: "skilled", backgroundKey: "herbalist", backgroundLabel: "Herbalist" },
    { backgroundType: "skilled", backgroundKey: "scribe", backgroundLabel: "Scribe" },
    { backgroundType: "skilled", backgroundKey: "tanner", backgroundLabel: "Tanner" },
    { backgroundType: "skilled", backgroundKey: "glassblower", backgroundLabel: "Glassblower" },
    { backgroundType: "skilled", backgroundKey: "weaver", backgroundLabel: "Weaver" },
    { backgroundType: "skilled", backgroundKey: "potter", backgroundLabel: "Potter" },
    { backgroundType: "skilled", backgroundKey: "chandler", backgroundLabel: "Chandler" },
    { backgroundType: "skilled", backgroundKey: "mason", backgroundLabel: "Mason" },
    { backgroundType: "skilled", backgroundKey: "bowyer_fletcher", backgroundLabel: "Bowyer Fletcher" },
    { backgroundType: "skilled", backgroundKey: "brewer", backgroundLabel: "Brewer" },
    { backgroundType: "skilled", backgroundKey: "tailor", backgroundLabel: "Tailor" },
    { backgroundType: "skilled", backgroundKey: "shipwright", backgroundLabel: "Shipwright" },
    { backgroundType: "skilled", backgroundKey: "jeweler", backgroundLabel: "Jeweler" },
    { backgroundType: "skilled", backgroundKey: "carpenter", backgroundLabel: "Carpenter" },
    { backgroundType: "skilled", backgroundKey: "calligrapher", backgroundLabel: "Calligrapher" },
    { backgroundType: "skilled", backgroundKey: "miner", backgroundLabel: "Miner" },
    { backgroundType: "skilled", backgroundKey: "tinker", backgroundLabel: "Tinker" },
    { backgroundType: "skilled", backgroundKey: "butcher", backgroundLabel: "Butcher" },
    { backgroundType: "skilled", backgroundKey: "cobbler", backgroundLabel: "Cobbler" },
    { backgroundType: "skilled", backgroundKey: "bookbinder", backgroundLabel: "Bookbinder" },
    { backgroundType: "skilled", backgroundKey: "painter", backgroundLabel: "Painter" },
    { backgroundType: "skilled", backgroundKey: "ropemaker", backgroundLabel: "Ropemaker" },
    { backgroundType: "skilled", backgroundKey: "armorer", backgroundLabel: "Armorer" },
    { backgroundType: "skilled", backgroundKey: "perfumer", backgroundLabel: "Perfumer" },

    // STREET (13)
    { backgroundType: "street", backgroundKey: "urchin", backgroundLabel: "Urchin" },
    { backgroundType: "street", backgroundKey: "beggar", backgroundLabel: "Beggar" },
    { backgroundType: "street", backgroundKey: "street_perf", backgroundLabel: "Street Performer" },
    { backgroundType: "street", backgroundKey: "drudge", backgroundLabel: "Drudge" },
    { backgroundType: "street", backgroundKey: "pickpocket", backgroundLabel: "Pickpocket" },
    { backgroundType: "street", backgroundKey: "lookout", backgroundLabel: "Lookout" },
    { backgroundType: "street", backgroundKey: "runner", backgroundLabel: "Runner" },
    { backgroundType: "street", backgroundKey: "fence", backgroundLabel: "Fence" },
    { backgroundType: "street", backgroundKey: "rat_catcher", backgroundLabel: "Rat Catcher" },
    { backgroundType: "street", backgroundKey: "dockhand", backgroundLabel: "Dockhand" },
    { backgroundType: "street", backgroundKey: "scavenger", backgroundLabel: "Scavenger" },
    { backgroundType: "street", backgroundKey: "alley_healer", backgroundLabel: "Alley Healer" },
    { backgroundType: "street", backgroundKey: "street_preacher", backgroundLabel: "Street Preacher" },

    // SOCIAL (20)
    { backgroundType: "social", backgroundKey: "noble_courtier", backgroundLabel: "Noble Courtier" },
    { backgroundType: "social", backgroundKey: "temple_acolyte", backgroundLabel: "Temple Acolyte" },
    { backgroundType: "social", backgroundKey: "clan_heir", backgroundLabel: "Clan Heir" },
    { backgroundType: "social", backgroundKey: "diplomatic_envoy", backgroundLabel: "Diplomatic Envoy" },
    { backgroundType: "social", backgroundKey: "wandering_pilgrim", backgroundLabel: "Wandering Pilgrim" },
    { backgroundType: "social", backgroundKey: "tribal_nomad", backgroundLabel: "Tribal Nomad" },
    { backgroundType: "social", backgroundKey: "scholars_ward", backgroundLabel: "Scholar’s Ward" },
    { backgroundType: "social", backgroundKey: "exiled_bloodline", backgroundLabel: "Exiled Bloodline" },
    { backgroundType: "social", backgroundKey: "cultural_artisan", backgroundLabel: "Cultural Artisan" },
    { backgroundType: "social", backgroundKey: "temple_foundling", backgroundLabel: "Temple Foundling" },
    { backgroundType: "social", backgroundKey: "guildborn", backgroundLabel: "Guildborn" },
    { backgroundType: "social", backgroundKey: "cult_survivor", backgroundLabel: "Cult Survivor" },
    { backgroundType: "social", backgroundKey: "diplomatic_hostage", backgroundLabel: "Diplomatic Hostage" },
    { backgroundType: "social", backgroundKey: "festival_child", backgroundLabel: "Festival Child" },
    { backgroundType: "social", backgroundKey: "marked_prophecy", backgroundLabel: "Marked by Prophecy" },
    { backgroundType: "social", backgroundKey: "monastic_disciple", backgroundLabel: "Monastic Disciple" },
    { backgroundType: "social", backgroundKey: "political_dissident", backgroundLabel: "Political Dissident" },
    { backgroundType: "social", backgroundKey: "archivists_kin", backgroundLabel: "Archivist’s Kin" },
    { backgroundType: "social", backgroundKey: "hearth_storykeeper", backgroundLabel: "Hearth Storykeeper" },
    { backgroundType: "social", backgroundKey: "oath_retainer", backgroundLabel: "Oath Retainer" }
  ],

  backgroundAbilityData: {},

  _ensureBuilt() {
    if (Object.keys(this.backgroundAbilityData).length) return;

    const byKey = {};
    for (const bg of this.backgroundList) byKey[bg.backgroundKey] = bg;

    const D = (key, builder) => {
      const bg = byKey[key];
      if (!bg) return;
      this.backgroundAbilityData[key] = builder({ bg, ...bg });
    };

    // -------------------------
    // COMMON (12) — utility 1/scene (per your rule)
    // -------------------------
   D("farmer", ({ bg }) => {
  const a = baseBackgroundAbility(bg);

  a.name = `${bg.backgroundLabel} — Second Wind`;

  a.system.details.short = "Once per scene: Restore Stamina (self).";
  a.system.details.description =
    "Once per scene, you push through fatigue. Restore 5 Stamina per character rank to yourself. " +
    "This has no activation cost.";

  // Common background design: utility, 1/scene
  a.system.details.actionType = "utility";
  a.system.details.actionCost = 1;

  // Explicitly no activation cost (per your requirement)
  a.system.details.cost = { type: "none", value: 0, perRank: false, extraPerRank: 0, recover: "" };

  // Effect payload (the sheet/engine can interpret this later; notes clarify scaling)
  a.system.details.effect = {
    type: "restore",
    resource: "stamina",
    target: "self",
    value: 5,
    per: "rank",
    notes: "Restore 5 Stamina per character rank. Once per scene. Self only."
  };

  return a;
});


    D("hunter", ({ bg }) => {
  const a = baseBackgroundAbility(bg);

  a.name = `${bg.backgroundLabel} — Track Quarry`;

  a.system.details.short = "Once per scene: Sense quarry direction (self).";
  a.system.details.description =
    "Once per scene, choose a creature you have personally seen within the last 24 hours. " +
    "You learn the general direction to that quarry, up to 2 miles per character rank. " +
    "This reveals direction only (not exact distance or location).";

  // Common background design: utility, 1 action
  a.system.details.actionType = "utility";
  a.system.details.actionCost = 1;

  // No activation cost (per your requirement). Still marks recover window for tracking.
  a.system.details.cost = { type: "none", value: 0, perRank: false, extraPerRank: 0, recover: "scene" };

  // Effect payload (interpreted by your system later)
  a.system.details.effect = {
    type: "utility",
    subtype: "locateDirection",
    target: "quarry",
    requiresSeenWithinHours: 24,
    range: { perRankMiles: 2 },
    reveals: ["direction"],
    notes: "Once per scene. Must have personally seen the target within last 24 hours."
  };

  return a;
});


   D("fisher", ({ bg }) => {
  const a = baseBackgroundAbility(bg);

  a.name = `${bg.backgroundLabel} — Slip the Hook`;

  a.system.details.short = "Once per day: Escape and reposition (self).";
  a.system.details.description =
    "Once per day, when you successfully escape a grapple, restraint, or movement-impairing effect, " +
    "you may immediately relocate yourself up to 5 feet per character rank. " +
    "This relocation does not provoke reactions/opportunity effects and must be to a physically reachable space.";

  // Utility with 1 action cost
  a.system.details.actionType = "utility";
  a.system.details.actionCost = 1;

  // No activation cost; limited by daily charge
  a.system.details.cost = { type: "charges", value: 1, perRank: false, extraPerRank: 0, recover: "day" };

  // Effect payload (interpreted by your engine later)
  a.system.details.effect = {
    type: "utility",
    subtype: "escapeReposition",
    target: "self",
    trigger: "onEscape",
    reposition: { feetPerRank: 5, provokes: false },
    notes: "Once per day. Triggers when you successfully escape a grapple/restraint or similar hinder."
  };

  return a;
});


   D("laborer", ({ bg }) => {
  const a = baseBackgroundAbility(bg);

  a.name = `${bg.backgroundLabel} — Lift Like a Mule`;

  a.system.details.short = "Once per scene: +carry/drag/lift capacity (self).";
  a.system.details.description =
    "Once per scene, you tap into practiced work-strength. For the rest of the scene, " +
    "increase your carrying/dragging/lifting capacity by 50%, plus an additional 25% per character rank. " +
    "This is a logistics/objective utility, not a combat damage buff.";

  // Utility activation
  a.system.details.actionType = "utility";
  a.system.details.actionCost = 1;

  // No activation resource cost; limited by once-per-scene charge
  a.system.details.cost = { type: "charges", value: 1, perRank: false, extraPerRank: 0, recover: "scene" };

  // Effect payload (engine interprets later)
  a.system.details.effect = {
    type: "utility",
    subtype: "capacityBoost",
    target: "self",
    duration: "scene",
    capacity: {
      basePercent: 50,
      perRankPercent: 25,
      appliesTo: ["carry", "drag", "lift"]
    },
    notes: "Once per scene. +50% capacity, +25% per character rank."
  };

  return a;
});


   D("merchant", ({ bg }) => {
  const a = baseBackgroundAbility(bg);

  a.name = `${bg.backgroundLabel} — Appraise Instantly`;

  a.system.details.short = "Once per scene: Appraise an item (rank-limited).";
  a.system.details.description =
    "Once per scene, you can quickly appraise one item you can see and reasonably inspect. " +
    "If the item is of your character rank or lower, you learn its approximate value band (or market range), " +
    "whether it is fake/damaged/misrepresented, and one notable risk/trait. " +
    "This does not reveal full magical properties or hidden powers.";

  // Utility activation
  a.system.details.actionType = "utility";
  a.system.details.actionCost = 1;

  // No activation cost; limited by once-per-scene charge
  a.system.details.cost = { type: "charges", value: 1, perRank: false, extraPerRank: 0, recover: "scene" };

  // Effect payload (engine interprets later)
  a.system.details.effect = {
    type: "utility",
    subtype: "appraise",
    target: "item",
    duration: "instant",
    rankLimit: "actor", // meaning: only items of actor rank or lower
    reveals: ["valueBand", "authenticity", "oneRiskOrTrait"],
    notes: "Only works on items of your character rank or lower. Not a magical identification."
  };

  return a;
});


   D("shepherd", ({ bg }) => {
  const a = baseBackgroundAbility(bg);

  a.name = `${bg.backgroundLabel} — Calm the Flock`;

  a.system.details.short = "Once per scene: Calm animals (rank-limited).";
  a.system.details.description =
    "Once per scene, you calm frightened or agitated animals of your character rank or lower, " +
    "preventing panic, stampede, or uncontrolled aggression for the remainder of the scene. " +
    "At Normal rank you affect 1 animal, and you affect +1 additional animal every other character rank.";

  // Utility activation
  a.system.details.actionType = "utility";
  a.system.details.actionCost = 1;

  // No activation cost; limited by once-per-scene charge
  a.system.details.cost = { type: "charges", value: 1, perRank: false, extraPerRank: 0, recover: "scene" };

  // Effect payload (engine interprets later)
  a.system.details.effect = {
    type: "utility",
    subtype: "calmAnimals",
    target: "animals",
    duration: "scene",
    rankLimit: "actor",         // only animals of actor rank or lower
    affects: {
      baseAtNormal: 1,
      plusEveryOtherRank: 1
    },
    notes: "Calms animals; prevents panic/stampede/uncontrolled aggression. Does not compel obedience."
  };

  return a;
});


   D("gravedigger", ({ bg }) => {
  const a = baseBackgroundAbility(bg);

  a.name = `${bg.backgroundLabel} — Steady Hands in the Dark`;

  a.system.details.short = "Once per scene: Secure remains or assess death (rank-limited).";
  a.system.details.description =
    "Once per scene, when you have physical access to a corpse or remains, choose one: " +
    "(1) Secure the remains to prevent the raising/reanimation of an undead creature of your character rank or lower, " +
    "or (2) determine the approximate time and likely cause of death, limited to circumstances equivalent to your character rank or lower. " +
    "This does not override higher-rank necromancy or miracles.";

  // Utility activation
  a.system.details.actionType = "utility";
  a.system.details.actionCost = 1;

  // No activation cost; limited by once-per-scene charge
  a.system.details.cost = { type: "charges", value: 1, perRank: false, extraPerRank: 0, recover: "scene" };

  // Effect payload (engine interprets later)
  a.system.details.effect = {
    type: "utility",
    subtype: "corpseHandling",
    target: "corpse",
    duration: "instantOrScene",
    rankLimit: "actor",
    options: [
      {
        mode: "preventRaising",
        appliesTo: "undead",
        notes: "Prevents raising/reanimation for undead of actor rank or lower (GM adjudication)."
      },
      {
        mode: "forensics",
        reveals: ["timeOfDeath", "causeOfDeath"],
        notes: "Only reliable for circumstances/forces of actor rank or lower (GM adjudication)."
      }
    ],
    notes: "Requires physical access to remains. Does not override higher-rank necromancy/miracles."
  };

  return a;
});


   D("stable_hand", ({ bg }) => {
  const a = baseBackgroundAbility(bg);

  a.name = `${bg.backgroundLabel} — Reliable Stable Network`;

  a.system.details.short = "Once per day: Cheaper mount rentals and more mounts.";
  a.system.details.description =
    "Once per day, when arranging standard mount/pack-animal rentals where such services exist, " +
    "you receive a discount of 10% every other character rank past Normal, and you can secure +1 additional rented mount per character rank, " +
    "subject to availability. This does not automatically apply to exotic or rare mounts unless the GM allows.";

  // Utility activation
  a.system.details.actionType = "utility";
  a.system.details.actionCost = 1;

  // No activation cost; limited by once-per-day charge
  a.system.details.cost = { type: "charges", value: 1, perRank: false, extraPerRank: 0, recover: "day" };

  // Effect payload (engine interprets later)
  a.system.details.effect = {
    type: "utility",
    subtype: "mountRental",
    target: "self",
    duration: "instant",
    discount: {
      percentPerEveryOtherRankPastNormal: 10
    },
    extraMounts: {
      perRank: 1
    },
    constraints: {
      requiresServiceAvailability: true,
      excludesExoticUnlessGMAllows: true
    },
    notes: "Discount: -10% every other rank past Normal. Extra mounts: +1 per character rank. Once per day."
  };

  return a;
});


   D("messenger", ({ bg }) => {
  const a = baseBackgroundAbility(bg);

  a.name = `${bg.backgroundLabel} — Run the Route`;

  a.system.details.short = "Once per day: Pace boost + ignore minor terrain penalties.";
  a.system.details.description =
    "Once per day, for the remainder of the scene, you gain +1 Pace at Normal rank and +1 additional Pace every 2 character ranks. " +
    "You also ignore minor movement penalties from crowds, rough ground, light debris, stairs, and common urban obstacles (GM discretion).";

  // Utility activation
  a.system.details.actionType = "movement";
  a.system.details.actionCost = 1;

  // No activation cost; limited by once-per-day charge
  a.system.details.cost = { type: "charges", value: 1, perRank: false, extraPerRank: 0, recover: "day" };

  // Effect payload (engine interprets later)
  a.system.details.effect = {
    type: "movement",
    subtype: "paceBoost",
    target: "self",
    duration: "scene",
    pace: {
      baseAtNormal: 1,
      plusPerTwoRanks: 1
    },
    ignores: ["crowds", "roughGroundMinor", "lightDebris", "stairs", "urbanObstaclesMinor"],
    notes: "Once per day. +1 Pace at Normal, +1 Pace per 2 ranks. Ignore minor movement penalties (GM discretion)."
  };

  return a;
});


   D("woodcutter", ({ bg }) => {
  const a = baseBackgroundAbility(bg);

  a.name = `${bg.backgroundLabel} — Clear the Way`;

  a.system.details.short = "Once per scene: Clear/breach mundane wooden obstructions.";
  a.system.details.description =
    "Once per scene, you can rapidly clear or breach mundane wooden obstructions (door, fence section, brush, barricade, rigging, poles). " +
    "At Normal rank you can clear one small obstruction, creating a passable opening for 1–2 creatures or fully removing the obstacle. " +
    "Each character rank thereafter, you may clear one additional small obstruction OR clear one size step larger (GM adjudication). " +
    "When using this ability, you do not cause unintended collapse or falling debris unless the structure was already unstable (GM discretion).";

  // Utility activation
  a.system.details.actionType = "utility";
  a.system.details.actionCost = 1;

  // No activation cost; limited by once-per-scene charge
  a.system.details.cost = { type: "charges", value: 1, perRank: false, extraPerRank: 0, recover: "scene" };

  // Effect payload (engine interprets later)
  a.system.details.effect = {
    type: "utility",
    subtype: "clearObstruction",
    target: "environment",
    duration: "instant",
    material: ["wood", "brush", "rope"],
    base: {
      obstructionSize: "small",
      count: 1,
      opening: "1-2 creatures"
    },
    scaling: {
      perRankChoice: "addCountOrIncreaseSize",   // one more small OR one size step larger per rank
      countPerRank: 1,
      sizeStepPerRank: 1
    },
    safety: {
      avoidsUnintendedCollapse: true,
      note: "Unless already unstable (GM discretion)."
    },
    notes: "Once per scene. Normal: 1 small. Each rank: +1 small OR +1 size step."
  };

  return a;
});


    D("cook", ({ bg }) => {
  const a = baseBackgroundAbility(bg);

  a.name = `${bg.backgroundLabel} — Restorative Broth`;

  a.system.details.short = "Once per day (out of combat): restorative servings.";
  a.system.details.description =
    "Once per day, during a safe pause and out of combat, you prepare restorative broth with 2 servings per character rank. " +
    "Each serving can be consumed by you or an ally and restores Mana, Vitality, and Stamina equal to 3 per character rank each. " +
    "This cannot be used during combat.";

  // Utility activation (explicitly non-combat)
  a.system.details.actionType = "utility";
  a.system.details.actionCost = 1;

  // No activation cost; limited by once-per-day charge
  a.system.details.cost = { type: "charges", value: 1, perRank: false, extraPerRank: 0, recover: "day" };

  // Effect payload (engine interprets later)
  a.system.details.effect = {
    type: "restore",
    subtype: "restorativeBroth",
    target: "allyOrSelf",
    duration: "instant",
    restriction: {
      outOfCombatOnly: true,
      requiresSafePause: true
    },
    servings: {
      perRank: 2
    },
    restorePerServing: {
      vitalityPerRank: 3,
      manaPerRank: 3,
      staminaPerRank: 3
    },
    notes: "Once per day. Out of combat only. 2 servings per rank. Each serving restores 3 Vitality/Mana/Stamina per rank."
  };

  return a;
});


   D("conscript", ({ bg }) => {
  const a = baseBackgroundAbility(bg);

  a.name = `${bg.backgroundLabel} — Battlefield First Aid`;

  a.system.details.short = "Daily: Stabilize (scales uses by rank).";
  a.system.details.description =
    "You apply drilled battlefield procedures to stabilize a dying character. " +
    "This ability does not remove conditions and provides no healing or resource restoration. " +
    "You have 1 use per day at Normal rank, and gain +1 additional use every 2 character ranks.";

  // Utility activation
  a.system.details.actionType = "utility";
  a.system.details.actionCost = 1;

  // Per-day uses scale by rank (tracked via effect; sheet/engine can interpret later)
  a.system.details.cost = { type: "charges", value: 1, perRank: false, extraPerRank: 0, recover: "day" };

  a.system.details.effect = {
    type: "utility",
    subtype: "stabilize",
    target: "allyOrSelf",
    duration: "instant",
    uses: {
      baseAtNormal: 1,
      plusPerTwoRanks: 1
    },
    notes: "Stabilizes a dying character only. No healing, no condition removal. Uses/day: 1 at Normal, +1 per 2 ranks."
  };

  return a;
});


    // -------------------------
    // SKILLED (25)
    // -------------------------
    D("blacksmith_app", ({ bg }) =>
      oncePerDayUtility({
        bg,
        abilityName: "Edge & Temper",
        effect: { type: "combatBoost", subtype: "weaponPrep", bonus: 1, duration: "next-hit" },
        notes: "Once per day, you can quickly tune a weapon. The next successful hit with that weapon gains +1 damage (or equivalent)."
      })
    );

    D("herbalist", ({ bg }) =>
      oncePerDayUtility({
        bg,
        abilityName: "Poultice",
        effect: { type: "restore", resource: "lifeForce", value: 1, target: "allyOrSelf" },
        notes: "Once per day, apply a poultice to restore 1 Life Force to yourself or an ally (requires a moment of care)."
      })
    );

    D("scribe", ({ bg }) =>
      passiveSkillBonus({
        bg,
        abilityName: "Precise Records",
        skill: "lore",
        value: 2,
        notes: "You gain +2 to Lore checks involving reading, documentation, and recalling written facts."
      })
    );

    D("tanner", ({ bg }) =>
      passiveResourceBonus({
        bg,
        abilityName: "Toughened Hide",
        resource: "shielding",
        value: 1,
        notes: "Passive resilience from hidework. Gain +1 Shielding (or equivalent buffer) when relevant to your system."
      })
    );

    D("glassblower", ({ bg }) =>
      downtimeEdge({
        bg,
        abilityName: "Fine Vessel",
        effect: { type: "downtime", subtype: "craftingBonus", skill: "crafting", value: 2 },
        notes: "Downtime: Gain +2 to Crafting checks involving delicate work, containers, or precision fittings."
      })
    );

    D("weaver", ({ bg }) =>
      downtimeEdge({
        bg,
        abilityName: "Mend & Reinforce",
        effect: { type: "downtime", subtype: "repair", bonus: 2 },
        notes: "Downtime: Gain +2 to repair and reinforcement tasks involving cloth, rope, nets, and light gear."
      })
    );

    D("potter", ({ bg }) =>
      downtimeEdge({
        bg,
        abilityName: "Kiln-Baked Storage",
        effect: { type: "downtime", subtype: "supply", bonus: 1 },
        notes: "Downtime: Your supplies last longer. Reduce mundane container/packaging loss and breakage (GM adjudication)."
      })
    );

    D("chandler", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Steady Flame",
        effect: { type: "utility", subtype: "light", bonus: 2 },
        notes: "Once per scene, gain +2 to checks involving lighting, maintaining flame, or working in low visibility."
      })
    );

    D("mason", ({ bg }) =>
      passiveSkillBonus({
        bg,
        abilityName: "Stone Sense",
        skill: "engineering",
        value: 2,
        notes: "You gain +2 to Engineering checks involving stonework, fortifications, and structural weaknesses."
      })
    );

    D("bowyer_fletcher", ({ bg }) =>
      combatTechnique({
        bg,
        abilityName: "True Fletch",
        effect: { type: "combatBoost", subtype: "ranged", weaponTag: "bow", bonus: 1 },
        notes: "Once per scene, gain +1 to ranged damage (or equivalent effect) with a bow or fletched ammunition."
      })
    );

    D("brewer", ({ bg }) =>
      oncePerDayUtility({
        bg,
        abilityName: "Restorative Draught",
        effect: { type: "restore", resource: "stamina", value: 1, target: "allyOrSelf" },
        notes: "Once per day, provide a restorative drink. Restore 1 Stamina to yourself or an ally."
      })
    );

    D("tailor", ({ bg }) =>
      passiveSkillBonus({
        bg,
        abilityName: "Fitted Gear",
        skill: "crafting",
        value: 2,
        notes: "You gain +2 to Crafting checks involving clothing, light armor fitting, and gear adjustments."
      })
    );

    D("shipwright", ({ bg }) =>
      passiveSkillBonus({
        bg,
        abilityName: "Seaworthy",
        skill: "navigation",
        value: 2,
        notes: "You gain +2 to Navigation checks involving ships, waterways, storms, and sea travel."
      })
    );

    D("jeweler", ({ bg }) =>
      passiveSkillBonus({
        bg,
        abilityName: "Gem Appraisal",
        skill: "appraise",
        value: 2,
        notes: "You gain +2 to Appraise checks involving gems, cores, jewelry, and fine materials."
      })
    );

    D("carpenter", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Field Repair",
        effect: { type: "utility", subtype: "repair", bonus: 2, target: "gear" },
        notes: "Once per scene, gain +2 to a quick repair check for gear, shields, or wooden structures."
      })
    );

    D("calligrapher", ({ bg }) =>
      passiveSkillBonus({
        bg,
        abilityName: "Sigil Script",
        skill: "lore",
        value: 2,
        notes: "You gain +2 to Lore checks involving symbols, formal writing, encoded messages, and magical notation (where applicable)."
      })
    );

    D("miner", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Darkdelver",
        effect: { type: "utility", subtype: "hazardResist", hazard: "cave/gas", bonus: 2 },
        notes: "Once per scene, gain +2 to resist or detect subterranean hazards such as bad air, unstable ground, or cave-ins."
      })
    );

    D("tinker", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Improvised Tool",
        effect: { type: "utility", subtype: "toolUse", bonus: 2 },
        notes: "Once per scene, gain +2 to a check where a tool, gadget, or improvisation would plausibly help."
      })
    );

    D("butcher", ({ bg }) =>
      combatTechnique({
        bg,
        abilityName: "Clean Cuts",
        effect: { type: "combatBoost", subtype: "melee", weaponTag: "knife", bonus: 1 },
        notes: "Once per scene, gain +1 to damage (or equivalent) with knives/cleavers, or when harvesting materials from a creature."
      })
    );

    D("cobbler", ({ bg }) =>
      movementTech({
        bg,
        abilityName: "Surefoot",
        effect: { type: "movement", subtype: "terrainIgnore", terrain: "rough/urban", bonus: 0 },
        notes: "Movement: Ignore minor movement penalties from rough ground, debris, or uneven streets (GM adjudication)."
      })
    );

    D("bookbinder", ({ bg }) =>
      downtimeEdge({
        bg,
        abilityName: "Preserve the Record",
        effect: { type: "downtime", subtype: "researchBonus", bonus: 2 },
        notes: "Downtime: Gain +2 to research, cataloging, and long-form study when you have reference materials."
      })
    );

    D("painter", ({ bg }) =>
      passiveSkillBonus({
        bg,
        abilityName: "Keen Eye",
        skill: "perception",
        value: 2,
        notes: "You gain +2 to Perception checks for details, disguises, tells, and subtle alterations."
      })
    );

    D("ropemaker", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Bind Fast",
        effect: { type: "utility", subtype: "restrain", bonus: 2 },
        notes: "Once per scene, gain +2 to restrain, secure, or rig a line for climbing, hauling, or containment."
      })
    );

    D("armorer", ({ bg }) =>
      oncePerDayUtility({
        bg,
        abilityName: "Reinforce Plate",
        effect: { type: "defenseBoost", subtype: "armor", bonus: 1, duration: "scene" },
        notes: "Once per day, reinforce an ally’s armor. They gain +1 defense/soak effect for the rest of the scene (as supported)."
      })
    );

    D("perfumer", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Scent Veil",
        effect: { type: "utility", subtype: "stealth", bonus: 2 },
        notes: "Once per scene, gain +2 to avoid detection by scent or to mask identifying odors/traces."
      })
    );

    // -------------------------
    // STREET (13)
    // -------------------------
    D("urchin", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Slip Away",
        effect: { type: "utility", subtype: "escape", bonus: 2 },
        notes: "Once per scene, gain +2 to evade, hide, or disengage in crowded or urban environments."
      })
    );

    D("beggar", ({ bg }) =>
      oncePerDayUtility({
        bg,
        abilityName: "Eyes & Ears",
        effect: { type: "utility", subtype: "information", bonus: 2 },
        notes: "Once per day, gain +2 to gather rumors or extract a useful piece of street information."
      })
    );

    D("street_perf", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Distracting Act",
        effect: { type: "debuff", subtype: "distract", target: "enemy", penalty: 2, duration: "short" },
        notes: "Once per scene, distract a target. The target suffers -2 to notice/observe you or an ally briefly (GM adjudication)."
      })
    );

    D("drudge", ({ bg }) =>
      passiveResourceBonus({
        bg,
        abilityName: "Grit",
        resource: "stamina",
        value: 1,
        notes: "Hardened by hardship. Increase maximum Stamina by 1."
      })
    );

    D("pickpocket", ({ bg }) =>
      passiveSkillBonus({
        bg,
        abilityName: "Light Fingers",
        skill: "thievery",
        value: 2,
        notes: "You gain +2 to Thievery checks involving sleight of hand, pocketing, and subtle theft."
      })
    );

    D("lookout", ({ bg }) =>
      reactionTech({
        bg,
        abilityName: "Call the Warning",
        effect: { type: "reaction", subtype: "allyDefense", bonus: 1, target: "ally" },
        notes: "Reaction: When an ally is about to be surprised or struck, grant them +1 defensive benefit (as supported) for that moment."
      })
    );

    D("runner", ({ bg }) =>
      movementTech({
        bg,
        abilityName: "Dash Line",
        effect: { type: "movement", subtype: "burst", paceBonus: 1, duration: "one-move" },
        notes: "Movement: Gain +1 Pace for one movement action."
      })
    );

    D("fence", ({ bg }) =>
      oncePerDayUtility({
        bg,
        abilityName: "Underworld Contact",
        effect: { type: "utility", subtype: "acquire", bonus: 2 },
        notes: "Once per day, gain +2 to acquire hard-to-find goods or move items discreetly (GM adjudication)."
      })
    );

    D("rat_catcher", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Vermin Sense",
        effect: { type: "utility", subtype: "hazardDetect", hazard: "disease/vermin", bonus: 2 },
        notes: "Once per scene, gain +2 to detect filth-borne risks, vermin trails, and signs of disease."
      })
    );

    D("dockhand", ({ bg }) =>
      passiveSkillBonus({
        bg,
        abilityName: "Heave-Ho",
        skill: "athletics",
        value: 2,
        notes: "You gain +2 to Athletics checks involving hauling, swimming, climbing rigging, and heavy lifts."
      })
    );

    D("scavenger", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Salvage Eye",
        effect: { type: "utility", subtype: "search", bonus: 2 },
        notes: "Once per scene, gain +2 to search/salvage checks to find something useful in debris, ruins, or refuse."
      })
    );

    D("alley_healer", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Stitch Up",
        effect: { type: "restore", resource: "lifeForce", value: 1, target: "allyOrSelf" },
        notes: "Once per scene, provide emergency treatment to restore 1 Life Force (or stabilize equivalent)."
      })
    );

    D("street_preacher", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Rally the Faithful",
        effect: { type: "buff", subtype: "morale", bonus: 1, target: "ally", duration: "short" },
        notes: "Once per scene, bolster an ally’s resolve. Grant +1 to a Spirit/resolve-style check or fear resistance (as supported)."
      })
    );

    // -------------------------
    // SOCIAL (20)
    // -------------------------
    D("noble_courtier", ({ bg }) =>
      passiveSkillBonus({
        bg,
        abilityName: "Court Etiquette",
        skill: "presence",
        value: 2,
        notes: "You gain +2 to Presence checks involving etiquette, status, and noble proceedings."
      })
    );

    D("temple_acolyte", ({ bg }) =>
      oncePerDayUtility({
        bg,
        abilityName: "Minor Blessing",
        effect: { type: "restore", resource: "mana", value: 1, target: "allyOrSelf" },
        notes: "Once per day, offer a small blessing to restore 1 Mana (or equivalent spiritual reserve)."
      })
    );

    D("clan_heir", ({ bg }) =>
      oncePerDayUtility({
        bg,
        abilityName: "Call in a Favor",
        effect: { type: "utility", subtype: "socialLeverage", bonus: 2 },
        notes: "Once per day, gain +2 to a check to secure aid, shelter, or influence from your clan network (GM adjudication)."
      })
    );

    D("diplomatic_envoy", ({ bg }) =>
      passiveSkillBonus({
        bg,
        abilityName: "Measured Words",
        skill: "diplomacy",
        value: 2,
        notes: "You gain +2 to Diplomacy checks involving negotiation, treaties, mediation, and de-escalation."
      })
    );

    D("wandering_pilgrim", ({ bg }) =>
      passiveResourceBonus({
        bg,
        abilityName: "Long Road Endurance",
        resource: "stamina",
        value: 1,
        notes: "Increase max Stamina by 1. You are accustomed to travel, discomfort, and long marches."
      })
    );

    D("tribal_nomad", ({ bg }) =>
      passiveSkillBonus({
        bg,
        abilityName: "Wayfinder",
        skill: "survival",
        value: 2,
        notes: "You gain +2 to Survival checks involving routes, camps, weather sense, and wilderness travel."
      })
    );

    D("scholars_ward", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Rapid Study",
        effect: { type: "utility", subtype: "recall", bonus: 2, target: "self" },
        notes: "Once per scene, gain +2 to a recall/research check when referencing notes, archives, or instruction."
      })
    );

    D("exiled_bloodline", ({ bg }) =>
      reactionTech({
        bg,
        abilityName: "Hardened Resolve",
        effect: { type: "reaction", subtype: "resistSocial", bonus: 2 },
        notes: "Reaction: Gain +2 to resist intimidation, coercion, or social domination in a tense moment."
      })
    );

    D("cultural_artisan", ({ bg }) =>
      downtimeEdge({
        bg,
        abilityName: "Masterwork Tradition",
        effect: { type: "downtime", subtype: "craftingBonus", skill: "crafting", value: 2 },
        notes: "Downtime: Gain +2 to Crafting checks tied to cultural techniques, ceremonial work, and traditional designs."
      })
    );

    D("temple_foundling", ({ bg }) =>
      oncePerDayUtility({
        bg,
        abilityName: "Sanctuary’s Shelter",
        effect: { type: "utility", subtype: "safeRest", bonus: 1 },
        notes: "Once per day, secure a modest safe rest/shelter benefit for the group (GM adjudication)."
      })
    );

    D("guildborn", ({ bg }) =>
      passiveSkillBonus({
        bg,
        abilityName: "Trade Network",
        skill: "commerce",
        value: 2,
        notes: "You gain +2 to Commerce checks involving contracts, logistics, pricing, and guild dealings."
      })
    );

    D("cult_survivor", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Sense Corruption",
        effect: { type: "utility", subtype: "detect", bonus: 2, target: "occult" },
        notes: "Once per scene, gain +2 to detect occult influence, coercive rituals, or signs of cult activity."
      })
    );

    D("diplomatic_hostage", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Read the Room",
        effect: { type: "utility", subtype: "insight", bonus: 2 },
        notes: "Once per scene, gain +2 to read intent, danger, and shifting power in a social setting."
      })
    );

    D("festival_child", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Crowd Weave",
        effect: { type: "utility", subtype: "positioning", bonus: 2, target: "crowd" },
        notes: "Once per scene, gain +2 to move through crowds, conceal motion, or create a brief distraction."
      })
    );

    D("marked_prophecy", ({ bg }) =>
      oncePerDayUtility({
        bg,
        abilityName: "Omen’s Turn",
        effect: { type: "buff", subtype: "nextRoll", bonus: 2, target: "self" },
        notes: "Once per day, take +2 to your next meaningful check as a prophetic ‘nudge’ (GM adjudication)."
      })
    );

    D("monastic_disciple", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Centered Breath",
        effect: { type: "restore", resource: "mana", value: 1, target: "self" },
        notes: "Once per scene, regain 1 Mana (or equivalent) through breath and focus, assuming a brief calm is possible."
      })
    );

    D("political_dissident", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Incite & Disperse",
        effect: { type: "utility", subtype: "influenceCrowd", bonus: 2 },
        notes: "Once per scene, gain +2 to sway a small group’s mood or create an opening via political rhetoric (GM adjudication)."
      })
    );

    D("archivists_kin", ({ bg }) =>
      passiveSkillBonus({
        bg,
        abilityName: "Catalog Mind",
        skill: "research",
        value: 2,
        notes: "You gain +2 to Research checks involving archives, indexing, cross-referencing, and document trails."
      })
    );

    D("hearth_storykeeper", ({ bg }) =>
      oncePerSceneUtility({
        bg,
        abilityName: "Inspiring Tale",
        effect: { type: "buff", subtype: "allyBoost", bonus: 1, target: "ally", duration: "one-check" },
        notes: "Once per scene, bolster an ally. Grant +1 to their next check if your words meaningfully apply."
      })
    );

    D("oath_retainer", ({ bg }) =>
      reactionTech({
        bg,
        abilityName: "Interpose",
        effect: { type: "reaction", subtype: "protectAlly", bonus: 1, target: "ally" },
        notes: "Reaction: Step between danger and an ally. Grant +1 defensive benefit (or reduce incoming impact) for that moment."
      })
    );
  },

  getBackgroundAbilityDefinition(backgroundKey) {
    this._ensureBuilt();
    return this.backgroundAbilityData?.[backgroundKey] ?? null;
  }
};
