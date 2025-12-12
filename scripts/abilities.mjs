// scripts/abilities.mjs

export const AbilityData = {

  // --------------------------------------------------------
  // Rank ladder for abilities and minimum character rank
  // --------------------------------------------------------
  ranks: {
    order: [
      "normal",
      "quartz",
      "topaz",
      "garnet",
      "emerald",
      "sapphire",
      "ruby",
      "diamond",
      "mythrite",
      "celestite"
    ],
    labels: {
      normal:    "Normal",
      quartz:    "Quartz",
      topaz:     "Topaz",
      garnet:    "Garnet",
      emerald:   "Emerald",
      sapphire:  "Sapphire",
      ruby:      "Ruby",
      diamond:   "Diamond",
      mythrite:  "Mythrite",
      celestite: "Celestite"
    }
  },

  // --------------------------------------------------------
  // Rank upgrade costs (Spirit consolidation)
  // --------------------------------------------------------
  rankCosts: {
    baseCost: 100,   // base Spirit cost

    // Multipliers per rank
    multipliers: {
      normal:    1,
      quartz:    2,
      topaz:     3,
      garnet:    5,
      emerald:   7,
      sapphire:  9,
      ruby:      12,
      diamond:   15,
      mythrite:  18,
      celestite: 25
    },

    // Precomputed total cost per rank (baseCost * multiplier)
    costByRank: {
      normal:    100,   // 100 * 1
      quartz:    200,   // 100 * 2
      topaz:     300,   // 100 * 3
      garnet:    500,   // 100 * 5
      emerald:   700,   // 100 * 7
      sapphire:  900,   // 100 * 9
      ruby:      1200,  // 100 * 12
      diamond:   1500,  // 100 * 15
      mythrite:  1800,  // 100 * 18
      celestite: 2500   // 100 * 25
    }
  },

  // --------------------------------------------------------
  // Action types: how the ability fits into the action economy
  // --------------------------------------------------------
  actionTypes: {
    action:   "Action",
    bonus:    "Bonus Action",
    reaction: "Reaction",
    free:     "Free Action",
    passive:  "Passive",
    toggle:   "Toggle",
    movement: "Movement"
  },

  // --------------------------------------------------------
  // Source types: where the ability comes from
  // --------------------------------------------------------
  sourceTypes: {
    racial:     "Racial",
    background: "Background",
    rank:       "Rank",
    mark:       "Mark",
    generic:    "Generic"
  },

  // --------------------------------------------------------
  // Effect types: mechanical "shape" of the ability
  // --------------------------------------------------------
  effectTypes: {
    damage:    "Damage",
    healing:   "Healing",
    shielding: "Shielding",
    drain:     "Drain",
    buff:      "Buff",
    debuff:    "Debuff",
    aura:      "Aura",
    summon:    "Summon",
    utility:   "Utility",
    other:     "Other"
  },

  // --------------------------------------------------------
  // Effect resources: what the effect is targeting/modifying
  // --------------------------------------------------------
  effectResources: {
    vitality:  "Vitality",
    mana:      "Mana",
    stamina:   "Stamina",
    shielding: "Shielding",
    trauma:    "Trauma",
    defense:   "Defense",
    other:     "Other"
  },

  // --------------------------------------------------------
  // Scaling modes: how the effect's numbers grow
  // --------------------------------------------------------
  scalingModes: {
    none:      "None",
    rank:      "Rank-Based",
    attribute: "Attribute-Based",
    custom:    "Custom"
  },

  // --------------------------------------------------------
  // Damage / element types for Mezoria
  // --------------------------------------------------------
  damageTypes: {
    untyped:     "Untyped",
    physical:    "Physical",
    slashing:    "Slashing",
    piercing:    "Piercing",
    bludgeoning: "Bludgeoning",

    fire:        "Fire",
    cold:        "Cold",
    lightning:   "Lightning",
    acid:        "Acid",
    poison:      "Poison",

    radiant:     "Radiant",
    necrotic:    "Necrotic",
    psychic:     "Psychic",
    force:       "Force",

    eldritch:    "Eldritch",
    void:        "Void",
    astral:      "Astral",

    other:       "Other"
  },

  // --------------------------------------------------------
  // Cost Types (for Activation cost)
  // --------------------------------------------------------
  costTypes: {
    mana:    "Mana",
    stamina: "Stamina"
  },

  // --------------------------------------------------------
  // Roll builder settings (die types, base dice, mod attributes)
  // --------------------------------------------------------
  rollBuilder: {

    // Die types for abilities (for damage/heal/shield/drain, etc.)
    dieTypes: {
      d4:  "d4",
      d6:  "d6",
      d8:  "d8",
      d10: "d10",
      d12: "d12"
    },

    // Base number of dice (1–10)
    diceBase: {
      1:  "1",
      2:  "2",
      3:  "3",
      4:  "4",
      5:  "5",
      6:  "6",
      7:  "7",
      8:  "8",
      9:  "9",
      10: "10"
    },

    // Sub-attributes used as modifiers (ALL 9)
    modAttributes: {
      // BODY
      might:      "Might",
      swiftness:  "Swiftness",
      endurance:  "Endurance",

      // MIND
      insight:    "Insight",
      focus:      "Focus",
      willpower:  "Willpower",

      // SOUL
      presence:   "Presence",
      grace:      "Grace",
      resolve:    "Resolve"
    }
  }
};
