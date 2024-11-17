import {ControllerCard} from "../cards/ControllerCard";
import {AbstractView} from "./AbstractView";
import {views} from "../types/strategy/views";
import {cards} from "../types/strategy/cards";
import {Helper} from "../Helper";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Camera View Class.
 *
 * Used to create a view for entities of the camera domain.
 *
 * @class CameraView
 * @extends AbstractView
 */
class CameraView extends AbstractView {
  /**
   * Domain of the view's entities.
   *
   * @type {string}
   * @static
   * @private
   */
  static #domain: string = "camera";

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  #defaultConfig: views.ViewConfig = {
    title: "Cameras",
    path: "cameras",
    icon: "mdi:cctv",
    subview: false,
    controllerCardOptions: {
      showControls: false,
    },
  };

  /**
   * Default configuration of the view's Controller card.
   *
   * @type {cards.ControllerCardOptions}
   * @private
   */
  #viewControllerCardConfig: cards.ControllerCardOptions = {
    title: "All Cameras",
    subtitle: Helper.getCountTemplate(CameraView.#domain, [{operator: "ne", value: "off"}]) + " cameras on",
  };

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(options: views.ViewConfig = {}) {
    super(CameraView.#domain);

    this.config = Object.assign(this.config, this.#defaultConfig, options);

    // Create a Controller card to switch all entities of the domain.
    this.viewControllerCard = new ControllerCard(
      {},
      {
        ...this.#viewControllerCardConfig,
        ...("controllerCardOptions" in this.config ? this.config.controllerCardOptions : {}) as cards.ControllerCardConfig,
      }).createCard();
  }
}

export {CameraView};
