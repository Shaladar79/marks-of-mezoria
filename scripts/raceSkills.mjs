// scripts/raceSkills.mjs
// Racial skill bonuses for Marks of Mezoria.
//
// NOTE: The keys (human, sprite, mythrian, wolf, flame, etc.)
// MUST match the keys you use in RaceData.labels, RaceData.mythrianTribes,
// RaceData.draconianClans, and RaceData.scionAspects.

export const RaceSkillData = {
  // -----------------------------------
  // Base race skill bonuses
  // -----------------------------------
  base: {
    human: {
      skills: [
        { path: "soul.presence.persuasion",   value: 2 },
        { path: "mind.insight.awareness",     value: 1 },
        { path: "body.might.athletics",       value: 1 }
      ]
    },

    sprite: {
      skills: [
        { path: "body.swiftness.stealth",        value: 2 },
        { path: "body.swiftness.acrobatics",     value: 1 },
        { path: "body.swiftness.sleightOfHand",  value: 1 }
      ]
    },

    sylvan: {
      skills: [
        { path: "mind.insight.tracking",    value: 2 },
        { path: "mind.insight.awareness",   value: 1 },
        { path: "body.swiftness.acrobatics",value: 1 }
      ]
    },

    etherean: {
      skills: [
        { path: "mind.insight.ritualCasting", value: 2 },
        { path: "mind.insight.intuition",     value: 1 },
        { path: "mind.focus.research",        value: 1 }
      ]
    },

    anthazoan: {
      skills: [
        { path: "body.might.bruteForce",   value: 2 },
        { path: "body.might.intimidation", value: 1 },
        { path: "body.might.heft",         value: 1 }
      ]
    },

    embergiest: {
      skills: [
        { path: "body.might.intimidation",    value: 2 },
        { path: "mind.insight.awareness",     value: 1 },
        { path: "body.endurance.painTolerance", value: 1 }
      ]
    },

    auramine: {
      skills: [
        { path: "soul.grace.performance",     value: 2 },
        { path: "soul.presence.oratory",      value: 1 },
        { path: "soul.presence.etiquette",    value: 1 }
      ]
    },

    // Races with sub-groups: base gives only +1/+1
    mythrian: {
      skills: [
        { path: "mind.insight.tracking",   value: 1 },
        { path: "mind.insight.awareness",  value: 1 }
      ]
    },

    draconian: {
      skills: [
        { path: "body.might.intimidation", value: 1 },
        { path: "body.endurance.fortitude",value: 1 }
      ]
    },

    scion: {
      skills: [
        { path: "mind.insight.awareness",  value: 1 },
        { path: "mind.insight.intuition",  value: 1 }
      ]
    }
  },

  // -----------------------------------
  // Mythrian tribes: +2 skill (no Lore)
  // Keys should match RaceData.mythrianTribes
  // -----------------------------------
  mythrianTribes: {
    wolf: {
      skills: [
        { path: "mind.insight.perception", value: 2 }
      ]
    },
    bear: {
      skills: [
        { path: "body.might.bruteForce", value: 2 }
      ]
    },
    hawk: {
      skills: [
        { path: "mind.insight.intuition", value: 2 }
      ]
    },
    snake: {
      skills: [
        { path: "body.swiftness.stealth", value: 2 }
      ]
    },
    stag: {
      skills: [
        { path: "body.swiftness.acrobatics", value: 2 }
      ]
    }
  },

  // -----------------------------------
  // Draconian clans: +2 skill
  // Keys should match RaceData.draconianClans
  // -----------------------------------
  draconianClans: {
    flame: {
      skills: [
        { path: "body.might.bruteForce", value: 2 }
      ]
    },
    frost: {
      skills: [
        { path: "body.endurance.painTolerance", value: 2 }
      ]
    },
    storm: {
      skills: [
        { path: "mind.insight.awareness", value: 2 }
      ]
    },
    earth: {
      skills: [
        { path: "body.might.heft", value: 2 }
      ]
    },
    venom: {
      skills: [
        { path: "soul.presence.deception", value: 2 }
      ]
    }
  },

  // -----------------------------------
  // Scion aspects: +2 skill
  // Keys should match RaceData.scionAspects
  // -----------------------------------
  scionAspects: {
    light: {
      skills: [
        { path: "soul.presence.persuasion", value: 2 }
      ]
    },
    shadow: {
      skills: [
        { path: "body.swiftness.stealth", value: 2 }
      ]
    },
    arcane: {
      skills: [
        { path: "mind.insight.ritualCasting", value: 2 }
      ]
    },
    nature: {
      skills: [
        { path: "mind.insight.tracking", value: 2 }
      ]
    },
    war: {
      skills: [
        { path: "mind.focus.tactics", value: 2 }
      ]
    }
  }
};
