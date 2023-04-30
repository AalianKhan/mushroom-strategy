import {AbstractCard} from "./AbstractCard";

/**
 * Camera Card Class
 *
 * Used to create a card for controlling an entity of the camera domain.
 *
 * @class
 * @extends AbstractCard
 */
class CameraCard extends AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {cameraCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:webrtc-camera",
    icon: undefined,
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {cameraCardOptions} [options={}] Options for the card.
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

export {CameraCard};
