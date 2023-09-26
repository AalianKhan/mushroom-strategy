import {AbstractCard} from "./AbstractCard";

/**
 * HA Area Card Class
 *
 * Used to create a card for an entity of the area domain using the built in type 'area'.
 *
 * @class
 * @extends AbstractCard
 */
class HaAreaCard extends AbstractCard {

  /**
   * Class constructor.
   *
   * @param {areaEntity} area The area entity to create a card for.
   * @throws {Error} If the Helper module isn't initialized.
   */

  constructor(area) {
    super(area);
    this.options = {
      type: "area",
      area: area.area_id,
      navigation_path: area.area_id,
    };
  }
}

export {HaAreaCard};
