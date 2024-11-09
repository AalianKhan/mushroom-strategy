import {Helper} from "../Helper";
import {ControllerCard} from "../cards/ControllerCard";
import {StackCardConfig} from "../types/homeassistant/lovelace/cards/types";
import {LovelaceCardConfig, LovelaceViewConfig} from "../types/homeassistant/data/lovelace";
import {cards} from "../types/strategy/cards";
import {TitleCardConfig} from "../types/lovelace-mushroom/cards/title-card-config";
import {HassServiceTarget} from "home-assistant-js-websocket";
import abstractCardConfig = cards.AbstractCardConfig;

/**
 * Abstract View Class.
 *
 * To create a new view, extend the new class with this one.
 *
 * @class
 * @abstract
 */
abstract class AbstractView {
  /**
   * Configuration of the view.
   *
   * @type {LovelaceViewConfig}
   */
  config: LovelaceViewConfig = {
    icon: "mdi:view-dashboard",
    subview: false,
  };

  /**
   * A card to switch all entities in the view.
   *
   * @type {StackCardConfig}
   */
  viewControllerCard: StackCardConfig = {
    cards: [],
    type: "",
  };

  /**
   * The domain of which we operate the devices.
   *
   * @private
   * @readonly
   */
  readonly #domain?: string;

  /**
   * Class constructor.
   *
   * @param {string} [domain] The domain which the view is representing.
   *
   * @throws {Error} If trying to instantiate this class.
   * @throws {Error} If the Helper module isn't initialized.
   */
  protected constructor(domain: string = "") {
    if (!Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }

    if (domain) {
      this.#domain = domain;
    }
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<(StackCardConfig | TitleCardConfig)[]>} An array of card objects.
   */
  async createViewCards(): Promise<(StackCardConfig | TitleCardConfig)[]> {
    const viewCards: LovelaceCardConfig[] = [];
    const configEntityHidden =
          Helper.strategyOptions.domains[this.#domain ?? "_"].hide_config_entities
          || Helper.strategyOptions.domains["_"].hide_config_entities;
    const diagnosticEntityHidden =
          Helper.strategyOptions.domains[this.#domain ?? "_"].hide_diagnostic_entities
          || Helper.strategyOptions.domains["_"].hide_diagnostic_entities;

    // Create cards for each area.
    for (const area of Helper.areas) {
      const areaCards: abstractCardConfig[] = [];
      const entities = Helper.getDeviceEntities(area, this.#domain ?? "");
      const className = Helper.sanitizeClassName(this.#domain + "Card");
      const cardModule = await import(`../cards/${className}`);

      // Set the target for controller cards to the current area.
      let target: HassServiceTarget = {
        area_id: [area.area_id],
      };

      // Set the target for controller cards to entities without an area.
      if (area.area_id === "undisclosed") {
        target = {
          entity_id: entities.map(entity => entity.entity_id),
        }
      }

      // Create a card for each domain-entity of the current area.
      for (const entity of entities) {
        let cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id];
        let deviceOptions = Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];

        if (cardOptions?.hidden || deviceOptions?.hidden) {
          continue;
        }

        if (entity.entity_category === "config" && configEntityHidden) {
          continue;
        }

        if (entity.entity_category === "diagnostic" && diagnosticEntityHidden) {
          continue;
        }

        areaCards.push(new cardModule[className](entity, cardOptions).getCard());
      }

      // Vertical stack the area cards if it has entities.
      if (areaCards.length) {
        const titleCardOptions = ("controllerCardOptions" in this.config) ? this.config.controllerCardOptions : {};

        // Create and insert a Controller card.
        areaCards.unshift(new ControllerCard(target, Object.assign({title: area.name}, titleCardOptions)).createCard());

        viewCards.push({
          type: "vertical-stack",
          cards: areaCards,
        } as StackCardConfig);
      }
    }

    // Add a Controller Card for all the entities in the view.
    if (viewCards.length) {
      viewCards.unshift(this.viewControllerCard);
    }

    return viewCards;
  }

  /**
   * Get a view object.
   *
   * The view includes the cards which are created by method createViewCards().
   *
   * @returns {Promise<LovelaceViewConfig>} The view object.
   */
  async getView(): Promise<LovelaceViewConfig> {
    return {
      ...this.config,
      cards: await this.createViewCards(),
    };
  }

  /**
   * Get a target of entity IDs for the given domain.
   *
   * @param {string} domain - The target domain to retrieve entity IDs from.
   * @return {HassServiceTarget} - A target for a service call.
   */
  targetDomain(domain: string): HassServiceTarget {
    return {
      entity_id: Helper.entities.filter(
        entity =>
          entity.entity_id.startsWith(domain + ".")
          && !entity.hidden_by
          && !Helper.strategyOptions.card_options?.[entity.entity_id]?.hidden
      ).map(entity => entity.entity_id),
    };
  }
}

export {AbstractView};
