const getFilteredEntitiesFromEntityRegistry = (entities, devices, area, startsWith) => {
  const areaDevices = new Set();
  // Find all devices linked to this area
  for (const device of devices) {
    if (device.area_id === area.area_id) {
      areaDevices.add(device.id);
    }
  }
  
  // Filter entities
  const filteredEntities = new Set();
  for (const entity of entities) 
  {
    if ((areaDevices.has(entity.device_id) || entity.area_id === area.area_id) && entity.entity_id.startsWith(startsWith) && entity.hidden_by == null && entity.disabled_by == null)
    {
      filteredEntities.add(entity);
    }
  }
  return filteredEntities;
};

const getFilteredEntitiesFromStates = (info, entities, devices, area, startsWith) => {
  const entityLookup = Object.fromEntries(
    entities.map((ent) => [ent.entity_id, ent])
  );
  const deviceLookup = Object.fromEntries(
    devices.map((dev) => [dev.id, dev])
  );

  let states = Object.values(info.hass.states).filter((stateObj) =>
    stateObj.entity_id.startsWith(startsWith) 
  );
  const areaEntities = new Set;
  for (const stateObj of states) {
    const entry = entityLookup[stateObj.entity_id];
    if (!entry) {
      continue;
    }
    if (entry.area_id) {
      if (entry.area_id !== area.area_id) {
        continue;
      }
    } else if (entry.device_id) {
      const device = deviceLookup[entry.device_id];
      if (!device || device.area_id !== area.area_id) {
        continue;
      }
    } else {
      continue;
    }
    areaEntities.add(stateObj);
  }
  return areaEntities;
}

const createTitleWithControls = (title, subtitle, offService, onService, iconOff, iconOn, area_id) => (
  {
    type: "horizontal-stack",
    cards:
    [
      {
        type: "custom:mushroom-title-card",
        title: title,
        subtitle: subtitle
      },
      {
        type: "horizontal-stack",
        cards:
        [
          {
            type: "custom:mushroom-template-card",
            icon: iconOff,
            layout: "vertical",
            icon_color: "red",
            tap_action:
            {
              action: "call-service",
              service: offService,
              target:
              {
                area_id: area_id
              },
              data: {}
            },
          },
          {
            type: "custom:mushroom-template-card",
            icon: iconOn,
            layout: "vertical",
            icon_color: "amber",
            tap_action:
            {
              action: "call-service",
              service: onService,
              target:
              {
                area_id: area_id
              },
              data: {}
            },
          }
        ]

      }
    ]
  }
)
const createPlatformCard = (entities, entity_config, defaultCard, titleCard, doubleTapActionConfig) => {
  const platformCards = [];
  if (titleCard != null) {
    platformCards.push(titleCard);
  }
  
  entitiesLoop:
  for (const entity of entities)
  {
    // Entity config does not exist then push defualt card, otherwise loop to find matching entity
    if (entity_config == null) {
      if (doubleTapActionConfig != null) {
        var doubleTapAction = 
        {
          double_tap_action:
          {
            target:
            {
              entity_id: entity.entity_id
            },
            ...doubleTapActionConfig
          }
        }
      }
      platformCards.push
      (
        {
          entity: entity.entity_id,
          ...defaultCard,
          ...doubleTapAction
        }
      )
    } else 
    {
      for (const config of entity_config)
      {
        if (entity.entity_id == config.entity)
        {
          platformCards.push
          (
            {
              ...config
            },
          );
          continue entitiesLoop;
        } 
      }
        
      if (doubleTapActionConfig != null)
      {
        var doubleTapAction = 
        {
          double_tap_action:
          {
            target:
            {
              entity_id: entity.entity_id
            },
            ...doubleTapActionConfig
          }
        }
      }

      platformCards.push
      (
        {
          entity: entity.entity_id,
          ...defaultCard,
          ...doubleTapAction
        }
      )
        
    }
  }

  return platformCards;
}

