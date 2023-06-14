import {Helper} from "../Helper";
import {TitleCard} from "../cards/TitleCard";
import {AbstractView} from "./AbstractView";

/**
 * Switch View Class.
 *
 * Used to create a view for entities of the switch domain.
 *
 * @class SwitchView
 * @extends AbstractView
 */
class SwitchView extends AbstractView {
  /**
   * Domain of the view's entities.
   * @type {string}
   */
  #domain = "switch";

  /**
   * Default options for the view.
   *
   * @type {viewOptions}
   * @private
   */
  #defaultOptions = {
    title: "Switches",
    path: "switches",
    icon: "mdi:dip-switch",
    subview: false,
    titleCard: {
      iconOn: "mdi:power-plug",
      iconOff: "mdi:power-plug-off",
      onService: "switch.turn_on",
      offService: "switch.turn_off",
    },
  };

  /**
   * Options for the view's title card.
   *
   * @type {viewTitleCardOptions}
   */
  #viewTitleCardOption = {
    title: "All Switches",
    subtitle: Helper.getCountTemplate(this.domain, "eq", "on") + " switches on",
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

export {SwitchView};
