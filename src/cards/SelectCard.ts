import {AbstractCard} from "./AbstractCard";
import {cards} from "../types/strategy/cards";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";
import {SelectCardConfig} from "../types/lovelace-mushroom/cards/select-card-config";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported
/**
 * Select Card Class
 *
 * Used to create a card for controlling an entity of the select domain.
 *
 * @class
 * @extends AbstractCard
 */
class SelectCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {SelectCardConfig}
   * @private
   */
  #defaultConfig: SelectCardConfig = {
    type: "custom:mushroom-select-card",
    icon: undefined,
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.SelectCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity: EntityRegistryEntry, options: cards.SelectCardOptions = {}) {
    super(entity);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {SelectCard};
