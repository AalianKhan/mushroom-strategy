/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Helper.js":
/*!***********************!*\
  !*** ./src/Helper.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Helper": () => (/* binding */ Helper)
/* harmony export */ });
/* harmony import */ var _optionDefaults__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./optionDefaults */ "./src/optionDefaults.js");


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
  static #areas = [];
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
  static debug = _optionDefaults__WEBPACK_IMPORTED_MODULE_0__.optionDefaults.debug;

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
    this.debug            = this.#strategyOptions.debug;

    // Setup required configuration entries.
    // TODO: Refactor to something smarter than repeating code for areas, views and domains.
    this.#strategyOptions.areas   = this.#strategyOptions.areas ?? {};
    this.#strategyOptions.views   = this.#strategyOptions.views ?? {};
    this.#strategyOptions.domains = this.#strategyOptions.domains ?? {};

    // Setup and add the undisclosed area if not hidden in the strategy options.
    if (!this.#strategyOptions.areas.undisclosed?.hidden) {
      this.#strategyOptions.areas.undisclosed = {
        ..._optionDefaults__WEBPACK_IMPORTED_MODULE_0__.optionDefaults.areas.undisclosed,
        ...this.#strategyOptions.areas.undisclosed,
      };

      // Make sure the area_id of the custom undisclosed area remains null.
      this.#strategyOptions.areas.undisclosed.area_id = null;

      this.#areas.push(this.#strategyOptions.areas.undisclosed);
    }

    // Merge custom areas of the strategy options into hass areas.
    this.#areas = Helper.areas.map(area => {
      return {...area, ...this.#strategyOptions.areas[area.area_id ?? "undisclosed"]};
    });

    // Sort hass areas by order first and then by name.
    this.#areas.sort((a, b) => {
      return (a.order ?? Infinity) - (b.order ?? Infinity) || a.name.localeCompare(b.name);
    });

    // Merge the views of the strategy options and the default views.
    for (const view of Object.keys(_optionDefaults__WEBPACK_IMPORTED_MODULE_0__.optionDefaults.views)) {
      this.#strategyOptions.views[view] = {
        ..._optionDefaults__WEBPACK_IMPORTED_MODULE_0__.optionDefaults.views[view],
        ...(this.#strategyOptions.views[view]),
      };
    }

    // Sort views of the strategy options by order first and then by title.
    this.#strategyOptions.views = Object.fromEntries(
        Object.entries(this.#strategyOptions.views).sort(([, a], [, b]) => {
          return (a.order ?? Infinity) - (b.order ?? Infinity) || a.title?.localeCompare(b.title);
        }),
    );

    // Merge the domains of the strategy options and the default domains.
    for (const domain of Object.keys(_optionDefaults__WEBPACK_IMPORTED_MODULE_0__.optionDefaults.domains)) {
      this.#strategyOptions.domains[domain] = {
        ..._optionDefaults__WEBPACK_IMPORTED_MODULE_0__.optionDefaults.domains[domain],
        ...(this.#strategyOptions.domains[domain]),
      };
    }

    // Sort domains of the strategy options by order first and then by title.
    this.#strategyOptions.domains = Object.fromEntries(
        Object.entries(this.#strategyOptions.domains).sort(([, a], [, b]) => {
          return (a.order ?? Infinity) - (b.order ?? Infinity) || a.title?.localeCompare(b.title);
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

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    // Get the ID of the devices which are linked to the given area.
    for (const area of this.#areas) {
      const areaDeviceIds = this.#devices.filter(device => {
        return device.area_id === area.area_id;
      }).map(device => {
        return device.id;
      });

      // Get the entities of which all conditions of the callback function are met. @see areaFilterCallback.
      const newStates = this.#entities.filter(
          this.#areaFilterCallback, {
            area: area,
            domain: domain,
            areaDeviceIds: areaDeviceIds,
          })
          .map(entity => `states['${entity.entity_id}']`);

      states.push(...newStates);
    }

    return `{% set entities = [${states}] %} {{ entities | selectattr('state','${operator}','${value}') | list | count }}`;
  }

  /**
   * Callback function for filtering entities.
   *
   * Entities of which all the conditions below are met are kept:
   * 1. Or/Neither the entity's linked device (if any) or/nor the entity itself is lined to the given area.
   *    (See variable areaMatch)
   * 2. The entity's domain matches the given domain.
   * 3. The entity is not hidden and is not disabled.
   *
   * @param {hassEntity} entity The current hass entity to evaluate.
   * @this {areaFilterContext}
   *
   * @return {boolean} True to keep the entity.
   * @static
   */
  static #areaFilterCallback(entity) {
    const areaMatch = this.area.area_id
        // Area is a hass entity; The entity's linked device or the entity itself is linked to the given area.
        ? this.areaDeviceIds.includes(entity.device_id) || entity.area_id === this.area.area_id
        // Undisclosed area; Neither the entity's linked device (if any), nor the entity itself is linked to any area.
        : (this.areaDeviceIds.includes(entity.device_id) || !entity.device_id) && !entity.area_id;

    return (
        areaMatch
        && entity.entity_id.startsWith(`${this.domain}.`)
        && entity.hidden_by == null && entity.disabled_by == null
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
   * @param {areaEntity} area Area entity.
   * @param {string} domain The domain of the entity-id.
   *
   * @return {hassEntity[]} Array of device entities.
   * @static
   */
  static getDeviceEntities(area, domain) {
    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    // Get the ID of the devices which are linked to the given area.
    const areaDeviceIds = this.#devices.filter(device => {
      return device.area_id === area.area_id;
    }).map(device => {

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
          /** @type hassEntity */
          return a.original_name?.localeCompare(b.original_name);
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
    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

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
   * Sanitize a classname.
   *
   * The name is sanitized by capitalizing the first character of the name or after an underscore.
   * Underscores are removed.
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

  /**
   * Get the keys of nested objects by its property value.
   *
   * @param {Object<Object>} object An object of objects.
   * @param {string|number} property The name of the property to evaluate.
   * @param {*} value The value which the property should match.
   *
   * @return {string[]|number[]} An array with keys.
   */
  static #getObjectKeysByPropertyValue(object, property, value) {
    const keys = [];

    for (const key of Object.keys(object)) {
      if (object[key][property] === value) {
        keys.push(key);
      }
    }

    return keys;
  }

  /**
   * Get the ids of the views which aren't set to hidden in the strategy options.
   *
   * @return {string[]} An array of view ids.
   */
  static getExposedViewIds() {
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
  static getExposedDomainIds() {
    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    return this.#getObjectKeysByPropertyValue(this.#strategyOptions.domains, "hidden", false);
  }
}




/***/ }),

/***/ "./src/cards/AbstractCard.js":
/*!***********************************!*\
  !*** ./src/cards/AbstractCard.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractCard": () => (/* binding */ AbstractCard)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.js");


/**
 * Abstract Card Class
 *
 * To create a new card, extend the new class with this one.
 *
 * @class
 * @abstract
 */
class AbstractCard {
  /**
   * Entity to create the card for.
   *
   * @type {hassEntity | areaEntity}
   */
  entity;

  /**
   * Options for creating a card.
   *
   * @type {abstractOptions}
   */
  options = {
    type: "custom:mushroom-entity-card",
    icon: "mdi:help-circle",
    double_tap_action: {
      action: null,
    },
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity | areaEntity} entity The hass entity to create a card for.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity) {
    if (this.constructor === AbstractCard) {
      throw new Error("Abstract classes can't be instantiated.");
    }

    if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }

    this.entity = entity;
  }

  /**
   * Merge the default options of this class and the custom options into the options of the parent class.
   *
   * @param {Object} [defaultOptions={}] Default options for the card.
   * @param {Object} [customOptions={}] Custom Options for the card.
   */
  mergeOptions(defaultOptions, customOptions) {
    this.options = {
      ...this.options,
      ...defaultOptions,
      ...customOptions,
    };

    try {
      this.options.double_tap_action.target.entity_id = this.entity.entity_id;
    } catch { }
  }

  /**
   * Get a card for an entity.
   *
   * @return {abstractOptions & Object} A card object.
   */
  getCard() {
    return {
      entity: this.entity.entity_id,
      ...this.options,
    };
  }
}




