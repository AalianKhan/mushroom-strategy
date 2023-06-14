import {Helper} from "../Helper";

/**
 * Abstract Card Class
 *
 * To create a new card, extend the new class with this one.
 *
 * @class
 * @abstract
 */
class AbstractCard {
  /**
   * Entity to create the card for.
   *
   * @type {hassEntity | areaEntity}
   */
  entity;

  /**
   * Options for creating a card.
   *
   * @type {abstractOptions}
   */
  options = {
    type: "custom:mushroom-entity-card",
    icon: "mdi:help-circle",
    double_tap_action: {
      action: null,
    },
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity | areaEntity} entity The hass entity to create a card for.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity) {
    if (this.constructor === AbstractCard) {
      throw new Error("Abstract classes can't be instantiated.");
    }

    if (!Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }

    this.entity = entity;
  }

  /**
   * Merge the default options of this class and the custom options into the options of the parent class.
   *
   * @param {Object} [defaultOptions={}] Default options for the card.
   * @param {Object} [customOptions={}] Custom Options for the card.
   */
  mergeOptions(defaultOptions, customOptions) {
    this.options = {
      ...this.options,
      ...defaultOptions,
      ...customOptions,
    };

    try {
      this.options.double_tap_action.target.entity_id = this.entity.entity_id;
    } catch { }
  }

  /**
   * Get a card for an entity.
   *
   * @return {abstractOptions & Object} A card object.
   */
  getCard() {
    return {
      entity: this.entity.entity_id,
      ...this.options,
    };
  }
}

export {AbstractCard};
