// system.mjs
import { MezoriaConfig } from "./config.mjs";
import { MezoriaActor } from "./scripts/actor.mjs";
import { MinimalActorSheet } from "./scripts/sheets/pc-sheet.mjs";
import { MezoriaAbilitySheet } from "./scripts/sheets/ability-sheet.mjs";
import { MezoriaEquipmentSheet } from "./scripts/sheets/equipment-sheet.mjs";
import { RaceAbilityPack } from "./scripts/packs/raceabilitypack.mjs";

/* ------------------------------------
 * Init hook
 * ----------------------------------*/
Hooks.once("init", async () => {
  console.log("Marks of Mezoria | Initializing system");

  CONFIG["marks-of-mezoria"] = MezoriaConfig;
  CONFIG.Actor.documentClass = MezoriaActor;

  await loadTemplates([
    "systems/marks-of-mezoria/templates/actor/actor-sheet.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/header.hbs",

    // Actor dropdowns
    "systems/marks-of-mezoria/templates/actor/parts/drops/racedrop.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/rankdrop.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/backtype.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/backdrop.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/markpurpose.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/tribedrop.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/clandrop.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/aspectdrop.hbs",

    // Ability dropdowns
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-rank.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-rankreq.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-marksystem.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-markreq.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-actiontype.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-sourcetype.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-effecttype.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-effectresource.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-damagetype.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-scalingmode.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-roll-dietype.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-roll-dicebase.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-roll-modattribute.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-rank-current.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-sourcekey.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/drops/abilities/ability-costtype.hbs",

    // Cinfo
    "systems/marks-of-mezoria/templates/actor/parts/cinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/rankinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/raceinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/backinfo.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/charinfo/markinfo.hbs",

    // Attributes & Status
    "systems/marks-of-mezoria/templates/actor/parts/astats.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/body.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/mind.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/soul.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/astats/status.hbs",

    // Skills
    "systems/marks-of-mezoria/templates/actor/parts/skills.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/body-might.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/body-swiftness.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/body-endurance.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/mind-insight.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/mind-focus.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/mind-willpower.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/mind-lore.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/soul-presence.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/soul-grace.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/soul-resolve.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/skills-combat.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/skills/skills-lore.hbs",

    // Abilities tab
    "systems/marks-of-mezoria/templates/actor/parts/abilities.hbs",

    // Treasure tab
    "systems/marks-of-mezoria/templates/actor/parts/treasure.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/treasure/riches.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/treasure/equipment.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/treasure/consumables.hbs",
    "systems/marks-of-mezoria/templates/actor/parts/subparts/treasure/storage.hbs",

    // Item sheets
    "systems/marks-of-mezoria/templates/items/ability-sheet.hbs",
    "systems/marks-of-mezoria/templates/items/equipment-sheet.hbs"
  ]);

  Actors.registerSheet("marks-of-mezoria", MinimalActorSheet, {
    types: ["pc"],
    makeDefault: true
  });

  Items.registerSheet("marks-of-mezoria", MezoriaAbilitySheet, {
    types: ["ability"],
    makeDefault: true
  });

  // NEW: Equipment sheet for weapon/armor/gear
  Items.registerSheet("marks-of-mezoria", MezoriaEquipmentSheet, {
    types: ["weapon", "armor", "gear"],
    makeDefault: true
  });
});

/* ------------------------------------
 * Auto-grant racial abilities & sync rank-tied abilities
 * ----------------------------------*/
Hooks.on("updateActor", async (actor, changed) => {
  if (actor.type !== "pc") return;

  const raceChanged = foundry.utils.getProperty(changed, "system.details.race") !== undefined;
  const rankChanged = foundry.utils.getProperty(changed, "system.details.rank") !== undefined;

  if (raceChanged) {
    await MezoriaActor.applyRacialAbilities(actor);
  }

  if (rankChanged) {
    await MezoriaActor.syncAbilityRanksToActor(actor);
  }
});

/* ------------------------------------
 * Ensure racial ability folders + items
 * ----------------------------------*/
Hooks.once("ready", async () => {
  if (!game.user.isGM) return;

  try {
    async function ensureFolder(name, parentId = null) {
      let folder = game.folders.find(f => {
        if (f.type !== "Item") return false;
        if (f.name !== name) return false;

        if (parentId === null) return !f.folder;
        return f.folder === parentId;
      });

      if (!folder) {
        folder = await Folder.create({
          name,
          type: "Item",
          folder: parentId
        });
      }

      return folder;
    }

    const actorFolder     = await ensureFolder("Actor", null);
    const abilitiesFolder = await ensureFolder("Abilities", actorFolder.id);
    const racialFolder    = await ensureFolder("Racial", abilitiesFolder.id);

    const racialData = RaceAbilityPack.racialAbilityData || {};
    const worldItems = game.items.contents;

    for (const [raceKey, defs] of Object.entries(racialData)) {
      if (!Array.isArray(defs) || !defs.length) continue;

      const raceFolderName = raceKey.charAt(0).toUpperCase() + raceKey.slice(1);
      const raceFolder     = await ensureFolder(raceFolderName, racialFolder.id);

      for (const def of defs) {
        if (!def || !def.key) continue;

        const exists = worldItems.find(i =>
          i.type === "ability" &&
          i.system?.details?.racialKey === def.key
        );
        if (exists) continue;

        const data = foundry.utils.deepClone(def);

        data.type   = "ability";
        data.folder = raceFolder.id;

        data.system ??= {};
        data.system.details ??= {};
        data.system.details.racialKey = def.key;

        data.system.details.sourceType  ??= "racial";
        data.system.details.sourceKey   ??= raceKey;
        data.system.details.autoGranted ??= false;

        await Item.create(data, { renderSheet: false });
      }
    }
  } catch (err) {
    console.error("Marks of Mezoria | Folder/Ability seeding error:", err);
  }
});
