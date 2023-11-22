import {AbstractCard} from "./AbstractCard";
import {cards} from "../types/strategy/cards";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";
import {PictureEntityCardConfig} from "../types/homeassistant/panels/lovelave/cards/types";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
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
   * Default configuration of the card.
   *
   * @type {PictureEntityCardConfig}
   * @private
   */
  #defaultConfig: PictureEntityCardConfig = {
    entity: "",
    type: "picture-entity",
    show_name: false,
    show_state: false,
    camera_view: "live",
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.PictureEntityCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity: EntityRegistryEntry, options: cards.PictureEntityCardOptions = {}) {
    super(entity);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {CameraCard};
