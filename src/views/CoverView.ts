import {Helper} from "../Helper";
import {ControllerCard} from "../cards/ControllerCard";
import {AbstractView} from "./AbstractView";
import {views} from "../types/strategy/views";
import {cards} from "../types/strategy/cards";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Cover View Class.
 *
 * Used to create a view for entities of the cover domain.
 *
 * @class CoverView
 * @extends AbstractView
 */
class CoverView extends AbstractView {
  /**
   * Domain of the view's entities.
   *
   * @type {string}
   * @static
   * @private
   */
  static #domain: string = "cover";

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  #defaultConfig: views.ViewConfig = {
    title: "Covers",
    path: "covers",
    icon: "mdi:window-open",
    subview: false,
    controllerCardOptions: {
      iconOn: "mdi:arrow-up",
      iconOff: "mdi:arrow-down",
      onService: "cover.open_cover",
      offService: "cover.close_cover",
    },
  };

  /**
   * Default configuration of the view's Controller card.
   *
   * @type {cards.ControllerCardOptions}
   * @private
   */
  #viewControllerCardConfig: cards.ControllerCardOptions = {
    title: "All Covers",
    subtitle: Helper.getCountTemplate(CoverView.#domain, [{operator: "eq", value: "open"}]) + " covers open",
  };

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(options: views.ViewConfig = {}) {
    super(CoverView.#domain);

    this.config = Object.assign(this.config, this.#defaultConfig, options);

    // Create a Controller card to switch all entities of the domain.
    this.viewControllerCard = new ControllerCard(
      this.targetDomain(CoverView.#domain),
      {
        ...this.#viewControllerCardConfig,
        ...("controllerCardOptions" in this.config ? this.config.controllerCardOptions : {}) as cards.ControllerCardConfig,
      }).createCard();
  }
}

export {CoverView};
