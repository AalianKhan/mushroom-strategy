import {getConfigurationDefaults} from "./configurationDefaults";
import {HassEntities, HassEntity} from "home-assistant-js-websocket";
import deepmerge from "deepmerge";
import {EntityRegistryEntry} from "./types/homeassistant/data/entity_registry";
import {DeviceRegistryEntry} from "./types/homeassistant/data/device_registry";
import {AreaRegistryEntry} from "./types/homeassistant/data/area_registry";
import {generic} from "./types/strategy/generic";
import setupCustomLocalize from "./localize";
import {applyEntityCategoryFilters} from "./utillties/filters";
import StrategyArea = generic.StrategyArea;

/**
 * Helper Class
 *
 * Contains the objects of Home Assistant's registries and helper methods.
 */
class Helper {
  /**
   * An array of entities from Home Assistant's entity registry.
   *
   * @type {EntityRegistryEntry[]}
   * @private
   */
  static #entities: EntityRegistryEntry[];

  /**
   * An array of entities from Home Assistant's device registry.
   *
   * @type {DeviceRegistryEntry[]}
   * @private
   */
  static #devices: DeviceRegistryEntry[];

  /**
   * An array of entities from Home Assistant's area registry.
   *
   * @type {StrategyArea[]}
   * @private
   */
  static #areas: StrategyArea[] = [];

  /**
   * An array of state entities from Home Assistant's Hass object.
   *
   * @type {HassEntities}
   * @private
   */
  static #hassStates: HassEntities;

  /**
   * Indicates whether this module is initialized.
   *
   * @type {boolean} True if initialized.
   * @private
   */
  static #initialized: boolean = false;

  /**
   * The Custom strategy configuration.
   *
   * @type {generic.StrategyConfig}
   * @private
   */
  static #strategyOptions: generic.StrategyConfig;

  /**
   * Set to true for more verbose information in the console.
   *
   * @type {boolean}
   * @private
   */
  static #debug: boolean;
  static customLocalize: Function;

  /**
   * Class constructor.
   *
   * This class shouldn't be instantiated directly.
   * Instead, it should be initialized with method initialize().
   *
   * @throws {Error} If trying to instantiate this class.
   */
  constructor() {
    throw new Error("This class should be invoked with method initialize() instead of using the keyword new!");
  }

  /**
   * Custom strategy configuration.
   *
   * @returns {generic.StrategyConfig}
   * @static
   */
  static get strategyOptions(): generic.StrategyConfig {
    return this.#strategyOptions;
  }

  /**
   * Get the entities from Home Assistant's area registry.
   *
   * @returns {StrategyArea[]}
   * @static
   */
  static get areas(): StrategyArea[] {
    return this.#areas;
  }

  /**
   * Get the devices from Home Assistant's device registry.
   *
   * @returns {DeviceRegistryEntry[]}
   * @static
   */
  static get devices(): DeviceRegistryEntry[] {
    return this.#devices;
  }

  /**
   * Get the entities from Home Assistant's entity registry.
   *
   * @returns {EntityRegistryEntry[]}
   * @static
   */
  static get entities(): EntityRegistryEntry[] {
    return this.#entities;
  }

  /**
   * Get the current debug mode of the mushroom strategy.
   *
   * @returns {boolean}
   * @static
   */
  static get debug(): boolean {
    return this.#debug;
  }

  /**
   * Initialize this module.
   *
   * @param {generic.DashBoardInfo} info Strategy information object.
   * @returns {Promise<void>}
   * @static
   */
  static async initialize(info: generic.DashBoardInfo): Promise<void> {
    // Initialize properties.
    this.customLocalize = setupCustomLocalize(info.hass);

    const configurationDefaults = getConfigurationDefaults(this.customLocalize)
    this.#strategyOptions = deepmerge(configurationDefaults, info.config?.strategy?.options ?? {});

    this.#hassStates = info.hass.states;
    this.#debug = this.#strategyOptions.debug;

    try {
      // Query the registries of Home Assistant.

      // noinspection ES6MissingAwait False positive? https://youtrack.jetbrains.com/issue/WEB-63746
      [Helper.#entities, Helper.#devices, Helper.#areas] = await Promise.all([
        info.hass.callWS({type: "config/entity_registry/list"}) as Promise<EntityRegistryEntry[]>,
        info.hass.callWS({type: "config/device_registry/list"}) as Promise<DeviceRegistryEntry[]>,
        info.hass.callWS({type: "config/area_registry/list"}) as Promise<AreaRegistryEntry[]>,
      ]);
    } catch (e) {
      Helper.logError("An error occurred while querying Home assistant's registries!", e);
      throw 'Check the console for details';
    }

    // Create and add the undisclosed area if not hidden in the strategy options.
    if (!this.#strategyOptions.areas.undisclosed?.hidden) {
      this.#strategyOptions.areas.undisclosed = {
        ...configurationDefaults.areas.undisclosed,
        ...this.#strategyOptions.areas.undisclosed,
      };

