// scripts/packs/raceabilitypack.mjs

/**
 * RaceAbilityPack
 *
 * Central place to define which racial abilities are auto-granted
 * for each race, using UUIDs that point into the "abilities-racial"
 * compendium pack.
 *
 * Usage:
 *  - Create racial abilities in the "Abilities - Racial" compendium.
 *  - Right-click each → Copy Document UUID.
 *  - Paste those UUID strings into racialAbilityMap below.
 */
export const RaceAbilityPack = {
  PACK_COLLECTION: "abilities-racial",
  FULL_PACK_ID: "marks-of-mezoria.abilities-racial",

  racialAbilityMap: {
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
            // This flag tells our code to sync currentRank with the character's rank, not consolidation
            syncWithRank: true,
            // This flag disables consolidation UI/logic
            noConsolidate: true,

            // Action usage
            actionType: "action",
            actionCost: 2,

            // Cost: 3 stamina per character rank
            cost: {
              type: "stamina",  // "stamina" or "mana"
              value: 3,         // base cost per rank
              perRank: true     // interpret value as "per rank"
            },

            range: "Self",

            effect: {
              type: "buff",
              resource: "",         // not directly impacting a resource
              amount: 0,
              damageType: "",
              notes: "Applies to the next trained skill check only.",
              roll: {
                dieType: "",        // no roll; this is a buff effect
                diceBase: 0,
                modAttribute: ""
              },
              // For convenience, encode the buff pattern here:
              skillBonusBase: 2,       // +2 at Normal
              skillBonusPerRank: 1,    // +1 for each rank above Normal
              appliesTo: "nextTrainedSkill"
            },

            scaling: {
              enabled: true,
              mode: "rank",   // we treat this as “character rank” scaling via syncWithRank
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

  getRacialAbilityUUIDs(raceKey) {
    if (!raceKey) return [];
    const map = this.racialAbilityMap || {};
    return map[raceKey] || [];
  }
};
