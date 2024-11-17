import {AbstractCard} from "./AbstractCard";
import {cards} from "../types/strategy/cards";
import {AreaRegistryEntry} from "../types/homeassistant/data/area_registry";
import {TemplateCardConfig} from "../types/lovelace-mushroom/cards/template-card-config";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
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
   * Default configuration of the card.
   *
   * @type {TemplateCardConfig}
   * @private
   */
  #defaultConfig: TemplateCardConfig = {
    type: "custom:mushroom-template-card",
    primary: undefined,
    icon: "mdi:texture-box",
    icon_color: "blue",
    tap_action: {
      action: "navigate",
      navigation_path: "",
    },
    hold_action: {
      action: "none",
    },
  };

  /**
   * Class constructor.
   *
   * @param {AreaRegistryEntry} area The area entity to create a card for.
   * @param {cards.TemplateCardOptions} [options={}] Options for the card.
   *
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(area: AreaRegistryEntry, options: cards.TemplateCardOptions = {}) {
    super(area);

    // Don't override the default card type if default is set in the strategy options.
    if (options.type === "default") {
      delete options.type;
    }

    // Initialize the default configuration.
    this.#defaultConfig.primary = area.name;
    if (this.#defaultConfig.tap_action && ("navigation_path" in this.#defaultConfig.tap_action)) {
      this.#defaultConfig.tap_action.navigation_path = area.area_id;
    }

    if (area.icon) {
        this.#defaultConfig.icon = area.icon;
    }

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {AreaCard};
