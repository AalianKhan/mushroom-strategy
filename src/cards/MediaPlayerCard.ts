import {AbstractCard} from "./AbstractCard";
import {cards} from "../types/strategy/cards";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";
import {MediaPlayerCardConfig} from "../types/lovelace-mushroom/cards/media-player-card-config";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
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
   * Default configuration of the card.
   *
   * @type {MediaPlayerCardConfig}
   * @private
   */
  #defaultConfig: MediaPlayerCardConfig = {
    type: "custom:mushroom-media-player-card",
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
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.MediaPlayerCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity: EntityRegistryEntry, options: cards.MediaPlayerCardOptions = {}) {
    super(entity);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {MediaPlayerCard};