/***/ }),

/***/ "./src/cards/AreaCard.js":
/*!*******************************!*\
  !*** ./src/cards/AreaCard.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AreaCard": () => (/* binding */ AreaCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.js");


/**
 * Area Card Class
 *
 * Used to create a card for an entity of the area domain.
 *
 * @class
 * @extends AbstractCard
 */
class AreaCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {areaCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-template-card",
    primary: undefined,
    icon: "mdi:texture-box",
    icon_color: "blue",
    tap_action: {
      action: "navigate",
      navigation_path: undefined,
    },
    hold_action: {
      action: "none",
    }
  };

  /**
   * Class constructor.
   *
   * @param {areaEntity} area The area entity to create a card for.
   * @param {areaCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(area, options = {}) {
    super(area);
    this.#defaultOptions.primary                    = area.name;
    this.#defaultOptions.tap_action.navigation_path = area.area_id ?? area.name;

    this.mergeOptions(
        this.#defaultOptions,
        options,
    );

    // Override the area's name with a custom name, unless a custom primary text is set.
    if (!options.primary && options.name) {
      this.options.primary = options.name;
    }
  }
}




/***/ }),

/***/ "./src/cards/BinarySensorCard.js":
/*!***************************************!*\
  !*** ./src/cards/BinarySensorCard.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BinarySensorCard": () => (/* binding */ BinarySensorCard)
/* harmony export */ });
/* harmony import */ var _SensorCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SensorCard */ "./src/cards/SensorCard.js");


/**
 * Sensor Card Class
 *
 * Used to create a card for controlling an entity of the binary_sensor domain.
 *
 * @class
 * @extends SensorCard
 */
class BinarySensorCard extends _SensorCard__WEBPACK_IMPORTED_MODULE_0__.SensorCard {
  /**
   * Default options of the card.
   *
   * @type {sensorCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-entity-card",
    icon: "mdi:power-cycle",
    icon_color: "green",
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {sensorCardOptions} [options={}] Options for the card.
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




/***/ }),

/***/ "./src/cards/CameraCard.js":
/*!*********************************!*\
  !*** ./src/cards/CameraCard.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CameraCard": () => (/* binding */ CameraCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.js");


/**
 * Camera Card Class
 *
 * Used to create a card for controlling an entity of the camera domain.
 *
 * @class
 * @extends AbstractCard
 */
class CameraCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {cameraCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:webrtc-camera",
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




/***/ }),

/***/ "./src/cards/ClimateCard.js":
/*!**********************************!*\
  !*** ./src/cards/ClimateCard.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ClimateCard": () => (/* binding */ ClimateCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.js");


/**
 * Climate Card Class
 *
 * Used to create a card for controlling an entity of the climate domain.
 *
 * @class
 * @extends AbstractCard
 */
class ClimateCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {climateCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-climate-card",
    icon: undefined,
    hvac_modes: [
      "off",
      "cool",
      "heat",
      "fan_only",
    ],
    show_temperature_control: true,
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {climateCardOptions} [options={}] Options for the card.
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




/***/ }),

/***/ "./src/cards/CoverCard.js":
/*!********************************!*\
  !*** ./src/cards/CoverCard.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CoverCard": () => (/* binding */ CoverCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.js");


/**
 * Cover Card Class
 *
 * Used to create a card for controlling an entity of the cover domain.
 *
 * @class
 * @extends AbstractCard
 */
class CoverCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {coverCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-cover-card",
    icon: undefined,
    show_buttons_control: true,
    show_position_control: true,
    show_tilt_position_control: true,
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {coverCardOptions} [options={}] Options for the card.
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




/***/ }),

/***/ "./src/cards/FanCard.js":
/*!******************************!*\
  !*** ./src/cards/FanCard.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FanCard": () => (/* binding */ FanCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.js");


/**
 * Fan Card Class
 *
 * Used to create a card for controlling an entity of the fan domain.
 *
 * @class
 * @extends AbstractCard
 */
class FanCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {fanCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-fan-card",
    icon: undefined,
    show_percentage_control: true,
    show_oscillate_control: true,
    icon_animation: true,
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {fanCardOptions} [options={}] Options for the card.
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




/***/ }),

/***/ "./src/cards/LightCard.js":
/*!********************************!*\
  !*** ./src/cards/LightCard.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LightCard": () => (/* binding */ LightCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.js");


/**
 * Light Card Class
 *
 * Used to create a card for controlling an entity of the light domain.
 *
 * @class
 * @extends AbstractCard
 */
class LightCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
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




/***/ }),

/***/ "./src/cards/MediaPlayerCard.js":
/*!**************************************!*\
  !*** ./src/cards/MediaPlayerCard.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MediaPlayerCard": () => (/* binding */ MediaPlayerCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.js");


/**
 * Mediaplayer Card Class
 *
 * Used to create a card for controlling an entity of the media_player domain.
 *
 * @class
 * @extends AbstractCard
 */
class MediaPlayerCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {mediaPlayerCardOptions}
   * @private
   */
  #defaultOptions = {
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




/***/ }),

/***/ "./src/cards/MiscellaneousCard.js":
/*!****************************************!*\
  !*** ./src/cards/MiscellaneousCard.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MiscellaneousCard": () => (/* binding */ MiscellaneousCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.js");


/**
 * Miscellaneous Card Class
 *
 * Used to create a card an entity of any domain.
 *
 * @class
 * @extends AbstractCard
 */
class MiscellaneousCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {miscellaneousCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-entity-card",
    icon_color: "blue-grey",
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {miscellaneousCardOptions} [options={}] Options for the card.
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




/***/ }),

/***/ "./src/cards/PersonCard.js":
/*!*********************************!*\
  !*** ./src/cards/PersonCard.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PersonCard": () => (/* binding */ PersonCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.js");


/**
 * Person Card Class
 *
 * Used to create a card for an entity of the person domain.
 *
 * @class
 * @extends AbstractCard
 */
class PersonCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {personCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-person-card",
    layout: "vertical",
    primary_info: "none",
    secondary_info: "none",
    icon_type: "entity-picture",
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {personCardOptions} [options={}] Options for the card.
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




/***/ }),

/***/ "./src/cards/SensorCard.js":
/*!*********************************!*\
  !*** ./src/cards/SensorCard.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SensorCard": () => (/* binding */ SensorCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.js");


/**
 * Sensor Card Class
 *
 * Used to create a card for controlling an entity of the sensor domain.
 *
 * @class
 * @extends AbstractCard
 */
class SensorCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {sensorCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-entity-card",
    icon: "mdi:information",
    animate: true,
    line_color: "green",
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {sensorCardOptions} [options={}] Options for the card.
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




/***/ }),

/***/ "./src/cards/SwitchCard.js":
/*!*********************************!*\
  !*** ./src/cards/SwitchCard.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SwitchCard": () => (/* binding */ SwitchCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.js");


/**
 * Switch Card Class
 *
 * Used to create a card for controlling an entity of the switch domain.
 *
 * @class
 * @extends AbstractCard
 */
class SwitchCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {switchCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-entity-card",
    icon: undefined,
    tap_action: {
      action: "toggle",
    },
  };

  /**
   * Class constructor.
   *
   * @param {hassEntity} entity The hass entity to create a card for.
   * @param {switchCardOptions} [options={}] Options for the card.
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




/***/ }),

/***/ "./src/cards/TitleCard.js":
/*!********************************!*\
  !*** ./src/cards/TitleCard.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TitleCard": () => (/* binding */ TitleCard)
/* harmony export */ });
/**
 * Title Card class.
 *
 * Used for creating a Title Card.
 *
 * @class
 */
class TitleCard {
  /**
   * @type {string[]} An array of area ids.
   * @private
   */
  #areaIds;

