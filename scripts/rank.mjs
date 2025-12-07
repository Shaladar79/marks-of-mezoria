// scripts/rank.mjs
// Centralized rank data for Marks of Mezoria

export const RankData = {
  // Key → label (for dropdowns, displays, etc.)
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
  },

  // Rank → trained skill bonus
  // (only trained skills get this; untrained = 0)
  skillBonuses: {
    normal:    1,
    quartz:    2,
    topaz:     3,
    garnet:    5,
    emerald:   6,
    sapphire:  7,
    ruby:      9,
    diamond:   10,
    mythrite:  11,
    celestite: 15
  }

  // Later you can add:
  // descriptions: { normal: "...", quartz: "...", ... }
  // other rank-based scaling (resources, defenses, etc.)
};

