// scripts/rank.mjs
// Central rank rules for Marks of Mezoria

export const RankData = {
  /**
   * Order of ranks from lowest to highest.
   * (Handy later for comparisons / advancement logic.)
   */
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

  /**
   * Trained skill bonus by rank.
   * Only being trained gives a rank-based bonus; expertise is not a thing.
   *
   * Values (per your list): 1,2,3,5,6,7,9,10,11,15
   */
  trainedSkillBonus: {
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
  },

  /**
   * Placeholders for future rank rules.
   * We’re not using these yet, but this keeps everything in one place.
   */
  saves: {
    // e.g. body: { base: 0, perRank: {...} }
  },

  status: {
    // e.g. vitality, mana, stamina scaling by rank later
  },

  defenses: {
    // e.g. extra physical/magical defense by rank later
  }
};
