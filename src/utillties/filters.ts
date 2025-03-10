import {EntityRegistryEntry} from "../types/homeassistant/data/entity_registry";
import {Helper} from "../Helper";

/**
 * Filter an array of entities by property/value pair
 *
 * @param entities The array of entities to filter.
 * @param property The property to filter on.
 * @param value The value to match.
 * @param exclude Whether to exclude entities with the given property/value pair (default: true).
 *
 * @returns A new list of entities filtered by the given property/value pair.
 */
export function filterEntitiesByPropertyValue(
  entities: EntityRegistryEntry[],
  property: keyof EntityRegistryEntry,
  value: any,
  exclude: boolean = true
) {
  return entities.filter(entity => exclude ? entity[property] !== value : entity[property] === value);
}

export function applyEntityCategoryFilters(entities: EntityRegistryEntry[], domain: string) {
  if (!Helper.isInitialized()) {
    throw new Error("The Helper module must be initialized before using this one.");
  }

  const domainOptions = {
    ...Helper.strategyOptions.domains["_"],
    ...Helper.strategyOptions.domains[domain],
  };

  let filteredEntityCategory = [];

  if (domainOptions.hide_config_entities) {
    entities = filterEntitiesByPropertyValue(entities, "entity_category", "config");
    filteredEntityCategory.push("Config");
  }

  if (domainOptions.hide_diagnostic_entities) {
    entities = filterEntitiesByPropertyValue(entities, "entity_category", "diagnostic");
    filteredEntityCategory.push("Diagnostic");
  }

  if (Helper.debug && filteredEntityCategory.length > 0) {
    console.warn(filteredEntityCategory.join(" & ") + "entities are filtered out.");
  }

  return entities;
}


