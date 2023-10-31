import {AbstractCard} from "./AbstractCard";

/**
 * Number Card Class
 *
 * Used to create a card for controlling an entity of the number domain.
 *
 * @class
 * @extends AbstractCard
 */
class NumberCard extends AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {numberCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-number-card",
    icon: undefined,
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {numberCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity, options = {}) {
    super(entity);

    this.mergeOptions(this.#defaultOptions, options);
  }
}

export {NumberCard};