  /**
   * @type {titleCardOptions}
   * @private
   */
  #options = {
    title: undefined,
    subtitle: undefined,
    showControls: true,
    iconOn: "mdi:power-on",
    iconOff: "mdi:power-off",
    onService: "none",
    offService: "none",
  };

  /**
   * Class constructor.
   *
   * @param {areaEntity[]} areas An array of area entities.
   * @param {titleCardOptions} options Title Card options.
   */
  constructor(areas, options = {}) {
    this.#areaIds = areas.map(area => area.area_id);
    this.#options = {
      ...this.#options,
      ...options,
    };
  }

  /**
   * Create a Title card.
   *
   * @return {Object} A Title card.
   */
  createCard() {
    /** @type {Object[]} */
    const cards = [
      {
        type: "custom:mushroom-title-card",
        title: this.#options.title,
        subtitle: this.#options.subtitle,
      },
    ];

    if (this.#options.showControls) {
      cards.push({
        type: "horizontal-stack",
        cards: [
          {
            type: "custom:mushroom-template-card",
            icon: this.#options.iconOff,
            layout: "vertical",
            icon_color: "red",
            tap_action: {
              action: "call-service",
              service: this.#options.offService,
              target: {
                area_id: this.#areaIds,
              },
              data: {},
            },
          },
          {
            type: "custom:mushroom-template-card",
            icon: this.#options.iconOn,
            layout: "vertical",
            icon_color: "amber",
            tap_action: {
              action: "call-service",
              service: this.#options.onService,
              target: {
                area_id: this.#areaIds,
              },
              data: {},
            },
          },
        ],
      });
    }

    return {
      type: "horizontal-stack",
      cards: cards,
    };
  }
}




/***/ }),

/***/ "./src/cards/typedefs.js":
/*!*******************************!*\
  !*** ./src/cards/typedefs.js ***!
  \*******************************/
/***/ (() => {

/**
 * @namespace typedefs.cards
 */

/**
 * @typedef {Object} abstractOptions
 * @property {string} [type] The type of the card.
 * @property {string} [icon] Icon of the card.
 * @property {Object} [double_tap_action] Home assistant action to perform on double_tap.
 */

/**
 * @typedef {Object} titleCardOptions Title Card options.
 * @property {string} [title] Title to render. May contain templates.
 * @property {string} [subtitle] Subtitle to render. May contain templates.
 * @property {boolean} [showControls=true] False to hide controls.
 * @property {string} [iconOn] Icon to show for switching entities from off state.
 * @property {string} [iconOff] Icon to show for switching entities to off state.
 * @property {string} [onService=none] Service to call for switching entities from off state.
 * @property {string} [offService=none] Service to call for switching entities to off state.
 * @memberOf typedefs.cards
 */

/**
 * @typedef {abstractOptions & Object} lightCardOptions Light Card options.
 * @property {boolean} [show_brightness_control=true]  Show a slider to control brightness
 * @property {boolean} [show_color_control=true] Show a slider to control RGB color
 * @property {boolean} [use_light_color=true] Colorize the icon and slider according light temperature or color
 * @property {{double_tap_action: lightDoubleTapAction}} [action] Home assistant action to perform on double_tap
 * @memberOf typedefs.cards
 */

/**
 * @typedef {Object} lightDoubleTapAction Home assistant action to perform on double_tap.
 * @property {{entity_id: string}} target The target entity id.
 * @property {"call-service"} action Calls a hass service.
 * @property {"light.turn_on"} service The hass service to call
 * @property {{rgb_color: [255, 255, 255]}} data The data payload for the service.
 * @memberOf typedefs.cards
 */

/**
 * @typedef {abstractOptions & Object} coverCardOptions Cover Card options.
 * @property {boolean} [show_buttons_control=true] Show buttons to open, close and stop cover.
 * @property {boolean} [show_position_control=true] Show a slider to control position of the cover.
 * @property {boolean} [show_tilt_position_control=true] Show a slider to control tilt position of the cover.
 * @memberOf typedefs.cards
 */

/**
 * @typedef {abstractOptions & Object} fanCardOptions Fan Card options.
 * @property {boolean} [show_percentage_control=true] Show a slider to control speed.
 * @property {boolean} [show_oscillate_control=true] Show a button to control oscillation.
 * @property {boolean} [icon_animation=true] Animate the icon when fan is on.
 * @memberOf typedefs.cards
 */

/**
 * @typedef {abstractOptions & Object} switchCardOptions Switch Card options.
 * @property {{tap_action: switchTapAction}} [action] Home assistant action to perform on tap.
 * @memberOf typedefs.cards
 */

/**
 * @typedef {Object} switchTapAction Home assistant action to perform on tap.
 * @property {"toggle"} action Toggles a hass entity.
 * @memberOf typedefs.cards
 */

/**
 * @typedef {abstractOptions & Object} climateCardOptions Climate Card options.
 * @property {["off", "cool", "heat", "fan_only"]} [hvac_modes] Show buttons to control target temperature.
 * @property {boolean} [show_temperature_control=true] Show buttons to control target temperature.
 * @memberOf typedefs.cards
 */

/**
 * @typedef {abstractOptions} cameraCardOptions Camera Card options.
 * @memberOf typedefs.cards
 */

/**
 * @typedef {abstractOptions & Object} personCardOptions Person Card options.
 * @property {string} [layout] Layout of the card. Vertical, horizontal, and default layouts are supported.
 * @property {("name" | "state" | "last-changed" | "last-updated" | "none")} [primary_info=name] Info to show as
 *     primary info.
 * @property {("name" | "state" | "last-changed" | "last-updated" | "none")} [secondary_info=sate] Info to show as
 *     secondary info.
 * @property {("icon" | "entity-picture" | "none")} [icon_type]=icon Type of icon to display.
 * @memberOf typedefs.cards
 */

/**
 * @typedef {abstractOptions & Object} areaCardOptions Area Card options.
 * @property {string} [name] The name of the area
 * @property {string} [icon] Icon to render. May contain templates.
 * @property {string} [icon_color] Icon color to render. May contain templates.
 * @property {string} [primary] Primary info to render. May contain templates.
 * @property {areaTapAction} [tap_action] Home assistant action to perform on tap.
 * @memberOf typedefs.cards
 */

/**
 * @typedef {Object} areaTapAction Home assistant action to perform on tap.
 * @property {"navigate"} action Toggles a hass entity.
 * @property {string} navigation_path The id of the area to navigate to.
 * @memberOf typedefs.cards
 */

/**
 * @typedef {abstractOptions & Object} mediaPlayerCardOptions Media Player Card options.
 * @property {boolean} [use_media_info=true] Use media info instead of name, state, and icon when a media is playing
 * @property {string[]} [media_controls="on_off", "play_pause_stop"] List of controls to display
 *                                                                   (on_off, shuffle, previous, play_pause_stop, next,
 *                                                                   repeat)
 * @property {boolean} [show_volume_level=true] Show volume level next to media state when media is playing
 * @property {string[]} [volume_controls="volume_mute", "volume_set", "volume_buttons"] List of controls to display
 *                                                                                      (volume_mute, volume_set,
 *                                                                                      volume_buttons)
 * @memberOf typedefs.cards
 */

/**
 * @typedef {abstractOptions & Object} sensorCardOptions Sensor Card options.
 * @property {string} [icon_color=green] Custom color for icon when entity is state is active.
 * @property {boolean} [animate=true] Add a reveal animation to the graph.
 * @property {string} [line_color=green] Set a custom color for the graph line.
 *                                       Provide a list of colors for multiple graph entries.
 * @memberOf typedefs.cards
 */

/**
 * @typedef {abstractOptions & Object} miscellaneousCardOptions Miscellaneous Card options.
 * @property {string} [icon_color=blue-grey] Custom color for icon when entity is state is active.
 * @memberOf typedefs.cards
 */



/***/ }),

