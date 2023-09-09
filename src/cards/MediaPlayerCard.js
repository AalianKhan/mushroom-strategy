import {AbstractCard} from "./AbstractCard";

/**
 * Mediaplayer Card Class
 *
 * Used to create a card for controlling an entity of the media_player domain.
 *
 * @class
 * @extends AbstractCard
 */
class MediaPlayerCard extends AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {mediaPlayerCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-media-player-card",
    icon: undefined,
    use_media_info: true,
    media_controls: [
      "on_off",
      "play_pause_stop",
    ],
    show_volume_level: true,
    volume_controls: [
      "volume_mute",
      "volume_set",
      "volume_buttons",
    ],
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {mediaPlayerCardOptions} [options={}] Options for the card.
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

export {MediaPlayerCard};
