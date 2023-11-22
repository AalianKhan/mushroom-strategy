import {AbstractCard} from "./AbstractCard";
import {cards} from "../types/strategy/cards";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";
import {CoverCardConfig} from "../types/lovelace-mushroom/cards/cover-card-config";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Cover Card Class
 *
 * Used to create a card for controlling an entity of the cover domain.
 *
 * @class
 * @extends AbstractCard
 */
class CoverCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {CoverCardConfig}
   * @private
   */
  #defaultConfig: CoverCardConfig = {
    type: "custom:mushroom-cover-card",
    icon: undefined,
    show_buttons_control: true,
    show_position_control: true,
    show_tilt_position_control: true,
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.CoverCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity: EntityRegistryEntry, options: cards.CoverCardOptions = {}) {
    super(entity);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {CoverCard};
