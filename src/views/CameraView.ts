import {AbstractView} from "./AbstractView";
import {views} from "../types/strategy/views";
import {cards} from "../types/strategy/cards";
import {Helper} from "../Helper";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";

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
  viewControllerCardConfig = (entities: EntityRegistryEntry[], content: string = 'cameras'): cards.ControllerCardOptions => ({
    title: `All ${content}`,
    subtitle: Helper.getCountEntityTemplate(entities, "ne", "off") + ` ${content} on`,
  });

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(options: views.ViewConfig = {}) {
    super(CameraView.#domain);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {CameraView};
