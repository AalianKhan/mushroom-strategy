import {Helper} from "../Helper";
import {TitleCard} from "../cards/TitleCard";
import {AbstractView} from "./AbstractView";

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
   * @type {string}
   */
  #domain = "cover";

  /**
   * Default options for the view.
   *
   * @type {viewOptions}
   * @private
   */
  #defaultOptions = {
    title: "Covers",
    path: "covers",
    icon: "mdi:window-open",
    subview: false,
    titleCard: {
      iconOn: "mdi:arrow-up",
      iconOff: "mdi:arrow-down",
      onService: "cover.open_cover",
      offService: "cover.close_cover",
    },
  };

  /**
   * Options for the view's title card.
   *
   * @type {viewTitleCardOptions}
   */
  #viewTitleCardOption = {
    title: "All Covers",
    subtitle: Helper.getCountTemplate(this.domain, "eq", "open") + " covers open",
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

export {CoverView};