/***/ "./src/cards lazy recursive ^\\.\\/.*$":
/*!***************************************************!*\
  !*** ./src/cards/ lazy ^\.\/.*$ namespace object ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./AbstractCard": [
		"./src/cards/AbstractCard.js",
		9
	],
	"./AbstractCard.js": [
		"./src/cards/AbstractCard.js",
		9
	],
	"./AreaCard": [
		"./src/cards/AreaCard.js",
		9,
		"main"
	],
	"./AreaCard.js": [
		"./src/cards/AreaCard.js",
		9,
		"main"
	],
	"./BinarySensorCard": [
		"./src/cards/BinarySensorCard.js",
		9,
		"main"
	],
	"./BinarySensorCard.js": [
		"./src/cards/BinarySensorCard.js",
		9,
		"main"
	],
	"./CameraCard": [
		"./src/cards/CameraCard.js",
		9,
		"main"
	],
	"./CameraCard.js": [
		"./src/cards/CameraCard.js",
		9,
		"main"
	],
	"./ClimateCard": [
		"./src/cards/ClimateCard.js",
		9,
		"main"
	],
	"./ClimateCard.js": [
		"./src/cards/ClimateCard.js",
		9,
		"main"
	],
	"./CoverCard": [
		"./src/cards/CoverCard.js",
		9,
		"main"
	],
	"./CoverCard.js": [
		"./src/cards/CoverCard.js",
		9,
		"main"
	],
	"./FanCard": [
		"./src/cards/FanCard.js",
		9,
		"main"
	],
	"./FanCard.js": [
		"./src/cards/FanCard.js",
		9,
		"main"
	],
	"./LightCard": [
		"./src/cards/LightCard.js",
		9,
		"main"
	],
	"./LightCard.js": [
		"./src/cards/LightCard.js",
		9,
		"main"
	],
	"./MediaPlayerCard": [
		"./src/cards/MediaPlayerCard.js",
		9,
		"main"
	],
	"./MediaPlayerCard.js": [
		"./src/cards/MediaPlayerCard.js",
		9,
		"main"
	],
	"./MiscellaneousCard": [
		"./src/cards/MiscellaneousCard.js",
		9,
		"main"
	],
	"./MiscellaneousCard.js": [
		"./src/cards/MiscellaneousCard.js",
		9,
		"main"
	],
	"./PersonCard": [
		"./src/cards/PersonCard.js",
		9,
		"main"
	],
	"./PersonCard.js": [
		"./src/cards/PersonCard.js",
		9,
		"main"
	],
	"./SensorCard": [
		"./src/cards/SensorCard.js",
		9
	],
	"./SensorCard.js": [
		"./src/cards/SensorCard.js",
		9
	],
	"./SwitchCard": [
		"./src/cards/SwitchCard.js",
		9,
		"main"
	],
	"./SwitchCard.js": [
		"./src/cards/SwitchCard.js",
		9,
		"main"
	],
	"./TitleCard": [
		"./src/cards/TitleCard.js",
		9
	],
	"./TitleCard.js": [
		"./src/cards/TitleCard.js",
		9
	],
	"./typedefs": [
		"./src/cards/typedefs.js",
		7,
		"main"
	],
	"./typedefs.js": [
		"./src/cards/typedefs.js",
		7,
		"main"
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(() => {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return Promise.all(ids.slice(2).map(__webpack_require__.e)).then(() => {
		return __webpack_require__.t(id, ids[1] | 16)
	});
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = "./src/cards lazy recursive ^\\.\\/.*$";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "./src/chips/ClimateChip.js":
/*!**********************************!*\
  !*** ./src/chips/ClimateChip.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ClimateChip": () => (/* binding */ ClimateChip)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.js");


class ClimateChip {
  #areaIds;
  #options = {
    // No default options.
  };

  constructor(areaIds, options = {}) {
    if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }

    this.#areaIds = areaIds;
    this.#options = {
      ...this.#options,
      ...options,
    };
  }

  getChip() {
    return {
      type: "template",
      icon: "mdi:thermostat",
      icon_color: "orange",
      content: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("climate", "ne", "off"),
      tap_action: {
        action: "navigate",
        navigation_path: "thermostats",
      },
    };
  }
}




/***/ }),

/***/ "./src/chips/CoverChip.js":
/*!********************************!*\
  !*** ./src/chips/CoverChip.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CoverChip": () => (/* binding */ CoverChip)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.js");


class CoverChip {
  #areaIds;
  #options = {
    // No default options.
  };

  constructor(areaIds, options = {}) {
    if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }

    this.#areaIds = areaIds;
    this.#options = {
      ...this.#options,
      ...options,
    };
  }

  getChip() {
    return {
      type: "template",
      icon: "mdi:window-open",
      icon_color: "cyan",
      content: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("cover", "eq", "open"),
      tap_action: {
        action: "navigate",
        navigation_path: "covers",
      },
    };
  }
}




/***/ }),

/***/ "./src/chips/FanChip.js":
/*!******************************!*\
  !*** ./src/chips/FanChip.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FanChip": () => (/* binding */ FanChip)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.js");


class FanChip {
  #areaIds;
  #options = {
    // No default options.
  };

  constructor(areaIds, options = {}) {
    if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }

    this.#areaIds = areaIds;
    this.#options = {
      ...this.#options,
      ...options,
    };
  }

  getChip() {
    return {
      type: "template",
      icon: "mdi:fan",
      icon_color: "green",
      content: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("fan", "eq", "on"),
      tap_action: {
        action: "call-service",
        service: "fan.turn_off",
        target: {
          area_id: this.#areaIds,
        },
        data: {},
      },
      hold_action: {
        action: "navigate",
        navigation_path: "fans",
      },
    };
  }
}




/***/ }),

/***/ "./src/chips/LightChip.js":
/*!********************************!*\
  !*** ./src/chips/LightChip.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LightChip": () => (/* binding */ LightChip)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.js");


class LightChip {
  #areaIds;
  #options = {
    // No default options.
  };

  constructor(areaIds, options = {}) {
    if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }

    this.#areaIds = areaIds;
    this.#options = {
      ...this.#options,
      ...options,
    };
  }

  getChip() {
    return {
      type: "template",
      icon: "mdi:lightbulb-group",
      icon_color: "amber",
      content: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("light", "eq", "on"),
      tap_action: {
        action: "call-service",
        service: "light.turn_off",
        target: {
          area_id: this.#areaIds,
        },
        data: {},
      },
      hold_action: {
        action: "navigate",
        navigation_path: "lights",
      },
    };
  }
}




/***/ }),

/***/ "./src/chips/SwitchChip.js":
/*!*********************************!*\
  !*** ./src/chips/SwitchChip.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SwitchChip": () => (/* binding */ SwitchChip)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.js");


class SwitchChip {
  #areaIds;
  #options = {
    // No default options.
  };

  constructor(areaIds, options = {}) {
    if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }

    this.#areaIds = areaIds;
    this.#options = {
      ...this.#options,
      ...options,
    };
  }

  getChip() {
    return {
      type: "template",
      icon: "mdi:dip-switch",
      icon_color: "blue",
      content: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("switch", "eq", "on"),
      tap_action: {
        action: "call-service",
        service: "switch.turn_off",
        target: {
          area_id: this.#areaIds,
        },
        data: {},
      },
      hold_action: {
        action: "navigate",
        navigation_path: "switches",
      },
    };
  }
}




/***/ }),

/***/ "./src/chips/WeatherChip.js":
/*!**********************************!*\
  !*** ./src/chips/WeatherChip.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "WeatherChip": () => (/* binding */ WeatherChip)
/* harmony export */ });
class WeatherChip {
  #entityId;
  #options = {
    show_temperature: true,
    show_conditions: true,
  };

  constructor(entityId, options = {}) {
    this.#entityId = entityId;
    this.#options  = {
      ...this.#options,
      ...options,
    };
  }

  getChip() {
    return {
      type: "weather",
      entity: this.#entityId,
      ...this.#options,
    };
  }
}




/***/ }),

