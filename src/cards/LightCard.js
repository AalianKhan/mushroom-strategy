import {AbstractCard} from "./AbstractCard";

/**
 * Light Card Class
 *
 * Used to create a card for controlling an entity of the light domain.
 *
 * @class
 * @extends AbstractCard
 */
class LightCard extends AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {lightCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-light-card",
    icon: undefined,
    show_brightness_control: true,
    show_color_control: true,
    use_light_color: true,
    double_tap_action: {
      target: {
        entity_id: undefined,
      },
      action: "call-service",
      service: "light.turn_on",
      data: {
        rgb_color: [255, 255, 255],
      },
    },
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {lightCardOptions} [options={}] Options for the card.
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

export {LightCard};
