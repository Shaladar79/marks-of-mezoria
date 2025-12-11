// scripts/packs/raceabilitypack.mjs

/**
 * RaceAbilityPack
 *
 * System-side definitions of racial abilities.
 * These are plain data objects; we use them to:
 *  - Seed world-level Items on first load (so GMs see them in the Items sidebar).
 *  - Create embedded racial abilities on actors when their race is set/changed.
 */
export const RaceAbilityPack = {
  /**
   * Racial ability definitions by race key.
   *
   * raceKey must match actor.system.details.race.
   */
  racialAbilityData: {
    // --------------------
    // HUMAN: Versatility
    // --------------------
    human: [
      {
        key: "human-versatility",
        name: "Human – Versatility",
        type: "ability",
        img: "icons/svg/book.svg",
        system: {
          details: {
            short: "Tap into human adaptability to boost your next trained skill.",
            description:
              "You spend stamina to sharpen your focus. Versatility grants a +2 bonus to the next trained skill check you make. " +
              "This bonus increases by +1 for each character rank above Normal (e.g., +3 at Quartz, +4 at Topaz, etc.). " +
              "The ability’s stamina cost is 3 per character rank. Versatility cannot be consolidated; it ranks up automatically when the character’s rank increases.",

            // Rank + scaling
            rankReq: "normal",
            currentRank: "normal",

            // This ability’s rank follows the character’s rank, not consolidation
            syncWithRank: true,
            // Cannot be consolidated
            noConsolidate: true,

            // Action usage
            actionType: "action",
            actionCost: 2,
            range: "Self",

            // Cost: 3 stamina per character rank
            cost: {
              type: "stamina",  // resource to pay from status
              value: 3,         // base cost per rank
              perRank: true     // treat value as "per rank"
            },

            // Effect: buff to next trained skill
            effect: {
              type: "buff",
              resource: "",
              amount: 0,
              damageType: "",
              notes: "Applies to the next trained skill check only.",
              roll: {
                dieType: "",
                diceBase: 0,
                modAttribute: ""
              },
              skillBonusBase: 2,     // +2 at Normal
              skillBonusPerRank: 1,  // +1 per rank above Normal
              appliesTo: "nextTrainedSkill"
            },

            scaling: {
              enabled: true,
              mode: "rank",
              value: ""
            },

            sourceType: "racial",
            sourceKey: "human",
            autoGranted: false,   // template; embedded copy will be marked true
            tags: "human, racial, versatility"
          }
        }
      }
    ],

    // other races: fill later
    aetherian: [],
    sylvan: [],
    sprite: [],
    anthazoan: [],
    mythrian: [],
    draconian: [],
    scion: [],
    embergiest: [],
    auramine: []
  },

  /**
   * Get all racial ability definitions for a given race.
   * @param {string} raceKey
   * @returns {Array<object>}
   */
  getRacialAbilityDefinitions(raceKey) {
    if (!raceKey) return [];
    const map = this.racialAbilityData || {};
    return map[raceKey] || [];
  }
};
