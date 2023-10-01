import {AbstractCard} from "./AbstractCard";

/**
 * HA Area Card Class
 *
 * Used to create a card for an entity of the area domain using the built in type 'area'.
 *
 * @class
 * @extends AbstractCard
 */
class AreaCard extends AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {HaAreaCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "area",
    area: undefined,
    navigation_path: undefined,
  };

  /**
   * Class constructor.
   *
   * @param {areaEntity} area The area entity to create a card for.
   * @param {HaAreaCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */

  constructor(area, options = {}) {
    super(area);
    this.#defaultOptions.area            = area.area_id ?? area.name;
    this.#defaultOptions.navigation_path = area.area_id ?? area.name;

    // Enforce the card type.
    options.type = this.#defaultOptions.type;

    this.mergeOptions(
        this.#defaultOptions,
        options,
    );
  }
}

export {AreaCard};
