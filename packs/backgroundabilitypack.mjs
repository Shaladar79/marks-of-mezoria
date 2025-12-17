// scripts/packs/backgroundabilitypack.mjs

/**
 * BackgroundAbilityPack
 *
 * Placeholder-tier background ability definitions used for:
 *  - World template seeding (Items sidebar)
 *  - Actor auto-grant (embedded copies)
 *
 * Identity (non-duplication):
 *  item.type === "ability" AND
 *  item.system.details.sourceType === "background" AND
 *  item.system.details.sourceKey  === "<backgroundKey>"
 */

function makePlaceholder({ backgroundKey, backgroundLabel, backgroundType }) {
  // Keep the shape identical for every entry:
  return {
    key: `background-${backgroundKey}-training`,
    name: `${backgroundLabel} – Background Training`,
    type: "ability",
    img: "icons/svg/book.svg",
    system: {
      details: {
        // Minimal placeholder content; safe + inert
        short: "Placeholder background ability (pipeline validation).",
        description: `Placeholder ability for the ${backgroundLabel} background. This will be replaced with a real background ability design later.`,

        // Keep these consistent with your current ability schema
        rankReq: "normal",
        currentRank: "normal",
        syncWithRank: false,
        noConsolidate: true,

        // Placeholder is passive + no cost
        actionType: "passive",
        actionCost: 0,
        range: "Self",

        // Use existing details.cost/effect container so the sheet/roll builder doesn’t choke
        cost: { type: "", value: 0, perRank: false, extraPerRank: 0 },
        effect: { type: "utility", notes: "Placeholder; no mechanical effect yet." },

        // Leave scaling inert
        scaling: { enabled: false, mode: "", value: "" },

        // Required identity fields
        sourceType: "background",
        sourceKey: backgroundKey,
        autoGranted: false,

        // Optional but helpful for debugging
        tags: `background,${backgroundType},${backgroundKey}`
      }
    }
  };
}

export const BackgroundAbilityPack = {
  /**
   * Canonical list for Phase 3 (placeholder tier).
   * NOTE: cook_skilled intentionally excluded; Cook remains Common only.
   */
  backgroundList: [
    // --------------------
    // COMMON (14)
    // --------------------
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
    { backgroundType: "common", backgroundKey: "milkmaid", backgroundLabel: "Milkmaid" },
    { backgroundType: "common", backgroundKey: "field_hand", backgroundLabel: "Field Hand" },
    { backgroundType: "common", backgroundKey: "field_guide", backgroundLabel: "Field Guide" },
    { backgroundType: "common", backgroundKey: "cook", backgroundLabel: "Cook" },

    // --------------------
    // SKILLED (25) — cook_skilled excluded
    // --------------------
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

    // --------------------
    // STREET (13)
    // --------------------
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

    // --------------------
    // SOCIAL (20)
    // --------------------
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

  /**
   * Built map: { [backgroundKey]: abilityDefinition }
   * Generated via factory so every entry has identical structure.
   */
  backgroundAbilityData: {},

  /**
   * Call once (lazy init) to build backgroundAbilityData.
   */
  _ensureBuilt() {
    if (Object.keys(this.backgroundAbilityData).length) return;

    for (const bg of this.backgroundList) {
      this.backgroundAbilityData[bg.backgroundKey] = makePlaceholder(bg);
    }
  },

  /**
   * Get a background ability definition by background key.
   */
  getBackgroundAbilityDefinition(backgroundKey) {
    this._ensureBuilt();
    return this.backgroundAbilityData?.[backgroundKey] ?? null;
  }
};

