/**
 * Helper Class
 *
 * Contains the objects of Home Assistant's registries and helper methods.
 */
class Helper {
  /**
   * An array of entities from Home Assistant's entity registry.
   *
   * @type {hassEntity[]}
   * @private
   */
  static #entities;
  /**
   * An array of entities from Home Assistant's device registry.
   *
   * @type {deviceEntity[]}
   * @private
   */
  static #devices;
  /**
   * An array of entities from Home Assistant's area registry.
   *
   * @type {areaEntity[]}
   * @private
   */
  static #areas;
  /**
   * An array of state entities from Home Assistant's Hass object.
   *
   * @type {hassObject["states"]}
   * @private
   */
  static #hassStates;

  /**
   * Indicates whether this module is initialized.
   *
   * @type {boolean} True if initialized.
   * @private
   */
  static #initialized = false;

  /**
   * The Custom strategy configuration.
   *
   * @type {customStrategyOptions | {}}
   * @private
   */
  static #strategyOptions = {};

  /**
   * Set to true for more verbose information in the console.
   *
   * @type {boolean}
   */
  static debug = false;

  /**
   * Class constructor.
   *
   * This class shouldn't be instantiated directly. Instead, it should be initialized with method initialize().
   * @throws {Error} If trying to instantiate this class.
   */
  constructor() {
    throw new Error("This class should be invoked with method initialize() instead of using the keyword new!");
  }

  /**
   * Custom strategy configuration.
   *
   * @returns {customStrategyOptions|{}}
   * @static
   */
  static get strategyOptions() {
    return this.#strategyOptions;
  }

  /**
   * @returns {areaEntity[]}
   * @static
   */
  static get areas() {
    return this.#areas;
  }

  /**
   * @returns {deviceEntity[]}
   * @static
   */
  static get devices() {
    return this.#devices;
  }

  /**
   * @returns {hassEntity[]}
   * @static
   */
  static get entities() {
    return this.#entities;
  }

  /**
   * @returns {boolean}
   * @static
   */
  static get debug() {
    return this.debug;
  }

  /**
   * Initialize this module.
   *
   * @param {dashBoardInfo | viewInfo} info Strategy information object.
   * @returns {Promise<void>}
   * @static
   */
  static async initialize(info) {
    this.debug       = this.strategyOptions.debug;
    this.#hassStates = info.hass.states;

    try {
      // Query the registries of Home Assistant.
      [this.#entities, this.#devices, this.#areas] = await Promise.all([
        info.hass.callWS({type: "config/entity_registry/list"}),
        info.hass.callWS({type: "config/device_registry/list"}),
        info.hass.callWS({type: "config/area_registry/list"}),
      ]);
    } catch (e) {
      console.error(Helper.debug ? e : "An error occurred while querying Home assistant's registries!");
    }

    // Cloning is required for the purpose of the required undisclosed area.
    this.#strategyOptions = structuredClone(info.config.strategy.options || {});

    // Setup required configuration entries.
    if (!this.#strategyOptions.areas) {
      this.#strategyOptions.areas = {};
    }

    // TODO: Decide on property name and value of undisclosed.name.
    if (!this.#strategyOptions.areas.undisclosed?.hidden) {
      this.#strategyOptions.areas.undisclosed         = {
        aliases: [],
        area_id: null,
        name: "Undisclosed",
        picture: null,
        hidden: false,
        ...this.#strategyOptions.areas.undisclosed,
      };

