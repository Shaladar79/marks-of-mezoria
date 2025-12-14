// scripts/sheets/equipment-sheet.mjs
import { MezoriaConfig } from "../../config.mjs";

export class MezoriaEquipmentSheet extends ItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["marks-of-mezoria", "sheet", "item", "equipment"],
      template: "systems/marks-of-mezoria/templates/items/equipment-sheet.hbs",
      width: 520,
      height: 620,
      submitOnChange: true,
      resizable: true
    });
  }

  get title() {
    return `${this.item.name} — Equipment`;
  }

  async getData(options) {
    const data = await super.getData(options);

    data.config = CONFIG["marks-of-mezoria"] ?? MezoriaConfig;

    // Equipment kinds for the dropdown (stored as system.category)
    data.equipmentKinds = {
      weapon: "Weapon",
      armor: "Armor",
      misc: "Misc"
    };

    // Rank list for dropdown
    // In your config this is an array like ["normal","quartz",...]
    const ranks = Array.isArray(data.config?.ranks) ? data.config.ranks : [];
    data.rankOptions = ranks.reduce((acc, r) => {
      if (!r) return acc;
      const key = String(r).toLowerCase();
      acc[key] = key.charAt(0).toUpperCase() + key.slice(1);
      return acc;
    }, {});

    // Weapon combat skill dropdown options (keys should match your skill paths used on the sheet)
    data.combatSkillOptions = {
      combatHeavy: "Combat: Heavy Weapons",
      combatMedium: "Combat: Medium Weapons",
      combatGrappling: "Combat: Grappling",
      combatRanged: "Combat: Ranged Weapons",
      combatThrowing: "Combat: Throwing Weapons",
      combatSpellcasting: "Combat: Spellcasting",
      combatWands: "Combat: Wands"
    };

    // Weapon damage die dropdown
    data.dieTypeOptions = {
      d4: "d4",
      d6: "d6",
      d8: "d8",
      d10: "d10",
      d12: "d12"
    };

    // Convenience flags for template rendering
    const t = this.item.type;
    const cat = (this.item.system?.category || "").toLowerCase();

    data.isWeapon = (t === "weapon") || (cat === "weapon");
    data.isArmor  = (t === "armor")  || (cat === "armor");
    data.isMisc   = (t === "gear")   || (cat === "misc" || cat === "gear" || cat === "");

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    // No special listeners needed for now.
    // We rely on Foundry's default form update behavior (submitOnChange: true).
  }

  async _updateObject(event, formData) {
    const expanded = foundry.utils.expandObject(formData);

    // Normalize category based on dropdown if present
    // This does NOT change item.type (Foundry restriction); it only sets system.category.
    const cat = expanded.system?.category;
    if (cat) expanded.system.category = String(cat).toLowerCase();

    await this.item.update(expanded);
  }
}
