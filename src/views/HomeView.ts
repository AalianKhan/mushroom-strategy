import {Helper} from "../Helper";
import {AbstractView} from "./AbstractView";
import {views} from "../types/strategy/views";
import {LovelaceChipConfig} from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import {ChipsCardConfig} from "../types/lovelace-mushroom/cards/chips-card";
import {AreaCardConfig, StackCardConfig} from "../types/homeassistant/lovelace/cards/types";
import {TemplateCardConfig} from "../types/lovelace-mushroom/cards/template-card-config";
import {ActionConfig} from "../types/homeassistant/data/lovelace";
import {TitleCardConfig} from "../types/lovelace-mushroom/cards/title-card-config";
import {PersonCardConfig} from "../types/lovelace-mushroom/cards/person-card-config";


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
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
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  #defaultConfig: views.ViewConfig = {
    title: Helper.customLocalize("generic.home"),
    icon: "mdi:home-assistant",
    path: "home",
    subview: false,
  };

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(options: views.ViewConfig = {}) {
    super();

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
   * @override
   */
  async createViewCards(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {
    return await Promise.all([
      this.#createChips(),
      this.#createPersonCards(),
      this.#createAreaSection(),
    ]).then(([chips, personCards, areaCards]) => {
      const options = Helper.strategyOptions;
      const homeViewCards = [];

      if (chips.length) {
        // TODO: Create the Chip card at this.#createChips()
        homeViewCards.push({
          type: "custom:mushroom-chips-card",
          alignment: "center",
          chips: chips,
        } as ChipsCardConfig)
      }

      if (personCards.length) {
        // TODO: Create the stack at this.#createPersonCards()
        homeViewCards.push({
          type: "horizontal-stack",
          cards: personCards,
        } as StackCardConfig);
      }

      if (!Helper.strategyOptions.home_view.hidden.includes("greeting")) {
        const greeting =
                homeViewCards.push({
                  type: "custom:mushroom-template-card",
                  primary:
                    `{% set time = now().hour %} {% if (time >= 18) %} ${Helper.customLocalize("generic.good_evening")},{{user}}!
                     {% elif (time >= 12) %} ${Helper.customLocalize("generic.good_afternoon")}, {{user}}!
                     {% elif (time >= 5) %} ${Helper.customLocalize("generic.good_morning")}, {{user}}!
                     {% else %} ${Helper.customLocalize("generic.hello")}, {{user}}! {% endif %}`,
                  icon: "mdi:hand-wave",
                  icon_color: "orange",
                  tap_action: {
                    action: "none",
                  } as ActionConfig,
                  double_tap_action: {
                    action: "none",
                  } as ActionConfig,
                  hold_action: {
                    action: "none",
                  } as ActionConfig,
                } as TemplateCardConfig);
      }

      // Add quick access cards.
      if (options.quick_access_cards) {
        homeViewCards.push(...options.quick_access_cards);
      }

      // Add area cards.
      homeViewCards.push({
        type: "vertical-stack",
        cards: areaCards,
      } as StackCardConfig);

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
   * @return {Promise<LovelaceChipConfig[]>} Promise a chip array.
   */
  async #createChips(): Promise<LovelaceChipConfig[]> {
    if (Helper.strategyOptions.home_view.hidden.includes("chips")) {
      // Chips section is hidden.

      return [];
    }

    const chips: LovelaceChipConfig[] = [];
    const chipOptions = Helper.strategyOptions.chips;

    // TODO: Get domains from config.
    const exposedChips = ["light", "fan", "cover", "switch", "climate"];
    // Create a list of area-ids, used for switching all devices via chips
    const areaIds = Helper.areas.map(area => area.area_id ?? "");

    let chipModule;

    // Weather chip.
    const weatherEntityId = chipOptions?.weather_entity ?? Helper.entities.find(
      (entity) => entity.entity_id.startsWith("weather.") && entity.disabled_by === null && entity.hidden_by === null,
    )?.entity_id;

    if (weatherEntityId) {
      try {
        chipModule = await import("../chips/WeatherChip");
        const weatherChip = new chipModule.WeatherChip(weatherEntityId);

        chips.push(weatherChip.getChip());
      } catch (e) {
        Helper.logError("An error occurred while creating the weather chip!", e);
      }
    }

    // Numeric chips.
    for (let chipType of exposedChips) {
      if (chipOptions?.[`${chipType}_count` as string] ?? true) {
        const className = Helper.sanitizeClassName(chipType + "Chip");
        try {
          chipModule = await import((`../chips/${className}`));
          const chip = new chipModule[className]();

          chip.setTapActionTarget({area_id: areaIds});
          chips.push(chip.getChip());
        } catch (e) {
          Helper.logError(`An error occurred while creating the ${chipType} chip!`, e);
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
   * @return {PersonCardConfig[]} A Person Card array.
   */
  #createPersonCards(): PersonCardConfig[] {
    if (Helper.strategyOptions.home_view.hidden.includes("persons")) {
      // Person section is hidden.

      return [];
    }

    const cards: PersonCardConfig[] = [];

    import("../cards/PersonCard").then(personModule => {
      for (const person of Helper.entities.filter((entity) => {
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
   * @return {Promise<(TitleCardConfig | StackCardConfig)[]>} Promise an Area Card Section.
   */
  async #createAreaSection(): Promise<(TitleCardConfig | StackCardConfig)[]> {
    if (Helper.strategyOptions.home_view.hidden.includes("areas")) {
      // Areas section is hidden.

      return [];
    }

    const groupedCards: (TitleCardConfig | StackCardConfig)[] = [];

    let areaCards: (TemplateCardConfig | AreaCardConfig)[] = [];

    if (!Helper.strategyOptions.home_view.hidden.includes("areasTitle")) {
      groupedCards.push({
          type: "custom:mushroom-title-card",
          title: Helper.customLocalize("generic.areas"),
        },
      );
    }

    for (const [i, area] of Helper.areas.entries()) {
      type ModuleType = typeof import("../cards/AreaCard");

      let module: ModuleType;
      let moduleName =
            Helper.strategyOptions.areas[area.area_id]?.type ??
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

      // Get a card for the area.
      if (!Helper.strategyOptions.areas[area.area_id as string]?.hidden) {
        let options = {
          ...Helper.strategyOptions.areas["_"],
          ...Helper.strategyOptions.areas[area.area_id],
        };

        areaCards.push(new module.AreaCard(area, options).getCard());
      }

      // Horizontally group every two area cards if all cards are created.
      if (i === Helper.areas.length - 1) {
        for (let i = 0; i < areaCards.length; i += 2) {
          groupedCards.push({
            type: "horizontal-stack",
            cards: areaCards.slice(i, i + 2),
          } as StackCardConfig);
        }
      }
    }

    return groupedCards;
  }
}

export {HomeView};
