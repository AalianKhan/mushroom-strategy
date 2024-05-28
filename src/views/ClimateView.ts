import {Helper} from "../Helper";
import {AbstractView} from "./AbstractView";
import {views} from "../types/strategy/views";
import {cards} from "../types/strategy/cards";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate View Class.
 *
 * Used to create a view for entities of the climate domain.
 *
 * @class ClimateView
 * @extends AbstractView
 */
class ClimateView extends AbstractView {
  /**
   * Domain of the view's entities.
   *
   * @type {string}
   * @static
   * @private
   */
  static #domain: string = "climate";

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @protected
   */
  defaultConfig = {
    id: ClimateView.#domain,
    title: "Climates",
    path: "climates",
    icon: "mdi:thermostat",
    subview: false,
    controllerCardOptions: {
      showControls: false,
    },
  };

  /**
   * Get default configuration of the view's Controller card.
   *
   * @param {EntityRegistryEntry[]} [entities] relevant entities for this card
   * @param {string?} groupName can be used to define alternative domain name for card
   *
   * @return {cards.ControllerCardOptions}
   */
  viewControllerCardConfig = (entities: EntityRegistryEntry[], groupName: string = 'climates'): cards.ControllerCardOptions => ({
    title: `All ${groupName}`,
    subtitle: Helper.getCountEntityTemplate(entities, "ne", "off") + ` ${groupName} on`,
  });

  /**
   * Class constructor.
   */
  constructor() {
    super(ClimateView.#domain);
  }
}

export {ClimateView};
