import {AbstractCard} from "./AbstractCard";

/**
 * Lock Card Class
 *
 * Used to create a card for controlling an entity of the lock domain.
 *
 * @class
 * @extends AbstractCard
 */
class LockCard extends AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {lockCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-lock-card",
    icon: undefined,
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {lockCardOptions} [options={}] Options for the card.
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

export {LockCard};
