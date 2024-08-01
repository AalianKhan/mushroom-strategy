import {Helper} from "../Helper";
import {AbstractView} from "./AbstractView";
import {views} from "../types/strategy/views";
import {cards} from "../types/strategy/cards";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Fan View Class.
 *
 * Used to create a view for entities of the fan domain.
 *
 * @class FanView
 * @extends AbstractView
 */
class FanView extends AbstractView {
  /**
   * Domain of the view's entities.
   *
   * @type {string}
   * @static
   * @private
   */
  static #domain: string = "fan";

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @protected
   */
  defaultConfig: views.ViewConfig = {
    id: FanView.#domain,
    title: "Fans",
    path: "fans",
    icon: "mdi:fan",
    subview: false,
    controllerCardOptions: {
      iconOn: "mdi:fan",
      iconOff: "mdi:fan-off",
      onService: "fan.turn_on",
      offService: "fan.turn_off",
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
  viewControllerCardConfig = (entities: EntityRegistryEntry[], groupName: string = 'fans'): cards.ControllerCardOptions => ({
    title: `All ${groupName}`,
    subtitle: Helper.getCountEntityTemplate(entities, "eq", "on") + ` ${groupName} on`,
  });

  /**
   * Class constructor.
   */
  constructor() {
    super(FanView.#domain);
  }
}

export {FanView};
