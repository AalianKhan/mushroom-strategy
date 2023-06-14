import {Helper} from "../Helper";
import {TitleCard} from "../cards/TitleCard";
import {AbstractView} from "./AbstractView";

/**
 * Climate View Class.
 *
 * Used to create a view for entities of the climate domain.
 *
 * @class ClimateView
 * @extends AbstractView
 */
class ClimateView extends AbstractView {
  /**
   * Domain of the view's entities.
   * @type {string}
   */
  #domain = "climate";

  /**
   * Default options for the view.
   *
   * @type {viewOptions}
   * @private
   */
  #defaultOptions = {
    title: "Climates",
    path: "climates",
    icon: "mdi:thermostat",
    subview: false,
    titleCard: {
      showControls: false,
    },
  };

  /**
   * Options for the view's title card.
   *
   * @type {viewTitleCardOptions}
   */
  #viewTitleCardOption = {
    title: "All Climates",
    subtitle: Helper.getCountTemplate(this.domain, "ne", "off") + " climates on",
    ...this.options["titleCard"],
  };

  /**
   * Class constructor.
   *
   * @param {viewOptions} [options={}] Options for the view.
   */
  constructor(options = {}) {
    super();
    this.mergeOptions(
        this.#defaultOptions,
        options,
    );

    // Create a title card to switch all entities of the domain.
    this.viewTitleCard = new TitleCard(Helper.areas, {
      ...this.#viewTitleCardOption,
      ...this.options["titleCard"],
    }).createCard();
  }

  get domain() {
    return this.#domain;
  }
}

export {ClimateView};