/***/ "./src/chips lazy recursive ^\\.\\/.*$":
/*!***************************************************!*\
  !*** ./src/chips/ lazy ^\.\/.*$ namespace object ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./ClimateChip": [
		"./src/chips/ClimateChip.js",
		"main"
	],
	"./ClimateChip.js": [
		"./src/chips/ClimateChip.js",
		"main"
	],
	"./CoverChip": [
		"./src/chips/CoverChip.js",
		"main"
	],
	"./CoverChip.js": [
		"./src/chips/CoverChip.js",
		"main"
	],
	"./FanChip": [
		"./src/chips/FanChip.js",
		"main"
	],
	"./FanChip.js": [
		"./src/chips/FanChip.js",
		"main"
	],
	"./LightChip": [
		"./src/chips/LightChip.js",
		"main"
	],
	"./LightChip.js": [
		"./src/chips/LightChip.js",
		"main"
	],
	"./SwitchChip": [
		"./src/chips/SwitchChip.js",
		"main"
	],
	"./SwitchChip.js": [
		"./src/chips/SwitchChip.js",
		"main"
	],
	"./WeatherChip": [
		"./src/chips/WeatherChip.js",
		"main"
	],
	"./WeatherChip.js": [
		"./src/chips/WeatherChip.js",
		"main"
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(() => {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return __webpack_require__.e(ids[1]).then(() => {
		return __webpack_require__(id);
	});
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = "./src/chips lazy recursive ^\\.\\/.*$";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "./src/optionDefaults.js":
/*!*******************************!*\
  !*** ./src/optionDefaults.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "optionDefaults": () => (/* binding */ optionDefaults)
/* harmony export */ });
const optionDefaults = {
  debug: false,
  views: {
    home: {
      order: 1,
      hidden: false,
    },
    light: {
      order: 2,
      hidden: false,
    },
    fan: {
      order: 3,
      hidden: false,
    },
    cover: {
      order: 4,
      hidden: false,
    },
    switch: {
      order: 5,
      hidden: false,
    },
    climate: {
      order: 6,
      hidden: false,
    },
    camera: {
      order: 7,
      hidden: false,
    }
  },
  areas: {
    undisclosed: {
      aliases: [],
      area_id: null,
      name: "Undisclosed",
      picture: null,
      hidden: false,
    }
  },
  domains: {
    default: {
      title: "Miscellaneous",
      showControls: false,
      hidden: false,
    },
    light: {
      title: "Lights",
      showControls: true,
      iconOn: "mdi:lightbulb",
      iconOff: "mdi:lightbulb-off",
      onService: "light.turn_on",
      offService: "light.turn_off",
      hidden: false,
    },
    fan: {
      title: "Fans",
      showControls: true,
      iconOn: "mdi:fan",
      iconOff: "mdi:fan-off",
      onService: "fan.turn_on",
      offService: "fan.turn_off",
      hidden: false,
    },
    cover: {
      title: "Covers",
      showControls: true,
      iconOn: "mdi:arrow-up",
      iconOff: "mdi:arrow-down",
      onService: "cover.open_cover",
      offService: "cover.close_cover",
      hidden: false,
    },
    switch: {
      title: "Switches",
      showControls: true,
      iconOn: "mdi:power-plug",
      iconOff: "mdi:power-plug-off",
      onService: "switch.turn_on",
      offService: "switch.turn_off",
      hidden: false,
    },
    camera: {
      title: "Cameras",
      showControls: false,
      hidden: false,
    },
    climate: {
      title: "Climates",
      showControls: false,
      hidden: false,
    },
    media_player: {
      title: "Media Players",
      showControls: false,
      hidden: false,
    },
    sensor: {
      title: "Sensors",
      showControls: false,
      hidden: false,
    },
    binary_sensor: {
      title: "Binary Sensors",
      showControls: false,
      hidden: false,
    },
  }
}


/***/ }),

/***/ "./src/views/AbstractView.js":
/*!***********************************!*\
  !*** ./src/views/AbstractView.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractView": () => (/* binding */ AbstractView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.js");
/* harmony import */ var _cards_TitleCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/TitleCard */ "./src/cards/TitleCard.js");



/**
 * Abstract View Class.
 *
 * To create a new view, extend the new class with this one.
 *
 * @class
 * @abstract
 */
class AbstractView {
  /**
   * Options for creating a view.
   *
   * @type {abstractOptions}
   */
  options = {
    title: null,
    path: null,
    icon: "mdi:view-dashboard",
    subview: false,
  };

  /**
   * A card to switch all entities in the view.
   *
   * @type {Object}
   */
  viewTitleCard;

  /**
   * Class constructor.
   *
   * @throws {Error} If trying to instantiate this class.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor() {
    if (this.constructor === AbstractView) {
      throw new Error("Abstract classes can't be instantiated.");
    }

    if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }
  }

  /**
   * Merge the default options of this class and the custom options into the options of the parent class.
   *
   * @param {Object} [defaultOptions={}] Default options for the card.
   * @param {Object} [customOptions={}] Custom Options for the card.
   */
  mergeOptions(defaultOptions, customOptions) {
    this.options = {
      ...defaultOptions,
      ...customOptions,
    };
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Object[] | Promise} An array of card objects.
   */
  createViewCards() {
    /** @type Object[] */
    const viewCards      = [this.viewTitleCard];

    // Create cards for each area.
    for (const area of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas) {
      const areaCards = [];
      const entities  = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getDeviceEntities(area, this["domain"]);
      const className = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(this["domain"] + "Card");

      __webpack_require__("./src/cards lazy recursive ^\\.\\/.*$")(`./${className}`).then(cardModule => {
        if (entities.length) {
          // Create a Title card for the current area.
          areaCards.push(
              new _cards_TitleCard__WEBPACK_IMPORTED_MODULE_1__.TitleCard([area], {
                title: area.name,
                ...this.options["titleCard"],
              }).createCard(),
          );

          // Create a card for each domain-entity of the current area.
          for (const entity of entities) {
              const card = (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.entity_config ?? []).find(
                  config => config.entity === entity.entity_id,
              ) ?? new cardModule[className](entity).getCard();

            areaCards.push(card);
          }
        }
      });

      viewCards.push({
        type: "vertical-stack",
        cards: areaCards,
      });
    }

    return viewCards;
  }

  /**
   * Get a view object.
   *
   * The view includes the cards which are created by method createViewCards().
   *
   * @returns {viewOptions & {cards: Object[]}} The view object.
   */
  async getView() {
    return {
      ...this.options,
      cards: await this.createViewCards(),
    };
  }
}




/***/ }),

/***/ "./src/views/CameraView.js":
/*!*********************************!*\
  !*** ./src/views/CameraView.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CameraView": () => (/* binding */ CameraView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.js");
/* harmony import */ var _cards_TitleCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/TitleCard */ "./src/cards/TitleCard.js");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.js");




/**
 * Camera View Class.
 *
 * Used to create a view for entities of the camera domain.
 *
 * @class CameraView
 * @extends AbstractView
 */
class CameraView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
  /**
   * Domain of the view's entities.
   * @type {string}
   */
  #domain = "camera";

  /**
   * Default options for the view.
   *
   * @type {viewOptions}
   * @private
   */
  #defaultOptions = {
    title: "Cameras",
    path: "cameras",
    icon: "mdi:cctv",
    subview: false,
    titleCard: {
      showControls: false,
    },
  };

  /**
   * Options for the view's title card.
   *
   * @type {viewTitleCardOptions}
   */
  #viewTitleCardOption = {
    title: "All Cameras",
    ...this.options["titleCard"],
  };

  /**
   * Class constructor.
   *
   * @param {viewOptions} [options={}] Options for the view.
   */
  constructor(options = {}) {
    super();
    this.mergeOptions(
        this.#defaultOptions,
        options,
    );

    // Create a title card to switch all entities of the domain.
    this.viewTitleCard = new _cards_TitleCard__WEBPACK_IMPORTED_MODULE_1__.TitleCard(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas, {
      ...this.#viewTitleCardOption,
      ...this.options["titleCard"],
    }).createCard();
  }

  get domain() {
    return this.#domain;
  }
}




/***/ }),

/***/ "./src/views/ClimateView.js":
/*!**********************************!*\
  !*** ./src/views/ClimateView.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ClimateView": () => (/* binding */ ClimateView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.js");
/* harmony import */ var _cards_TitleCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/TitleCard */ "./src/cards/TitleCard.js");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.js");




/**
 * Climate View Class.
 *
 * Used to create a view for entities of the climate domain.
 *
 * @class ClimateView
 * @extends AbstractView
 */
