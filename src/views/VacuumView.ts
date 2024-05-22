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
   * @private
   */
  #defaultConfig: views.ViewConfig = {
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
   * Default configuration of the view's Controller card.
   *
   * @type {cards.ControllerCardOptions}
   * @private
   */
  viewControllerCardConfig = (entities: EntityRegistryEntry[], content: string = 'vacuums'): cards.ControllerCardOptions => ({
    title: `All ${content}`,
    subtitle: Helper.getCountEntityTemplate(entities, "ne", "off") + ` ${content} on`,
  });

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(options: views.ViewConfig = {}) {
    super(VacuumView.#domain);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {VacuumView};
