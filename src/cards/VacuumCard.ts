import {AbstractCard} from "./AbstractCard";
import {cards} from "../types/strategy/cards";
import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";
import {VACUUM_COMMANDS, VacuumCardConfig} from "../types/lovelace-mushroom/cards/vacuum-card-config";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Vacuum Card Class
 *
 * Used to create a card for controlling an entity of the vacuum domain.
 *
 * @class
 * @extends AbstractCard
 */
class VacuumCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {VacuumCardConfig}
   * @private
   */
  #defaultConfig: VacuumCardConfig = {
    type: "custom:mushroom-vacuum-card",
    icon: undefined,
    icon_animation: true,
    commands: [...VACUUM_COMMANDS],
    tap_action: {
      action: "more-info",
    }
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.VacuumCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity: EntityRegistryEntry, options: cards.VacuumCardOptions = {}) {
    super(entity);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export {VacuumCard};