class ClimateView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
  /**
   * Domain of the view's entities.
   * @type {string}
   */
  #domain = "climate";

  /**
   * Default options for the view.
   *
   * @type {viewOptions}
   * @private
   */
  #defaultOptions = {
    title: "Climates",
    path: "climates",
    icon: "mdi:thermostat",
    subview: false,
    titleCard: {
      showControls: false,
    },
  };

  /**
   * Options for the view's title card.
   *
   * @type {viewTitleCardOptions}
   */
  #viewTitleCardOption = {
    title: "All Climates",
    subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(this.domain, "ne", "off") + " climates on",
    ...this.options["titleCard"],
  };

  /**
   * Class constructor.
   *
   * @param {viewOptions} [options={}] Options for the view.
   */
  constructor(options = {}) {
    super();
    this.mergeOptions(
        this.#defaultOptions,
        options,
    );

    // Create a title card to switch all entities of the domain.
    this.viewTitleCard = new _cards_TitleCard__WEBPACK_IMPORTED_MODULE_1__.TitleCard(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas, {
      ...this.#viewTitleCardOption,
      ...this.options["titleCard"],
    }).createCard();
  }

  get domain() {
    return this.#domain;
  }
}




/***/ }),

/***/ "./src/views/CoverView.js":
/*!********************************!*\
  !*** ./src/views/CoverView.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CoverView": () => (/* binding */ CoverView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.js");
/* harmony import */ var _cards_TitleCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/TitleCard */ "./src/cards/TitleCard.js");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.js");




/**
 * Cover View Class.
 *
 * Used to create a view for entities of the cover domain.
 *
 * @class CoverView
 * @extends AbstractView
 */
class CoverView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
  /**
   * Domain of the view's entities.
   * @type {string}
   */
  #domain = "cover";

  /**
   * Default options for the view.
   *
   * @type {viewOptions}
   * @private
   */
  #defaultOptions = {
    title: "Covers",
    path: "covers",
    icon: "mdi:window-open",
    subview: false,
    titleCard: {
      iconOn: "mdi:arrow-up",
      iconOff: "mdi:arrow-down",
      onService: "cover.open_cover",
      offService: "cover.close_cover",
    },
  };

  /**
   * Options for the view's title card.
   *
   * @type {viewTitleCardOptions}
   */
  #viewTitleCardOption = {
    title: "All Covers",
    subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(this.domain, "eq", "open") + " covers open",
  };

  /**
   * Class constructor.
   *
   * @param {viewOptions} [options={}] Options for the view.
   */
  constructor(options = {}) {
    super();
    this.mergeOptions(
        this.#defaultOptions,
        options,
    );

    // Create a title card to switch all entities of the domain.
    this.viewTitleCard = new _cards_TitleCard__WEBPACK_IMPORTED_MODULE_1__.TitleCard(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas, {
      ...this.#viewTitleCardOption,
      ...this.options["titleCard"],
    }).createCard();
  }

  get domain() {
    return this.#domain;
  }
}




/***/ }),

/***/ "./src/views/FanView.js":
/*!******************************!*\
  !*** ./src/views/FanView.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FanView": () => (/* binding */ FanView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.js");
/* harmony import */ var _cards_TitleCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/TitleCard */ "./src/cards/TitleCard.js");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.js");




/**
 * Fan View Class.
 *
 * Used to create a view for entities of the fan domain.
 *
 * @class FanView
 * @extends AbstractView
 */
class FanView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
  /**
   * Domain of the view's entities.
   * @type {string}
   */
  #domain = "fan";

  /**
   * Default options for the view.
   *
   * @type {viewOptions}
   * @private
   */
  #defaultOptions = {
    title: "Fans",
    path: "fans",
    icon: "mdi:fan",
    subview: false,
    titleCard: {
      iconOn: "mdi:fan",
      iconOff: "mdi:fan-off",
      onService: "fan.turn_on",
      offService: "fan.turn_off",
    },
  };

  /**
   * Options for the view's title card.
   *
   * @type {viewTitleCardOptions}
   */
  #viewTitleCardOption = {
    title: "All Fans",
    subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(this.domain, "eq", "on") + " fans on",
  };

  /**
   * Class constructor.
   *
   * @param {viewOptions} [options={}] Options for the view.
   */
  constructor(options = {}) {
    super();
    this.mergeOptions(
        this.#defaultOptions,
        options,
    );

    // Create a title card to switch all entities of the domain.
    this.viewTitleCard = new _cards_TitleCard__WEBPACK_IMPORTED_MODULE_1__.TitleCard(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas, {
      ...this.#viewTitleCardOption,
      ...this.options["titleCard"],
    }).createCard();
  }

  get domain() {
    return this.#domain;
  }
}




/***/ }),

/***/ "./src/views/HomeView.js":
/*!*******************************!*\
  !*** ./src/views/HomeView.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HomeView": () => (/* binding */ HomeView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.js");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.js");



/**
 * Home View Class.
 *
 * Used to create a Home view.
 *
 * @class HomeView
 * @extends AbstractView
 */
class HomeView extends _AbstractView__WEBPACK_IMPORTED_MODULE_1__.AbstractView {
  /**
   * Default options for the view.
   *
   * @type {viewOptions}
   * @private
   */
  #defaultOptions = {
    title: "Home",
    path: "home",
    subview: false,
  };

  /**
   * Class constructor.
   *
   * @param {viewOptions} [options={}] Options for the view.
   */
  constructor(options = {}) {
    super();
    this.mergeOptions(
        this.#defaultOptions,
        options,
    );
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise} A promise of a card object array.
   * @override
   */
  async createViewCards() {
    return await Promise.all([
      this.#createChips(),
      this.#createPersonCards(),
      this.#createAreaCards(),
    ]).then(([chips, personCards, areaCards]) => {
      const options       = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions;
      const homeViewCards = [
        {
          type: "custom:mushroom-chips-card",
          alignment: "center",
          chips: chips,
        },
        {
          type: "horizontal-stack",
          cards: personCards,
        },
        {
          type: "custom:mushroom-template-card",
          primary: "{% set time = now().hour %} {% if (time >= 18) %} Good Evening, {{user}}! {% elif (time >= 12) %} Good Afternoon, {{user}}! {% elif (time >= 5) %} Good Morning, {{user}}! {% else %} Hello, {{user}}! {% endif %}",
          icon: "mdi:hand-wave",
          icon_color: "orange",
          tap_action: {
            action: "none",
          },
          double_tap_action: {
            action: "none",
          },
          hold_action: {
            action: "none",
          },
        },
      ];

      // Add quick access cards.
      if (options.quick_access_cards) {
        homeViewCards.push(...options.quick_access_cards);
      }

      // Add area cards.
      homeViewCards.push({
            type: "custom:mushroom-title-card",
            title: "Areas",
          },
          {
            type: "vertical-stack",
            cards: areaCards,
          });

      // Add custom cards.
      if (options.extra_cards) {
        homeViewCards.push(...options.extra_cards);
      }

      return homeViewCards;
    });
  }

  /**
   * Create the chips to include in the view.
   *
   * @return {Object[]} A chip object array.
   */
  async #createChips() {
    const chips           = [];
    const chipOptions     = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.chips;

    // TODO: Get domains from config (Currently strategy.options.views).
    const exposed_domains = ["light", "fan", "cover", "switch", "climate"];
    // Create a list of area-ids, used for switching all devices via chips
    const areaIds         = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas.map(area => area.area_id);

    let chipModule;

    // Weather chip.
    const weatherEntityId = chipOptions?.weather_entity ?? _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities.find(
        entity => entity.entity_id.startsWith("weather.") && entity.disabled_by == null && entity.hidden_by == null,
    ).entity_id;

    if (weatherEntityId) {
      try {
        chipModule        = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../chips/WeatherChip */ "./src/chips/WeatherChip.js"));
        const weatherChip = new chipModule.WeatherChip(weatherEntityId);
        chips.push(weatherChip.getChip());
      } catch (e) {
        console.error(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.debug ? e : "An error occurred while creating the weather chip!");
      }
    }

    // Numeric chips.
    for (let chipType of exposed_domains) {
      if (chipOptions?.[`${chipType}_count`] ?? true) {
        const className = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(chipType + "Chip");
        try {
          chipModule = await __webpack_require__("./src/chips lazy recursive ^\\.\\/.*$")(`./${className}`);
          const chip = new chipModule[className](areaIds);
          chips.push(chip.getChip());
        } catch (e) {
          console.error(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.debug ? e : `An error occurred while creating the ${chipType} chip!`);
        }
      }
    }

    // Extra chips.
    if (chipOptions?.extra_chips) {
      chips.push(...chipOptions.extra_chips);
    }

    return chips;
  }

  /**
   * Create the person cards to include in the view.
   *
   * @return {Object[]} A card object array.
   */
  #createPersonCards() {
    const cards = [];

    Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../cards/PersonCard */ "./src/cards/PersonCard.js")).then(personModule => {
      for (const person of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities.filter(entity => entity.entity_id.startsWith("person."))) {
        cards.push(new personModule.PersonCard(person).getCard());
      }
    });

    return cards;
  }

  /**
   * Create the area cards to include in the view.
   *
   * Area cards are grouped into two areas per row.
   *
   * @return {Object[]} A card object array.
   */
  #createAreaCards() {
    const groupedCards = [];

    Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../cards/AreaCard */ "./src/cards/AreaCard.js")).then(areaModule => {
      const areaCards = [];

      for (const area of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas) {
        if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas[area.area_id]?.hidden) {
          areaCards.push(
              new areaModule.AreaCard(area, _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas[area.area_id ?? "undisclosed"]).getCard());
        }
      }

      // Horizontally group every two area cards.
      for (let i = 0; i < areaCards.length; i += 2) {
        groupedCards.push({
          type: "horizontal-stack",
          cards: areaCards.slice(i, i + 2),
        });
      }
    });

    return groupedCards;
  }
}




