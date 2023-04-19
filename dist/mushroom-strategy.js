/**
 * Mushroom Dashboard Strategy.<br>
 * <br>
 * Mushroom dashboard strategy provides a strategy for Home-Assistant to create a dashboard automatically.<br>
 * The strategy makes use Mushroom, Mini Graph and WebRTC cards to represent your entities.<br>
 * <br>
 * Features:<br>
 *     🛠 Automatically create dashboard with 3 lines of yaml.<br>
 *     😍 Built-in Views for several standard domains.<br>
 *     🎨 Many options to customize to your needs.<br>
 * <br>
 * Check the [Repository]{@link https://github.com/AalianKhan/mushroom-strategy} for more information.
 */
class MushroomStrategy {
  /**
   * An array of entities from Home Assistant's entity registry.
   *
   * @type hassEntity[]
   * @private
   */
  static #entities;
  /**
   * An array of entities from Home Assistant's device registry.
   *
   * @type deviceEntity[]
   * @private
   */
  static #devices;
  /**
   * An array of entities from Home Assistant's area registry.
   *
   * @type areaEntity[]
   * @private
   */
  static #areas;
  /**
   * An array of state entities from Home Assistant's Hass object.
   *
   * @type {hassObject["states"]}
   * @private
   */
  static #hassStates;

  /**
   * Get a template string to define the number of a given domain's entities with a certain state.
   *
   * States are compared against a given value by a given operator.
   *
   * @param {string} domain The domain of the entities.
   * @param {string} operator The Comparison operator between state and value.
   * @param {string} value The value to which the state is compared against.
   *
   * @return {string} The template string.
   */
  static #GetCountTemplate(domain, operator, value) {
    // noinspection JSMismatchedCollectionQueryUpdate (False positive per 17-04-2023)
    /**
     * Array of entity state-entries, filtered by domain.
     *
     * Each element contains a template-string which is used to access home assistant's state machine (state object) in
     * a template.
     * E.g. "states['light.kitchen']"
     *
     * The array excludes hidden and disabled entities.
     *
     * @type {string[]}
     */
    const states = [];

