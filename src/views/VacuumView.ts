import {Helper} from "../Helper";
import {AbstractView} from "./AbstractView";
import {views} from "../types/strategy/views";
import {cards} from "../types/strategy/cards";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Vacuum View Class.
 *
 * Used to create a view for entities of the vacuum domain.
 *
 * @class VacuumView
 * @extends AbstractView
 */
class VacuumView extends AbstractView {
  /**
   * Domain of the view's entities.
   *
   * @type {string}
   * @static
   * @private
   */
  static #domain: string = "vacuum";

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @protected
   */
  defaultConfig: views.ViewConfig = {
    id: VacuumView.#domain,
    title: "Vacuums",
    path: "vacuums",
    icon: "mdi:robot-vacuum",
    subview: false,
    controllerCardOptions: {
      iconOn: "mdi:robot-vacuum",
      iconOff: "mdi:robot-vacuum-off",
      onService: "vacuum.start",
      offService: "vacuum.stop",
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
  viewControllerCardConfig = (entities: EntityRegistryEntry[], groupName: string = 'vacuums'): cards.ControllerCardOptions => ({
    title: `All ${groupName}`,
    subtitle: Helper.getCountEntityTemplate(entities, "ne", "off") + ` ${groupName} on`,
  });

  /**
   * Class constructor.
   */
  constructor() {
    super(VacuumView.#domain);
  }
}

export {VacuumView};
