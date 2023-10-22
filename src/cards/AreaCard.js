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

    if (!card.secondary) {
      const temperature = this.options?.temperature || Helper.getStateEntities(this.entity, "sensor", "temperature")[0]?.entity_id;
      const humidity = this.options?.humidity || Helper.getStateEntities(this.entity, "sensor", "humidity")[0]?.entity_id;
      const lux = this.options?.illuminance || Helper.getStateEntities(this.entity, "sensor", "illuminance")[0]?.entity_id;

      let secondaries = [];
      if (temperature) {
        secondaries.push(`🌡️{{ states('${temperature}') | int }}°`);
      }
      if (humidity) {
        secondaries.push(`💧{{ states('${humidity}') | int }}%`);
      }
      if (lux) {
        secondaries.push(`☀️{{ states('${lux}')}}lx`);
      }
      card.secondary = secondaries.join(" ");
    }

    if (!card.badge_icon) {
      const lock = this.options?.lock || Helper.getStateEntities(this.entity, "lock")[0]?.entity_id;
      const window = this.options?.window || Helper.getStateEntities(this.entity, "binary_sensor", "window")[0]?.entity_id;
      const door = this.options?.door || Helper.getStateEntities(this.entity, "binary_sensor", "door")[0]?.entity_id;

      let badgeConditions = []
      if (lock) {
        badgeConditions.push({entity: lock, state: 'unlocked', icon: 'mdi:lock-open'})
      }
      if (window) {
        badgeConditions.push({entity: window, state: 'on', icon: 'mdi:window-open-variant'})
      }
      if (door) {
        badgeConditions.push({entity: door, state: 'on', icon: 'mdi:door-open'})
      }

      if (badgeConditions.length) {
        let badge = badgeConditions
          .map(condition => `is_state('${condition.entity}', '${condition.state}') %}${condition.icon}{%`)
          .join(' elif ')
        badge = `{% if ${badge} endif %}`

        card.badge_color = "red";
        card.badge_icon = badge;
      }
    }

    return card;
  }
}

export {AreaCard};
