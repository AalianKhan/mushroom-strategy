import {AbstractCard} from "./AbstractCard";
import {cards} from "../types/strategy/cards";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";
import {LightCardConfig} from "../types/lovelace-mushroom/cards/light-card-config";
import {generic} from "../types/strategy/generic";
import isCallServiceActionConfig = generic.isCallServiceActionConfig;
import isCallServiceActionTarget = generic.isCallServiceActionTarget;


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Card Class
 *
 * Used to create a card for controlling an entity of the light domain.
 *
 * @class
 * @extends AbstractCard
 */
class LightCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {LightCardConfig}
   * @private
   */
  #defaultConfig: LightCardConfig = {
    type: "custom:mushroom-light-card",
    icon: undefined,
    show_brightness_control: true,
    show_color_control: true,
    show_color_temp_control: true,
    use_light_color: true,
    double_tap_action: {
      action: "call-service",
      service: "light.turn_on",
      target: {
        entity_id: undefined,
      },
      data: {
        rgb_color: [255, 255, 255],
      },
    },
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.LightCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity: EntityRegistryEntry, options: cards.LightCardOptions = {}) {
    super(entity);

    // Set the target for double-tap action.
    if (
      isCallServiceActionConfig(this.#defaultConfig.double_tap_action)
      && isCallServiceActionTarget(this.#defaultConfig.double_tap_action.target)
    ) {
      this.#defaultConfig.double_tap_action.target.entity_id = entity.entity_id;
    }

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {LightCard};
