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
            tags: "human, racial, versatility",

            // racialKey is set again when seeding templates, but harmless here
            racialKey: "human-versatility"
          }
        }
      }
    ],

    // --------------------
    // DRACONIAN: Breath Weapon
    // --------------------
    draconian: [
      {
        key: "draconian-breath-weapon",
        name: "Draconian – Breath Weapon",
        type: "ability",
        img: "icons/svg/cone.svg",
        system: {
          details: {
            short: "Exhale a clan-themed breath weapon in a line.",
            description:
              "You unleash a devastating breath weapon whose damage type is determined by your clan (fire, cold, lightning, acid, etc.). " +
              "As an action (Action Cost 5), you exhale a 15-foot line that deals 1d8 damage per character rank. " +
              "The line’s length increases by +5 feet for each rank above Normal. The ability costs Mana per rank (3 Mana per rank by default) " +
              "and cannot be consolidated; it scales automatically with your rank.",

            rankReq: "normal",
            currentRank: "normal",
            syncWithRank: true,
            noConsolidate: true,

            actionType: "action",
            actionCost: 5,
            range: "15 ft line +5 ft per rank",

            cost: {
              type: "mana",
              value: 3,
              perRank: true
            },

            effect: {
              type: "damage",
              damageType: "clan", // interpret via clan elsewhere
              notes: "Line AoE. Targets in the line take clan-type damage.",
              roll: {
                dieType: "d8",
                diceBase: 1,      // 1d8 at Normal; ability rank adds more dice
                modAttribute: "might"
              },
              baseRangeFeet: 15,
              rangePerRankFeet: 5
            },

            scaling: {
              enabled: true,
              mode: "rank",
              value: ""
            },

            sourceType: "racial",
            sourceKey: "draconian",
            autoGranted: false,
            tags: "draconian, racial, breath, damage",
            racialKey: "draconian-breath-weapon"
          }
        }
      }
    ],

    // --------------------
    // EMBERGIEST: Flame Imbuement
    // --------------------
    embergiest: [
      {
        key: "embergiest-flame-imbuement",
        name: "Embergiest – Flame Imbuement",
        type: "ability",
        img: "icons/svg/fire.svg",
        system: {
          details: {
            short: "Imbue your physical attacks with fire for several rounds.",
            description:
              "You wreathe your weapons in living flame. For 3 full rounds, all physical weapon attacks you make deal fire damage instead of their normal type. " +
              "At Normal rank, this is a pure conversion. For each rank above Normal, your weapon attacks also deal an additional +1d4 fire damage. " +
              "Flame Imbuement costs 3 Mana per rank and cannot be consolidated; it scales automatically with your character rank.",

            rankReq: "normal",
            currentRank: "normal",
            syncWithRank: true,
            noConsolidate: true,

            actionType: "action",
            actionCost: 3,
            range: "Self",

            cost: {
              type: "mana",
              value: 3,
              perRank: true
            },

            effect: {
              type: "buff",
              appliesTo: "weaponAttacks",
              damageType: "fire",
              durationRounds: 3,
              extraDicePerRank: 1,   // +1 die per rank above Normal
              extraDieType: "d4",
              notes:
                "For the duration, all physical weapon attacks deal fire damage instead of their normal type. " +
                "Each rank above Normal adds +1d4 fire damage to each hit."
            },

            scaling: {
              enabled: true,
              mode: "rank",
              value: ""
            },

            sourceType: "racial",
            sourceKey: "embergiest",
            autoGranted: false,
            tags: "embergiest, racial, fire, buff",
            racialKey: "embergiest-flame-imbuement"
          }
        }
      }
    ],

    // --------------------
    // ETHEREAN: Ethereal Step
    // --------------------
    etherean: [
      {
        key: "etherean-ethereal-step",
        name: "Etherean – Ethereal Step",
        type: "ability",
        img: "icons/svg/wing.svg",
        system: {
          details: {
            short: "Short-range teleport that avoids attacks of opportunity.",
            description:
              "You step sideways into the aether and reappear a short distance away. As a movement action, you instantly move up to 15 feet to any square you can see. " +
              "This movement does not provoke attacks of opportunity. For each character rank above Normal, the range increases by 10 feet (e.g., 25 ft at Quartz, 35 ft at Topaz, etc.). " +
              "Ethereal Step costs 3 Mana per character rank and cannot be consolidated; it scales automatically with your rank.",

            rankReq: "normal",
            currentRank: "normal",
            syncWithRank: true,
            noConsolidate: true,

            actionType: "move",
            actionCost: 2,
            range: "15 ft + 10 ft per rank",

            cost: {
              type: "mana",
              value: 3,
              perRank: true
            },

            effect: {
              type: "teleport",
              appliesTo: "selfMovement",
              baseRangeFeet: 15,
              rangePerRankFeet: 10,
              provokeOpportunity: false,
              notes:
                "Movement action. Teleport to a visible square without provoking attacks of opportunity."
            },

            scaling: {
              enabled: true,
              mode: "rank",
              value: ""
            },

            sourceType: "racial",
            sourceKey: "etherean",
            autoGranted: false,
            tags: "etherean, racial, teleport, movement",
            racialKey: "etherean-ethereal-step"
          }
        }
      }
    ],

    // --------------------
    // ANTHAZOAN: Chest of the Depths
    // --------------------
    anthazoan: [
      {
        key: "anthazoan-chest-depths",
        name: "Anthazoan – Chest of the Depths",
        type: "ability",
        img: "icons/svg/chest.svg",
        system: {
          details: {
            short: "Open a personal extradimensional storage vault.",
            description:
              "You open a personal dimensional storage space – a living coral vault. Activating this ability (Action Cost 3) opens access to a private inventory that ignores encumbrance. " +
              "The vault can hold 40 different item types at Normal rank. For each rank above Normal, capacity increases by 5 item types. " +
              "One vault slot holds all copies of a single item type (e.g., 3 quartz shortswords share one slot; 30 healing potions share one slot). " +
              "Chest of the Depths costs 10 Mana + 2 Mana per rank above Normal and can be used once per day.",

            rankReq: "normal",
            currentRank: "normal",
            syncWithRank: true,
            noConsolidate: true,

            actionType: "action",
            actionCost: 3,
            range: "5 ft",

            cost: {
              type: "mana",
              value: 10,
              perRank: false,
              extraPerRank: 2   // handled by system.mjs cost logic
            },

            effect: {
              type: "storage",
              appliesTo: "personalVault",
              storageBaseSlots: 40,
              storageSlotsPerRank: 5,
              notes:
                "Personal extradimensional vault for treasure items. Ignores encumbrance. Once-per-day use will be enforced when time/ resting is implemented."
            },

            scaling: {
              enabled: true,
              mode: "rank",
              value: ""
            },

            sourceType: "racial",
            sourceKey: "anthazoan",
            autoGranted: false,
            tags: "anthazoan, racial, storage, utility",
            racialKey: "anthazoan-chest-depths"
          }
        }
      }
    ],

    // --------------------
    // Sylvan
    // --------------------
    sylvan: [
  {
    key: "sylvan-whisper-grove",
    name: "Sylvan – Whisper of the Grove",
    type: "ability",
    img: "icons/magic/nature/leaf-glow-trail-green.webp",
    system: {
      details: {
        sourceType: "racial",
        sourceKey: "sylvan",
        racialKey: "sylvan-whisper-grove",

        // Action economy
        actionType: "action",
        actionCost: 2,

        // Resource cost: 2 mana per rank
        cost: {
          type: "mana",
          value: 2,
          perRank: true
        },

        // Effect definition (buff)
        effect: {
          type: "buff",
          appliesTo: "awareness",
          durationRounds: 3,

          // You requested 10' diameter at Normal +5' per rank
          // Store it explicitly as diameter to match your wording.
          areaDiameterBase: 10,
          areaDiameterPerRank: 5
        },

        // These are consistent with how you handle racials that should scale automatically
        syncWithRank: true,
        noConsolidate: true
      }
    }
  }
],
 // --------------------
    // PLACEHOLDER RACES (no abilities yet)
    // --------------------
    sprite:    [],
    mythrian:  [],
    scion:     [],
    auramine:  []
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
