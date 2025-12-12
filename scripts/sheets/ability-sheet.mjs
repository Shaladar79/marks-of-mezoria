// scripts/sheets/ability-sheet.mjs

import { buildAbilityRollFormula } from "../abilities/rolls.mjs";

/**
 * MezoriaAbilitySheet
 *
 * Item sheet for Abilities.
 * Logic is unchanged from your current system.mjs, just moved here.
 */
export class MezoriaAbilitySheet extends ItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["marks-of-mezoria", "sheet", "item", "ability"],
      template: "systems/marks-of-mezoria/templates/items/ability-sheet.hbs",
      width: 600,
      height: 500,
      tabs: [],
      submitOnChange: true
    });
  }

  async getData(options) {
    const data   = await super.getData(options);
    const config = CONFIG["marks-of-mezoria"];

    data.config = config;

    const system = data.item.system || {};
    data.system  = system;

    // Parent actor (if this ability is on a character)
    const actor = data.item.parent ?? null;
    data.actor  = actor || null;

    // ---------------------------------
    // Source Key options based on Source Type
    // ---------------------------------
    const sourceType = system?.details?.sourceType ?? "";
    let sourceKeyOptions = {};

    const races        = (config && config.races)            || {};
    const backgrounds  = (config && config.backgrounds)      || {};
    const markPurposes = (config && config.markOfPurpose)    || {};
    const rankLabels   = (config && config.abilityRanks)     || {};
    const rankOrder    = (config && config.abilityRankOrder) || [];

    if (sourceType === "racial") {
      sourceKeyOptions = races;
    }
    else if (sourceType === "background") {
      sourceKeyOptions = backgrounds;
    }
    else if (sourceType === "mark") {
      sourceKeyOptions = markPurposes;
    }
    else if (sourceType === "rank") {
      const out = {};
      for (const key of rankOrder) {
        out[key] = rankLabels[key] || (key.charAt(0).toUpperCase() + key.slice(1));
      }
      sourceKeyOptions = out;
    }
    else {
      sourceKeyOptions = {};
    }

    data.sourceKeyOptions = sourceKeyOptions;

    // ---------------------------------
    // Filtered mod-attribute options based on Effect Type
    // ---------------------------------
    const allModAttrs = config.abilityModAttributes || {};
    const effectType  = system?.details?.effect?.type ?? "";

    let filtered = allModAttrs;

    if (effectType === "healing") {
      filtered = {};
      if (allModAttrs.grace) filtered.grace = allModAttrs.grace;
    }
    else if (effectType === "shielding") {
      filtered = {};
      if (allModAttrs.presence) filtered.presence = allModAttrs.presence;
    }
    else if (effectType === "damage" || effectType === "drain") {
      filtered = {};
      if (allModAttrs.might)   filtered.might   = allModAttrs.might;
      if (allModAttrs.insight) filtered.insight = allModAttrs.insight;
    }

    data.modAttributeOptions = filtered;

    // ---------------------------------
    // Consolidation / Upgrade Cost
    // ---------------------------------
    const rankCostsCfg = config.abilityRankCosts || {};
    const baseCost     = Number(rankCostsCfg.baseCost ?? 100);
    const costByRank   = rankCostsCfg.costByRank || {};
    const multipliers  = rankCostsCfg.multipliers || {};

    const details        = system.details || {};
    const rankOrderAb    = config.abilityRankOrder || [];
    const baseRankKey    = details.rankReq || "";              // treat min char rank as base
    const currentRankKey = details.currentRank || baseRankKey; // default to base if not set

    let upgradeCost    = null;
    let canConsolidate = false;

    if (rankOrderAb.length && currentRankKey) {
      const curIdx  = rankOrderAb.indexOf(currentRankKey);
      const nextIdx = curIdx + 1;

      if (curIdx !== -1 && nextIdx < rankOrderAb.length) {
        const nextRankKey = rankOrderAb[nextIdx];

        let cost = Number(costByRank[nextRankKey]);
        if (!cost || isNaN(cost)) {
          const mult = Number(multipliers[nextRankKey] ?? 1);
          cost = baseCost * (mult || 1);
        }

        upgradeCost = cost;
      }
    }

    if (upgradeCost != null && actor && actor.system && actor.system.spirit) {
      const currentSpirit = Number(actor.system.spirit.current ?? 0);
      canConsolidate = currentSpirit >= upgradeCost;
    }

    data.upgradeCost    = upgradeCost;
    data.canConsolidate = canConsolidate;

    // If this ability is flagged as non-consolidatable, force-disable
    const noConsolidate = !!details.noConsolidate;
    if (noConsolidate) {
      data.upgradeCost    = null;
      data.canConsolidate = false;
    }

    // ---------------------------------
    // Roll Preview
    // ---------------------------------
    data.rollPreview = "";
    try {
      const formula = buildAbilityRollFormula(actor, data.item);
      if (formula) data.rollPreview = formula;
    } catch (err) {
      console.error("Marks of Mezoria | Roll Preview Error:", err);
      data.rollPreview = "";
    }

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Consolidation button on Ability sheet
    html.find(".consolidate-ability").on("click", async (event) => {
      event.preventDefault();

      const button = event.currentTarget;
      const itemId = button.dataset.itemId || this.item.id;
      const actor  = this.item.parent;

      if (!actor) {
        ui.notifications?.warn("Consolidation requires this ability to be on a character.");
        return;
      }

      const item = actor.items.get(itemId);
      if (!item) return;

      const sys = item.system || {};
      if (sys.details?.noConsolidate) {
        ui.notifications?.warn("This ability ranks up automatically and cannot be consolidated.");
        return;
      }

      const cfg           = CONFIG["marks-of-mezoria"] || {};
      const rankOrder     = cfg.abilityRankOrder || [];
      const details       = sys.details || {};
      const baseRankKey   = details.rankReq || "";
      const currentRankKey = details.currentRank || baseRankKey;

      if (!currentRankKey || !rankOrder.length) {
        ui.notifications?.warn("This ability does not have a valid rank configuration.");
        return;
      }

      const curIdx  = rankOrder.indexOf(currentRankKey);
      const nextIdx = curIdx + 1;

      if (curIdx === -1 || nextIdx >= rankOrder.length) {
        ui.notifications?.warn("This ability is already at maximum rank.");
        return;
      }

      const nextRankKey = rankOrder[nextIdx];

      const rankCostsCfg = cfg.abilityRankCosts || {};
      const baseCost     = Number(rankCostsCfg.baseCost ?? 100);
      const costByRank   = rankCostsCfg.costByRank || {};
      const multipliers  = rankCostsCfg.multipliers || {};

      let cost = Number(costByRank[nextRankKey]);
      if (!cost || isNaN(cost)) {
        const mult = Number(multipliers[nextRankKey] ?? 1);
        cost = baseCost * (mult || 1);
      }

      const spiritNode    = actor.system.spirit || {};
      const currentSpirit = Number(spiritNode.current ?? 0);
      const spentSpirit   = Number(spiritNode.spent   ?? 0);

      if (currentSpirit < cost) {
        ui.notifications?.warn("Not enough Spirit to consolidate this ability.");
        return;
      }

      const newSpiritCurrent = currentSpirit - cost;
      const newSpiritSpent   = spentSpirit + cost;

      await actor.update({
        "system.spirit.current": newSpiritCurrent,
        "system.spirit.spent":   newSpiritSpent
      });

      await item.update({
        "system.details.currentRank": nextRankKey
      });

      const rankLabels = cfg.abilityRanks || {};
      const rankLabel  = rankLabels[nextRankKey] || nextRankKey;

      ui.notifications?.info(`Consolidated ${item.name} to ${rankLabel}.`);
    });
  }

  async _updateObject(event, formData) {
    const expanded = foundry.utils.expandObject(formData);
    await this.object.update(expanded);
  }
}
