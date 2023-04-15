/**
 * Get a set of device entities from the entity registry, filtered by area and by entity-id, starting with string.
 *
 * The entity registry is a registry where Home Assistant keeps track of all entities.
 * A device is represented in Home Assistant via one or more entities.
 *
 * The set excludes hidden and disabled entities.
 *
 * @param {hassEntity[]} entities Registered Hass entities.
 * @param {deviceEntity[]} devices Registered devices entities.
 * @param {areaEntity} area Area entity.
 * @param {string} startsWith Starting string of the entity-id.
 *
 * @return {hassEntity[]} Set of device entities.
 * @todo: Create a lookup map for entities, just like at getStateEntities().
 */
function getDeviceEntitiesFromRegistry(entities, devices, area, startsWith) {
  // Get the ID of the devices which are linked to the given area.
  const areaDeviceIds = devices.filter(device => {
    return device.area_id === area.area_id;
  }).map(device => {
    return device.id;
  });

  // Return the states of which all conditions below are met:
  // 1. The state is linked to a device which is linked to the given area,
  //    or the state itself is linked to the given area.
  // 2. The state's ID starts with the give string.
  // 3. The state is not hidden and not disabled.
  return entities.filter(entity => {
    return (
        (areaDeviceIds.includes(entity.device_id) || entity.area_id === area.area_id)
        && entity.entity_id.startsWith(startsWith)
        && entity.hidden_by == null && entity.disabled_by == null
    );
  });
}

/**
 * Get a set of state entities, filtered by area and by entity-id, starting with string.
 *
 * The set excludes hidden and disabled entities.
 *
 * @param {hassObject["states"]} hassStates Hass entity states.
 * @param {hassEntity[]} entities Registered Hass entities.
 * @param {deviceEntity[]} devices Registered devices entities.
 * @param {areaEntity} area Area entity.
 * @param {string} startsWith Starting string of the entity-id.
 *
 * @return {Set<stateObject>} Set of state entities.
 * @todo: Apply a filter to stateEntities instead of iterating it manually.
 */
