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
    
    draconian: [
      {
        key: "draconian-breath-weapon",
        name: "Draconian – Breath Weapon",
        type: "ability",
        img: "icons/magic/fire/breath-weapon-ray-orange.webp", // or any icon you like
        system: {
          details: {
            short: "Exhale elemental power in a line, with damage and type scaling by rank and clan.",
            description:
              "You unleash a blast of elemental breath in a straight line. The damage type is determined by your Draconian clan "
              + "(for example: Fire Clan = fire, Frost Clan = cold, Lightning Clan = lightning, etc.). "
              + "The breath weapon has a base range of 15 feet and increases by +5 feet for each rank above Normal. "
              + "It deals 1d8 damage per character rank (e.g., 1d8 at Normal, 2d8 at Quartz, 3d8 at Topaz, and so on). "
              + "You must spend mana equal to 3 per character rank to use this ability. "
              + "This ability is a racial power: it automatically scales with your rank and cannot be consolidated.",

            // Rank + scaling
            rankReq: "normal",
            currentRank: "normal",

            // Racial scaling: follows character rank, not consolidation
            syncWithRank: true,
            // Cannot be consolidated
            noConsolidate: true,

            // Action usage
            actionType: "action",
            actionCost: 5,

            // Range: 15 ft line, +5 ft per rank above Normal
            range: "15 ft line (+5 ft per rank)",
            rangeBase: 15,
            rangePerRank: 5,
            lineShape: "line",

            // Mana cost: 3 mana per character rank
            cost: {
              type: "mana",   // spends from system.status.mana.current
              value: 3,       // base cost per rank
              perRank: true   // multiply by (rank index + 1)
            },

            // Effect: Damage, type based on clan
            effect: {
              type: "damage",
              resource: "vitality",
              amount: 0,          // resolved by the roll, not flat amount
              damageType: "",     // determined by Draconian clan; see notes
              notes: "Damage type is determined by your Draconian clan (fire, cold, lightning, acid, etc.).",
              roll: {
                dieType: "d8",
                diceBase: 1,      // 1d8 at Normal; rank scaling logic adds +1 die per rank
                modAttribute: "might" // or leave blank to default; currently uses Might for damage
              }
            },

            // Scaling metadata (already supported by your roll logic)
            scaling: {
              enabled: true,
              mode: "rank",
              value: ""
            },

            sourceType: "racial",
            sourceKey: "draconian",
            autoGranted: false,   // template; embedded copies will be marked autoGranted=true
            tags: "draconian, racial, breath-weapon"
          }
        }
      }
    ],
    
    scion: [],
    embergiest: [
      {
        key: "embergiest-flame-imbuement",
        name: "Embergiest – Flame Imbuement",
        type: "ability",
        img: "icons/svg/explosion.svg", // change later if you want a custom fire icon
        system: {
          details: {
            short: "Wreathe your weapons in living flame.",
            description:
              "You ignite your inner embers, wreathed in living flame. For 3 full turns, all of your physical weapon attacks " +
              "are treated as fire damage instead of their normal type. Starting at ranks above Normal, your fiery strikes " +
              "also deal additional burning damage.\n\n" +
              "• Duration: 3 full turns\n" +
              "• Range: Self\n" +
              "• Cost: 3 Mana per character rank\n" +
              "• Effect at Normal: Your physical weapon attacks deal fire damage.\n" +
              "• Effect per rank above Normal: Your physical weapon attacks deal +1d4 additional fire damage per rank above Normal.\n" +
              "• This is a racial ability; it scales automatically with your character rank and cannot be consolidated.",

            // Rank + scaling
            rankReq: "normal",
            currentRank: "normal",

            // This ability’s rank follows the character’s rank automatically
            syncWithRank: true,
            // Cannot be consolidated via Spirit
            noConsolidate: true,

            // Action usage
            actionType: "action",
            actionCost: 5,
            range: "Self",

            // Cost: 3 mana per character rank
            cost: {
              type: "mana",   // spends from status.mana.current
              value: 3,       // base cost per rank
              perRank: true   // Normal = 3, Quartz = 6, Topaz = 9, etc.
            },

            // Effect: weapon buff
            effect: {
              type: "buff",
              resource: "",
              amount: 0,
              damageType: "fire",
              notes:
                "For 3 full turns, your physical weapon attacks are treated as fire damage. " +
                "At ranks above Normal, they also deal additional fire damage.",

              // No direct roll from the ability button itself (it’s a buff)
              roll: {
                dieType: "",
                diceBase: 0,
                modAttribute: ""
              },

              // Custom Embergiest flags – for when we wire weapon attacks to look for this
              appliesTo: "weaponAttacks",
              durationRoundsBase: 3,     // lasts 3 turns
              extraDamageDieType: "d4",  // extra die type
              extraDamagePerRank: 1      // +1d4 per rank above Normal
            },

            scaling: {
              enabled: true,
              mode: "rank",
              value: ""
            },

            sourceType: "racial",
            sourceKey: "embergiest",
            autoGranted: false, // template; embedded copies will be autoGranted
            tags: "embergiest, racial, fire, flame-imbuement"
          }
        }
      }
    ],
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
