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
   * Class constructor.
   *
   * @param {areaEntity} area The area entity to create a card for.
   * @param {options} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */

  constructor(area, options = {}) {
    super(area);
    const defaultOptions = {
      type: "area",
      area: area.area_id,
      navigation_path: area.area_id,
    };
    this.mergeOptions(
      defaultOptions,
      options,
    );
  }
}

export {AreaCard};
