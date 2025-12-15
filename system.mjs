// system.mjs
import { MezoriaConfig } from "./config.mjs";
import { RaceData } from "./scripts/races.mjs";
import { MezoriaActor } from "./scripts/actor.mjs";

// Actor sheet + Item sheets
import { MinimalActorSheet } from "./scripts/sheets/pc-sheet.mjs";
import { MezoriaAbilitySheet } from "./scripts/sheets/ability-sheet.mjs";
import { MezoriaEquipmentSheet } from "./scripts/sheets/equipment-sheet.mjs";

// Existing pack helper (you already have this in your project)
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

    // Character Info
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

  // Actor sheet
  Actors.registerSheet("marks-of-mezoria", MinimalActorSheet, {
    types: ["pc"],
    makeDefault: true
  });

  // Ability item sheet
  Items.registerSheet("marks-of-mezoria", MezoriaAbilitySheet, {
    types: ["ability"],
    makeDefault: true
  });

  // Equipment item sheet (single equipment type workflow)
  Items.registerSheet("marks-of-mezoria", MezoriaEquipmentSheet, {
    types: ["equipment"],
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
 * Ready hook
 * - Abilities compendium folder wiring (system pack)
 * - Existing world Item folder seeding (kept intact)
 * ----------------------------------*/
Hooks.once("ready", async () => {
  if (!game.user.isGM) return;

  // ---------------------------------------------------------------------------
  // 1) Abilities Compendium Folder Wiring
  // ---------------------------------------------------------------------------
  try {
    const PACK_KEY = "marks-of-mezoria.abilities";
    const pack = game.packs.get(PACK_KEY);

    if (!pack) {
      console.warn(`Marks of Mezoria | Abilities compendium not found: ${PACK_KEY}. Check system.json packs[].`);
    } else {
      await pack.getIndex();

      // NOTE: Only this function has been updated to prevent duplicate folder creation.
      const ensureCompendiumFolder = async (name, parentFolderId = null, folderKey = null) => {
        const SCOPE = "marks-of-mezoria";

        // Compendium folders are stored as real Folder documents; they can be found via game.folders
        // where folder.pack === pack.collection.
        const folders = game.folders.filter(f =>
          f.type === "Item" &&
          f.pack === pack.collection
        );

        // 1) Prefer stable flag match when folderKey is provided
        let folder = null;
        if (folderKey) {
          folder = folders.find(f => f.getFlag(SCOPE, "folderKey") === folderKey) ?? null;
        }

        // 2) Fallback to name + parent match (supports legacy folders that predate flags)
        if (!folder) {
          folder = folders.find(f => {
            const sameName = f.name === name;
            const sameParent = parentFolderId ? (f.folder?.id === parentFolderId) : !f.folder;
            return sameName && sameParent;
          }) ?? null;
        }

        // 3) Create if missing
        if (!folder) {
          folder = await Folder.create(
            {
              name,
              type: "Item",
              folder: parentFolderId || null,
              flags: folderKey ? { [SCOPE]: { folderKey } } : {}
            },
            { pack: pack.collection }
          );
        } else if (folderKey && folder.getFlag(SCOPE, "folderKey") !== folderKey) {
          // 4) Stamp flag on existing folder so future runs are stable and never duplicate
          await folder.setFlag(SCOPE, "folderKey", folderKey);
        }

        return folder;
      };

      // Top-level folders
      const racialFolder     = await ensureCompendiumFolder("Racial", null, "abilities-racial");
      const backgroundFolder = await ensureCompendiumFolder("Background", null, "abilities-background");
      const marksFolder      = await ensureCompendiumFolder("Marks", null, "abilities-marks");
      await ensureCompendiumFolder("Talents", null, "abilities-talents");

      // Background subfolders
      await ensureCompendiumFolder("Common Professions", backgroundFolder.id, "abilities-background-common");
      await ensureCompendiumFolder("Skilled Trades & Crafts", backgroundFolder.id, "abilities-background-skilled");
      await ensureCompendiumFolder("Street-Level Backgrounds", backgroundFolder.id, "abilities-background-street");
      await ensureCompendiumFolder("Social & Cultural Backgrounds", backgroundFolder.id, "abilities-background-social");

      // Marks subfolders
      await ensureCompendiumFolder("Purpose", marksFolder.id, "abilities-marks-purpose");
      await ensureCompendiumFolder("Power", marksFolder.id, "abilities-marks-power");
      await ensureCompendiumFolder("Concept", marksFolder.id, "abilities-marks-concept");
      await ensureCompendiumFolder("Eldritch", marksFolder.id, "abilities-marks-eldritch");

      // Racial subfolders: one per race
      const raceLabels =
        MezoriaConfig?.races ??
        RaceData?.labels ??
        {};

      const raceEntries = Object.entries(raceLabels)
        .filter(([k, v]) => k && v)
        .sort((a, b) => String(a[1]).localeCompare(String(b[1])));

      for (const [raceKey, raceName] of raceEntries) {
        await ensureCompendiumFolder(String(raceName), racialFolder.id, `abilities-racial-${String(raceKey)}`);
      }

      console.log("Marks of Mezoria | Abilities compendium folder tree verified (including per-race folders).");
    }
  } catch (err) {
    console.error("Marks of Mezoria | Failed to wire Abilities compendium folders:", err);
  }

  // ---------------------------------------------------------------------------
  // Shared helper for world Item folders (v13-safe)
  // ---------------------------------------------------------------------------
  async function ensureFolder(name, parentId = null) {
    let folder = game.folders.find(f => {
      if (f.type !== "Item") return false;
      if (f.name !== name) return false;

      if (parentId === null) return !f.folder;
      // FIX: v13 uses Folder references; compare by id
      return f.folder?.id === parentId;
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

  // ---------------------------------------------------------------------------
  // 2) Existing World Item folder seeding for racial abilities
  // ---------------------------------------------------------------------------
  try {
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

  // ---------------------------------------------------------------------------
  // 3) World Item folder seeding for Equipment (folders only for now)
  // ---------------------------------------------------------------------------
  try {
    const equipmentRoot = await ensureFolder("Equipment", null);

    await ensureFolder("Armor",   equipmentRoot.id);
    await ensureFolder("Weapons", equipmentRoot.id);
    await ensureFolder("Misc",    equipmentRoot.id);

    console.log("Marks of Mezoria | Equipment folder tree verified (Armor/Weapons/Misc).");
  } catch (err) {
    console.error("Marks of Mezoria | Equipment folder seeding error:", err);
  }
});