const createListOfFilteredStates = (entities, devices, definedAreas, startsWith) => {
  const filteredEntities = new Set();
  for (const area of definedAreas)
  {
    const areaDevices = new Set();
    // Find all devices linked to this area
    for (const device of devices) {
      if (device.area_id === area.area_id) {
        areaDevices.add(device.id);
      }
    }
    
    // Filter entities
    for (const entity of entities) 
    {
      if ((areaDevices.has(entity.device_id) || entity.area_id === area.area_id) && entity.entity_id.startsWith(startsWith) && entity.hidden_by == null && entity.disabled_by == null)
      {
        filteredEntities.add(entity);
      }
    }
  }
  
  // create a list of states.light
  var statesList = [];
  for (const entity of filteredEntities)
  {
    statesList.push
    (
      "states['" + entity.entity_id + "']"
    );
  }
  return statesList
}

class MushroomStrategy {

  static async generateDashboard(info)
  {
    const strategyOptions = info.config.strategy.options || {};
    // Query all data we need. We will make it available to views by storing it in strategy options.
    const [areas, devices, entities] = await Promise.all([
      info.hass.callWS({ type: "config/area_registry/list" }),
      info.hass.callWS({ type: "config/device_registry/list" }),
      info.hass.callWS({ type: "config/entity_registry/list" }),
    ]);
  
    // Create People card for each person 
    let people = Object.values(info.hass.states).filter((stateObj) =>
      stateObj.entity_id.startsWith("person.")
    );
    const peopleCards = [];
    for (const person of people)
    {
      peopleCards.push
      (
        {
          type: "custom:mushroom-person-card",
          layout: "vertical",
          primary_info: "none",
          secondary_info: "none",
          icon_type: "entity-picture",
          entity: person.entity_id
        },
      );
    }
    /*******************************************************
    ***** Create Room cards for each area in Home view *****
    *******************************************************/
    const roomCards = [];
    
    // Find all user defined areas and push the card, if not defined, create the room card for every area
    const definedAreas = new Set();
    if (strategyOptions.areas != null)
    {
      for (const userDefinedArea of strategyOptions.areas)
      {
        for (const area of areas)
        {
          if (userDefinedArea.name == area.name)
          {
            definedAreas.add(area);
            roomCards.push
            (
              {
                type: "custom:mushroom-template-card",
                primary: area.name,
                icon: "mdi:texture-box",
                icon_color: "blue",
                tap_action:
                {
                  action: "navigate",
                  navigation_path: area.area_id
                },
                ...userDefinedArea,
              },
            );
          }
        }
      }
    } else 
    {
      for (const area of areas)
      {
        definedAreas.add(area);
        roomCards.push
        (
          {
            type: "custom:mushroom-template-card",
            primary: area.name,
            icon: "mdi:texture-box",
            icon_color: "blue",
            tap_action:
            {
              action: "navigate",
              navigation_path: area.area_id
            },
          },
        );
      }
    }
      
    // horizontally stack the room cards, 2 per row
    const horizontalRoomcards = [];
    for (var i = 0; i < roomCards.length; i = i + 2)
    {
      if (roomCards[i+1] == null)
      {
        horizontalRoomcards.push(
          {
            type: "horizontal-stack",
            cards: 
            [
              roomCards[i]
            ]
          }
        )
      } else 
      {
        horizontalRoomcards.push(
          {
            type: "horizontal-stack",
            cards: 
            [
              roomCards[i],
              roomCards[i+1],
            ]
          }
        )
      }
    }
    
    // Create list of area ids, used for turning off all devices via chips
    const area_ids = [];
    for (const area of definedAreas)
    {
      area_ids.push(area.area_id);
    }

    /********************************************************************************
    ***** Create chip to show how many are on for each platform if not disabled *****
    ********************************************************************************/
    const chips = []
    
    // weather 
    if (strategyOptions.chips != null && strategyOptions.chips.weather_entity != null)
    {
      chips.push
      (
        {
          type: "weather",
          entity: strategyOptions.chips.weather_entity,
          show_temperature: true,
          show_conditions: true
        }
      )
    } else 
    {
      const weatherEntity = entities.find(entity => entity.entity_id.startsWith("weather.") && entity.disabled_by == null && entity.hidden_by == null)
      if (weatherEntity != null)
      {
        chips.push
        (
          {
            type: "weather",
            entity: weatherEntity.entity_id,
            show_temperature: true,
            show_conditions: true
          }
        )
      }
      
    }
    
    
    // Light count
    const lightCountTemplate = "{% set lights = [" + createListOfFilteredStates(entities, devices, definedAreas, "light.") + "] %} {{ lights | selectattr('state','eq','on') | list | count }}";
    if (strategyOptions.chips == null || (strategyOptions.chips != null && strategyOptions.chips.light_count != false))
    {
      chips.push
      (
        {
          type: "template",
          icon: "mdi:lightbulb",
          icon_color: "amber",
          content: lightCountTemplate,
          tap_action:
          {
            action: "call-service",
            service: "light.turn_off",
            target:
            {
              area_id: area_ids
            },
            data: {}
          },
          hold_action:
          {
            action: "navigate",
            navigation_path: "lights"
          }
        },
      )
    }
      
    // Fan count
    const fanCountTemplate = "{% set fans = [" + createListOfFilteredStates(entities, devices, definedAreas, "fan.") + "] %} {{ fans | selectattr('state','eq','on') | list | count }}";
    if (strategyOptions.chips == null || (strategyOptions.chips != null && strategyOptions.chips.fan_count != false))
    {
      chips.push
      (
        {
          type: "template",
          icon: "mdi:fan",
          icon_color: "green",
          content: fanCountTemplate,
          tap_action:
          {
            action: "call-service",
            service: "fan.turn_off",
            target:
            {
              area_id: area_ids
            },
            data: {}
          },
          hold_action:
          {
            action: "navigate",
            navigation_path: "fans"
          }
        }
      )
    }

    // Cover count
    const coverCountTemplate = "{% set covers = [" + createListOfFilteredStates(entities, devices, definedAreas, "cover.") + "]%} {{ covers | selectattr('state','eq','open') | list | count }}"
    if (strategyOptions.chips == null || (strategyOptions.chips != null && strategyOptions.chips.cover_count != false))
    {
      chips.push
      (
        {
          type: "template",
          icon: "mdi:window-open",
          icon_color: "cyan",
          content: coverCountTemplate,
          tap_action:
          {
            action: "navigate",
            navigation_path: "covers"
          }
        },
      )
    }

    // Switch count
    const switchCountTemplate = "{% set switches = [" + createListOfFilteredStates(entities, devices, definedAreas, "switch.") + "] %} {{ switches | selectattr('state','eq','on') | list | count }}";
    if (strategyOptions.chips == null || (strategyOptions.chips != null && strategyOptions.chips.switch_count != false))
    {
      chips.push
      (
        {
          type: "template",
          icon: "mdi:power-plug",
          icon_color: "blue",
          content: switchCountTemplate,
          tap_action:
          {
            action: "call-service",
            service: "switch.turn_off",
            target:
            {
              area_id: area_ids
            },
            data: {}
          },
          hold_action:
          {
            action: "navigate",
            navigation_path: "switches"
          }
        },
      )
    }


    // Thermostat count
    const thermostatCountTemplate = "{% set thermostats = [" + createListOfFilteredStates(entities, devices, definedAreas, "climate.") + "]%} {{ thermostats | selectattr('state','ne','off') | list | count }}"
    if (strategyOptions.chips == null || (strategyOptions.chips != null && strategyOptions.chips.climate_count != false))
    {
      chips.push
      (
        {
          type: "template",
          icon: "mdi:thermostat",
          icon_color: "orange",
          content: thermostatCountTemplate,
          tap_action:
          {
            action: "navigate",
            navigation_path: "thermostats"
          }
        },
      )
    }

    // Extra cards
    if (strategyOptions.chips != null && strategyOptions.chips.extra_chips != null) {
      chips.push
      (
        ...strategyOptions.chips.extra_chips
      )
    }
        
      
    /***************************
    ***** Create Home view *****
    ***************************/
    const homeViewcards = [];
    homeViewcards.push
    (
      {
        type: "custom:mushroom-chips-card",
        alignment: "center",
        chips: chips
      },
      {
        type: "horizontal-stack",
        cards: peopleCards
      },
      {
        type: "custom:mushroom-template-card",
        primary: "{% set time = now().hour %} {% if (time >= 18) %} Good Evening, {{user}}! {% elif (time >= 12) %} Good Afternoon, {{user}}! {% elif (time >= 5) %} Good Morning, {{user}}! {% else %} Hello, {{user}}! {% endif %}",
        icon: "mdi:hand-wave",
        icon_color: "orange"
      }
    );

    if (strategyOptions.quick_access_cards != null) {
      homeViewcards.push(...strategyOptions.quick_access_cards);
    }

    homeViewcards.push
    (
      {
        type: "custom:mushroom-title-card",
        title: "Rooms"
      },
      {
        type: "vertical-stack",
        cards: horizontalRoomcards
      }
    );

    if (strategyOptions.extra_cards != null) {
      homeViewcards.push(...strategyOptions.extra_cards);
    }

    const Views = [];
    Views.push(
      {
        title: "Home",
        path: "home",
        cards: homeViewcards
      },
    );

    // Create Subview for each user defined areas
    const entity_config = strategyOptions.entity_config;
    const defined_areas = strategyOptions.areas;
    for (const area of definedAreas) 
    {
      Views.push
      (
        {
          title: area.name,
          path: area.area_id,
            subview: true,
            strategy: {
              type: "custom:mushroom-strategy",
              options: { area, devices, entities, entity_config, defined_areas },
            }
          },
      );
    }
      
    /***************************************
    ***** Create Light view if enabled *****
    ***************************************/
    if (strategyOptions.views == null || (strategyOptions.views != null && strategyOptions.views.lights != false))
    {
      const lightViewCards = [];
      lightViewCards.push(createTitleWithControls("All Lights", lightCountTemplate + " lights on", "light.turn_off", "light.turn_on", "mdi:lightbulb-off", "mdi:lightbulb", area_ids ));
      for (const area of definedAreas)
      {
        const lights = getFilteredEntitiesFromEntityRegistry(entities, devices, area, "light.");
        // If there are lights, create a title card and a light card for each lights
        if (lights.size > 0) 
        {
          lightViewCards.push(
            {
              type: "vertical-stack",
              cards: createPlatformCard(
                lights, 
                entity_config, 
                {
                  type: "custom:mushroom-light-card",
                  show_brightness_control: true,
                  show_color_control: true,
                  use_light_color: true
                },
                createTitleWithControls(area.name, null, "light.turn_off", "light.turn_on", "mdi:lightbulb-off", "mdi:lightbulb", area.area_id),
                {
                  action: "call-service",
                  service: "light.turn_on",
                  data:
                  {
                    rgb_color:
                    [
                      255,
                      255,
                      255
                    ]
                  }
                }
              )
            },
          )
        }
      }

      // Add the light view to Views
      Views.push
      (
        {
          title: "Lights",
          path: "lights",
          icon: "mdi:lightbulb-group",
          cards: lightViewCards
        }
      ); 
    }

    /*************************************
    ***** Create Fan view if enabled *****
    *************************************/
    if (strategyOptions.views == null || (strategyOptions.views != null && strategyOptions.views.fans != false))
    {
      const fanViewCards = [];
      fanViewCards.push(createTitleWithControls("All Fans", fanCountTemplate + " fans on", "fan.turn_off", "fan.turn_on", "mdi:fan-off", "mdi:fan", area_ids ));
      for (const area of definedAreas)
      {
        const fans = getFilteredEntitiesFromEntityRegistry(entities, devices, area, "fan.");
        if (fans.size > 0) 
        {
          fanViewCards.push(
            {
              type: "vertical-stack",
              cards: createPlatformCard(
                fans, 
                entity_config, 
                {
                  type: "custom:mushroom-fan-card",
                  show_percentage_control: true,
                  show_oscillate_control: true,
                  icon_animation: true
                },
                createTitleWithControls(area.name, null,  "fan.turn_off", "fan.turn_on", "mdi:fan-off", "mdi:fan", area.area_id)
              )
            },
          )
        }
      }

      // Add the light view to Views
      Views.push
      (
        {
          title: "Fans",
          path: "fans",
          icon: "mdi:fan",
          cards: fanViewCards
        }
      ); 
    }

    /****************************************
    ***** Create Covers view if enabled *****
    ****************************************/
    if (strategyOptions.views == null || (strategyOptions.views != null && strategyOptions.views.covers != false))
    {
      const coverViewCards = [];
      coverViewCards.push(createTitleWithControls("All Covers", coverCountTemplate + " covers open", "cover.close_cover", "cover.open_cover", "mdi:arrow-down", "mdi:arrow-up", area_ids ));
      for (const area of definedAreas)
      {
        const covers = getFilteredEntitiesFromEntityRegistry(entities, devices, area, "cover.");
        if (covers.size > 0) 
        {
          coverViewCards.push
            (
              {
                type: "vertical-stack",
                cards: createPlatformCard(
                  covers, 
                  entity_config, 
                  {
                    type: "custom:mushroom-cover-card",
                    show_buttons_control: true,
                    show_position_control: true,
                    show_tilt_position_control: true
                  },
                  createTitleWithControls(area.name, null, "cover.close_cover", "cover.open_cover", "mdi:arrow-down", "mdi:arrow-up", area.area_id)
                )
              },
            )
        }
      }
 
      // Add the switch view to Views
      Views.push
      (
        {
          title: "Covers",
          path: "covers",
          icon: "mdi:window-open",
          cards: coverViewCards
        }
      ); 
    }

    /******************************************
    ***** Create Switches view if enabled *****
    ******************************************/
    if (strategyOptions.views == null || (strategyOptions.views != null && strategyOptions.views.switches != false))
    {
      const switchViewCards = [];
      switchViewCards.push(createTitleWithControls("All Switches", switchCountTemplate + " switches on", "switch.turn_off","switch.turn_on", "mdi:power-plug-off", "mdi:power-plug", area_ids ));
      for (const area of definedAreas)
      {
        const switches = getFilteredEntitiesFromEntityRegistry(entities, devices, area, "switch.");
        if (switches.size > 0) 
        {
          switchViewCards.push
            (
              {
                type: "vertical-stack",
                cards: createPlatformCard(
                  switches, 
                  entity_config, 
                  {
                    type: "custom:mushroom-entity-card",
                    tap_action:
                    {
                      action: "toggle"
                    }
                  },
                  createTitleWithControls(area.name, null, "switch.turn_off","switch.turn_on", "mdi:power-plug-off", "mdi:power-plug", area.area_id)
                )
              },
            )
        }
      }

      // Add the switch view to Views
      Views.push
      (
        {
          title: "Switches",
          path: "switches",
          icon: "mdi:dip-switch",
          cards: switchViewCards
        }
      ); 
    }

    /******************************************
    ***** Create Climate view if enabled *****
    ******************************************/
    if (strategyOptions.views == null || (strategyOptions.views != null && strategyOptions.views.climates != false))
    {
      const thermostatViewCards = [];
      thermostatViewCards.push(
        {
          
          type: "custom:mushroom-title-card",
          title: "Thermostats",
          subtitle: thermostatCountTemplate + " thermostats on",
          
        }
      );
      for (const area of definedAreas)
      {
        const thermostats = getFilteredEntitiesFromEntityRegistry(entities, devices, area, "climate.");
        if (thermostats.size > 0) 
        {
          thermostatViewCards.push
            (
              {
                type: "vertical-stack",
                cards: createPlatformCard(
                  thermostats, 
                  entity_config, 
                  {
                    type: "custom:mushroom-climate-card",
                    hvac_modes:
                    [
                      "off",
                      "cool",
                      "heat",
                      "fan_only"
                    ],
                    show_temperature_control: true
                  },
                  {
                    type: "custom:mushroom-title-card",
                    title: area.name
                  }
                )
              },
            )
        }
      }

      // Add the switch view to Views
      Views.push
      (
        {
          title: "Thermostats",
          path: "thermostats",
          icon: "mdi:thermostat",
          cards: thermostatViewCards
        }
      ); 
    }

      /****************************************
    ***** Create camera view if enabled *****
    ****************************************/
    if (strategyOptions.views == null || (strategyOptions.views != null && strategyOptions.views.cameras != false))
    {
      const cameraViewCards = [];
      cameraViewCards.push(
        {
          
          type: "custom:mushroom-title-card",
          title: "Cameras",
        }
      );
      for (const area of definedAreas)
      {
        const cameraAreaCard = [];
        const cameras = getFilteredEntitiesFromEntityRegistry(entities, devices, area, "camera.");
        // If there are cameras, create a title card and a camera card for each cameras
        if (cameras.size > 0) 
        {
          cameraAreaCard.push
          (
            {
              type: "custom:mushroom-title-card",
              title: area.name,
            },
          );

          for (const camera of cameras)
            {
              cameraAreaCard.push
              (
                {
                  type: "custom:webrtc-camera",
                  entity: camera.entity_id
                },
              );
            }
        }

        cameraViewCards.push
          (
            {
              type: "vertical-stack",
              cards: cameraAreaCard
            },
          )
      }

      // Add the camera view to Views
      Views.push
      (
        {
          title: "Cameras",
          path: "cameras",
          icon: "mdi:cctv",
          cards: cameraViewCards
        }
      );        
    }

    // Add extra views if defined
    if (strategyOptions.extra_views != null) {
      Views.push
      (
        ...strategyOptions.extra_views
      )
    }

    // Return views
    return {
      views: Views
    };
  }
  