/***/ }),

/***/ "./src/views/LightView.js":
/*!********************************!*\
  !*** ./src/views/LightView.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LightView": () => (/* binding */ LightView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.js");
/* harmony import */ var _cards_TitleCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/TitleCard */ "./src/cards/TitleCard.js");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.js");




/**
 * Light View Class.
 *
 * Used to create a view for entities of the light domain.
 *
 * @class LightView
 * @extends AbstractView
 */
class LightView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
  /**
   * Domain of the view's entities.
   * @type {string}
   */
  #domain = "light";

  /**
   * Default options for the view.
   *
   * @type {viewOptions}
   * @private
   */
  #defaultOptions = {
    title: "Lights",
    path: "lights",
    icon: "mdi:lightbulb-group",
    subview: false,
    titleCard: {
      iconOn: "mdi:lightbulb",
      iconOff: "mdi:lightbulb-off",
      onService: "light.turn_on",
      offService: "light.turn_off",
    },
  };

  /**
   * Options for the view's title card.
   *
   * @type {viewTitleCardOptions}
   */
  #viewTitleCardOption = {
    title: "All Lights",
    subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(this.domain, "eq", "on") + " lights on",
  };

  /**
   * Class constructor.
   *
   * @param {viewOptions} [options={}] Options for the view.
   */
  constructor(options = {}) {
    super();
    this.mergeOptions(
        this.#defaultOptions,
        options,
    );

    // Create a title card to switch all entities of the domain.
    this.viewTitleCard = new _cards_TitleCard__WEBPACK_IMPORTED_MODULE_1__.TitleCard(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas, {
      ...this.#viewTitleCardOption,
      ...this.options["titleCard"],
    }).createCard();
  }

  get domain() {
    return this.#domain;
  }
}




/***/ }),

/***/ "./src/views/SwitchView.js":
/*!*********************************!*\
  !*** ./src/views/SwitchView.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SwitchView": () => (/* binding */ SwitchView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.js");
/* harmony import */ var _cards_TitleCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/TitleCard */ "./src/cards/TitleCard.js");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.js");




/**
 * Switch View Class.
 *
 * Used to create a view for entities of the switch domain.
 *
 * @class SwitchView
 * @extends AbstractView
 */
class SwitchView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
  /**
   * Domain of the view's entities.
   * @type {string}
   */
  #domain = "switch";

  /**
   * Default options for the view.
   *
   * @type {viewOptions}
   * @private
   */
  #defaultOptions = {
    title: "Switches",
    path: "switches",
    icon: "mdi:dip-switch",
    subview: false,
    titleCard: {
      iconOn: "mdi:power-plug",
      iconOff: "mdi:power-plug-off",
      onService: "switch.turn_on",
      offService: "switch.turn_off",
    },
  };

  /**
   * Options for the view's title card.
   *
   * @type {viewTitleCardOptions}
   */
  #viewTitleCardOption = {
    title: "All Switches",
    subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(this.domain, "eq", "on") + " switches on",
  };

  /**
   * Class constructor.
   *
   * @param {viewOptions} [options={}] Options for the view.
   */
  constructor(options = {}) {
    super();
    this.mergeOptions(
        this.#defaultOptions,
        options,
    );

    // Create a title card to switch all entities of the domain.
    this.viewTitleCard = new _cards_TitleCard__WEBPACK_IMPORTED_MODULE_1__.TitleCard(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas, {
      ...this.#viewTitleCardOption,
      ...this.options["titleCard"],
    }).createCard();
  }

  get domain() {
    return this.#domain;
  }
}




/***/ }),

/***/ "./src/views/typedefs.js":
/*!*******************************!*\
  !*** ./src/views/typedefs.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/**
 * @namespace typedefs.views
 */

/**
 * @typedef {Object} abstractOptions Options to create a view.
 * @property {string} [title] The title or name.
 * @property {string} [path] Paths are used in the URL.
 * @property {string} [icon] The icon of the view.
 * @property {boolean} subview  Mark the view as “Subview”.
 * @memberOf typedefs.views
 * @see https://www.home-assistant.io/dashboards/views/
 */

/**
 * @typedef {abstractOptions & Object} viewOptions Options for the extended View class.
 * @property {titleCardOptions} [titleCard] Options for the title card of the view.
 * @memberOf typedefs.views
 */

/**
 * @typedef {Object} titleCardOptions Options for the title card of the view.
 * @property {string} iconOn Icon to show for switching entities from off state.
 * @property {string} iconOff Icon to show for switching entities to off state.
 * @property {string} onService Service to call for switching entities from off state.
 * @property {string} offService Service to call for switching entities to off state.
 * @memberOf typedefs.views
 */

/**
 * @typedef {Object} viewTitleCardOptions Options for the view's title card.
 * @property {string} [title] Title to render. May contain templates.
 * @property {string} [subtitle] Subtitle to render. May contain templates.
 * @property {boolean} [showControls=true] False to hide controls.
 * @memberOf typedefs.views
 */




/***/ }),

/***/ "./src/views lazy recursive ^\\.\\/.*$":
/*!***************************************************!*\
  !*** ./src/views/ lazy ^\.\/.*$ namespace object ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./AbstractView": [
		"./src/views/AbstractView.js",
		"main"
	],
	"./AbstractView.js": [
		"./src/views/AbstractView.js",
		"main"
	],
	"./CameraView": [
		"./src/views/CameraView.js",
		"main"
	],
	"./CameraView.js": [
		"./src/views/CameraView.js",
		"main"
	],
	"./ClimateView": [
		"./src/views/ClimateView.js",
		"main"
	],
	"./ClimateView.js": [
		"./src/views/ClimateView.js",
		"main"
	],
	"./CoverView": [
		"./src/views/CoverView.js",
		"main"
	],
	"./CoverView.js": [
		"./src/views/CoverView.js",
		"main"
	],
	"./FanView": [
		"./src/views/FanView.js",
		"main"
	],
	"./FanView.js": [
		"./src/views/FanView.js",
		"main"
	],
	"./HomeView": [
		"./src/views/HomeView.js",
		"main"
	],
	"./HomeView.js": [
		"./src/views/HomeView.js",
		"main"
	],
	"./LightView": [
		"./src/views/LightView.js",
		"main"
	],
	"./LightView.js": [
		"./src/views/LightView.js",
		"main"
	],
	"./SwitchView": [
		"./src/views/SwitchView.js",
		"main"
	],
	"./SwitchView.js": [
		"./src/views/SwitchView.js",
		"main"
	],
	"./typedefs": [
		"./src/views/typedefs.js",
		"main"
	],
	"./typedefs.js": [
		"./src/views/typedefs.js",
		"main"
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(() => {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return __webpack_require__.e(ids[1]).then(() => {
		return __webpack_require__(id);
	});
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = "./src/views lazy recursive ^\\.\\/.*$";
module.exports = webpackAsyncContext;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		// The chunk loading function for additional chunks
/******/ 		// Since all referenced chunks are already included
/******/ 		// in this file, this function is empty here.
/******/ 		__webpack_require__.e = () => (Promise.resolve());
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************************!*\
  !*** ./src/mushroom-strategy.js ***!
  \**********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Helper */ "./src/Helper.js");
