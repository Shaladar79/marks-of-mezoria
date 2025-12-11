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
      "Item.feBMeXP3JWxm6NeL"
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
