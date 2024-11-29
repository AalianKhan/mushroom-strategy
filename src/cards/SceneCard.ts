import {AbstractCard} from "./AbstractCard";
import {cards} from "../types/strategy/cards";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";
import {TemplateCardConfig} from "../types/lovelace-mushroom/cards/template-card-config";
import {generic} from "../types/strategy/generic";
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
   * @type {TemplateCardConfig}
   * @private
   */
  #defaultConfig: TemplateCardConfig = {
    type: "custom:mushroom-template-card",
    primary: undefined,
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
   * @param {cards.TemplateCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity: EntityRegistryEntry, options: cards.TemplateCardOptions = {}) {
    super(entity);

    // Set the target for tap action.
    if (
      isCallServiceActionConfig(this.#defaultConfig.tap_action)
      && isCallServiceActionTarget(this.#defaultConfig.tap_action.target)
    ) {
      this.#defaultConfig.tap_action.target.entity_id = entity.entity_id;
    }

    // Initialize the default configuration.
    // entity.name doesn't appear to be populated for scene entities..
    this.#defaultConfig.primary = entity.original_name ?? entity.entity_id;

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {SceneCard};
