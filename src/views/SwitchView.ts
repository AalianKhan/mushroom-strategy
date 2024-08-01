import {Helper} from "../Helper";
import {AbstractView} from "./AbstractView";
import {views} from "../types/strategy/views";
import {cards} from "../types/strategy/cards";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Switch View Class.
 *
 * Used to create a view for entities of the switch domain.
 *
 * @class SwitchView
 * @extends AbstractView
 */
class SwitchView extends AbstractView {
  /**
   * Domain of the view's entities.
   *
   * @type {string}
   * @static
   * @private
   */
  static #domain: string = "switch";

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @protected
   */
  defaultConfig: views.ViewConfig = {
    id: SwitchView.#domain,
    title: "Switches",
    path: "switches",
    icon: "mdi:dip-switch",
    subview: false,
    controllerCardOptions: {
      iconOn: "mdi:power-plug",
      iconOff: "mdi:power-plug-off",
      onService: "switch.turn_on",
      offService: "switch.turn_off",
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
  viewControllerCardConfig = (entities: EntityRegistryEntry[], groupName: string = 'switches'): cards.ControllerCardOptions => ({
    title: `All ${groupName}`,
    subtitle: Helper.getCountEntityTemplate(entities, "eq", "on") + ` ${groupName} on`,
  });

  /**
   * Class constructor.
   */
  constructor() {
    super(SwitchView.#domain);
  }
}

export {SwitchView};