function getStateEntities(hassStates, entities, devices, area, startsWith) {
  const states = new Set;

  // Create a map for the hassEntities and devices {id: object} to improve lookup speed.
  /** @type {Object<string, hassEntity>} */
  const entityMap = Object.fromEntries(entities.map(entity => [entity.entity_id, entity]));
  /** @type {Object<string, deviceEntity>} */
  const deviceMap = Object.fromEntries(devices.map(device => [device.id, device]));

  // Get states whose entity-id starts with the given string.
  const stateEntities = Object.values(hassStates).filter(
      state => state.entity_id.startsWith(startsWith),
  );

  for (const state of stateEntities) {
    const hassEntity = entityMap[state.entity_id];
    const device     = deviceMap[hassEntity.device_id];

    // Collect states of which all conditions below are met:
    // 1. The linked entity is linked to the given area or isn't linked to any area.
    // 2. The linked device (if any) is assigned to the given area.
    if (
        (!hassEntity.area_id || hassEntity.area_id === area.area_id)
        && (device && device.area_id === area.area_id)
    ) {
      states.add(state);
    }
  }

  return states;
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
function createTitleCard(title, subtitle, offService, onService, iconOff, iconOn, area_id) {
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
 * @param {hassEntity[]} entities Registered Hass entities.
 * @param {entityConfig[]} customEntityCards Custom card-configurations for an entity on a view.
 * @param {Object} defaultCard Default card-configuration for the entities on a view.
 * @param {Object} titleCard Optional title card.
 * @param {Object} action Custom configuration for the card's double-tap action.
 *
 * @return {Object[]} Array of view cards.
 */
function createViewCards(entities, customEntityCards, defaultCard, titleCard, action = null) {
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
 * Get an array of entity state-entries, filtered by areas and by entity-id, starting with string.
 *
 * Each element contains a template-string which is used to access home assistant's state machine (state object) in a
 * template. E.g. "states['light.kitchen']"
 *
 * The array excludes hidden and disabled entities.
 *
 * @param {hassEntity[]} entities Registered Hass entities.
 * @param {deviceEntity[]} devices Registered devices entities.
 * @param {Set<areaEntity>} definedAreas Set of user-defined areas.
 * @param {string} startsWith Starting string of the entity-id.
 *
 * @return {string[]} Array of entity states.
 * @todo: Create lookup map like at getStateEntities().
 */
function getFilteredStatesEntries(entities, devices, definedAreas, startsWith) {
  /** @type {string[]} */
  const states = [];

  // Get the ID of the devices which are linked to the given area.
  for (const area of definedAreas) {
    const areaDeviceIds = devices.filter(device => {
      return device.area_id === area.area_id;
    }).map(device => {
      return device.id;
    });

    // Collect entities of which all conditions below are met:
    // 1. The entity is linked to a device which is linked to the given area,
    //    or the entity itself is linked to the given area.
    // 2. The entity's ID starts with the give string.
    // 3. The entity is not hidden and not disabled.
    for (const entity of entities) {
      if (
          (areaDeviceIds.includes(entity.device_id) || entity.area_id === area.area_id)
          && entity.entity_id.startsWith(startsWith)
          && entity.hidden_by == null && entity.disabled_by == null
      ) {
        states.push("states['" + entity.entity_id + "']");
      }
    }
  }

  // Return the list of entity states.
  return states;
}

class MushroomStrategy {
  /**
   * Generate a dashboard.
   *
   * The object passed to the info parameter contains the following properties:
   * ```
   * Key    Description
   * config User supplied dashboard configuration, if any.
   * hass   The Home Assistant object.
   * narrow If the current user interface is rendered in narrow mode or not.
   * ```
   *
   * @param {infoObject} info Dashboard strategy information object.
   * @return {Promise<{views: Object[]}>}
   */
  static async generateDashboard(info) {
    const strategyOptions = info.config.strategy.options || {};

    /** @type hassEntity[] */
    let entities;
    /** @type deviceEntity[] */
    let devices;
    /** @type areaEntity[] */
    let areas;

    // Query the registries of Home Assistant.
    [entities, devices, areas] = await Promise.all([
      info.hass.callWS({type: "config/entity_registry/list"}),
      info.hass.callWS({type: "config/device_registry/list"}),
      info.hass.callWS({type: "config/area_registry/list"}),
    ]);

    // Create a card for each person.
    const personCards = [];

    let people = Object.values(info.hass.states).filter((stateObj) =>
        stateObj.entity_id.startsWith("person."),
    );

    for (const person of people) {
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
    const areaCards    = [];
    const definedAreas = new Set();

    for (const area of areas) {
      // Override Home assistant properties of the with custom properties.
      const customConfiguration = {...area, ...strategyOptions.areas?.[area.area_id]}

      if (customConfiguration.hidden !== true) {
        dashboardAreas.push(area);
        areaCards.push({
          type: "custom:mushroom-template-card",
          primary: customConfiguration.name,
          icon: "mdi:texture-box",
          icon_color: "blue",
          tap_action: {
            action: "navigate",
            navigation_path: customConfiguration.area_id,
          },
          ...customConfiguration,
        });
      }
    }

    // Create a two-card horizontal stack of area cards.
    const horizontalAreaCards = [];

    for (let i = 0; i < areaCards.length; i += 2) {
      horizontalAreaCards.push({
        type: "horizontal-stack",
        cards: areaCards.slice(i, i + 2),
      });
    }

    // Create a list of area-ids, used for turning off all devices via chips
    const areaIds = [];

    for (const area of definedAreas) {
      areaIds.push(area.area_id);
    }

    // Create a chip to show how many are on for each platform if not disabled.
    const chips = [];

    // weather
    if (strategyOptions.chips != null && strategyOptions.chips.weather_entity != null) {
      chips.push({
        type: "weather",
        entity: strategyOptions.chips.weather_entity,
        show_temperature: true,
        show_conditions: true,
      });
    } else {
      const weatherEntity = entities.find(
          entity => entity.entity_id.startsWith("weather.") && entity.disabled_by == null && entity.hidden_by == null,
      );

      if (weatherEntity != null) {
        chips.push({
          type: "weather",
          entity: weatherEntity.entity_id,
          show_temperature: true,
          show_conditions: true,
        });
      }
    }

    // Light count
    const lightCountTemplate =
              "{% set lights = ["
              + getFilteredStatesEntries(entities, devices, definedAreas, "light.")
              + "] %} {{ lights | selectattr('state','eq','on') | list | count }}";

    if (strategyOptions.chips == null || strategyOptions.chips.light_count !== false) {
      chips.push({
        type: "template",
        icon: "mdi:lightbulb",
        icon_color: "amber",
        content: lightCountTemplate,
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

    // Fan count
    const fanCountTemplate =
              "{% set fans = ["
              + getFilteredStatesEntries(entities, devices, definedAreas, "fan.")
              + "] %} {{ fans | selectattr('state','eq','on') | list | count }}";

    if (strategyOptions.chips == null || strategyOptions.chips.fan_count !== false) {
      chips.push({
        type: "template",
        icon: "mdi:fan",
        icon_color: "green",
        content: fanCountTemplate,
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

    // Cover count
    const coverCountTemplate =
              "{% set covers = ["
              + getFilteredStatesEntries(entities, devices, definedAreas, "cover.") +
              "]%} {{ covers | selectattr('state','eq','open') | list | count }}";

    if (strategyOptions.chips == null || strategyOptions.chips.cover_count !== false) {
      chips.push({
        type: "template",
        icon: "mdi:window-open",
        icon_color: "cyan",
        content: coverCountTemplate,
        tap_action: {
          action: "navigate",
          navigation_path: "covers",
        },
      });
    }

    // Switch count
    const switchCountTemplate =
              "{% set switches = ["
              + getFilteredStatesEntries(entities, devices, definedAreas, "switch.")
              + "] %} {{ switches | selectattr('state','eq','on') | list | count }}";

    if (strategyOptions.chips == null || strategyOptions.chips.switch_count !== false) {
      chips.push({
        type: "template",
        icon: "mdi:power-plug",
        icon_color: "blue",
        content: switchCountTemplate,
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

    // Thermostat count
    const thermostatCountTemplate =
              "{% set thermostats = ["
              + getFilteredStatesEntries(entities, devices, definedAreas, "climate.")
              + "]%} {{ thermostats | selectattr('state','ne','off') | list | count }}";

    if (strategyOptions.chips == null || strategyOptions.chips.climate_count !== false) {
      chips.push({
        type: "template",
        icon: "mdi:thermostat",
        icon_color: "orange",
        content: thermostatCountTemplate,
        tap_action: {
          action: "navigate",
          navigation_path: "thermostats",
        },
      });
    }

    // Extra cards
    if (strategyOptions.chips != null && strategyOptions.chips.extra_chips != null) {
      chips.push(...strategyOptions.chips.extra_chips);
    }

    // Create Home view.
    const homeViewCards = [];

    homeViewCards.push(
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
    );

    if (strategyOptions.quick_access_cards != null) {
      homeViewCards.push(...strategyOptions.quick_access_cards);
    }

    homeViewCards.push(
        {
          type: "custom:mushroom-title-card",
          title: "Rooms",
        },
        {
          type: "vertical-stack",
          cards: horizontalRoomCards,
        },
    );

    if (strategyOptions.extra_cards != null) {
      homeViewCards.push(...strategyOptions.extra_cards);
    }

    const views = [];
    views.push({
      title: "Home",
      path: "home",
      cards: homeViewCards,
    });

    // Create Subview for each user-defined area.
    const entity_config = strategyOptions.entity_config;
    const defined_areas = strategyOptions.areas;

    for (const area of definedAreas) {
      views.push({
        title: area.name,
        path: area.area_id,
        subview: true,
        strategy: {
          type: "custom:mushroom-strategy",
          options: {area, devices, entities, entity_config, defined_areas},
        },
      });
    }

    // Create Light view if enabled.
    if (strategyOptions.views == null || strategyOptions.views.lights !== false) {
      const lightViewCards = [];

      lightViewCards.push(
          createTitleCard(
              "All Lights",
              lightCountTemplate + " lights on",
              "light.turn_off",
              "light.turn_on",
              "mdi:lightbulb-off",
              "mdi:lightbulb",
              areaIds,
          ),
      );

      for (const area of definedAreas) {
        const lights = getDeviceEntitiesFromRegistry(entities, devices, area, "light.");

        // If there are lights, create a title card and a light card for each one.
        if (lights.length > 0) {
          lightViewCards.push({
            type: "vertical-stack",
            cards: createViewCards(
                lights,
                entity_config,
                {
                  type: "custom:mushroom-light-card",
                  show_brightness_control: true,
                  show_color_control: true,
                  use_light_color: true,
                },
                createTitleCard(
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

      // Add the light to views
      views.push({
        title: "Lights",
        path: "lights",
        icon: "mdi:lightbulb-group",
        cards: lightViewCards,
      });
    }

    // Create Fan view if enabled.
    if (strategyOptions.views == null || strategyOptions.views.fans !== false) {
      const fanViewCards = [];

      fanViewCards.push(
          createTitleCard(
              "All Fans",
              fanCountTemplate + " fans on",
              "fan.turn_off",
              "fan.turn_on",
              "mdi:fan-off",
              "mdi:fan",
              areaIds,
          ),
      );

      for (const area of definedAreas) {
        const fans = getDeviceEntitiesFromRegistry(entities, devices, area, "fan.");

        if (fans.length > 0) {
          fanViewCards.push({
            type: "vertical-stack",
            cards: createViewCards(
                fans,
                entity_config,
                {
                  type: "custom:mushroom-fan-card",
                  show_percentage_control: true,
                  show_oscillate_control: true,
                  icon_animation: true,
                },
                createTitleCard(
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

      // Add the light to views.
      views.push({
        title: "Fans",
        path: "fans",
        icon: "mdi:fan",
        cards: fanViewCards,
      });
    }

    // Create Covers view if enabled.
    if (strategyOptions.views == null || strategyOptions.views.covers !== false) {
      const coverViewCards = [];

      coverViewCards.push(
          createTitleCard(
              "All Covers",
              coverCountTemplate + " covers open",
              "cover.close_cover",
              "cover.open_cover",
              "mdi:arrow-down",
              "mdi:arrow-up",
              areaIds,
          ),
      );

      for (const area of definedAreas) {
        const covers = getDeviceEntitiesFromRegistry(entities, devices, area, "cover.");

        if (covers.length > 0) {
          coverViewCards.push({
            type: "vertical-stack",
            cards: createViewCards(
                covers,
                entity_config,
                {
                  type: "custom:mushroom-cover-card",
                  show_buttons_control: true,
                  show_position_control: true,
                  show_tilt_position_control: true,
                },
                createTitleCard(
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

      // Add the switch to views.
      views.push({
        title: "Covers",
        path: "covers",
        icon: "mdi:window-open",
        cards: coverViewCards,
      });
    }

    // Create Switches view if enabled.
    if (strategyOptions.views == null || strategyOptions.views.switches !== false) {
      const switchViewCards = [];

      switchViewCards.push(
          createTitleCard(
              "All Switches",
              switchCountTemplate + " switches on",
              "switch.turn_off",
              "switch.turn_on",
              "mdi:power-plug-off",
              "mdi:power-plug",
              areaIds,
          ),
      );

      for (const area of definedAreas) {
        const switches = getDeviceEntitiesFromRegistry(entities, devices, area, "switch.");

        if (switches.length > 0) {
          switchViewCards.push({
            type: "vertical-stack",
            cards: createViewCards(
                switches,
                entity_config,
                {
                  type: "custom:mushroom-entity-card",
                  tap_action: {
                    action: "toggle",
                  },
                },
                createTitleCard(
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

      // Add the switch to views.
      views.push({
        title: "Switches",
        path: "switches",
        icon: "mdi:dip-switch",
        cards: switchViewCards,
      });
    }

    // Create Climate view if enabled.
    if (strategyOptions.views == null || strategyOptions.views.climates !== false) {
      const thermostatViewCards = [];

      thermostatViewCards.push({
        type: "custom:mushroom-title-card",
        title: "Thermostats",
        subtitle: thermostatCountTemplate + " thermostats on",
      });

      for (const area of definedAreas) {
        const thermostats = getDeviceEntitiesFromRegistry(entities, devices, area, "climate.");

        if (thermostats.length > 0) {
          thermostatViewCards.push({
            type: "vertical-stack",
            cards: createViewCards(
                thermostats,
                entity_config,
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

      // Add the switch to views.
      views.push({
        title: "Thermostats",
        path: "thermostats",
        icon: "mdi:thermostat",
        cards: thermostatViewCards,
      });
    }

    // Create camera view if enabled.
    if (strategyOptions.views == null || strategyOptions.views.cameras !== false) {
      const cameraViewCards = [];

      cameraViewCards.push({
        type: "custom:mushroom-title-card",
        title: "Cameras",
      });

      for (const area of definedAreas) {
        const cameraAreaCard = [];
        const cameras        = getDeviceEntitiesFromRegistry(entities, devices, area, "camera.");

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

      // Add the camera to views.
      views.push({
        title: "Cameras",
        path: "cameras",
        icon: "mdi:cctv",
        cards: cameraViewCards,
      });
    }

    // Add extra views if defined.
    if (strategyOptions.extra_views != null) {
      views.push(...strategyOptions.extra_views);
    }

    // Return views.
    return {
      views: views,
    };
  }

  /**
   * Generate a view.
   *
   * The object passed to the info parameter contains the following properties:
   * ```
   * Key    Description
   * view   View configuration.
   * config User supplied dashboard configuration, if any.
   * hass   The Home Assistant object.
   * narrow If the current user interface is rendered in narrow mode or not.
   * ```
   * @param {infoObject} info The view's strategy information object.
   * @return {Promise<{cards: Object[]}>}
   */
  static async generateView(info) {
    // Get all required values.
    const area          = info.view.strategy.options.area;
    const devices       = info.view.strategy.options.devices;
    const entities      = info.view.strategy.options.entities;
    const entity_config = info.view.strategy.options.entity_config;
    const definedAreas  = info.view.strategy.options.defined_areas;
    const cards         = [];

    // Add extra cards if defined.
    if (definedAreas != null) {
      for (const definedArea of definedAreas) {
        if (definedArea.name === area.name && definedArea.extra_cards != null) {
          cards.push(...definedArea.extra_cards);
        }
      }
    }

    // Create light cards.
    const lights = getDeviceEntitiesFromRegistry(entities, devices, area, "light.");

    if (lights.length > 0) {
      cards.push({
        type: "vertical-stack",
        cards: createViewCards(
            lights,
            entity_config,
            {
              type: "custom:mushroom-light-card",
              show_brightness_control: true,
              show_color_control: true,
              use_light_color: true,
            },
            createTitleCard(
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

    // Create fan cards.
    const fans = getDeviceEntitiesFromRegistry(entities, devices, area, "fan.");

    if (fans.length > 0) {
      cards.push({
            type: "vertical-stack",
            cards: createViewCards(
                fans,
                entity_config,
                {
                  type: "custom:mushroom-fan-card",
                  show_percentage_control: true,
                  show_oscillate_control: true,
                  icon_animation: true,
                },
                createTitleCard(
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

    // Create cover cards
    const covers = getDeviceEntitiesFromRegistry(entities, devices, area, "cover.");
    if (covers.length > 0) {
      cards.push({
        type: "vertical-stack",
        cards: createViewCards(
            covers,
            entity_config,
            {
              type: "custom:mushroom-cover-card",
              show_buttons_control: true,
              show_position_control: true,
              show_tilt_position_control: true,
            },
            createTitleCard(
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

    // Create switch cards.
    const switches = getDeviceEntitiesFromRegistry(entities, devices, area, "switch.");

    if (switches.length > 0) {
      cards.push({
        type: "vertical-stack",
        cards: createViewCards(
            switches,
            entity_config,
            {
              type: "custom:mushroom-entity-card",
              tap_action: {
                action: "toggle",
              },
            },
            createTitleCard(
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

    // Create climate cards.
    const thermostats = getDeviceEntitiesFromRegistry(entities, devices, area, "climate.");

    if (thermostats.length > 0) {
      cards.push({
        type: "vertical-stack",
        cards: createViewCards(
            thermostats,
            entity_config,
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

    // Create Media player cards.
    const media_players = getDeviceEntitiesFromRegistry(entities, devices, area, "media_player.");

    if (media_players.length > 0) {
      cards.push({
        type: "vertical-stack",
        cards: createViewCards(
            media_players,
            entity_config,
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

    // Create Sensor cards.
    const sensorStatesObj = getStateEntities(info.hass.states, entities, devices, area, "sensor.");
    const sensors         = getDeviceEntitiesFromRegistry(entities, devices, area, "sensor.");

    if (sensors.length > 0) {
      const sensorCards = [];

      sensorCards.push({
        type: "custom:mushroom-title-card",
        subtitle: "Sensors",
      });

      let sensorStateObj;
      sensorsLoop:
          for (const sensor of sensors) {
            // Find the state obj that matches with current sensor

            for (const stateObj of sensorStatesObj) {
              if (stateObj.entity_id === sensor.entity_id) {
                sensorStateObj = stateObj;
              }
            }

            if (entity_config == null) {
              if (sensorStateObj && sensorStateObj.attributes.unit_of_measurement != null) {
                sensorCards.push({
                  type: "custom:mini-graph-card",
                  entities: [sensor.entity_id],
                  animate: true,
                  line_color: "green",
                });
              } else {
                sensorCards.push({
                  type: "custom:mushroom-entity-card",
                  entity: sensor.entity_id,
                  icon_color: "green",
                });
              }
            } else {
              for (const config of entity_config) {
                if (sensor.entity_id === config.entity_id) {
                  sensorCards.push({...config});

                  continue sensorsLoop;
                }
              }

              if (sensorStateObj && sensorStateObj.attributes.unit_of_measurement != null) {
                sensorCards.push({
                  type: "custom:mini-graph-card",
                  entities: [sensor.entity_id],
                  animate: true,
                  line_color: "green",
                });
              } else {
                sensorCards.push({
                  type: "custom:mushroom-entity-card",
                  entity: sensor.entity_id,
                  icon_color: "green",
                });
              }
            }
          }

      cards.push({
        type: "vertical-stack",
        cards: sensorCards,
      });
    }

    // Create card for binary sensors.
    const binary_sensors = getDeviceEntitiesFromRegistry(entities, devices, area, "binary_sensor.");
    if (binary_sensors.length > 0) {
      const horizontalBinarySensorCards = [];
      const binarySensorCards           = createViewCards(
          binary_sensors,
          entity_config,
          {
            type: "custom:mushroom-entity-card",
            icon_color: "green",
          },
          null,
      );

      horizontalBinarySensorCards.push({
        type: "custom:mushroom-title-card",
        subtitle: "Binary Sensors",
      });

      for (let i = 0; i < binarySensorCards.length; i = i + 2) {
        if (binarySensorCards[i + 1] == null) {
          horizontalBinarySensorCards.push({
                type: "horizontal-stack",
                cards: [binarySensorCards[i]],
              },
          );
        } else {
          horizontalBinarySensorCards.push({
                type: "horizontal-stack",
                cards: [binarySensorCards[i], binarySensorCards[i + 1]],
              },
          );
        }
      }

      cards.push({
        type: "vertical-stack",
        cards: horizontalBinarySensorCards,
      });
    }

    // Create card of miscellaneous.
    const areaDevices = new Set();

    // Find all devices linked to this area
    for (const device of devices) {
      if (device.area_id === area.area_id) {
        areaDevices.add(device.id);
      }
    }

    // Filter entities
    const others = [];

    for (const entity of entities) {
      if (
          (areaDevices.has(entity.device_id) || entity.area_id === area.area_id)
          && entity.hidden_by == null
          && entity.disabled_by == null
          && !entity.entity_id.startsWith("light.")
          && !entity.entity_id.startsWith("fan.")
          && !entity.entity_id.startsWith("cover.")
          && !entity.entity_id.startsWith("switch.")
          && !entity.entity_id.startsWith("climate.")
          && !entity.entity_id.startsWith("sensor.")
          && !entity.entity_id.startsWith("binary_sensor.")
          && !entity.entity_id.startsWith("media_player.")
      ) {
        others.push(entity);
      }
    }

    if (others.length > 0) {
      cards.push({
        type: "vertical-stack",
        cards: createViewCards(
            others,
            entity_config,
            {
              type: "custom:mushroom-entity-card",
              icon_color: "blue-grey",
            },
            {
              type: "custom:mushroom-title-card",
              subtitle: "More",
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
