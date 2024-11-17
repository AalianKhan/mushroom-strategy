import {Helper} from "../Helper";
import {ControllerCard} from "../cards/ControllerCard";
import {AbstractView} from "./AbstractView";
import {views} from "../types/strategy/views";
import {cards} from "../types/strategy/cards";

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
  #viewControllerCardConfig: cards.ControllerCardOptions = {
    title: "All Vacuums",
    subtitle: Helper.getCountTemplate(VacuumView.#domain, [{operator: "ne", value: "off"}]) + " vacuums on",
  };

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(options: views.ViewConfig = {}) {
    super(VacuumView.#domain);

    this.config = Object.assign(this.config, this.#defaultConfig, options);

    // Create a Controller card to switch all entities of the domain.
    this.viewControllerCard = new ControllerCard(
      this.targetDomain(VacuumView.#domain),
      {
        ...this.#viewControllerCardConfig,
        ...("controllerCardOptions" in this.config ? this.config.controllerCardOptions : {}) as cards.ControllerCardConfig,
      }).createCard();
  }
}

export {VacuumView};