      // Make sure the custom configuration of the undisclosed area doesn't overwrite the area_id.
      this.#strategyOptions.areas.undisclosed.area_id = "undisclosed";

      this.#areas.push(this.#strategyOptions.areas.undisclosed);
    }

    // Merge custom areas of the strategy options into strategy areas.
    this.#areas = Helper.areas.map(area => {
      return {...area, ...this.#strategyOptions.areas?.[area.area_id]};
    });

    // Sort strategy areas by order first and then by name.
    this.#areas.sort((a, b) => {
      return (a.order ?? Infinity) - (b.order ?? Infinity) || a.name.localeCompare(b.name);
    });

    // Sort custom and default views of the strategy options by order first and then by title.
    this.#strategyOptions.views = Object.fromEntries(
      Object.entries(this.#strategyOptions.views).sort(([, a], [, b]) => {
        return (a.order ?? Infinity) - (b.order ?? Infinity) || (a.title ?? "undefined").localeCompare(b.title ?? "undefined");
      }),
    );

    // Sort custom and default domains of the strategy options by order first and then by title.
    this.#strategyOptions.domains = Object.fromEntries(
      Object.entries(this.#strategyOptions.domains).sort(([, a], [, b]) => {
        return (a.order ?? Infinity) - (b.order ?? Infinity) || (a.title ?? "undefined").localeCompare(b.title ?? "undefined");
      }),
    );

    this.#initialized = true;
  }

  /**
   * Get the initialization status of the Helper class.
   *
   * @returns {boolean} True if this module is initialized.
   * @static
   */
  static isInitialized(): boolean {
    return this.#initialized;
  }

  /**
   * Get a template string to define the number of a given domain's entities with a certain state.
   *
   * States are compared against a given value by a given operator.
   * States `unavailable` and `unknown` are always excluded.
   *
   * @param {string} domain The domain of the entities.
   * @param {string} operator The comparison operator between state and value.
   * @param {string} value The value to which the state is compared against.
   *
   * @return {string} The template string.
   * @static
   */
  static getCountTemplate(domain: string, operator: string, value: string): string {
    /**
     * Array of entity state-entries, filtered by domain.
     *
     * Each element contains a template-string which is used to access home assistant's state machine (state object) in
     * a template.
     * E.g. "states['light.kitchen']"
     *
     * The array excludes hidden and disabled entities.
     *
     * @type {string[]}
     */
    const states: string[] = [];

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    // Get the state of entities which are linked to the given area.
    for (const area of this.#areas) {
      let entities = this.getDeviceEntities(area, domain);

      // Exclude hidden Config and Diagnostic entities.
      entities = applyEntityCategoryFilters(entities, domain);

      const newStates = entities.map((entity) => `states['${entity.entity_id}']`);

      states.push(...newStates);
    }

    return (
      `{% set entities = [${states}] %}
       {{ entities
          | selectattr('state','${operator}','${value}')
          | selectattr('state','ne','unavailable')
          | selectattr('state','ne','unknown')
          | list
          | count
        }}`
    );
  }

  /**
   * Get device entities from the entity registry, filtered by area and domain.
   *
   * The entity registry is a registry where Home-Assistant keeps track of all entities.
   * A device is represented in Home Assistant via one or more entities.
   *
   * The result excludes hidden and disabled entities.
   *
   * @param {AreaRegistryEntry} area Area entity.
   * @param {string} [domain] The domain of the entity-id.
   *
   * @return {EntityRegistryEntry[]} Array of device entities.
   * @static
   */
  static getDeviceEntities(area: AreaRegistryEntry, domain?: string): EntityRegistryEntry[] {
    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    // Get the ID of the devices which are linked to the given area.
    const areaDeviceIds = this.#devices.filter((device) => {
      return (device.area_id ?? "undisclosed") === area.area_id;
    }).map((device: DeviceRegistryEntry) => {

      return device.id;
    });

    // Return the entities of which all conditions of the callback function are met. @see areaFilterCallback.
    return this.#entities.filter(
      this.#areaFilterCallback, {
        area: area,
        domain: domain,
        areaDeviceIds: areaDeviceIds,
      })
      .sort((a, b) => {
        return (a.original_name ?? "undefined").localeCompare(b.original_name ?? "undefined");
      });
  }

  /**
   * Get state entities, filtered by area and domain.
   *
   * The result excludes hidden and disabled entities.
   *
   * @param {AreaRegistryEntry} area Area entity.
   * @param {string} domain Domain of the entity-id.
   *
   * @return {HassEntity[]} Array of state entities.
   */
  static getStateEntities(area: AreaRegistryEntry, domain: string): HassEntity[] {
    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const states: HassEntity[] = [];

    // Create a map for the hassEntities and devices {id: object} to improve lookup speed.
    const entityMap: {
      [s: string]: EntityRegistryEntry;
    } = Object.fromEntries(this.#entities.map((entity) => [entity.entity_id, entity]));
    const deviceMap: {
      [s: string]: DeviceRegistryEntry;
    } = Object.fromEntries(this.#devices.map((device) => [device.id, device]));

    // Get states whose entity-id starts with the given string.
    const stateEntities = Object.values(this.#hassStates).filter(
      (state) => state.entity_id.startsWith(`${domain}.`),
    );

    for (const state of stateEntities) {
      const hassEntity = entityMap[state.entity_id];
      const device = deviceMap[hassEntity?.device_id ?? ""];

      // Collect states of which any (whichever comes first) of the conditions below are met:
      // 1. The linked entity is linked to the given area.
      // 2. The entity is linked to a device, and the linked device is linked to the given area.
      if (
        (hassEntity?.area_id === area.area_id)
        || (device && device.area_id === area.area_id)
      ) {
        states.push(state);
      }
    }

    return states;
  }

  /**
   * Get the state object of a HASS entity.
   *
   * @param {EntityRegistryEntry} entity The entity for which to get the state.
   * @returns {HassEntity | undefined} The state object of the entity, or undefined if not found.
   * @static
   */
  static getEntityState(entity: EntityRegistryEntry): HassEntity | undefined {
    return this.#hassStates[entity.entity_id];
  }

  /**
   * Sanitize a classname.
   *
   * The name is sanitized by capitalizing the first character of the name or after an underscore.
   * Underscores are removed.
   *
   * @param {string} className Name of the class to sanitize.
   * @returns {string} The sanitized classname.
   */
  static sanitizeClassName(className: string): string {
    className = className.charAt(0).toUpperCase() + className.slice(1);

    return className.replace(/([-_][a-z])/g, (group) => group
      .toUpperCase()
      .replace("-", "")
      .replace("_", ""),
    );
  }

  /**
   * Get the ids of the views which aren't set to hidden in the strategy options.
   *
   * @return {string[]} An array of view ids.
   */
  static getExposedViewIds(): string[] {
    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    return this.#getObjectKeysByPropertyValue(this.#strategyOptions.views, "hidden", false);
  }

  /**
   * Get the ids of the domain ids which aren't set to hidden in the strategy options.
   *
   * @return {string[]} An array of domain ids.
   */
  static getExposedDomainIds(): string[] {
    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    return this.#getObjectKeysByPropertyValue(this.#strategyOptions.domains, "hidden", false);
  }

  /**
   * Callback function for filtering entities.
   *
   * Entities of which all the conditions below are met are kept:
   * 1. The entity is not hidden and the entity's device is not hidden by the strategy options.
   * 2. The entity is not hidden and is not disabled by Hass.
   * 3. The entity's domain matches the given domain.
   * 4. The entity itself or else the entity's device is linked to the given area.
   *
   * @param {EntityRegistryEntry} entity The current Hass entity to evaluate.
   * @this {AreaFilterContext}
   *
   * @return {boolean} True to keep the entity.
   * @static
   */
  static #areaFilterCallback(
    this: {
      area: AreaRegistryEntry,
      areaDeviceIds: string[],
      domain: string,
    },
    entity: EntityRegistryEntry): boolean {
    const cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id];
    const deviceOptions = Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];

    const entityUnhidden =
            !cardOptions?.hidden && !deviceOptions?.hidden                                             // Condition 1.
            && entity.hidden_by === null && entity.disabled_by === null;                               // Condition 2.
    const domainMatches = this.domain === undefined || entity.entity_id.startsWith(`${this.domain}.`); // Condition 3.
    // Condition 4.
    const entityLinked = this.area.area_id === "undisclosed"
      // Undisclosed area.
      ? !entity.area_id && (this.areaDeviceIds.includes(entity.device_id ?? "") || !entity.device_id)
      // Area is a hass entity. Note: entity.area_id is set to null when using device's area.
      : entity.area_id === this.area.area_id || (!entity.area_id && this.areaDeviceIds.includes(entity.device_id ?? ""));

    return (entityUnhidden && domainMatches && entityLinked);
  }

  /**
   * Get the keys of nested objects by its property value.
   *
   * @param {Object<string, any>} object An object of objects.
   * @param {string|number} property The name of the property to evaluate.
   * @param {*} value The value which the property should match.
   *
   * @return {string[]} An array with keys.
   */
  static #getObjectKeysByPropertyValue(
    object: { [k: string]: any },
    property: string, value: any
  ): string[] {
    const keys: string[] = [];

    for (const key of Object.keys(object)) {
      if (object[key][property] === value) {
        keys.push(key);
      }
    }

    return keys;
  }

  /**
   * Logs an error message to the console.
   *
   * @param {string} userMessage - The error message to display.
   * @param {unknown} [e] - (Optional) The error object or additional information.
   *
   * @return {void}
   */
  static logError(userMessage: string, e?: unknown): void {
    if (Helper.debug) {
      console.error(userMessage, e);

      return;
    }

    console.error(userMessage);
  }
}

export {Helper};
