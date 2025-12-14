// scripts/sheets/equipment-sheet.mjs
import { MezoriaConfig } from "../../config.mjs";

export class MezoriaEquipmentSheet extends ItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["marks-of-mezoria", "sheet", "item", "equipment"],
      template: "systems/marks-of-mezoria/templates/items/equipment-sheet.hbs",
      width: 560,
      height: 680,
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

    // Dropdown: equipment type (drives conditional fields)
    data.equipTypeOptions = {
      weapon: "Weapon",
      armor: "Armor",
      misc: "Misc"
    };

    // Dropdown: ranks
    const ranks = Array.isArray(data.config?.ranks) ? data.config.ranks : [];
    data.rankOptions = ranks.reduce((acc, r) => {
      if (!r) return acc;
      const key = String(r).toLowerCase();
      acc[key] = key.charAt(0).toUpperCase() + key.slice(1);
      return acc;
    }, {});

    // Dropdown: combat skill used for weapon attacks
    // Keys should match your combat skill keys elsewhere.
    data.combatSkillOptions = {
      combatHeavy: "Combat: Heavy Weapons",
      combatMedium: "Combat: Medium Weapons",
      combatGrappling: "Combat: Grappling",
      combatRanged: "Combat: Ranged Weapons",
      combatThrowing: "Combat: Throwing Weapons",
      combatSpellcasting: "Combat: Spellcasting",
      combatWands: "Combat: Wands"
    };

    // Dropdown: weapon damage die type
    data.dieTypeOptions = {
      d4: "d4",
      d6: "d6",
      d8: "d8",
      d10: "d10",
      d12: "d12"
    };

    const equipType = String(this.item.system?.equipType || "misc").toLowerCase();
    data.isWeapon = equipType === "weapon";
    data.isArmor  = equipType === "armor";
    data.isMisc   = equipType === "misc";

    return data;
  }

  async _updateObject(event, formData) {
    const expanded = foundry.utils.expandObject(formData);

    // Normalize equipType
    if (expanded.system?.equipType !== undefined) {
      expanded.system.equipType = String(expanded.system.equipType || "misc").toLowerCase();
    }

    await this.item.update(expanded);
  }
}
