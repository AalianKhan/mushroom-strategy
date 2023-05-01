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
   * Domain of the view's entities.
   * @type {string}
   */
  #domain = "camera";

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

  get domain() {
    return this.#domain;
  }

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
        },
      ];

      // Add quick access cards.
      if (options.quick_access_cards) {
        homeViewCards.push(...options.quick_access_cards);
      }

      // Add area cards.
      homeViewCards.push({
            type: "custom:mushroom-title-card",
            title: "Areas",
          },
          {
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

  async #createChips() {
    const chips           = [];
    const chipOptions     = Helper.strategyOptions.chips;
    // TODO: Get domains from config (Currently strategy.options.views).
    const exposed_domains = ["light", "fan", "cover", "switch", "climate"];
    // Create a list of area-ids, used for switching all devices via chips
    const areaIds         = Helper.areas.map(area => area.area_id);

    let chipModule;

    // Weather chip.
    const weatherEntityId = chipOptions?.weather_entity ?? Helper.entities.find(
        entity => entity.entity_id.startsWith("weather.") && entity.disabled_by == null && entity.hidden_by == null,
    ).entity_id;

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
    for (let chipType of exposed_domains) {
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
      chips.push(chipOptions.extra_chips);
    }

    return chips;
  }

  #createPersonCards() {
    const cards = [];

    import("../cards/PersonCard").then(personModule => {
      for (const person of Helper.entities.filter(entity => entity.entity_id.startsWith("person."))) {
        cards.push(new personModule.PersonCard(person).getCard());
      }
    });

    return cards;
  }

  #createAreaCards() {
    const groupedCards = [];

    import("../cards/AreaCard").then(areaModule => {
      const areaCards = [];

      for (const area of Helper.areas) {
        areaCards.push(new areaModule.AreaCard(area, Helper.strategyOptions.areas?.[area.area_id]).getCard());
      }

      // Horizontally group every two area cards.
      for (let i = 0; i < areaCards.length; i += 2) {
        groupedCards.push({
          type: "horizontal-stack",
          cards: areaCards.slice(i, i + 2),
        });
      }
    });

    return groupedCards;
  }
}

export {HomeView};