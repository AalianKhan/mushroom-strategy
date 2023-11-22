import {AbstractCard} from "./AbstractCard";
import {cards} from "../types/strategy/cards";
import {AreaRegistryEntry} from "../types/homeassistant/data/area_registry";
import {AreaCardConfig} from "../types/homeassistant/lovelace/cards/types";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * HA Area Card Class
 *
 * Used to create a card for an entity of the area domain using the built-in type 'area'.
 *
 * @class
 * @extends AbstractCard
 */
class AreaCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {AreaCardConfig}
   * @private
   */
  #defaultConfig: AreaCardConfig = {
    type: "area",
    area: "",
  };

  /**
   * Class constructor.
   *
   * @param {AreaRegistryEntry} area The area entity to create a card for.
   * @param {cards.AreaCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */

  constructor(area: AreaRegistryEntry, options: cards.AreaCardOptions = {}) {
    super(area);

    // Initialize the default configuration.
    this.#defaultConfig.area = area.area_id;
    this.#defaultConfig.navigation_path = this.#defaultConfig.area;

    // Enforce the card type.
    delete options.type;

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {AreaCard};
