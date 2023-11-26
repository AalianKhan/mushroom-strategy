import {AbstractCard} from "./AbstractCard";
import {cards} from "../types/strategy/cards";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";
import {FanCardConfig} from "../types/lovelace-mushroom/cards/fan-card-config";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Fan Card Class
 *
 * Used to create a card for controlling an entity of the fan domain.
 *
 * @class
 * @extends AbstractCard
 */
class FanCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {FanCardConfig}
   * @private
   */
  #defaultConfig: FanCardConfig = {
    type: "custom:mushroom-fan-card",
    icon: undefined,
    show_percentage_control: true,
    show_oscillate_control: true,
    icon_animation: true,
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.FanCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity: EntityRegistryEntry, options: cards.FanCardOptions = {}) {
    super(entity);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {FanCard};
