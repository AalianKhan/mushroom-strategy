import {AbstractCard} from "./AbstractCard";

/**
 * Switch Card Class
 *
 * Used to create a card for controlling an entity of the switch domain.
 *
 * @class
 * @extends AbstractCard
 */
class SwitchCard extends AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {switchCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-entity-card",
    icon: undefined,
    tap_action: {
      action: "toggle",
    },
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {switchCardOptions} [options={}] Options for the card.
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

export {SwitchCard};
