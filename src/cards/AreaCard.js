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

  /**
   * @inheritdoc
   */
  getCard() {
    let card = super.getCard();

    let temperature = this.options?.temperature;
    let humidity = this.options?.humidity;
    let lux = this.options?.illuminance;
    let window = this.options?.window;
    let lock = this.options?.lock;
    let door = this.options?.door;
    
    // Search for sensors if not configured
    if (!(temperature || humidity || lux)) {
      const sensors  = Helper.getDeviceEntities(this.entity, "sensor");
      
      if (sensors.length) {
        const sensorStates = Helper.getStateEntities(this.entity, "sensor");
        for (const sensor of sensors) {
          const sensorState = sensorStates.find(state => state.entity_id === sensor.entity_id);
          if (sensorState.state === "unavailable") continue;
          switch (sensorState.attributes.device_class) {
            case "temperature":
              temperature = sensor.entity_id;
              break;
            case "humidity":
              humidity = sensor.entity_id;
              break;
            case "illuminance":
              lux = sensor.entity_id;
              break;
            default:
              // Handle other device classes if needed
              break;
          }
        }
      }
    }

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
    
    // Search for binary sensors if not configured
    if (!(window || lock || door)) {
      const binary_sensors  = Helper.getDeviceEntities(this.entity, "binary_sensor");
      if (binary_sensors.length) {
        const binary_sensorStates = Helper.getStateEntities(this.entity, "binary_sensor");
        for (const binary_sensor of binary_sensors) {
          const binary_sensorState = binary_sensorStates.find(state => state.entity_id === binary_sensor.entity_id);
          if (!binary_sensorState.state === "unavailable") continue;
          switch (binary_sensorState.attributes.device_class) {
            case "window":
              window = binary_sensor.entity_id;
              break;
            case "lock":
              lock = binary_sensor.entity_id;
              break;
            case "door":
              door = binary_sensor.entity_id;
              break;
            default:
              // Handle other device classes if needed
              break;
          }
        }
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