      // Make sure the area_id of the undisclosed area remains null.
      this.#strategyOptions.areas.undisclosed.area_id = null;
      this.#areas.push(this.#strategyOptions.areas.undisclosed);
    }



    this.#initialized = true;
  }

  /**
   * @returns {boolean} True if this module is initialized.
   * @static
   */
  static isInitialized() {
    return this.#initialized;
  }

  /**
   * Get a template string to define the number of a given domain's entities with a certain state.
   *
   * States are compared against a given value by a given operator.
   *
   * @param {string} domain The domain of the entities.
   * @param {string} operator The Comparison operator between state and value.
   * @param {string} value The value to which the state is compared against.
   *
   * @return {string} The template string.
   * @static
   */
  static getCountTemplate(domain, operator, value) {
    // noinspection JSMismatchedCollectionQueryUpdate (False positive per 17-04-2023)
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
    const states = [];

    // Get the ID of the devices which are linked to the given area.
    for (const area of this.#areas) {
      const areaDeviceIds = this.#devices.filter(device => {
        return device.area_id === area.area_id;
      }).map(device => {
        return device.id;
      });

      // Collect entity states of which all the conditions below are met:
      // 1. The entity is linked to a device which is linked to the given area,
      //    or the entity itself is linked to the given area.
      // 2. The entity's ID starts with the give string.
      // 3. The entity is not hidden and not disabled.
      for (const entity of this.#entities) {
        if (
            (areaDeviceIds.includes(entity.device_id) || entity.area_id === area.area_id)
            && entity.entity_id.startsWith(`${domain}.`)
            && entity.hidden_by == null && entity.disabled_by == null
        ) {
          states.push(`states['${entity.entity_id}']`);
        }
      }
    }

    return `{% set entities = [${states}] %} {{ entities | selectattr('state','${operator}','${value}') | list | count }}`;
  }

  /**
   * Get device entities from the entity registry, filtered by area and domain.
   *
   * The entity registry is a registry where Home-Assistant keeps track of all entities.
   * A device is represented in Home Assistant via one or more entities.
   *
   * The result excludes hidden and disabled entities.
   *
   * @param {areaEntity} area Area entity.
   * @param {string} domain The domain of the entity-id.
   *
   * @return {hassEntity[]} Array of device entities.
   * @static
   */
  static getDeviceEntities(area, domain) {
    // Get the ID of the devices which are linked to the given area.
    const areaDeviceIds = this.#devices.filter(device => {
      return device.area_id === area.area_id;
    }).map(device => {

      return device.id;
    });

    // Return the entities of which all conditions below are met:
    // 1. Or/Neither the entity's linked device or/nor the entity itself is lined to the given area.
    // (See variable areaMatch)
    // 2. The entity's domain matches the given domain.
    // 3. The entity is not hidden and is not disabled.
    return this.#entities.filter(entity => {
      // Define the matching condition of the area_id.
      const areaMatch = area.area_id
          // The entity's linked device or the entity itself is linked to the given area.
          ? (areaDeviceIds.includes(entity.device_id) || entity.area_id === area.area_id)
          // Neither the entity's linked device, nor the entity itself is linked to any area.
          : (areaDeviceIds.includes(entity.device_id) && entity.area_id === area.area_id);
      return (
          areaMatch
          && entity.entity_id.startsWith(`${domain}.`)
          && entity.hidden_by == null && entity.disabled_by == null
      );
    });
  }

  /**
   * Get state entities, filtered by area and domain.
   *
   * The result excludes hidden and disabled entities.
   *
   * @param {areaEntity} area Area entity.
   * @param {string} domain Domain of the entity-id.
   *
   * @return {stateObject[]} Array of state entities.
   */
  static getStateEntities(area, domain) {
    const states = [];

    // Create a map for the hassEntities and devices {id: object} to improve lookup speed.
    /** @type {Object<string, hassEntity>} */
    const entityMap = Object.fromEntries(this.#entities.map(entity => [entity.entity_id, entity]));
    /** @type {Object<string, deviceEntity>} */
    const deviceMap = Object.fromEntries(this.#devices.map(device => [device.id, device]));

    // Get states whose entity-id starts with the given string.
    const stateEntities = Object.values(this.#hassStates).filter(
        state => state.entity_id.startsWith(`${domain}.`),
    );

    for (const state of stateEntities) {
      const hassEntity = entityMap[state.entity_id];
      const device     = deviceMap[hassEntity?.device_id];

      // TODO: Agree on conditions (https://github.com/AalianKhan/mushroom-strategy/pull/7#discussion_r1173032335)
      // Collect states of which any (whichever comes first) of the conditions below are met:
      // 1. The linked entity is linked to the given area.
      // 2. The entity is linked to a device, and the linked device is linked to the given area.
      if (
          (hassEntity?.area_id === area.area_id)
          || (device && device.area_id === area.area_id)
      ) {
        states.push(state);
      }

      /*
       // Collect states of which all conditions below are met:
       // 1. The linked entity is linked to the given area or isn't linked to any area.
       // 2. The linked device (if any) is assigned to the given area.
       if (
       (!hassEntity?.area_id || hassEntity.area_id === area.area_id)
       && (device && device.area_id === area.area_id)
       ) {
       states.push(state);
       }
       */
    }

    return states;
  }

  /**
   * Sanitize a classname.
   *
   * The name is sanitized nu upper-casing the first character of the name or after an underscore.
   * Underscored will be removed.
   *
   * @param {string} className Name of the class to sanitize.
   * @returns {string} The sanitized classname.
   */
  static sanitizeClassName(className) {
    className = className.charAt(0).toUpperCase() + className.slice(1);

    return className.replace(/([-_][a-z])/g, group =>
        group
            .toUpperCase()
            .replace("-", "")
            .replace("_", ""),
    );
  }
}

export {Helper};
