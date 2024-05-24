import {Helper} from "../Helper";
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
  defaultConfig: views.ViewConfig = {
    id: CoverView.#domain,
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
  viewControllerCardConfig = (entities: EntityRegistryEntry[], content: string = "covers"): cards.ControllerCardOptions => ({
    title: `All ${content}`,
    subtitle: Helper.getCountEntityTemplate(entities, "eq", "open") + ` ${content} open`,
  });

  /**
   * Class constructor.
   */
  constructor() {
    super(CoverView.#domain);
  }
}

export {CoverView};