  static async generateView(info)
  {
    // Get all required values
    const area = info.view.strategy.options.area;
    const devices = info.view.strategy.options.devices;
    const entities = info.view.strategy.options.entities
    const entity_config = info.view.strategy.options.entity_config
    const definedAreas = info.view.strategy.options.defined_areas
    
    
    
    const cards = [];
    // Add extra cards if defined
    if (definedAreas != null) {
      for (const definedArea of definedAreas)
      {
        if (definedArea.name == area.name && definedArea.extra_cards != null) 
        {
          cards.push(...definedArea.extra_cards);  
        }
      }
      
    }
    
    // Create light cards     
    const lights = getFilteredEntitiesFromEntityRegistry(entities, devices, area, "light.");
    if (lights.size > 0) 
    {
      cards.push
      (
        {
          type: "vertical-stack",
          cards: createPlatformCard(
            lights,
            entity_config,
            {
              type: "custom:mushroom-light-card",
              show_brightness_control: true,
              show_color_control: true,
              use_light_color: true
            },
            createTitleWithControls(null, "Lights", "light.turn_off", "light.turn_on", "mdi:lightbulb-off", "mdi:lightbulb", area.area_id),
            {
              action: "call-service",
              service: "light.turn_on",
              data:
              {
                rgb_color:
                [
                  255,
                  255,
                  255
                ]
              }
            })
        }
      )

    }
    // Create fan cards     
    const fans = getFilteredEntitiesFromEntityRegistry(entities, devices, area, "fan.");
    if (fans.size > 0) 
    {
      cards.push
      (
        {
          type: "vertical-stack",
          cards: 
          createPlatformCard(
            fans, 
            entity_config,
            {
              type: "custom:mushroom-fan-card",
              show_percentage_control: true,
              show_oscillate_control: true,
              icon_animation: true
            }, 
            createTitleWithControls(null, "Fans", "fan.turn_off", "fan.turn_on", "mdi:fan-off", "mdi:fan", area.area_id))
        }
      )
    }
      
    // Create cover cards
    const covers = getFilteredEntitiesFromEntityRegistry(entities, devices, area, "cover.");
    if (covers.size > 0) 
    {
      cards.push
      (
        {
          type: "vertical-stack",
          cards: 
          createPlatformCard(
            covers,
            entity_config,
            {
              type: "custom:mushroom-cover-card",
              show_buttons_control: true,
              show_position_control: true,
              show_tilt_position_control: true
            },
            createTitleWithControls(null, "Covers", "cover.close_cover", "cover.open_cover", "mdi:arrow-down", "mdi:arrow-up", area.area_id)
          )
        }
      )
    }

    // Create switch cards
    const switches = getFilteredEntitiesFromEntityRegistry(entities, devices, area, "switch.");
    if (switches.size > 0) 
    {
      cards.push
      (
        {
          type: "vertical-stack",
          cards: 
          createPlatformCard(
            switches,
            entity_config,
            {
              type: "custom:mushroom-entity-card",
              tap_action:
              {
                action: "toggle"
              }
            },
            createTitleWithControls(null, "Switches", "switch.turn_off", "switch.turn_off", "mdi:power-plug-off", "mdi:power-plug", area.area_id)
          )
        }
      )
    }

    // Create climate cards
    const thermoststats = getFilteredEntitiesFromEntityRegistry(entities, devices, area, "climate.");
    if (thermoststats.size > 0) 
    {
      cards.push
      (
        {
          type: "vertical-stack",
          cards: 
          createPlatformCard(
            thermoststats, 
            entity_config, 
            {
              type: "custom:mushroom-climate-card",
              hvac_modes:
              [
                "off",
                "cool",
                "heat",
                "fan_only"
              ],
              show_temperature_control: true
            },
            {
              type: "custom:mushroom-title-card",
              subtitle: "Climate"
            }
          )
        }
      )
    }

    // Create Media player cards
    const media_players = getFilteredEntitiesFromEntityRegistry(entities, devices, area, "media_player.");
    if (media_players.size > 0) 
    {
      cards.push
      (
        {
          type: "vertical-stack",
          cards: 
          createPlatformCard(
            media_players,
            entity_config,
            {
              type: "custom:mushroom-media-player-card",
              use_media_info: true,
              media_controls:
              [
                "on_off",
                "play_pause_stop"
              ],
              show_volume_level: true,
              volume_controls:
              [
                "volume_mute",
                "volume_set",
                "volume_buttons"
              ]
            },
            {
              type: "custom:mushroom-title-card",
              subtitle: "Media Players"
            }
          )
        }
      )
    }

    // Create Sensor cards
    const sensorsStateObj = getFilteredEntitiesFromStates(info, entities, devices, area, "sensor.");
    const sensors = getFilteredEntitiesFromEntityRegistry(entities, devices, area, "sensor.");
    if (sensors.size > 0) 
    {
      const sensorCards = []
      sensorCards.push
      (
        {
          type: "custom:mushroom-title-card",
          subtitle: "Sensors"
        },
      );
      sensorsLoop:
      for (const sensor of sensors)
      {
        // Find the state obj that matches with current sensor
        var sensorStateObj;
        for (const stateObj of sensorsStateObj)
        {
          if (stateObj.entity_id == sensor.entity_id) 
          {
            sensorStateObj = stateObj;
          }
        }
        
        if (entity_config == null) {
          if (sensorStateObj.attributes.unit_of_measurement != null) 
          {
            sensorCards.push
            (
              {
                type: "custom:mini-graph-card",
                entities:
                [
                  sensor.entity_id
                ],
                animate: true,
                line_color: "green"
              },
            );  
          } else 
          {
            sensorCards.push
            (
              {
                type: "custom:mushroom-entity-card",
                entity: sensor.entity_id,
                icon_color: "green"
              },
            );
          }
        } else 
        {          
          for (const config of entity_config)
          {
            if (sensor.entity_id == config.entity_id)
            {
              sensorCards.push
              (
                {
                  ...config
                },
              );
              continue sensorsLoop;  
            } 
          }
            
          if (sensorStateObj.attributes.unit_of_measurement != null) 
          {
            sensorCards.push
            (
              {
                type: "custom:mini-graph-card",
                entities:
                [
                  sensor.entity_id
                ],
                animate: true,
                line_color: "green"
              },
            );  
          } else 
          {
            sensorCards.push
            (
              {
                type: "custom:mushroom-entity-card",
                entity: sensor.entity_id,
                icon_color: "green"
              },
            );
          }
        }
      }
      cards.push
      (
        {
          type: "vertical-stack",
          cards: sensorCards
        }, 
      )
    }

    // Create card for binary sensors
    const binary_sensors = getFilteredEntitiesFromEntityRegistry(entities, devices, area, "binary_sensor.");
    if (binary_sensors.size > 0) 
    {
      const binarySensorCards = createPlatformCard
      (
        binary_sensors, 
        entity_config,
        {
          type: "custom:mushroom-entity-card",
          icon_color: "green"
        },
        null
      )
      const horizontalBinarySensorcards = [];
      horizontalBinarySensorcards.push
      (
        {
          type: "custom:mushroom-title-card",
          subtitle: "Binary Sensors"
        }
      )
      for (var i = 0; i < binarySensorCards.length; i = i + 2)
      {
        if (binarySensorCards[i+1] == null)
        {
          horizontalBinarySensorcards.push(
            {
              type: "horizontal-stack",
              cards: 
              [
                binarySensorCards[i]
              ]
            }
          )
        } else 
        {
          horizontalBinarySensorcards.push(
            {
              type: "horizontal-stack",
              cards: 
              [
                binarySensorCards[i],
                binarySensorCards[i+1],
              ]
            }
          )
        }
      }
      
      cards.push
      (
        {
          type: "vertical-stack",
          cards: horizontalBinarySensorcards
        }
      )
    }

    // Create card of miscelnanous, I am engilsh professional
    const areaDevices = new Set();
    // Find all devices linked to this area
    for (const device of devices) {
      if (device.area_id === area.area_id) {
        areaDevices.add(device.id);
      }
    }

    // Filter entities
    const others = new Set();
    for (const entity of entities) 
    {
      if ((areaDevices.has(entity.device_id) || entity.area_id === area.area_id) && entity.hidden_by == null && entity.disabled_by == null && 
      !entity.entity_id.startsWith("light.") && 
      !entity.entity_id.startsWith("fan.") &&
      !entity.entity_id.startsWith("cover.") &&
      !entity.entity_id.startsWith("switch.") &&
      !entity.entity_id.startsWith("climate.") &&
      !entity.entity_id.startsWith("sensor.") &&
      !entity.entity_id.startsWith("binary_sensor.") &&
      !entity.entity_id.startsWith("media_player.")
      )
      {
        others.add(entity);
      }
    }
    if (others.size > 0) 
    {
      cards.push
      (
        {
          type: "vertical-stack",
          cards: 
          createPlatformCard(
            others,
            entity_config,
            {
              type: "custom:mushroom-entity-card",
              icon_color: "blue-grey"
            },
            {
              type: "custom:mushroom-title-card",
              subtitle: "More"
            }
          )
        }
      )
    }
    
    // Return cards
    return {
      cards
    };
  }
}
  
customElements.define("ll-strategy-mushroom-strategy", MushroomStrategy);
