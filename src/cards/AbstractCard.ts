import {Helper} from "../Helper";
import {cards} from "../types/strategy/cards";
import {generic} from "../types/strategy/generic";
import {EntityCardConfig} from "../types/lovelace-mushroom/cards/entity-card-config";

/**
 * Abstract Card Class
 *
 * To create a new card, extend the new class with this one.
 *
 * @class
 * @abstract
 */
abstract class AbstractCard {
  /**
   * Entity to create the card for.
   *
   * @type {generic.RegistryEntry}
   */
  entity: generic.RegistryEntry;

  /**
   * Configuration of the card.
   *
   * @type {EntityCardConfig}
   */
  config: EntityCardConfig = {
    type: "custom:mushroom-entity-card",
    icon: "mdi:help-circle",
  };

  /**
   * Class constructor.
   *
   * @param {generic.RegistryEntry} entity The hass entity to create a card for.
   * @throws {Error} If the Helper module isn't initialized.
   */
  protected constructor(entity: generic.RegistryEntry) {
    if (!Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }

    this.entity = entity;
  }

  /**
   * Get a card.
   *
   * @return {cards.AbstractCardConfig} A card object.
   */
  getCard(): cards.AbstractCardConfig {
    return {
      ...this.config,
      entity: "entity_id" in this.entity ? this.entity.entity_id : undefined,
    };
  }
}

export {AbstractCard};