/* harmony import */ var _cards_SensorCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./cards/SensorCard */ "./src/cards/SensorCard.js");
/* harmony import */ var _cards_TitleCard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./cards/TitleCard */ "./src/cards/TitleCard.js");




/**
 * Mushroom Dashboard Strategy.<br>
 * <br>
 * Mushroom dashboard strategy provides a strategy for Home-Assistant to create a dashboard automatically.<br>
 * The strategy makes use Mushroom, Mini Graph and WebRTC cards to represent your entities.<br>
 * <br>
 * Features:<br>
 *     🛠 Automatically create dashboard with 3 lines of yaml.<br>
 *     😍 Built-in Views for several standard domains.<br>
 *     🎨 Many options to customize to your needs.<br>
 * <br>
 * Check the [Repository]{@link https://github.com/AalianKhan/mushroom-strategy} for more information.
 */
class MushroomStrategy {
  /**
   * Generate a dashboard.
   *
   * Called when opening a dashboard.
   *
   * @param {dashBoardInfo} info Dashboard strategy information object.
   * @return {Promise<{views: Object[]}>}
   */
  static async generateDashboard(info) {
    await _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.initialize(info);

    // Create views.
    const views = [];

    let viewModule;

    // Create a view for each exposed domain.
    for (let viewId of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getExposedViewIds()) {
      try {
        const viewType = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(viewId + "View");
        viewModule     = await __webpack_require__("./src/views lazy recursive ^\\.\\/.*$")(`./${viewType}`);
        const view     = await new viewModule[viewType](_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.views[viewId]).getView();

        views.push(view);

      } catch (e) {
        console.error(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.debug ? e : `View '${viewId}' couldn't be loaded!`);
      }
    }

    // Create subviews for each area.
    for (let area of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas) {
      if (!area.hidden) {
        views.push({
          title: area.name,
          path: area.area_id ?? area.name,
          subview: true,
          strategy: {
            type: "custom:mushroom-strategy",
            options: {
              area,
              "entity_config": _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.entity_config,
            },
          },
        });
      }
    }

    // Add custom views.
    if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.extra_views) {
      views.push(..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.extra_views);
    }

    // Return the created views.
    return {
      views: views,
    };
  }

  /**
   * Generate a view.
   *
   * Called when opening a subview.
   *
   * @param {viewInfo} info The view's strategy information object.
   * @return {Promise<{cards: Object[]}>}
   */
  static async generateView(info) {
    const exposedDomainIds  = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getExposedDomainIds();
    const area            = info.view.strategy.options.area;
    const viewCards       = [...(area.extra_cards ?? [])];
    const strategyOptions = {
      entityConfig: info.view.strategy.options.entity_config,
    };

    // Create cards for each domain.
    for (const domain of exposedDomainIds) {
      if (domain === "default") {
        continue;
      }

      const className = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + "Card");

      let domainCards = [];

      try {
        domainCards = await __webpack_require__("./src/cards lazy recursive ^\\.\\/.*$")(`./${className}`).then(cardModule => {
          let domainCards = [];
          const entities  = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getDeviceEntities(area, domain);

          if (entities.length) {
            // Create a Title card for the current domain.
            const titleCard = new _cards_TitleCard__WEBPACK_IMPORTED_MODULE_2__.TitleCard(
                [area],
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain]
            ).createCard();

            if (domain === "sensor") {
              // Create a card for each entity-sensor of the current area.
              const sensorStates = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getStateEntities(area, "sensor");
              const sensorCards  = [];

              for (const sensor of entities) {
                let card = (strategyOptions.entityConfig?.find(config => config.entity_id === sensor.entity_id));

                if (card) {
                  sensorCards.push(card);
                  continue;
                }

                // Find the state of the current sensor.
                const sensorState = sensorStates.find(state => state.entity_id === sensor.entity_id);
                let cardOptions   = {};

                if (sensorState?.attributes.unit_of_measurement) {
                  cardOptions = {
                    type: "custom:mini-graph-card",
                    entities: [sensor.entity_id],
                  };
                }

                sensorCards.push(new _cards_SensorCard__WEBPACK_IMPORTED_MODULE_1__.SensorCard(sensor, cardOptions).getCard());
              }

              domainCards.push({
                type: "vertical-stack",
                cards: sensorCards,
              });

              domainCards.unshift(titleCard);
              return domainCards;
            }

            // Create a card for each domain-entity of the current area.
            for (const entity of entities) {
              const card = (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.entity_config ?? []).find(
                  config => config.entity === entity.entity_id,
              ) ?? new cardModule[className](entity).getCard();

              domainCards.push(card);
            }

            if (domain === "binary_sensor") {
              // Horizontally group every two binary sensor cards.
              const horizontalCards = [];

              for (let i = 0; i < domainCards.length; i += 2) {
                horizontalCards.push({
                  type: "horizontal-stack",
                  cards: domainCards.slice(i, i + 2),
                });
              }

              domainCards = horizontalCards;
            }

            domainCards.unshift(titleCard);
          }

          return domainCards;
        });
      } catch (e) {
        console.error(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.debug ? e : "An error occurred while creating the domain cards!");
      }

      if (domainCards.length) {
        viewCards.push({
          type: "vertical-stack",
          cards: domainCards,
        });
      }
    }

    // Create cards for any other domain.
    // Collect device entities of the current area.
    const areaDevices = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.devices.filter(device => device.area_id === area.area_id)
        .map(device => device.id);

    // Collect the remaining entities of which all conditions below are met:
    // 1. The entity is linked to a device which is linked to the current area,
    //    or the entity itself is linked to the current area.
    // 2. The entity is not hidden and is not disabled.
    const miscellaneousEntities = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities.filter(entity => {
      return (areaDevices.includes(entity.device_id) || entity.area_id === area.area_id)
          && entity.hidden_by == null
          && entity.disabled_by == null
          && !exposedDomainIds.includes(entity.entity_id.split(".", 1)[0]);
    });

    // Create a column of miscellaneous entity cards.
    if (miscellaneousEntities.length) {
      let miscellaneousCards = [];

      try {
        miscellaneousCards = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./cards/MiscellaneousCard */ "./src/cards/MiscellaneousCard.js")).then(cardModule => {
          /** @type Object[] */
          const miscellaneousCards = [
            new _cards_TitleCard__WEBPACK_IMPORTED_MODULE_2__.TitleCard([area], _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains["default"]).createCard(),
          ];
          for (const entity of miscellaneousEntities) {
            const card = (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.entity_config ?? []).find(
                config => config.entity === entity.entity_id,
            ) ?? new cardModule.MiscellaneousCard(entity).getCard();

            miscellaneousCards.push(card);
          }

          return miscellaneousCards;
        });
      } catch (e) {
        console.error(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.debug ? e : "An error occurred while creating the domain cards!");
      }

      viewCards.push({
        type: "vertical-stack",
        cards: miscellaneousCards,
      });
    }

    // Return cards.
    return {
      cards: viewCards,
    };
  }
}

// noinspection JSUnresolvedReference
customElements.define("ll-strategy-mushroom-strategy", MushroomStrategy);

})();

/******/ })()
;
//# sourceMappingURL=mushroom-strategy.js.map