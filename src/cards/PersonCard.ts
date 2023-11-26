import {AbstractCard} from "./AbstractCard";
import {cards} from "../types/strategy/cards";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";
import {PersonCardConfig} from "../types/lovelace-mushroom/cards/person-card-config";

/**
 * Person Card Class
 *
 * Used to create a card for an entity of the Person domain.
 *
 * @class
 * @extends AbstractCard
 */
class PersonCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {PersonCardConfig}
   * @private
   */
  #defaultConfig: PersonCardConfig = {
    type: "custom:mushroom-person-card",
    layout: "vertical",
    primary_info: "none",
    secondary_info: "none",
    icon_type: "entity-picture",
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.PersonCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity: EntityRegistryEntry, options: cards.PersonCardOptions = {}) {
    super(entity);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {PersonCard};