    // Get the ID of the devices which are linked to the given area.
    for (const area of this.#areas) {
      const areaDeviceIds = this.#devices.filter(device => {
        return device.area_id === area.area_id;
      }).map(device => {
        return device.id;
      });

      // Collect entity states of which all conditions below are met:
      // 1. The entity is linked to a device which is linked to the given area,
      //    or the entity itself is linked to the given area.
      // 2. The entity's ID starts with the give string.
      // 3. The entity is not hidden and not disabled.
      for (const entity of this.#entities) {
        if (
            (areaDeviceIds.includes(entity.device_id) || entity.area_id === area.area_id)
            && entity.entity_id.startsWith(`${domain}.`)
            && entity.hidden_by == null && entity.disabled_by == null
        ) {
          states.push(`states['${entity.entity_id}']`);
        }
      }
    }

    return `{% set entities = [${states}] %} {{ entities | selectattr('state','${operator}','${value}') | list | count }}`;
  }

  /**
   * Create a title card with controls to switch the entities of given areas.
   *
   * A title card is a horizontal-stack-card which includes:
   * ```
   * 1. A mushroom title card with title and subtitle (Both optional).
   * 2. A card to switch on given areas.
   * 3. A card to switch off given areas.
   * ```
   *
   * @param {string|null} title Title of the card.
   * @param {string|null} subtitle Subtitle of the card.
   * @param {string} offService Name of service to switch off the group.
   * @param {string} onService Name of service to switch on the group.
   * @param {string} iconOff Icon to set when given areas are switched off.
   * @param {string} iconOn Icon to set when given areas are switched on.
   * @param {string|string[]} area_id Id of the areas(s) to switch.
   *
   * @return {Object} A title card object.
   */
  static #createTitleCard(title, subtitle, offService, onService, iconOff, iconOn, area_id) {
    return {
      type: "horizontal-stack",
      cards: [
        {
          type: "custom:mushroom-title-card",
          title: title,
          subtitle: subtitle,
        },
        {
          type: "horizontal-stack",
          cards: [
            {
              type: "custom:mushroom-template-card",
              icon: iconOff,
              layout: "vertical",
              icon_color: "red",
              tap_action: {
                action: "call-service",
                service: offService,
                target: {
                  area_id: area_id,
                },
                data: {},
              },
            },
            {
              type: "custom:mushroom-template-card",
              icon: iconOn,
              layout: "vertical",
              icon_color: "amber",
              tap_action: {
                action: "call-service",
                service: onService,
                target: {
                  area_id: area_id,
                },
                data: {},
              },
            },
          ],
        },
      ],
    };
  }

  /**
   * Get an array of cards to be included in a view.
   *
   * A default card is created for each given entity and consists of an optional title-card and an entity-card.
   * Double-tapping opens the more-info popup of home assistant, unless given a custom double-tap configuration.
   *
   * If a custom card configuration is defined for an entity, it will override the default card and double-tap action.
   *
   * @param {hassEntity[]} entities Hass entities to create cards for.
   * @param {entityConfig[]} customEntityCards Custom card-configurations for an entity on a view.
   * @param {Object} defaultCard Default card-configuration for the entities on a view.
   * @param {Object=} [titleCard] Optional title card.
   * @param {Object=} action Custom configuration for the card's double-tap action.
   *
   * @return {Object[]} Array of view cards.
   */
  static #createViewCards(entities, customEntityCards, defaultCard, titleCard = null, action = null) {
    const viewCards = [];
    let customCard;

    // If a title card is defined, add it.
    if (titleCard) {
      viewCards.push(titleCard);
    }

    for (const entity of entities) {
      // If a custom card configuration is defined, add the custom card.
      customCard = (customEntityCards ?? []).find(config => config.entity === entity.entity_id);
      if (customCard) {
        viewCards.push(customCard);

        continue;
      }

      // No custom card configuration; Add the given default card with given double-tap action.
      action = action ? {
        double_tap_action: {
          target: {
            entity_id: entity.entity_id,
          },
          ...action,
        },
      } : null;

      viewCards.push({
        entity: entity.entity_id,
        ...defaultCard,
        ...action,
      });
    }

    return viewCards;
  }

  /**
   * Get state entities, filtered by area and domain.
   *
   * The result excludes hidden and disabled entities.
   *
   * @param {areaEntity} area Area entity.
   * @param {string} domain Domain of the entity-id.
   *
   * @return {stateObject[]} Array of state entities.
   */
  static #getStateEntities(area, domain) {
    const states = [];

    // Create a map for the hassEntities and devices {id: object} to improve lookup speed.
    /** @type {Object<string, hassEntity>} */
    const entityMap = Object.fromEntries(this.#entities.map(entity => [entity.entity_id, entity]));
    /** @type {Object<string, deviceEntity>} */
    const deviceMap = Object.fromEntries(this.#devices.map(device => [device.id, device]));

    // Get states whose entity-id starts with the given string.
    const stateEntities = Object.values(this.#hassStates).filter(
        state => state.entity_id.startsWith(`${domain}.`),
    );

    for (const state of stateEntities) {
      const hassEntity = entityMap[state.entity_id];
      const device     = deviceMap[hassEntity?.device_id];

      // Collect states of which all conditions below are met:
      // 1. The linked entity is linked to the given area or isn't linked to any area.
      // 2. The linked device (if any) is assigned to the given area.
      if (
          (!hassEntity?.area_id || hassEntity.area_id === area.area_id)
          && (device && device.area_id === area.area_id)
      ) {
        states.push(state);
      }
    }

    return states;
  }

  /**
   * Get device entities from the entity registry, filtered by area and domain.
   *
   * The entity registry is a registry where Home-Assistant keeps track of all entities.
   * A device is represented in Home Assistant via one or more entities.
   *
   * The result excludes hidden and disabled entities.
   *
   * @param {areaEntity} area Area entity.
   * @param {string} domain The domain of the entity-id.
   *
   * @return {hassEntity[]} Array of device entities.
   */
  static #getDeviceEntities(area, domain) {
    // Get the ID of the devices which are linked to the given area.
    const areaDeviceIds = this.#devices.filter(device => {
      return device.area_id === area.area_id;
    }).map(device => {
      return device.id;
    });

    // Return the entities of which all conditions below are met:
    // 1. The entity is linked to a device which is linked to the given area,
    //    or the entity itself is linked to the given area.
    // 2. The entity's domain matches the given domain.
    // 3. The entity is not hidden and is not disabled.
    return this.#entities.filter(entity => {
      return (
          (areaDeviceIds.includes(entity.device_id) || entity.area_id === area.area_id)
          && entity.entity_id.startsWith(`${domain}.`)
          && entity.hidden_by == null && entity.disabled_by == null
      );
    });
  }

  /**
   * Generate a dashboard.
   *
   * Called when opening a dashboard.
   *
   * @param {dashBoardInfo} info Dashboard strategy information object.
   * @return {Promise<{views: Object[]}>}
   */
  static async generateDashboard(info) {
    this.#hassStates      = info.hass.states;
    const strategyOptions = info.config.strategy.options || {};

    // Query the registries of Home Assistant.
    [this.#entities, this.#devices, this.#areas] = await Promise.all([
      info.hass.callWS({type: "config/entity_registry/list"}),
      info.hass.callWS({type: "config/device_registry/list"}),
      info.hass.callWS({type: "config/area_registry/list"}),
    ]);

    // Override the properties of the Home Assistant areas with custom values.
    this.#areas = this.#areas.map(area => {
      return {...area, ...strategyOptions.areas?.[area.area_id]};
    });

    // Create Person cards.
    const personCards = [];

    // Collect person entities.
    for (const person of this.#entities.filter(entity => entity.entity_id.startsWith("person."))) {
      personCards.push({
        type: "custom:mushroom-person-card",
        layout: "vertical",
        primary_info: "none",
        secondary_info: "none",
        icon_type: "entity-picture",
        entity: person.entity_id,
      });
    }

    // Create Area cards.
    const areaCards = [];

    for (let area of this.#areas) {
      if (area.hidden !== true) {
        areaCards.push({
          type: "custom:mushroom-template-card",
          primary: area.name,
          icon: "mdi:texture-box",
          icon_color: "blue",
          tap_action: {
            action: "navigate",
            navigation_path: area.area_id,
          },
          ...area,
        });
      }
    }

    // Horizontally group every two area cards.
    const horizontalCards = [];

    for (let i = 0; i < areaCards.length; i += 2) {
      horizontalCards.push({
        type: "horizontal-stack",
        cards: areaCards.slice(i, i + 2),
      });
    }

    // Create Chips.

    const chips   = [];
    // Create a list of area-ids, used for turning off all devices via chips
    const areaIds = this.#areas.map(area => area.area_id);

    // Weather chip.
    const weatherEntityId = strategyOptions.chips?.weather_entity ?? this.#entities.find(
        entity => entity.entity_id.startsWith("weather.") && entity.disabled_by == null && entity.hidden_by == null,
    ).entity_id;

    if (weatherEntityId) {
      chips.push({
        type: "weather",
        entity: weatherEntityId,
        show_temperature: true,
        show_conditions: true,
      });
    }

    // Light chip.
    if (strategyOptions.chips?.light_count ?? true) {
      chips.push({
        type: "template",
        icon: "mdi:lightbulb-group",
        icon_color: "amber",
        content: this.#GetCountTemplate("light", "eq", "on"),
        tap_action: {
          action: "call-service",
          service: "light.turn_off",
          target: {
            area_id: areaIds,
          },
          data: {},
        },
        hold_action: {
          action: "navigate",
          navigation_path: "lights",
        },
      });
    }

    // Fan chip.
    if (strategyOptions.chips?.fan_count ?? true) {
      chips.push({
        type: "template",
        icon: "mdi:fan",
        icon_color: "green",
        content: this.#GetCountTemplate("fan", "eq", "on"),
        tap_action: {
          action: "call-service",
          service: "fan.turn_off",
          target: {
            area_id: areaIds,
          },
          data: {},
        },
        hold_action: {
          action: "navigate",
          navigation_path: "fans",
        },
      });
    }

    // Cover chip
    if (strategyOptions.chips?.cover_count ?? true) {
      chips.push({
        type: "template",
        icon: "mdi:window-open",
        icon_color: "cyan",
        content: this.#GetCountTemplate("cover", "eq", "open"),
        tap_action: {
          action: "navigate",
          navigation_path: "covers",
        },
      });
    }

    // Switch chip.
    if (strategyOptions.chips?.switch_count ?? true) {
      chips.push({
        type: "template",
        icon: "mdi:dip-switch",
        icon_color: "blue",
        content: this.#GetCountTemplate("switch", "eq", "on"),
        tap_action: {
          action: "call-service",
          service: "switch.turn_off",
          target: {
            area_id: areaIds,
          },
          data: {},
        },
        hold_action: {
          action: "navigate",
          navigation_path: "switches",
        },
      });
    }

    // Climate chip.
    if (strategyOptions.chips?.climate_count ?? true) {
      chips.push({
        type: "template",
        icon: "mdi:thermostat",
        icon_color: "orange",
        content: this.#GetCountTemplate("climate", "ne", "off"),
        tap_action: {
          action: "navigate",
          navigation_path: "thermostats",
        },
      });
    }

    // Extra chips.
    if (strategyOptions.chips?.extra_chips) {
      chips.push(...strategyOptions.chips.extra_chips);
    }

    // Create views.
    const views = [];

    // Create Home view.
    /** @type {Object<string, *>[]} */
    const homeViewCards = [
      {
        type: "custom:mushroom-chips-card",
        alignment: "center",
        chips: chips,
      },
      {
        type: "horizontal-stack",
        cards: personCards,
      },
      {
        type: "custom:mushroom-template-card",
        primary: "{% set time = now().hour %} {% if (time >= 18) %} Good Evening, {{user}}! {% elif (time >= 12) %} Good Afternoon, {{user}}! {% elif (time >= 5) %} Good Morning, {{user}}! {% else %} Hello, {{user}}! {% endif %}",
        icon: "mdi:hand-wave",
        icon_color: "orange",
      },
    ];

    // Add quick access cards.
    if (strategyOptions.quick_access_cards) {
      homeViewCards.push(...strategyOptions.quick_access_cards);
    }

    // Add Area cards.
    homeViewCards.push(
        {
          type: "custom:mushroom-title-card",
          title: "Areas",
        },
        {
          type: "vertical-stack",
          cards: horizontalCards,
        },
    );

    // Add extra cards.
    if (strategyOptions.extra_cards) {
      homeViewCards.push(...strategyOptions.extra_cards);
    }

    views.push({
      title: "Home",
      path: "home",
      cards: homeViewCards,
    });

    // Create a Lights view, if enabled.
    if (strategyOptions.views?.lights ?? true) {
      const lightViewCards = [];

      lightViewCards.push(
          this.#createTitleCard(
              "All Lights",
              this.#GetCountTemplate("light", "eq", "on") + " lights on",
              "light.turn_off",
              "light.turn_on",
              "mdi:lightbulb-off",
              "mdi:lightbulb",
              areaIds,
          ),
      );

      for (const area of this.#areas) {
        const lights = this.#getDeviceEntities(area, "light");

        // If there are lights, create a title card and a light card for each one.
        if (lights.length > 0) {
          lightViewCards.push({
            type: "vertical-stack",
            cards: this.#createViewCards(
                lights,
                strategyOptions.entity_config,
                {
                  type: "custom:mushroom-light-card",
                  show_brightness_control: true,
                  show_color_control: true,
                  use_light_color: true,
                },
                this.#createTitleCard(
                    area.name,
                    null,
                    "light.turn_off",
                    "light.turn_on",
                    "mdi:lightbulb-off",
                    "mdi:lightbulb",
                    area.area_id,
                ),
                {
                  action: "call-service",
                  service: "light.turn_on",
                  data: {
                    rgb_color: [255, 255, 255],
                  },
                },
            ),
          });
        }
      }

      // Add the Lights view.
      views.push({
        title: "Lights",
        path: "lights",
        icon: "mdi:lightbulb-group",
        cards: lightViewCards,
      });
    }

    // Create a fans view, if enabled.
    if (strategyOptions.views?.fans ?? true) {
      const fanViewCards = [];

      fanViewCards.push(
          this.#createTitleCard(
              "All Fans",
              this.#GetCountTemplate("fan", "eq", "on") + " fans on",
              "fan.turn_off",
              "fan.turn_on",
              "mdi:fan-off",
              "mdi:fan",
              areaIds,
          ),
      );

      for (const area of this.#areas) {
        const fans = this.#getDeviceEntities(area, "fan");

        if (fans.length > 0) {
          fanViewCards.push({
            type: "vertical-stack",
            cards: this.#createViewCards(
                fans,
                strategyOptions.entity_config,
                {
                  type: "custom:mushroom-fan-card",
                  show_percentage_control: true,
                  show_oscillate_control: true,
                  icon_animation: true,
                },
                this.#createTitleCard(
                    area.name,
                    null, "fan.turn_off",
                    "fan.turn_on",
                    "mdi:fan-off",
                    "mdi:fan",
                    area.area_id,
                ),
            ),
          });
        }
      }

      // Add the Fans view.
      views.push({
        title: "Fans",
        path: "fans",
        icon: "mdi:fan",
        cards: fanViewCards,
      });
    }

    // Create Covers view if enabled.
    if (strategyOptions.views?.covers ?? true) {
      const coverViewCards = [];

      coverViewCards.push(
          this.#createTitleCard(
              "All Covers",
              this.#GetCountTemplate("cover", "eq", "open") + " covers open",
              "cover.close_cover",
              "cover.open_cover",
              "mdi:arrow-down",
              "mdi:arrow-up",
              areaIds,
          ),
      );

      for (const area of this.#areas) {
        const covers = this.#getDeviceEntities(area, "cover");

        if (covers.length > 0) {
          coverViewCards.push({
            type: "vertical-stack",
            cards: this.#createViewCards(
                covers,
                strategyOptions.entity_config,
                {
                  type: "custom:mushroom-cover-card",
                  show_buttons_control: true,
                  show_position_control: true,
                  show_tilt_position_control: true,
                },
                this.#createTitleCard(
                    area.name,
                    null,
                    "cover.close_cover",
                    "cover.open_cover",
                    "mdi:arrow-down",
                    "mdi:arrow-up",
                    area.area_id,
                ),
            ),
          });
        }
      }

      // Add the Covers view.
      views.push({
        title: "Covers",
        path: "covers",
        icon: "mdi:window-open",
        cards: coverViewCards,
      });
    }

    // Create a Switches view, if enabled.
    if (strategyOptions.views?.switches ?? true) {
      const switchViewCards = [];

      switchViewCards.push(
          this.#createTitleCard(
              "All Switches",
              this.#GetCountTemplate("switch", "eq", "on") + " switches on",
              "switch.turn_off",
              "switch.turn_on",
              "mdi:power-plug-off",
              "mdi:power-plug",
              areaIds,
          ),
      );

      for (const area of this.#areas) {
        const switches = this.#getDeviceEntities(area, "switch");

        if (switches.length > 0) {
          switchViewCards.push({
            type: "vertical-stack",
            cards: this.#createViewCards(
                switches,
                strategyOptions.entity_config,
                {
                  type: "custom:mushroom-entity-card",
                  tap_action: {
                    action: "toggle",
                  },
                },
                this.#createTitleCard(
                    area.name,
                    null,
                    "switch.turn_off",
                    "switch.turn_on",
                    "mdi:power-plug-off",
                    "mdi:power-plug",
                    area.area_id,
                ),
            ),
          });
        }
      }

      // Add the Switches view.
      views.push({
        title: "Switches",
        path: "switches",
        icon: "mdi:dip-switch",
        cards: switchViewCards,
      });
    }

    // Create a Climates view, if enabled.
    if (strategyOptions.views?.climates ?? true) {
      const climateViewCards = [];

      climateViewCards.push({
        type: "custom:mushroom-title-card",
        title: "Climates",
        subtitle: this.#GetCountTemplate("climate", "ne", "off") + " climates on",
      });

      for (const area of this.#areas) {
        const climates = this.#getDeviceEntities(area, "climate");

        if (climates.length > 0) {
          climateViewCards.push({
            type: "vertical-stack",
            cards: this.#createViewCards(
                climates,
                strategyOptions.entity_config,
                {
                  type: "custom:mushroom-climate-card",
                  hvac_modes: [
                    "off",
                    "cool",
                    "heat",
                    "fan_only",
                  ],
                  show_temperature_control: true,
                },
                {
                  type: "custom:mushroom-title-card",
                  title: area.name,
                },
            ),
          });
        }
      }

      // Add the Climates view.
      views.push({
        title: "Climates",
        path: "climates",
        icon: "mdi:thermostat",
        cards: climateViewCards,
      });
    }

    // Create a Cameras view, if enabled.
    if (strategyOptions.views?.cameras ?? true) {
      const cameraViewCards = [];

      cameraViewCards.push({
        type: "custom:mushroom-title-card",
        title: "Cameras",
      });

      for (const area of this.#areas) {
        const cameraAreaCard = [];
        const cameras        = this.#getDeviceEntities(area, "camera");

        // If there are cameras, create a title card and a camera card for each one.
        if (cameras.length > 0) {
          cameraAreaCard.push({
            type: "custom:mushroom-title-card",
            title: area.name,
          });

          for (const camera of cameras) {
            cameraAreaCard.push({
              type: "custom:webrtc-camera",
              entity: camera.entity_id,
            });
          }
        }

        cameraViewCards.push({
          type: "vertical-stack",
          cards: cameraAreaCard,
        });
      }

      // Add the Camera view.
      views.push({
        title: "Cameras",
        path: "cameras",
        icon: "mdi:cctv",
        cards: cameraViewCards,
      });
    }

    // Add extra views if defined.
    if (strategyOptions.extra_views) {
      views.push(...strategyOptions.extra_views);
    }

    // Create Area sub views.
    for (const area of this.#areas) {
      views.push({
        title: area.name,
        path: area.area_id,
        subview: true,
        strategy: {
          type: "custom:mushroom-strategy",
          options: {
            // TODO: Check necessity of below variables.
            area,
            "defined_areas": strategyOptions.areas,
            "entity_config": strategyOptions.entity_config,
            devices: this.#devices,
            entities: this.#entities,
          },
        },
      });
    }

    // Return the created views.
    return {
      views: views,
    };
  }

  /**
   * Generate a view.
   *
   * Called when opening a subview.
   *
   * @param {viewInfo} info The view's strategy information object.
   * @return {Promise<{cards: Object[]}>}
   */
  static async generateView(info) {
    // Get all required values.
    // TODO: Check necessity of below variables.
    const area         = info.view.strategy.options.area;
    const devices      = info.view.strategy.options.devices;
    const entities     = info.view.strategy.options.entities;
    const entityConfig = info.view.strategy.options.entity_config;
    const cards        = [];

    // Add extra cards if defined.
    cards.push(...(area.extra_cards ?? []));

    // Create a column of light cards.
    const lights = this.#getDeviceEntities(area, "light");

    if (lights.length) {
      cards.push({
        type: "vertical-stack",
        cards: this.#createViewCards(
            lights,
            entityConfig,
            {
              type: "custom:mushroom-light-card",
              show_brightness_control: true,
              show_color_control: true,
              use_light_color: true,
            },
            this.#createTitleCard(
                null,
                "Lights",
                "light.turn_off",
                "light.turn_on",
                "mdi:lightbulb-off",
                "mdi:lightbulb",
                area.area_id,
            ),
            {
              action: "call-service",
              service: "light.turn_on",
              data: {
                rgb_color: [255, 255, 255],
              },
            },
        ),
      });
    }

    // Create a column of fan cards.
    const fans = this.#getDeviceEntities(area, "fan");

    if (fans.length) {
      cards.push({
            type: "vertical-stack",
            cards: this.#createViewCards(
                fans,
                entityConfig,
                {
                  type: "custom:mushroom-fan-card",
                  show_percentage_control: true,
                  show_oscillate_control: true,
                  icon_animation: true,
                },
                this.#createTitleCard(
                    null,
                    "Fans",
                    "fan.turn_off",
                    "fan.turn_on",
                    "mdi:fan-off",
                    "mdi:fan",
                    area.area_id,
                ),
            ),
          },
      );
    }

    // Create a column of cover cards
    const covers = this.#getDeviceEntities(area, "cover");

    if (covers.length) {
      cards.push({
        type: "vertical-stack",
        cards: this.#createViewCards(
            covers,
            entityConfig,
            {
              type: "custom:mushroom-cover-card",
              show_buttons_control: true,
              show_position_control: true,
              show_tilt_position_control: true,
            },
            this.#createTitleCard(
                null, "Covers",
                "cover.close_cover",
                "cover.open_cover",
                "mdi:arrow-down",
                "mdi:arrow-up",
                area.area_id,
            ),
        ),
      });
    }

    // Create a column of switch cards.
    const switches = this.#getDeviceEntities(area, "switch");

    if (switches.length) {
      cards.push({
        type: "vertical-stack",
        cards: this.#createViewCards(
            switches,
            entityConfig,
            {
              type: "custom:mushroom-entity-card",
              tap_action: {
                action: "toggle",
              },
            },
            this.#createTitleCard(
                null,
                "Switches",
                "switch.turn_off",
                "switch.turn_off",
                "mdi:power-plug-off",
                "mdi:power-plug",
                area.area_id,
            ),
        ),
      });
    }

    // Create a column of climate cards.
    const climates = this.#getDeviceEntities(area, "climate");

    if (climates.length) {
      cards.push({
        type: "vertical-stack",
        cards: this.#createViewCards(
            climates,
            entityConfig,
            {
              type: "custom:mushroom-climate-card",
              hvac_modes: [
                "off",
                "cool",
                "heat",
                "fan_only",
              ],
              show_temperature_control: true,
            },
            {
              type: "custom:mushroom-title-card",
              subtitle: "Climate",
            },
        ),
      });
    }

    // Create a column of Media player cards.
    const mediaPlayers = this.#getDeviceEntities(area, "media_player");

    if (mediaPlayers.length) {
      cards.push({
        type: "vertical-stack",
        cards: this.#createViewCards(
            mediaPlayers,
            entityConfig,
            {
              type: "custom:mushroom-media-player-card",
              use_media_info: true,
              media_controls: [
                "on_off",
                "play_pause_stop",
              ],
              show_volume_level: true,
              volume_controls: [
                "volume_mute",
                "volume_set",
                "volume_buttons",
              ],
            },
            {
              type: "custom:mushroom-title-card",
              subtitle: "Media Players",
            },
        ),
      });
    }

    // Create a column of Sensor cards.
    let sensors        = this.#getDeviceEntities(area, "sensor");
    const sensorStates = this.#getStateEntities(area, "sensor");
    const sensorCards  = [];

    if (sensors.length) {
      // Add a Title card.
      sensorCards.push({
        type: "custom:mushroom-title-card",
        subtitle: "Sensors",
      });

      // Create a card for each sensor.
      for (const sensor of sensors) {
        // Find the state of the current sensor.
        const sensorState = sensorStates.find(state => state.entity_id === sensor.entity_id);

        // Define the card type.
        let card = {
          type: "custom:mushroom-entity-card",
          entity: sensor.entity_id,
          icon_color: "green",
        };

        if (sensorState.attributes.unit_of_measurement) {
          card = {
            type: "custom:mini-graph-card",
            entities: [sensor.entity_id],
            animate: true,
            line_color: "green",
          };
        }

        if (entityConfig) {
          card = entityConfig.find(config => config.entity_id === sensor.entity_id) ?? card;
        }

        sensorCards.push(card);
      }

      cards.push({
        type: "vertical-stack",
        cards: sensorCards,
      });
    }

    // Create a column of Binary-Sensor cards.
    sensors = this.#getDeviceEntities(area, "binary_sensor");

    if (sensors.length) {
      const horizontalCards = [];

      // Add a title card.
      horizontalCards.push({
        type: "custom:mushroom-title-card",
        subtitle: "Binary Sensors",
      });

      // Create a card for each binary sensor.
      const binarySensorCards = this.#createViewCards(
          sensors,
          entityConfig,
          {
            type: "custom:mushroom-entity-card",
            icon_color: "green",
          },
      );

      // Horizontally group every two sensor cards.
      for (let i = 0; i < binarySensorCards.length; i += 2) {
        horizontalCards.push({
          type: "horizontal-stack",
          cards: binarySensorCards.slice(i, i + 2),
        });
      }

      cards.push({
        type: "vertical-stack",
        cards: horizontalCards,
      });
    }

    // Create Miscellaneous cards.
    const regularDomains = [
      "light",
      "fan",
      "cover",
      "switch",
      "climate",
      "sensor",
      "binary_sensor",
      "media_player",
    ];

    // Collect device entities of the current area.
    const areaDevices = devices
        .filter(device => device.area_id === area.area_id)
        .map(device => device.id);

    // Collect the remaining entities of which all conditions below are met:
    // 1. The entity is linked to a device which is linked to the current area,
    //    or the entity itself is linked to the current area.
    // 2. The entity is not hidden and is not disabled.
    const miscellaneousEntities = entities.filter(entity => {
      return (areaDevices.includes(entity.device_id) || entity.area_id === area.area_id)
          && entity.hidden_by == null
          && entity.disabled_by == null
          && !regularDomains.includes(entity.entity_id.split(".", 1)[0]);
    });

    // Create a column of miscellaneous entity cards.
    if (miscellaneousEntities.length) {
      cards.push({
        type: "vertical-stack",
        cards: this.#createViewCards(
            miscellaneousEntities,
            entityConfig,
            {
              type: "custom:mushroom-entity-card",
              icon_color: "blue-grey",
            },
            {
              type: "custom:mushroom-title-card",
              subtitle: "Miscellaneous",
            },
        ),
      });
    }

    // Return cards.
    return {
      cards: cards,
    };
  }
}

// noinspection JSUnresolvedReference
customElements.define("ll-strategy-mushroom-strategy", MushroomStrategy);
