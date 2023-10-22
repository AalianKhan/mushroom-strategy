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

    let chips = []

    let motion = this.options?.motion || this.options?.occupancy || this.options?.presence;
    if (motion) {
      chips.push(this.makeChip('conditional', motion, {
        icon: 'mdi:motion-sensor',
        tap_action: {
          action: 'more-info'
        }
      }))
    }

    // Ideally, I would only see covers than are open when elevation is low / night
    // While I should see closed covers when elevation high / day
    // Helper.getStateEntities(this.entity, "cover").forEach(device => {
    //   chips.push(this.makeChip('entity', device.entity_id))
    // });

    // Ideally, there should only be 1 chip shown for all media players, climate
    Helper.getDeviceEntities(this.entity, "media_player").forEach(device => {
      chips.push(this.makeChip('conditional', device.entity_id, {}, {state: "playing"}))
      chips.push(this.makeChip('conditional', device.entity_id, {}, {state: "on"}))
    });

    Helper.getDeviceEntities(this.entity, "climate").forEach(device => {
      chips.push(this.makeChip('conditional', device.entity_id, {}, {state_not: "off"}))
    })

    // How can a single chip be achieved without requiring light_group configuration?
    let lightGroup = this.options?.light_group;
    if (lightGroup) {
      let lightChip = {
        type: 'conditional',
        conditions: [
          {entity: lightGroup, state: 'on'}
        ],
        chip: {
          type: 'template',
          entity: lightGroup,
          icon: 'mdi:lightbulb-group',
          // content: `{{ ['${lightGroup}'] | expand | selectattr('state','eq','on') | list | count }}`,
          tap_action: {
            action: 'toggle'
          },
          double_tap_action: {
            action: 'more-info'
          },
          hold_action: {
            action: 'more-info'
          },
        }
      }
      chips.push(lightChip)
    }

    if (chips.length) {
      // See https://community.home-assistant.io/t/mushroom-cards-build-a-beautiful-dashboard-easily/388590/8146
      card = {
        type: 'custom:stack-in-card',
        mode: 'vertical',
        cards: [
          {
            ...card,
            card_mod: {
              style: `ha-card {
                border: none;
              }`
            }
          },
          {
            type: 'custom:mushroom-chips-card',
            chips: chips.map(chip => {
              const card_mod = {
                style: `:host {
                  --chip-height: 25px;
                  --chip-box-shadow: 0px 1px 4px rgba(0,0,0,0.2);
                  --chip-border-width: 0px;
                  --chip-spacing: 2px;
                }
                `
              }
              if (chip.type === 'conditional') {
                return {
                  ...chip,
                  chip: {
                    ...chip.chip,
                    card_mod,
                  }
                }
              }

              return {
                ...chip,
                card_mod
              }
            }),
            alignment: 'start',
            card_mod: {
              style: `ha-card {
                margin-bottom: 10px;
                margin-left: 12px;
              }`
            }
          }
        ]
      }
    }

    return card;
  }

  makeChip(type, entity_id, options = {}, condition = {state: 'on'}) {
    const chip = {
      type: type !== 'conditional' ? type : 'entity',
      content_info: 'none',
      tap_action: {
        action: 'toggle'
      },
      double_tap_action: {
        action: 'more-info'
      },
      hold_action: {
        action: 'more-info'
      },
      entity: entity_id,
      ...options,
    }

    return type !== 'conditional' ? chip : {
      type,
      conditions: [
        {
          entity: entity_id,
          ...condition
        }
      ],
      chip
    }
  }
}

export {AreaCard};
