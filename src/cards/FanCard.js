import {AbstractCard} from "./AbstractCard";

/**
 * Fan Card Class
 *
 * Used to create a card for controlling an entity of the fan domain.
 *
 * @class
 * @extends AbstractCard
 */
class FanCard extends AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {fanCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-fan-card",
    icon: undefined,
    show_percentage_control: true,
    show_oscillate_control: true,
    icon_animation: true,
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {fanCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity, options = {}) {
    super(entity);
    this.mergeOptions(
        this.#defaultOptions,
        options,
    );
  }
}

export {FanCard};
