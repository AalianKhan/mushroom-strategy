import {AbstractCard} from "./AbstractCard";
import {cards} from "../types/strategy/cards";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";
import {generic} from "../types/strategy/generic";
import {EntityCardConfig} from "../types/lovelace-mushroom/cards/entity-card-config";
import {Helper} from "../Helper";
import isCallServiceActionConfig = generic.isCallServiceActionConfig;
import isCallServiceActionTarget = generic.isCallServiceActionTarget;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Scene Card Class
 *
 * Used to create a card for an entity of the scene domain.
 *
 * @class
 * @extends AbstractCard
 */
class SceneCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {EntityCardConfig}
   * @private
   */
  #defaultConfig: EntityCardConfig = {
    type: "custom:mushroom-entity-card",
    icon: "mdi:palette",
    icon_color: "blue",
    tap_action: {
      action: "call-service",
      service: "scene.turn_on",
      target: {
        entity_id: undefined,
      },
    },
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.EntityCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity: EntityRegistryEntry, options: cards.EntityCardOptions = {}) {
    super(entity);

    // Set the target for tap action.
    if (
      isCallServiceActionConfig(this.#defaultConfig.tap_action)
      && isCallServiceActionTarget(this.#defaultConfig.tap_action.target)
    ) {
      this.#defaultConfig.tap_action.target.entity_id = entity.entity_id;
    }

    this.#defaultConfig.icon = Helper.getEntityState(entity)?.attributes.icon ?? this.#defaultConfig.icon;

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {SceneCard};
