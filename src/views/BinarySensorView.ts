import {AbstractView} from "./AbstractView";
import {views} from "../types/strategy/views";
import {cards} from "../types/strategy/cards";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Cover View Class.
 *
 * Used to create a view for entities of the cover domain.
 *
 * @class CoverView
 * @extends AbstractView
 */
class BinarySensorView extends AbstractView {
  /**
   * Domain of the view's entities.
   *
   * @type {string}
   * @static
   * @private
   */
  static #domain: string = "binary_sensor";

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @protected
   */
  defaultConfig: views.ViewConfig = {
    id: BinarySensorView.#domain,
    title: "Binary Sensors",
    path: "binary-sensors",
    icon: "mdi:numeric-10",
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
  viewControllerCardConfig = (entities: EntityRegistryEntry[], groupName: string = "covers"): cards.ControllerCardOptions => ({
    title: `All ${groupName}`,
    /*subtitle: Helper.getCountEntityTemplate(entities, "eq", "open") + ` ${groupName} open`,*/
  });

  /**
   * Class constructor.
   */
  constructor() {
    super(BinarySensorView.#domain);
  }
}

export {BinarySensorView};
