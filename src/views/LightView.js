import {Helper} from "../Helper";
import {TitleCard} from "../cards/TitleCard";
import {AbstractView} from "./AbstractView";

/**
 * Light View Class.
 *
 * Used to create a view for entities of the light domain.
 *
 * @class LightView
 * @extends AbstractView
 */
class LightView extends AbstractView {
  /**
   * Domain of the view's entities.
   * @type {string}
   */
  #domain = "light";

  /**
   * Default options for the view.
   *
   * @type {viewOptions}
   * @private
   */
  #defaultOptions = {
    title: "Lights",
    path: "lights",
    icon: "mdi:lightbulb-group",
    subview: false,
    titleCard: {
      iconOn: "mdi:lightbulb",
      iconOff: "mdi:lightbulb-off",
      onService: "light.turn_on",
      offService: "light.turn_off",
    },
  };

  /**
   * Options for the view's title card.
   *
   * @type {viewTitleCardOptions}
   */
  #viewTitleCardOption = {
    title: "All Lights",
    subtitle: Helper.getCountTemplate(this.domain, "eq", "on") + " lights on",
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

export {LightView};
