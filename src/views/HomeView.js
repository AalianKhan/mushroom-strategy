import {Helper} from "../Helper";
import {AbstractView} from "./AbstractView";

/**
 * Home View Class.
 *
 * Used to create a Home view.
 *
 * @class HomeView
 * @extends AbstractView
 */
class HomeView extends AbstractView {
  /**
   * Default options for the view.
   *
   * @type {viewOptions}
   * @private
   */
  #defaultOptions = {
    title: "Home",
    path: "home",
    subview: false,
  };

  /**
   * Class constructor.
   *
   * @param {viewOptions} [options={}] Options for the view.
   */
  constructor(options = {}) {
    super();
    this.mergeOptions(
        this.#defaultOptions,
        options,
    );
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise} A promise of a card object array.
   * @override
   */
  async createViewCards() {
    return await Promise.all([
      this.#createChips(),
      this.#createPersonCards(),
      this.#createAreaCards(),
    ]).then(([chips, personCards, areaCards]) => {
      const options       = Helper.strategyOptions;
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
          tap_action: {
            action: "none",
          },
          double_tap_action: {
            action: "none",
          },
          hold_action: {
            action: "none",
          },
        },
      ];

      // Add quick access cards.
      if (options.quick_access_cards) {
        homeViewCards.push(...options.quick_access_cards);
      }

      // Add area cards.
      homeViewCards.push({
        type: "vertical-stack",
        cards: areaCards,
      });

      // Add custom cards.
      if (options.extra_cards) {
        homeViewCards.push(...options.extra_cards);
      }

      return homeViewCards;
    });
  }

  /**
   * Create the chips to include in the view.
   *
   * @return {Object[]} A chip object array.
   */
  async #createChips() {
    const chips       = [];
    const chipOptions = Helper.strategyOptions.chips;

    // TODO: Get domains from config.
    const exposed_chips = ["light", "fan", "cover", "switch", "climate"];
    // Create a list of area-ids, used for switching all devices via chips
    const areaIds       = Helper.areas.map(area => area.area_id);

    let chipModule;

    // Weather chip.
    const weatherEntityId = chipOptions?.weather_entity ?? Helper.entities.find(
        entity => entity.entity_id.startsWith("weather.") && entity.disabled_by == null && entity.hidden_by == null,
    )?.entity_id;

    if (weatherEntityId) {
      try {
        chipModule        = await import("../chips/WeatherChip");
        const weatherChip = new chipModule.WeatherChip(weatherEntityId);
        chips.push(weatherChip.getChip());
      } catch (e) {
        console.error(Helper.debug ? e : "An error occurred while creating the weather chip!");
      }
    }

    // Numeric chips.
    for (let chipType of exposed_chips) {
      if (chipOptions?.[`${chipType}_count`] ?? true) {
        const className = Helper.sanitizeClassName(chipType + "Chip");
        try {
          chipModule = await import((`../chips/${className}`));
          const chip = new chipModule[className](areaIds);
          chips.push(chip.getChip());
        } catch (e) {
          console.error(Helper.debug ? e : `An error occurred while creating the ${chipType} chip!`);
        }
      }
    }

    // Extra chips.
    if (chipOptions?.extra_chips) {
      chips.push(...chipOptions.extra_chips);
    }

    return chips;
  }

  /**
   * Create the person cards to include in the view.
   *
   * @return {Object[]} A card object array.
   */
  #createPersonCards() {
    const cards = [];

    import("../cards/PersonCard").then(personModule => {
      for (const person of Helper.entities.filter(entity => {
        return entity.entity_id.startsWith("person.")
            && entity.hidden_by == null
            && entity.disabled_by == null;
      })) {
        cards.push(new personModule.PersonCard(person).getCard());
      }
    });

    return cards;
  }

  /**
   * Create the area cards to include in the view.
   *
   * Area cards are grouped into two areas per row.
   *
   * @return {Object[]} A card object array.
   */
  async #createAreaCards() {
    /**
     * Cards to be stacked vertically.
     *
     * Contains a Title card and horizontal stacks of Area cards.
     *
     * @type {[{}]}
     */
    const groupedCards = [
      {
        type: "custom:mushroom-title-card",
        title: "Areas",
      },
    ];
    let areaCards      = [];

    for (const [i, area] of Helper.areas.entries()) {
      let module;
      let moduleName =
              Helper.strategyOptions.areas[area.area_id ?? "undisclosed"]?.type ??
              Helper.strategyOptions.areas["_"]?.type ??
              "default";

      // Load module by type in strategy options.
      try {
        module = await import((`../cards/${moduleName}`));
      } catch (e) {
        // Fallback to the default strategy card.
        module = await import("../cards/AreaCard");

        if (Helper.strategyOptions.debug && moduleName !== "default") {
          console.error(e);
        }
      }

      let cardOptions   = Helper.strategyOptions.areas[area.area_id ?? "undisclosed"];
      let temperature = Helper.strategyOptions.areas[area.area_id]?.temperature;
      let humidity = Helper.strategyOptions.areas[area.area_id]?.humidity;
      let lux = Helper.strategyOptions.areas[area.area_id]?.illuminance;
      let window = Helper.strategyOptions.areas[area.area_id]?.window;
      let lock = Helper.strategyOptions.areas[area.area_id]?.lock;
      let door = Helper.strategyOptions.areas[area.area_id]?.door;
      
      // Search for sensors if not configured
      if (!(temperature || humidity || lux)) {
        const sensors  = Helper.getDeviceEntities(area, "sensor");
        
        if (sensors.length) {
          const sensorStates = Helper.getStateEntities(area, "sensor");
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
        cardOptions = {
          ...{
            secondary: secondary,
          },
          ...cardOptions,
        }
      }
      
      // Search for binary sensors if not configured
      if (!(window || lock || door)) {
        const binary_sensors  = Helper.getDeviceEntities(area, "binary_sensor");
        if (binary_sensors.length) {
          const binary_sensorStates = Helper.getStateEntities(area, "binary_sensor");
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
        cardOptions = {
          ...{
            badge_icon: badge,
            badge_color: "red",
          },
          ...cardOptions,
        }
      }

      // Get a card for the area.
      if (!Helper.strategyOptions.areas[area.area_id]?.hidden) {
        areaCards.push(new module.AreaCard(area, cardOptions).getCard());
      }

      // Horizontally group every two area cards if all cards are created.
      if (i === Helper.areas.length - 1) {
        for (let i = 0; i < areaCards.length; i += 2) {
          groupedCards.push({
            type: "horizontal-stack",
            cards: areaCards.slice(i, i + 2),
          });
        }
      }
    }

    return groupedCards;
  }
}

export {HomeView};
