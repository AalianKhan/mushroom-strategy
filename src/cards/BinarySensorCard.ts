import { AbstractCard } from "./AbstractCard";
import { cards } from "../types/strategy/cards";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * BinarySensorCard Class
 *
 * Creates a Mushroom Chips card containing an entity chip for a binary_sensor entity.
 *
 * @class
 * @extends AbstractCard
 */
class BinarySensorCard extends AbstractCard {
  /**
   * Default configuration of the chips card.
   *
   * @type {ChipsCardConfig}
   * @private
   */
  #defaultConfig: ChipsCardConfig = {
    type: "custom:mushroom-chips-card",
    chips: [
      {
        type: "entity",
        entity: "", // Placeholder; will be set in the constructor
        content_info: "name",
        icon_color: "green",
        use_entity_picture: true
      }
    ],
    grid_options: {
      columns: "full",
      rows: "auto"
    },
    alignment: "center"
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The Home Assistant entity to create a card for.
   * @param {Partial<ChipsCardConfig>} [options={}] Additional options for the card.
   */
  constructor(entity: EntityRegistryEntry, options: Partial<ChipsCardConfig> = {}) {
    super(entity);

    if (!entity?.entity_id) {
      throw new Error("Invalid entity: entity_id is required.");
    }

    // Narrow the type of the first chip to EntityChipConfig
    const firstChip = this.#defaultConfig.chips[0];
    if (firstChip.type === "entity") {
      (firstChip as any).entity = entity.entity_id; // Explicit cast or modify type definition
    } else {
      throw new Error("First chip must be of type 'entity'");
    }

    // Merge the default configuration with any additional options
    this.config = {
      ...this.#defaultConfig,
      ...options,
    };
  }
}

export { BinarySensorCard };

