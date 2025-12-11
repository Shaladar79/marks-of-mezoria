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
  /**
   * Logical collection id for the pack (from system.json).
   * Not strictly required for the mapping, but kept for reference.
   */
  PACK_COLLECTION: "abilities-racial",

  /**
   * Full pack identifier used in UUIDs.
   * Example UUID: "Compendium.marks-of-mezoria.abilities-racial.ABC123xyz"
   */
  FULL_PACK_ID: "marks-of-mezoria.abilities-racial",

  /**
   * Map raceKey → array of ability UUIDs.
   *
   * raceKey must match actor.system.details.race.
   * Each UUID should be a valid Foundry document UUID.
   *
   * Example entry (once you have created an ability):
   *  human: [
   *    "Compendium.marks-of-mezoria.abilities-racial.human-toughness",
   *    "Compendium.marks-of-mezoria.abilities-racial.human-ingenuity"
   *  ],
   */
  racialAbilityMap: {
    human: [],
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
   * Convenience accessor: safely returns the list of UUIDs for a given race key.
   *
   * @param {string} raceKey
   * @returns {string[]} UUIDs for racial abilities
   */
  getRacialAbilityUUIDs(raceKey) {
    if (!raceKey) return [];
    const map = this.racialAbilityMap || {};
    return map[raceKey] || [];
  }
};

