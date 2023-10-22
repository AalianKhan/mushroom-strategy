import {AbstractCard} from "./AbstractCard";
import {Helper} from "../Helper";

/**
 * Area Card Class
 *
 * Used to create a card for an entity of the area domain.
 *
 * @class
 * @extends AbstractCard
 */
class AreaCard extends AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {areaCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-template-card",
    primary: undefined,
    icon: "mdi:texture-box",
    icon_color: "blue",
    tap_action: {
      action: "navigate",
      navigation_path: undefined,
    },
    hold_action: {
      action: "none",
    },
  };

  /**
   * Class constructor.
   *
   * @param {areaEntity} area The area entity to create a card for.
   * @param {areaCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(area, options = {}) {
    super(area);

    this.#defaultOptions.primary                    = area.name;
    this.#defaultOptions.tap_action.navigation_path = area.area_id ?? area.name;

    // Set card type to default if a type "default" is given in strategy options.
    if (options.type === "default") {
      options.type = this.#defaultOptions.type;
    }

    this.mergeOptions(
        this.#defaultOptions,
        options,
    );

    // Override the area's name with a custom name, unless a custom primary text is set.
    if (!options.primary && options.name) {
      this.options.primary = options.name;
    }
  }

  getCard() {
    let card = {
      entity: this.entity.entity_id,
      ...this.options,
    };

    let temperature = options?.temperature || Helper.getStateEntities(this.entity, "sensor", "temperature")[0]?.entity_id;
    let humidity = options?.humidity || Helper.getStateEntities(this.entity, "sensor", "humidity")[0]?.entity_id;
    let lux = options?.illuminance || Helper.getStateEntities(this.entity, "sensor", "illuminance")[0]?.entity_id;
    let window = options?.window || Helper.getStateEntities(this.entity, "binary_sensor", "window")[0]?.entity_id;
    let lock = options?.lock || Helper.getStateEntities(this.entity, "binary_sensor", "lock")[0]?.entity_id;
    let door = options?.door || Helper.getStateEntities(this.entity, "binary_sensor", "door")[0]?.entity_id;
    
    // If configured or found, create template
    if (temperature || humidity || lux) {
      let secondary = ``;
      if (temperature) {
        secondary = secondary + `❄️{{ states('${temperature}') | int }}°`
      }
      if (humidity) {
        secondary = secondary + `💧{{ states('${humidity}')}}%`
      }
      if (lux) {
        secondary = secondary + `☀️{{ states('${lux}')}}lx`
      }

      if (!card.secondary) {
        card.secondary = secondary;
      }
    }

    // If configured or found, create template
    if (window || door || lock) {
      let badge;
      if (window) {
        badge = `{% if is_state('${window}', 'on') %}mdi:window-open-variant`;
        if (door) {
          badge = badge + `{% elif is_state('${door}', 'on') %}mdi:door-open`
        } 
        if (lock) {
          badge = badge + `{% elif is_state('${lock}', 'on') %}mdi:lock-open`
        }
      } else if (door) {
        badge = `{% if is_state('${door}', 'on') %}mdi:door-open`;
        if (lock) {
          badge = badge + `{% elif is_state('${lock}', 'on') %}mdi:lock-open`
        }
      } else if (lock) {
        badge = `{% if is_state('${lock}', 'on') %}mdi:lock-open`
      }
      badge = badge + `{% endif %}`

      if (!card.badge_icon) {
        card.badge_color = "red";
        card.badge_icon = badge;
      }
    }

    return card;
  }
}

export {AreaCard};
