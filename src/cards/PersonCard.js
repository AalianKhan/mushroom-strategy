import {AbstractCard} from "./AbstractCard";

/**
 * Person Card Class
 *
 * Used to create a card for an entity of the person domain.
 *
 * @class
 * @extends AbstractCard
 */
class PersonCard extends AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {personCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-person-card",
    layout: "vertical",
    primary_info: "none",
    secondary_info: "none",
    icon_type: "entity-picture",
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {personCardOptions} [options={}] Options for the card.
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

export {PersonCard};
