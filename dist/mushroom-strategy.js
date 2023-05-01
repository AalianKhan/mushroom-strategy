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

    this.#hassStates      = info.hass.states;
    this.#strategyOptions = info.config.strategy.options || {};
    this.debug            = this.strategyOptions.debug;

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
    // 1. The entity is linked to a device which is linked to the given area,
    //    or the entity itself is linked to the given area.
    // 2. The entity's domain matches the given domain.
    // 3. The entity is not hidden and is not disabled.
    return this.#entities.filter(entity => {
      return (
          (areaDeviceIds.includes(entity.device_id) || entity.area_id === area.area_id)
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
   * @type {Object}
   */
  options = {
    type: "custom:mushroom-entity-card",
    icon: "mdi:help-circle",
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
  };

  /**
   * Class constructor.
   *
   * @param {areaEntity} area The area entity to create a card for.
   * @param {personCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(area, options = {}) {
    super(area);
    this.#defaultOptions.primary                    = area.name;
    this.#defaultOptions.tap_action.navigation_path = area.area_id;

    this.mergeOptions(
        this.#defaultOptions,
        options,
    );
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
  // THe binary Card has the same representation as the Sensor Card.
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
    icon_color: "green",
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
 * @property {string} type The type of the card.
 * @property {string} icon Icon of the card.
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
 * @typedef {abstractOptions & Object} areaCardOptions Person Card options.
 * @property {string} [primary] Primary info to render. May contain templates.
 * @property {string} [icon] Icon to render. May contain templates.
 * @property {string} [icon_color] Icon color to render. May contain templates.
 * @property {areaTapAction} tap_action Home assistant action to perform on tap.
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
    const viewCards = [this.viewTitleCard];

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

      //areaCards.sort((a, b) => a.name.localeCompare(b.name));

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

  get domain() {
    return this.#domain;
  }

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
      chips.push(chipOptions.extra_chips);
    }

    return chips;
  }

  #createPersonCards() {
    const cards = [];

    Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../cards/PersonCard */ "./src/cards/PersonCard.js")).then(personModule => {
      for (const person of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities.filter(entity => entity.entity_id.startsWith("person."))) {
        cards.push(new personModule.PersonCard(person).getCard());
      }
    });

    return cards;
  }

  #createAreaCards() {
    const groupedCards = [];

    Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../cards/AreaCard */ "./src/cards/AreaCard.js")).then(areaModule => {
      const areaCards = [];

      for (const area of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas) {
        areaCards.push(new areaModule.AreaCard(area, _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas?.[area.area_id]).getCard());
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
    // TODO: Get domains from config (Currently strategy.options.views).
    const exposedDomains = ["Home", "light", "fan", "cover", "switch", "climate", "camera"];
    const views          = [];

    let viewModule;

    // Create a view for each exposed domain.
    for (let viewType of exposedDomains) {
      try {
        viewType   = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(viewType + "View");
        viewModule = await __webpack_require__("./src/views lazy recursive ^\\.\\/.*$")(`./${viewType}`);
        const view = await new viewModule[viewType]().getView();

        views.push(view);

      } catch (e) {
        console.error(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.debug ? e : `View '${viewType}' couldn't be loaded!`);
      }
    }

    // Create subviews for each area.
    for (const area of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas) {
      views.push({
        title: area.name,
        path: area.area_id,
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
    const area            = info.view.strategy.options.area;
    const viewCards       = area.extra_cards ?? [];
    const strategyOptions = {
      entityConfig: info.view.strategy.options.entity_config,
    };

    // TODO: Get domains from config (Currently strategy.options.views).
    const exposedDomains = [
      "light",
      "fan",
      "cover",
      "switch",
      "climate",
      "camera",
      "media_player",
      "sensor",
      "binary_sensor",
    ];

    const titleCardOptions = {
      default: {
        title: "Miscellaneous",
        showControls: false,
      },
      light: {
        title: "Lights",
        showControls: true,
        iconOn: "mdi:lightbulb",
        iconOff: "mdi:lightbulb-off",
        onService: "light.turn_on",
        offService: "light.turn_off",
      },
      fan: {
        title: "Fans",
        showControls: true,
        iconOn: "mdi:fan",
        iconOff: "mdi:fan-off",
        onService: "fan.turn_on",
        offService: "fan.turn_off",
      },
      cover: {
        title: "Covers",
        showControls: true,
        iconOn: "mdi:arrow-up",
        iconOff: "mdi:arrow-down",
        onService: "cover.open_cover",
        offService: "cover.close_cover",
      },
      switch: {
        title: "Switches",
        showControls: true,
        iconOn: "mdi:power-plug",
        iconOff: "mdi:power-plug-off",
        onService: "switch.turn_on",
        offService: "switch.turn_off",
      },
      camera: {
        title: "Cameras",
        showControls: false,
      },
      climate: {
        title: "Climates",
        showControls: false,
      },
      media_player: {
        title: "Media Players",
        showControls: false,
      },
      sensor: {
        title: "Sensors",
        showControls: false,
      },
      binary_sensor: {
        title: "Binary Sensors",
        showControls: false,
      },
    };

    // Create cards for each domain.
    for (const domain of exposedDomains) {
      const className = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + "Card");

      let domainCards = [];

      try {
        domainCards = await __webpack_require__("./src/cards lazy recursive ^\\.\\/.*$")(`./${className}`).then(cardModule => {
          let domainCards = [];
          const entities  = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getDeviceEntities(area, domain);

          if (entities.length) {
            // Create a Title card for the current domain.
            const titleCard = new _cards_TitleCard__WEBPACK_IMPORTED_MODULE_2__.TitleCard([area],
                titleCardOptions[domain] ?? titleCardOptions["default"]).createCard();

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

                if (sensorState.attributes.unit_of_measurement) {
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
          && !exposedDomains.includes(entity.entity_id.split(".", 1)[0]);
    });

    // Create a column of miscellaneous entity cards.
    if (miscellaneousEntities.length) {
      let miscellaneousCards = [];

      try {
        miscellaneousCards = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./cards/MiscellaneousCard */ "./src/cards/MiscellaneousCard.js")).then(cardModule => {
          /** @type Object[] */
          const miscellaneousCards = [
            new _cards_TitleCard__WEBPACK_IMPORTED_MODULE_2__.TitleCard([area], {title: "Miscellaneous", showControls: false}).createCard(),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDbEtpQzs7QUFFakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxtQ0FBbUM7QUFDbkMsU0FBUyx5REFBb0I7QUFDN0I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsNERBQXVCO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7O0FBRXFCOzs7Ozs7Ozs7Ozs7Ozs7OztBQ2xDWTs7QUFFakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxtQ0FBbUM7QUFDbkMsU0FBUyx5REFBb0I7QUFDN0I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsNERBQXVCO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNB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Q3ZDLGNBQWMsa0JBQWtCO0FBQ2hDO0FBQ0E7O0FBRUE7QUFDQSxhQUFhLFFBQVE7QUFDckIsY0FBYyxRQUFRO0FBQ3RCLGNBQWMsUUFBUTtBQUN0QixjQUFjLFFBQVE7QUFDdEIsY0FBYyxRQUFRO0FBQ3RCO0FBQ0E7O0FBRUE7QUFDQSxhQUFhLFFBQVE7QUFDckIsY0FBYyxRQUFRO0FBQ3RCLGNBQWMsUUFBUTtBQUN0QixjQUFjLFNBQVM7QUFDdkI7QUFDQTs7QUFFVTs7Ozs7Ozs7Ozs7QUNyQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7Ozs7OztVQzFGQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxzREFBc0Q7V0FD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QkFBOEIsd0JBQXdCO0FBQ3REO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsUUFBUTtBQUNSLHNCQUFzQixpREFBWTtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QiwwREFBcUI7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLDJEQUFzQjtBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMseUpBQW1DO0FBQ3RFO0FBQ0E7QUFDQSxnQkFBZ0IsdURBQVMsVUFBVSw0Q0FBNEM7QUFDL0U7QUFDQTtBQUNBLDBCQUEwQix5RUFBb0M7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsUUFBUTtBQUNSLHNCQUFzQixpREFBWTtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tdXNocm9vbS1zdHJhdGVneS8uL3NyYy9IZWxwZXIuanMiLCJ3ZWJwYWNrOi8vbXVzaHJvb20tc3RyYXRlZ3kvLi9zcmMvY2FyZHMvQWJzdHJhY3RDYXJkLmpzIiwid2VicGFjazovL211c2hyb29tLXN0cmF0ZWd5Ly4vc3JjL2NhcmRzL0FyZWFDYXJkLmpzIiwid2VicGFjazovL211c2hyb29tLXN0cmF0ZWd5Ly4vc3JjL2NhcmRzL0JpbmFyeVNlbnNvckNhcmQuanMiLCJ3ZWJwYWNrOi8vbXVzaHJvb20tc3RyYXRlZ3kvLi9zcmMvY2FyZHMvQ2FtZXJhQ2FyZC5qcyIsIndlYnBhY2s6Ly9tdXNocm9vbS1zdHJhdGVneS8uL3NyYy9jYXJkcy9DbGltYXRlQ2FyZC5qcyIsIndlYnBhY2s6Ly9tdXNocm9vbS1zdHJhdGVneS8uL3NyYy9jYXJkcy9Db3ZlckNhcmQuanMiLCJ3ZWJwYWNrOi8vbXVzaHJvb20tc3RyYXRlZ3kvLi9zcmMvY2FyZHMvRmFuQ2FyZC5qcyIsIndlYnBhY2s6Ly9tdXNocm9vbS1zdHJhdGVneS8uL3NyYy9jYXJkcy9MaWdodENhcmQuanMiLCJ3ZWJwYWNrOi8vbXVzaHJvb20tc3RyYXRlZ3kvLi9zcmMvY2FyZHMvTWVkaWFQbGF5ZXJDYXJkLmpzIiwid2VicGFjazovL211c2hyb29tLXN0cmF0ZWd5Ly4vc3JjL2NhcmRzL01pc2NlbGxhbmVvdXNDYXJkLmpzIiwid2VicGFjazovL211c2hyb29tLXN0cmF0ZWd5Ly4vc3JjL2NhcmRzL1BlcnNvbkNhcmQuanMiLCJ3ZWJwYWNrOi8vbXVzaHJvb20tc3RyYXRlZ3kvLi9zcmMvY2FyZHMvU2Vuc29yQ2FyZC5qcyIsIndlYnBhY2s6Ly9tdXNocm9vbS1zdHJhdGVneS8uL3NyYy9jYXJkcy9Td2l0Y2hDYXJkLmpzIiwid2VicGFjazovL211c2hyb29tLXN0cmF0ZWd5Ly4vc3JjL2NhcmRzL1RpdGxlQ2FyZC5qcyIsIndlYnBhY2s6Ly9tdXNocm9vbS1zdHJhdGVneS8uL3NyYy9jYXJkcy90eXBlZGVmcy5qcyIsIndlYnBhY2s6Ly9tdXNocm9vbS1zdHJhdGVneS8uL3NyYy9jYXJkcy8gbGF6eSBeXFwuXFwvLiokIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vbXVzaHJvb20tc3RyYXRlZ3kvLi9zcmMvY2hpcHMvQ2xpbWF0ZUNoaXAuanMiLCJ3ZWJwYWNrOi8vbXVzaHJvb20tc3RyYXRlZ3kvLi9zcmMvY2hpcHMvQ292ZXJDaGlwLmpzIiwid2VicGFjazovL211c2hyb29tLXN0cmF0ZWd5Ly4vc3JjL2NoaXBzL0ZhbkNoaXAuanMiLCJ3ZWJwYWNrOi8vbXVzaHJvb20tc3RyYXRlZ3kvLi9zcmMvY2hpcHMvTGlnaHRDaGlwLmpzIiwid2VicGFjazovL211c2hyb29tLXN0cmF0ZWd5Ly4vc3JjL2NoaXBzL1N3aXRjaENoaXAuanMiLCJ3ZWJwYWNrOi8vbXVzaHJvb20tc3RyYXRlZ3kvLi9zcmMvY2hpcHMvV2VhdGhlckNoaXAuanMiLCJ3ZWJwYWNrOi8vbXVzaHJvb20tc3RyYXRlZ3kvLi9zcmMvY2hpcHMvIGxhenkgXlxcLlxcLy4qJCBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL211c2hyb29tLXN0cmF0ZWd5Ly4vc3JjL3ZpZXdzL0Fic3RyYWN0Vmlldy5qcyIsIndlYnBhY2s6Ly9tdXNocm9vbS1zdHJhdGVneS8uL3NyYy92aWV3cy9DYW1lcmFWaWV3LmpzIiwid2VicGFjazovL211c2hyb29tLXN0cmF0ZWd5Ly4vc3JjL3ZpZXdzL0NsaW1hdGVWaWV3LmpzIiwid2VicGFjazovL211c2hyb29tLXN0cmF0ZWd5Ly4vc3JjL3ZpZXdzL0NvdmVyVmlldy5qcyIsIndlYnBhY2s6Ly9tdXNocm9vbS1zdHJhdGVneS8uL3NyYy92aWV3cy9GYW5WaWV3LmpzIiwid2VicGFjazovL211c2hyb29tLXN0cmF0ZWd5Ly4vc3JjL3ZpZXdzL0hvbWVWaWV3LmpzIiwid2VicGFjazovL211c2hyb29tLXN0cmF0ZWd5Ly4vc3JjL3ZpZXdzL0xpZ2h0Vmlldy5qcyIsIndlYnBhY2s6Ly9tdXNocm9vbS1zdHJhdGVneS8uL3NyYy92aWV3cy9Td2l0Y2hWaWV3LmpzIiwid2VicGFjazovL211c2hyb29tLXN0cmF0ZWd5Ly4vc3JjL3ZpZXdzL3R5cGVkZWZzLmpzIiwid2VicGFjazovL211c2hyb29tLXN0cmF0ZWd5Ly4vc3JjL3ZpZXdzLyBsYXp5IF5cXC5cXC8uKiQgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9tdXNocm9vbS1zdHJhdGVneS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9tdXNocm9vbS1zdHJhdGVneS93ZWJwYWNrL3J1bnRpbWUvY3JlYXRlIGZha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9tdXNocm9vbS1zdHJhdGVneS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vbXVzaHJvb20tc3RyYXRlZ3kvd2VicGFjay9ydW50aW1lL2Vuc3VyZSBjaHVuayIsIndlYnBhY2s6Ly9tdXNocm9vbS1zdHJhdGVneS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL211c2hyb29tLXN0cmF0ZWd5L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vbXVzaHJvb20tc3RyYXRlZ3kvLi9zcmMvbXVzaHJvb20tc3RyYXRlZ3kuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBIZWxwZXIgQ2xhc3NcbiAqXG4gKiBDb250YWlucyB0aGUgb2JqZWN0cyBvZiBIb21lIEFzc2lzdGFudCdzIHJlZ2lzdHJpZXMgYW5kIGhlbHBlciBtZXRob2RzLlxuICovXG5jbGFzcyBIZWxwZXIge1xuICAvKipcbiAgICogQW4gYXJyYXkgb2YgZW50aXRpZXMgZnJvbSBIb21lIEFzc2lzdGFudCdzIGVudGl0eSByZWdpc3RyeS5cbiAgICpcbiAgICogQHR5cGUge2hhc3NFbnRpdHlbXX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN0YXRpYyAjZW50aXRpZXM7XG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBlbnRpdGllcyBmcm9tIEhvbWUgQXNzaXN0YW50J3MgZGV2aWNlIHJlZ2lzdHJ5LlxuICAgKlxuICAgKiBAdHlwZSB7ZGV2aWNlRW50aXR5W119XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzdGF0aWMgI2RldmljZXM7XG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBlbnRpdGllcyBmcm9tIEhvbWUgQXNzaXN0YW50J3MgYXJlYSByZWdpc3RyeS5cbiAgICpcbiAgICogQHR5cGUge2FyZWFFbnRpdHlbXX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN0YXRpYyAjYXJlYXM7XG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBzdGF0ZSBlbnRpdGllcyBmcm9tIEhvbWUgQXNzaXN0YW50J3MgSGFzcyBvYmplY3QuXG4gICAqXG4gICAqIEB0eXBlIHtoYXNzT2JqZWN0W1wic3RhdGVzXCJdfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RhdGljICNoYXNzU3RhdGVzO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGlzIG1vZHVsZSBpcyBpbml0aWFsaXplZC5cbiAgICpcbiAgICogQHR5cGUge2Jvb2xlYW59IFRydWUgaWYgaW5pdGlhbGl6ZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzdGF0aWMgI2luaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFRoZSBDdXN0b20gc3RyYXRlZ3kgY29uZmlndXJhdGlvbi5cbiAgICpcbiAgICogQHR5cGUge2N1c3RvbVN0cmF0ZWd5T3B0aW9ucyB8IHt9fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RhdGljICNzdHJhdGVneU9wdGlvbnMgPSB7fTtcblxuICAvKipcbiAgICogU2V0IHRvIHRydWUgZm9yIG1vcmUgdmVyYm9zZSBpbmZvcm1hdGlvbiBpbiB0aGUgY29uc29sZS5cbiAgICpcbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqL1xuICBzdGF0aWMgZGVidWcgPSBmYWxzZTtcblxuICAvKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIFRoaXMgY2xhc3Mgc2hvdWxkbid0IGJlIGluc3RhbnRpYXRlZCBkaXJlY3RseS4gSW5zdGVhZCwgaXQgc2hvdWxkIGJlIGluaXRpYWxpemVkIHdpdGggbWV0aG9kIGluaXRpYWxpemUoKS5cbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRyeWluZyB0byBpbnN0YW50aWF0ZSB0aGlzIGNsYXNzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBjbGFzcyBzaG91bGQgYmUgaW52b2tlZCB3aXRoIG1ldGhvZCBpbml0aWFsaXplKCkgaW5zdGVhZCBvZiB1c2luZyB0aGUga2V5d29yZCBuZXchXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEN1c3RvbSBzdHJhdGVneSBjb25maWd1cmF0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Y3VzdG9tU3RyYXRlZ3lPcHRpb25zfHt9fVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBzdGF0aWMgZ2V0IHN0cmF0ZWd5T3B0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy4jc3RyYXRlZ3lPcHRpb25zO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHthcmVhRW50aXR5W119XG4gICAqIEBzdGF0aWNcbiAgICovXG4gIHN0YXRpYyBnZXQgYXJlYXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2FyZWFzO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtkZXZpY2VFbnRpdHlbXX1cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgc3RhdGljIGdldCBkZXZpY2VzKCkge1xuICAgIHJldHVybiB0aGlzLiNkZXZpY2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtoYXNzRW50aXR5W119XG4gICAqIEBzdGF0aWNcbiAgICovXG4gIHN0YXRpYyBnZXQgZW50aXRpZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2VudGl0aWVzO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBzdGF0aWMgZ2V0IGRlYnVnKCkge1xuICAgIHJldHVybiB0aGlzLmRlYnVnO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgdGhpcyBtb2R1bGUuXG4gICAqXG4gICAqIEBwYXJhbSB7ZGFzaEJvYXJkSW5mbyB8IHZpZXdJbmZvfSBpbmZvIFN0cmF0ZWd5IGluZm9ybWF0aW9uIG9iamVjdC5cbiAgICogQHJldHVybnMge1Byb21pc2U8dm9pZD59XG4gICAqIEBzdGF0aWNcbiAgICovXG4gIHN0YXRpYyBhc3luYyBpbml0aWFsaXplKGluZm8pIHtcbiAgICB0cnkge1xuICAgICAgLy8gUXVlcnkgdGhlIHJlZ2lzdHJpZXMgb2YgSG9tZSBBc3Npc3RhbnQuXG4gICAgICBbdGhpcy4jZW50aXRpZXMsIHRoaXMuI2RldmljZXMsIHRoaXMuI2FyZWFzXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgaW5mby5oYXNzLmNhbGxXUyh7dHlwZTogXCJjb25maWcvZW50aXR5X3JlZ2lzdHJ5L2xpc3RcIn0pLFxuICAgICAgICBpbmZvLmhhc3MuY2FsbFdTKHt0eXBlOiBcImNvbmZpZy9kZXZpY2VfcmVnaXN0cnkvbGlzdFwifSksXG4gICAgICAgIGluZm8uaGFzcy5jYWxsV1Moe3R5cGU6IFwiY29uZmlnL2FyZWFfcmVnaXN0cnkvbGlzdFwifSksXG4gICAgICBdKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKEhlbHBlci5kZWJ1ZyA/IGUgOiBcIkFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHF1ZXJ5aW5nIEhvbWUgYXNzaXN0YW50J3MgcmVnaXN0cmllcyFcIik7XG4gICAgfVxuXG4gICAgdGhpcy4jaGFzc1N0YXRlcyAgICAgID0gaW5mby5oYXNzLnN0YXRlcztcbiAgICB0aGlzLiNzdHJhdGVneU9wdGlvbnMgPSBpbmZvLmNvbmZpZy5zdHJhdGVneS5vcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuZGVidWcgICAgICAgICAgICA9IHRoaXMuc3RyYXRlZ3lPcHRpb25zLmRlYnVnO1xuXG4gICAgdGhpcy4jaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoaXMgbW9kdWxlIGlzIGluaXRpYWxpemVkLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBzdGF0aWMgaXNJbml0aWFsaXplZCgpIHtcbiAgICByZXR1cm4gdGhpcy4jaW5pdGlhbGl6ZWQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgdGVtcGxhdGUgc3RyaW5nIHRvIGRlZmluZSB0aGUgbnVtYmVyIG9mIGEgZ2l2ZW4gZG9tYWluJ3MgZW50aXRpZXMgd2l0aCBhIGNlcnRhaW4gc3RhdGUuXG4gICAqXG4gICAqIFN0YXRlcyBhcmUgY29tcGFyZWQgYWdhaW5zdCBhIGdpdmVuIHZhbHVlIGJ5IGEgZ2l2ZW4gb3BlcmF0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkb21haW4gVGhlIGRvbWFpbiBvZiB0aGUgZW50aXRpZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcGVyYXRvciBUaGUgQ29tcGFyaXNvbiBvcGVyYXRvciBiZXR3ZWVuIHN0YXRlIGFuZCB2YWx1ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIFRoZSB2YWx1ZSB0byB3aGljaCB0aGUgc3RhdGUgaXMgY29tcGFyZWQgYWdhaW5zdC5cbiAgICpcbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgdGVtcGxhdGUgc3RyaW5nLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBzdGF0aWMgZ2V0Q291bnRUZW1wbGF0ZShkb21haW4sIG9wZXJhdG9yLCB2YWx1ZSkge1xuICAgIC8vIG5vaW5zcGVjdGlvbiBKU01pc21hdGNoZWRDb2xsZWN0aW9uUXVlcnlVcGRhdGUgKEZhbHNlIHBvc2l0aXZlIHBlciAxNy0wNC0yMDIzKVxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIGVudGl0eSBzdGF0ZS1lbnRyaWVzLCBmaWx0ZXJlZCBieSBkb21haW4uXG4gICAgICpcbiAgICAgKiBFYWNoIGVsZW1lbnQgY29udGFpbnMgYSB0ZW1wbGF0ZS1zdHJpbmcgd2hpY2ggaXMgdXNlZCB0byBhY2Nlc3MgaG9tZSBhc3Npc3RhbnQncyBzdGF0ZSBtYWNoaW5lIChzdGF0ZSBvYmplY3QpIGluXG4gICAgICogYSB0ZW1wbGF0ZS5cbiAgICAgKiBFLmcuIFwic3RhdGVzWydsaWdodC5raXRjaGVuJ11cIlxuICAgICAqXG4gICAgICogVGhlIGFycmF5IGV4Y2x1ZGVzIGhpZGRlbiBhbmQgZGlzYWJsZWQgZW50aXRpZXMuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7c3RyaW5nW119XG4gICAgICovXG4gICAgY29uc3Qgc3RhdGVzID0gW107XG5cbiAgICAvLyBHZXQgdGhlIElEIG9mIHRoZSBkZXZpY2VzIHdoaWNoIGFyZSBsaW5rZWQgdG8gdGhlIGdpdmVuIGFyZWEuXG4gICAgZm9yIChjb25zdCBhcmVhIG9mIHRoaXMuI2FyZWFzKSB7XG4gICAgICBjb25zdCBhcmVhRGV2aWNlSWRzID0gdGhpcy4jZGV2aWNlcy5maWx0ZXIoZGV2aWNlID0+IHtcbiAgICAgICAgcmV0dXJuIGRldmljZS5hcmVhX2lkID09PSBhcmVhLmFyZWFfaWQ7XG4gICAgICB9KS5tYXAoZGV2aWNlID0+IHtcbiAgICAgICAgcmV0dXJuIGRldmljZS5pZDtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBDb2xsZWN0IGVudGl0eSBzdGF0ZXMgb2Ygd2hpY2ggYWxsIHRoZSBjb25kaXRpb25zIGJlbG93IGFyZSBtZXQ6XG4gICAgICAvLyAxLiBUaGUgZW50aXR5IGlzIGxpbmtlZCB0byBhIGRldmljZSB3aGljaCBpcyBsaW5rZWQgdG8gdGhlIGdpdmVuIGFyZWEsXG4gICAgICAvLyAgICBvciB0aGUgZW50aXR5IGl0c2VsZiBpcyBsaW5rZWQgdG8gdGhlIGdpdmVuIGFyZWEuXG4gICAgICAvLyAyLiBUaGUgZW50aXR5J3MgSUQgc3RhcnRzIHdpdGggdGhlIGdpdmUgc3RyaW5nLlxuICAgICAgLy8gMy4gVGhlIGVudGl0eSBpcyBub3QgaGlkZGVuIGFuZCBub3QgZGlzYWJsZWQuXG4gICAgICBmb3IgKGNvbnN0IGVudGl0eSBvZiB0aGlzLiNlbnRpdGllcykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAoYXJlYURldmljZUlkcy5pbmNsdWRlcyhlbnRpdHkuZGV2aWNlX2lkKSB8fCBlbnRpdHkuYXJlYV9pZCA9PT0gYXJlYS5hcmVhX2lkKVxuICAgICAgICAgICAgJiYgZW50aXR5LmVudGl0eV9pZC5zdGFydHNXaXRoKGAke2RvbWFpbn0uYClcbiAgICAgICAgICAgICYmIGVudGl0eS5oaWRkZW5fYnkgPT0gbnVsbCAmJiBlbnRpdHkuZGlzYWJsZWRfYnkgPT0gbnVsbFxuICAgICAgICApIHtcbiAgICAgICAgICBzdGF0ZXMucHVzaChgc3RhdGVzWycke2VudGl0eS5lbnRpdHlfaWR9J11gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBgeyUgc2V0IGVudGl0aWVzID0gWyR7c3RhdGVzfV0gJX0ge3sgZW50aXRpZXMgfCBzZWxlY3RhdHRyKCdzdGF0ZScsJyR7b3BlcmF0b3J9JywnJHt2YWx1ZX0nKSB8IGxpc3QgfCBjb3VudCB9fWA7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGRldmljZSBlbnRpdGllcyBmcm9tIHRoZSBlbnRpdHkgcmVnaXN0cnksIGZpbHRlcmVkIGJ5IGFyZWEgYW5kIGRvbWFpbi5cbiAgICpcbiAgICogVGhlIGVudGl0eSByZWdpc3RyeSBpcyBhIHJlZ2lzdHJ5IHdoZXJlIEhvbWUtQXNzaXN0YW50IGtlZXBzIHRyYWNrIG9mIGFsbCBlbnRpdGllcy5cbiAgICogQSBkZXZpY2UgaXMgcmVwcmVzZW50ZWQgaW4gSG9tZSBBc3Npc3RhbnQgdmlhIG9uZSBvciBtb3JlIGVudGl0aWVzLlxuICAgKlxuICAgKiBUaGUgcmVzdWx0IGV4Y2x1ZGVzIGhpZGRlbiBhbmQgZGlzYWJsZWQgZW50aXRpZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7YXJlYUVudGl0eX0gYXJlYSBBcmVhIGVudGl0eS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG9mIHRoZSBlbnRpdHktaWQuXG4gICAqXG4gICAqIEByZXR1cm4ge2hhc3NFbnRpdHlbXX0gQXJyYXkgb2YgZGV2aWNlIGVudGl0aWVzLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBzdGF0aWMgZ2V0RGV2aWNlRW50aXRpZXMoYXJlYSwgZG9tYWluKSB7XG4gICAgLy8gR2V0IHRoZSBJRCBvZiB0aGUgZGV2aWNlcyB3aGljaCBhcmUgbGlua2VkIHRvIHRoZSBnaXZlbiBhcmVhLlxuICAgIGNvbnN0IGFyZWFEZXZpY2VJZHMgPSB0aGlzLiNkZXZpY2VzLmZpbHRlcihkZXZpY2UgPT4ge1xuICAgICAgcmV0dXJuIGRldmljZS5hcmVhX2lkID09PSBhcmVhLmFyZWFfaWQ7XG4gICAgfSkubWFwKGRldmljZSA9PiB7XG4gICAgICByZXR1cm4gZGV2aWNlLmlkO1xuICAgIH0pO1xuXG4gICAgLy8gUmV0dXJuIHRoZSBlbnRpdGllcyBvZiB3aGljaCBhbGwgY29uZGl0aW9ucyBiZWxvdyBhcmUgbWV0OlxuICAgIC8vIDEuIFRoZSBlbnRpdHkgaXMgbGlua2VkIHRvIGEgZGV2aWNlIHdoaWNoIGlzIGxpbmtlZCB0byB0aGUgZ2l2ZW4gYXJlYSxcbiAgICAvLyAgICBvciB0aGUgZW50aXR5IGl0c2VsZiBpcyBsaW5rZWQgdG8gdGhlIGdpdmVuIGFyZWEuXG4gICAgLy8gMi4gVGhlIGVudGl0eSdzIGRvbWFpbiBtYXRjaGVzIHRoZSBnaXZlbiBkb21haW4uXG4gICAgLy8gMy4gVGhlIGVudGl0eSBpcyBub3QgaGlkZGVuIGFuZCBpcyBub3QgZGlzYWJsZWQuXG4gICAgcmV0dXJuIHRoaXMuI2VudGl0aWVzLmZpbHRlcihlbnRpdHkgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgICAoYXJlYURldmljZUlkcy5pbmNsdWRlcyhlbnRpdHkuZGV2aWNlX2lkKSB8fCBlbnRpdHkuYXJlYV9pZCA9PT0gYXJlYS5hcmVhX2lkKVxuICAgICAgICAgICYmIGVudGl0eS5lbnRpdHlfaWQuc3RhcnRzV2l0aChgJHtkb21haW59LmApXG4gICAgICAgICAgJiYgZW50aXR5LmhpZGRlbl9ieSA9PSBudWxsICYmIGVudGl0eS5kaXNhYmxlZF9ieSA9PSBudWxsXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBzdGF0ZSBlbnRpdGllcywgZmlsdGVyZWQgYnkgYXJlYSBhbmQgZG9tYWluLlxuICAgKlxuICAgKiBUaGUgcmVzdWx0IGV4Y2x1ZGVzIGhpZGRlbiBhbmQgZGlzYWJsZWQgZW50aXRpZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7YXJlYUVudGl0eX0gYXJlYSBBcmVhIGVudGl0eS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGRvbWFpbiBEb21haW4gb2YgdGhlIGVudGl0eS1pZC5cbiAgICpcbiAgICogQHJldHVybiB7c3RhdGVPYmplY3RbXX0gQXJyYXkgb2Ygc3RhdGUgZW50aXRpZXMuXG4gICAqL1xuICBzdGF0aWMgZ2V0U3RhdGVFbnRpdGllcyhhcmVhLCBkb21haW4pIHtcbiAgICBjb25zdCBzdGF0ZXMgPSBbXTtcblxuICAgIC8vIENyZWF0ZSBhIG1hcCBmb3IgdGhlIGhhc3NFbnRpdGllcyBhbmQgZGV2aWNlcyB7aWQ6IG9iamVjdH0gdG8gaW1wcm92ZSBsb29rdXAgc3BlZWQuXG4gICAgLyoqIEB0eXBlIHtPYmplY3Q8c3RyaW5nLCBoYXNzRW50aXR5Pn0gKi9cbiAgICBjb25zdCBlbnRpdHlNYXAgPSBPYmplY3QuZnJvbUVudHJpZXModGhpcy4jZW50aXRpZXMubWFwKGVudGl0eSA9PiBbZW50aXR5LmVudGl0eV9pZCwgZW50aXR5XSkpO1xuICAgIC8qKiBAdHlwZSB7T2JqZWN0PHN0cmluZywgZGV2aWNlRW50aXR5Pn0gKi9cbiAgICBjb25zdCBkZXZpY2VNYXAgPSBPYmplY3QuZnJvbUVudHJpZXModGhpcy4jZGV2aWNlcy5tYXAoZGV2aWNlID0+IFtkZXZpY2UuaWQsIGRldmljZV0pKTtcblxuICAgIC8vIEdldCBzdGF0ZXMgd2hvc2UgZW50aXR5LWlkIHN0YXJ0cyB3aXRoIHRoZSBnaXZlbiBzdHJpbmcuXG4gICAgY29uc3Qgc3RhdGVFbnRpdGllcyA9IE9iamVjdC52YWx1ZXModGhpcy4jaGFzc1N0YXRlcykuZmlsdGVyKFxuICAgICAgICBzdGF0ZSA9PiBzdGF0ZS5lbnRpdHlfaWQuc3RhcnRzV2l0aChgJHtkb21haW59LmApLFxuICAgICk7XG5cbiAgICBmb3IgKGNvbnN0IHN0YXRlIG9mIHN0YXRlRW50aXRpZXMpIHtcbiAgICAgIGNvbnN0IGhhc3NFbnRpdHkgPSBlbnRpdHlNYXBbc3RhdGUuZW50aXR5X2lkXTtcbiAgICAgIGNvbnN0IGRldmljZSAgICAgPSBkZXZpY2VNYXBbaGFzc0VudGl0eT8uZGV2aWNlX2lkXTtcblxuICAgICAgLy8gVE9ETzogQWdyZWUgb24gY29uZGl0aW9ucyAoaHR0cHM6Ly9naXRodWIuY29tL0FhbGlhbktoYW4vbXVzaHJvb20tc3RyYXRlZ3kvcHVsbC83I2Rpc2N1c3Npb25fcjExNzMwMzIzMzUpXG4gICAgICAvLyBDb2xsZWN0IHN0YXRlcyBvZiB3aGljaCBhbnkgKHdoaWNoZXZlciBjb21lcyBmaXJzdCkgb2YgdGhlIGNvbmRpdGlvbnMgYmVsb3cgYXJlIG1ldDpcbiAgICAgIC8vIDEuIFRoZSBsaW5rZWQgZW50aXR5IGlzIGxpbmtlZCB0byB0aGUgZ2l2ZW4gYXJlYS5cbiAgICAgIC8vIDIuIFRoZSBlbnRpdHkgaXMgbGlua2VkIHRvIGEgZGV2aWNlLCBhbmQgdGhlIGxpbmtlZCBkZXZpY2UgaXMgbGlua2VkIHRvIHRoZSBnaXZlbiBhcmVhLlxuICAgICAgaWYgKFxuICAgICAgICAgIChoYXNzRW50aXR5Py5hcmVhX2lkID09PSBhcmVhLmFyZWFfaWQpXG4gICAgICAgICAgfHwgKGRldmljZSAmJiBkZXZpY2UuYXJlYV9pZCA9PT0gYXJlYS5hcmVhX2lkKVxuICAgICAgKSB7XG4gICAgICAgIHN0YXRlcy5wdXNoKHN0YXRlKTtcbiAgICAgIH1cblxuICAgICAgLypcbiAgICAgICAvLyBDb2xsZWN0IHN0YXRlcyBvZiB3aGljaCBhbGwgY29uZGl0aW9ucyBiZWxvdyBhcmUgbWV0OlxuICAgICAgIC8vIDEuIFRoZSBsaW5rZWQgZW50aXR5IGlzIGxpbmtlZCB0byB0aGUgZ2l2ZW4gYXJlYSBvciBpc24ndCBsaW5rZWQgdG8gYW55IGFyZWEuXG4gICAgICAgLy8gMi4gVGhlIGxpbmtlZCBkZXZpY2UgKGlmIGFueSkgaXMgYXNzaWduZWQgdG8gdGhlIGdpdmVuIGFyZWEuXG4gICAgICAgaWYgKFxuICAgICAgICghaGFzc0VudGl0eT8uYXJlYV9pZCB8fCBoYXNzRW50aXR5LmFyZWFfaWQgPT09IGFyZWEuYXJlYV9pZClcbiAgICAgICAmJiAoZGV2aWNlICYmIGRldmljZS5hcmVhX2lkID09PSBhcmVhLmFyZWFfaWQpXG4gICAgICAgKSB7XG4gICAgICAgc3RhdGVzLnB1c2goc3RhdGUpO1xuICAgICAgIH1cbiAgICAgICAqL1xuICAgIH1cblxuICAgIHJldHVybiBzdGF0ZXM7XG4gIH1cblxuICAvKipcbiAgICogU2FuaXRpemUgYSBjbGFzc25hbWUuXG4gICAqXG4gICAqIFRoZSBuYW1lIGlzIHNhbml0aXplZCBudSB1cHBlci1jYXNpbmcgdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbmFtZSBvciBhZnRlciBhbiB1bmRlcnNjb3JlLlxuICAgKiBVbmRlcnNjb3JlZCB3aWxsIGJlIHJlbW92ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjbGFzc05hbWUgTmFtZSBvZiB0aGUgY2xhc3MgdG8gc2FuaXRpemUuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzYW5pdGl6ZWQgY2xhc3NuYW1lLlxuICAgKi9cbiAgc3RhdGljIHNhbml0aXplQ2xhc3NOYW1lKGNsYXNzTmFtZSkge1xuICAgIGNsYXNzTmFtZSA9IGNsYXNzTmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGNsYXNzTmFtZS5zbGljZSgxKTtcblxuICAgIHJldHVybiBjbGFzc05hbWUucmVwbGFjZSgvKFstX11bYS16XSkvZywgZ3JvdXAgPT5cbiAgICAgICAgZ3JvdXBcbiAgICAgICAgICAgIC50b1VwcGVyQ2FzZSgpXG4gICAgICAgICAgICAucmVwbGFjZShcIi1cIiwgXCJcIilcbiAgICAgICAgICAgIC5yZXBsYWNlKFwiX1wiLCBcIlwiKSxcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCB7SGVscGVyfTtcbiIsImltcG9ydCB7SGVscGVyfSBmcm9tIFwiLi4vSGVscGVyXCI7XG5cbi8qKlxuICogQWJzdHJhY3QgQ2FyZCBDbGFzc1xuICpcbiAqIFRvIGNyZWF0ZSBhIG5ldyBjYXJkLCBleHRlbmQgdGhlIG5ldyBjbGFzcyB3aXRoIHRoaXMgb25lLlxuICpcbiAqIEBjbGFzc1xuICogQGFic3RyYWN0XG4gKi9cbmNsYXNzIEFic3RyYWN0Q2FyZCB7XG4gIC8qKlxuICAgKiBFbnRpdHkgdG8gY3JlYXRlIHRoZSBjYXJkIGZvci5cbiAgICpcbiAgICogQHR5cGUge2hhc3NFbnRpdHkgfCBhcmVhRW50aXR5fVxuICAgKi9cbiAgZW50aXR5O1xuXG4gIC8qKlxuICAgKiBPcHRpb25zIGZvciBjcmVhdGluZyBhIGNhcmQuXG4gICAqXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBvcHRpb25zID0ge1xuICAgIHR5cGU6IFwiY3VzdG9tOm11c2hyb29tLWVudGl0eS1jYXJkXCIsXG4gICAgaWNvbjogXCJtZGk6aGVscC1jaXJjbGVcIixcbiAgfTtcblxuICAvKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7aGFzc0VudGl0eSB8IGFyZWFFbnRpdHl9IGVudGl0eSBUaGUgaGFzcyBlbnRpdHkgdG8gY3JlYXRlIGEgY2FyZCBmb3IuXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgSGVscGVyIG1vZHVsZSBpc24ndCBpbml0aWFsaXplZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVudGl0eSkge1xuICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yID09PSBBYnN0cmFjdENhcmQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkFic3RyYWN0IGNsYXNzZXMgY2FuJ3QgYmUgaW5zdGFudGlhdGVkLlwiKTtcbiAgICB9XG5cbiAgICBpZiAoIUhlbHBlci5pc0luaXRpYWxpemVkKCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBIZWxwZXIgbW9kdWxlIG11c3QgYmUgaW5pdGlhbGl6ZWQgYmVmb3JlIHVzaW5nIHRoaXMgb25lLlwiKTtcbiAgICB9XG5cbiAgICB0aGlzLmVudGl0eSA9IGVudGl0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZSB0aGUgZGVmYXVsdCBvcHRpb25zIG9mIHRoaXMgY2xhc3MgYW5kIHRoZSBjdXN0b20gb3B0aW9ucyBpbnRvIHRoZSBvcHRpb25zIG9mIHRoZSBwYXJlbnQgY2xhc3MuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbZGVmYXVsdE9wdGlvbnM9e31dIERlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIGNhcmQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbY3VzdG9tT3B0aW9ucz17fV0gQ3VzdG9tIE9wdGlvbnMgZm9yIHRoZSBjYXJkLlxuICAgKi9cbiAgbWVyZ2VPcHRpb25zKGRlZmF1bHRPcHRpb25zLCBjdXN0b21PcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgLi4uZGVmYXVsdE9wdGlvbnMsXG4gICAgICAuLi5jdXN0b21PcHRpb25zLFxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5vcHRpb25zLmRvdWJsZV90YXBfYWN0aW9uLnRhcmdldC5lbnRpdHlfaWQgPSB0aGlzLmVudGl0eS5lbnRpdHlfaWQ7XG4gICAgfSBjYXRjaCB7IH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBjYXJkIGZvciBhbiBlbnRpdHkuXG4gICAqXG4gICAqIEByZXR1cm4ge2Fic3RyYWN0T3B0aW9ucyAmIE9iamVjdH0gQSBjYXJkIG9iamVjdC5cbiAgICovXG4gIGdldENhcmQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVudGl0eTogdGhpcy5lbnRpdHkuZW50aXR5X2lkLFxuICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IHtBYnN0cmFjdENhcmR9O1xuIiwiaW1wb3J0IHtBYnN0cmFjdENhcmR9IGZyb20gXCIuL0Fic3RyYWN0Q2FyZFwiO1xuXG4vKipcbiAqIEFyZWEgQ2FyZCBDbGFzc1xuICpcbiAqIFVzZWQgdG8gY3JlYXRlIGEgY2FyZCBmb3IgYW4gZW50aXR5IG9mIHRoZSBhcmVhIGRvbWFpbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBleHRlbmRzIEFic3RyYWN0Q2FyZFxuICovXG5jbGFzcyBBcmVhQ2FyZCBleHRlbmRzIEFic3RyYWN0Q2FyZCB7XG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMgb2YgdGhlIGNhcmQuXG4gICAqXG4gICAqIEB0eXBlIHthcmVhQ2FyZE9wdGlvbnN9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICAjZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgdHlwZTogXCJjdXN0b206bXVzaHJvb20tdGVtcGxhdGUtY2FyZFwiLFxuICAgIHByaW1hcnk6IHVuZGVmaW5lZCxcbiAgICBpY29uOiBcIm1kaTp0ZXh0dXJlLWJveFwiLFxuICAgIGljb25fY29sb3I6IFwiYmx1ZVwiLFxuICAgIHRhcF9hY3Rpb246IHtcbiAgICAgIGFjdGlvbjogXCJuYXZpZ2F0ZVwiLFxuICAgICAgbmF2aWdhdGlvbl9wYXRoOiB1bmRlZmluZWQsXG4gICAgfSxcbiAgfTtcblxuICAvKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7YXJlYUVudGl0eX0gYXJlYSBUaGUgYXJlYSBlbnRpdHkgdG8gY3JlYXRlIGEgY2FyZCBmb3IuXG4gICAqIEBwYXJhbSB7cGVyc29uQ2FyZE9wdGlvbnN9IFtvcHRpb25zPXt9XSBPcHRpb25zIGZvciB0aGUgY2FyZC5cbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBIZWxwZXIgbW9kdWxlIGlzbid0IGluaXRpYWxpemVkLlxuICAgKi9cbiAgY29uc3RydWN0b3IoYXJlYSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoYXJlYSk7XG4gICAgdGhpcy4jZGVmYXVsdE9wdGlvbnMucHJpbWFyeSAgICAgICAgICAgICAgICAgICAgPSBhcmVhLm5hbWU7XG4gICAgdGhpcy4jZGVmYXVsdE9wdGlvbnMudGFwX2FjdGlvbi5uYXZpZ2F0aW9uX3BhdGggPSBhcmVhLmFyZWFfaWQ7XG5cbiAgICB0aGlzLm1lcmdlT3B0aW9ucyhcbiAgICAgICAgdGhpcy4jZGVmYXVsdE9wdGlvbnMsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQge0FyZWFDYXJkfTtcbiIsImltcG9ydCB7U2Vuc29yQ2FyZH0gZnJvbSBcIi4vU2Vuc29yQ2FyZFwiO1xuXG4vKipcbiAqIFNlbnNvciBDYXJkIENsYXNzXG4gKlxuICogVXNlZCB0byBjcmVhdGUgYSBjYXJkIGZvciBjb250cm9sbGluZyBhbiBlbnRpdHkgb2YgdGhlIGJpbmFyeV9zZW5zb3IgZG9tYWluLlxuICpcbiAqIEBjbGFzc1xuICogQGV4dGVuZHMgU2Vuc29yQ2FyZFxuICovXG5jbGFzcyBCaW5hcnlTZW5zb3JDYXJkIGV4dGVuZHMgU2Vuc29yQ2FyZCB7XG4gIC8vIFRIZSBiaW5hcnkgQ2FyZCBoYXMgdGhlIHNhbWUgcmVwcmVzZW50YXRpb24gYXMgdGhlIFNlbnNvciBDYXJkLlxufVxuXG5leHBvcnQge0JpbmFyeVNlbnNvckNhcmR9O1xuIiwiaW1wb3J0IHtBYnN0cmFjdENhcmR9IGZyb20gXCIuL0Fic3RyYWN0Q2FyZFwiO1xuXG4vKipcbiAqIENhbWVyYSBDYXJkIENsYXNzXG4gKlxuICogVXNlZCB0byBjcmVhdGUgYSBjYXJkIGZvciBjb250cm9sbGluZyBhbiBlbnRpdHkgb2YgdGhlIGNhbWVyYSBkb21haW4uXG4gKlxuICogQGNsYXNzXG4gKiBAZXh0ZW5kcyBBYnN0cmFjdENhcmRcbiAqL1xuY2xhc3MgQ2FtZXJhQ2FyZCBleHRlbmRzIEFic3RyYWN0Q2FyZCB7XG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMgb2YgdGhlIGNhcmQuXG4gICAqXG4gICAqIEB0eXBlIHtjYW1lcmFDYXJkT3B0aW9uc31cbiAgICogQHByaXZhdGVcbiAgICovXG4gICNkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICB0eXBlOiBcImN1c3RvbTp3ZWJydGMtY2FtZXJhXCIsXG4gICAgaWNvbjogdW5kZWZpbmVkLFxuICB9O1xuXG4gIC8qKlxuICAgKiBDbGFzcyBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtoYXNzRW50aXR5fSBlbnRpdHkgVGhlIGhhc3MgZW50aXR5IHRvIGNyZWF0ZSBhIGNhcmQgZm9yLlxuICAgKiBAcGFyYW0ge2NhbWVyYUNhcmRPcHRpb25zfSBbb3B0aW9ucz17fV0gT3B0aW9ucyBmb3IgdGhlIGNhcmQuXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgSGVscGVyIG1vZHVsZSBpc24ndCBpbml0aWFsaXplZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVudGl0eSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoZW50aXR5KTtcbiAgICB0aGlzLm1lcmdlT3B0aW9ucyhcbiAgICAgICAgdGhpcy4jZGVmYXVsdE9wdGlvbnMsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQge0NhbWVyYUNhcmR9O1xuIiwiaW1wb3J0IHtBYnN0cmFjdENhcmR9IGZyb20gXCIuL0Fic3RyYWN0Q2FyZFwiO1xuXG4vKipcbiAqIENsaW1hdGUgQ2FyZCBDbGFzc1xuICpcbiAqIFVzZWQgdG8gY3JlYXRlIGEgY2FyZCBmb3IgY29udHJvbGxpbmcgYW4gZW50aXR5IG9mIHRoZSBjbGltYXRlIGRvbWFpbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBleHRlbmRzIEFic3RyYWN0Q2FyZFxuICovXG5jbGFzcyBDbGltYXRlQ2FyZCBleHRlbmRzIEFic3RyYWN0Q2FyZCB7XG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMgb2YgdGhlIGNhcmQuXG4gICAqXG4gICAqIEB0eXBlIHtjbGltYXRlQ2FyZE9wdGlvbnN9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICAjZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgdHlwZTogXCJjdXN0b206bXVzaHJvb20tY2xpbWF0ZS1jYXJkXCIsXG4gICAgaWNvbjogdW5kZWZpbmVkLFxuICAgIGh2YWNfbW9kZXM6IFtcbiAgICAgIFwib2ZmXCIsXG4gICAgICBcImNvb2xcIixcbiAgICAgIFwiaGVhdFwiLFxuICAgICAgXCJmYW5fb25seVwiLFxuICAgIF0sXG4gICAgc2hvd190ZW1wZXJhdHVyZV9jb250cm9sOiB0cnVlLFxuICB9O1xuXG4gIC8qKlxuICAgKiBDbGFzcyBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtoYXNzRW50aXR5fSBlbnRpdHkgVGhlIGhhc3MgZW50aXR5IHRvIGNyZWF0ZSBhIGNhcmQgZm9yLlxuICAgKiBAcGFyYW0ge2NsaW1hdGVDYXJkT3B0aW9uc30gW29wdGlvbnM9e31dIE9wdGlvbnMgZm9yIHRoZSBjYXJkLlxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIEhlbHBlciBtb2R1bGUgaXNuJ3QgaW5pdGlhbGl6ZWQuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbnRpdHksIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKGVudGl0eSk7XG4gICAgdGhpcy5tZXJnZU9wdGlvbnMoXG4gICAgICAgIHRoaXMuI2RlZmF1bHRPcHRpb25zLFxuICAgICAgICBvcHRpb25zLFxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IHtDbGltYXRlQ2FyZH07XG4iLCJpbXBvcnQge0Fic3RyYWN0Q2FyZH0gZnJvbSBcIi4vQWJzdHJhY3RDYXJkXCI7XG5cbi8qKlxuICogQ292ZXIgQ2FyZCBDbGFzc1xuICpcbiAqIFVzZWQgdG8gY3JlYXRlIGEgY2FyZCBmb3IgY29udHJvbGxpbmcgYW4gZW50aXR5IG9mIHRoZSBjb3ZlciBkb21haW4uXG4gKlxuICogQGNsYXNzXG4gKiBAZXh0ZW5kcyBBYnN0cmFjdENhcmRcbiAqL1xuY2xhc3MgQ292ZXJDYXJkIGV4dGVuZHMgQWJzdHJhY3RDYXJkIHtcbiAgLyoqXG4gICAqIERlZmF1bHQgb3B0aW9ucyBvZiB0aGUgY2FyZC5cbiAgICpcbiAgICogQHR5cGUge2NvdmVyQ2FyZE9wdGlvbnN9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICAjZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgdHlwZTogXCJjdXN0b206bXVzaHJvb20tY292ZXItY2FyZFwiLFxuICAgIGljb246IHVuZGVmaW5lZCxcbiAgICBzaG93X2J1dHRvbnNfY29udHJvbDogdHJ1ZSxcbiAgICBzaG93X3Bvc2l0aW9uX2NvbnRyb2w6IHRydWUsXG4gICAgc2hvd190aWx0X3Bvc2l0aW9uX2NvbnRyb2w6IHRydWUsXG4gIH07XG5cbiAgLyoqXG4gICAqIENsYXNzIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0ge2hhc3NFbnRpdHl9IGVudGl0eSBUaGUgaGFzcyBlbnRpdHkgdG8gY3JlYXRlIGEgY2FyZCBmb3IuXG4gICAqIEBwYXJhbSB7Y292ZXJDYXJkT3B0aW9uc30gW29wdGlvbnM9e31dIE9wdGlvbnMgZm9yIHRoZSBjYXJkLlxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIEhlbHBlciBtb2R1bGUgaXNuJ3QgaW5pdGlhbGl6ZWQuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbnRpdHksIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKGVudGl0eSk7XG4gICAgdGhpcy5tZXJnZU9wdGlvbnMoXG4gICAgICAgIHRoaXMuI2RlZmF1bHRPcHRpb25zLFxuICAgICAgICBvcHRpb25zLFxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IHtDb3ZlckNhcmR9O1xuIiwiaW1wb3J0IHtBYnN0cmFjdENhcmR9IGZyb20gXCIuL0Fic3RyYWN0Q2FyZFwiO1xuXG4vKipcbiAqIEZhbiBDYXJkIENsYXNzXG4gKlxuICogVXNlZCB0byBjcmVhdGUgYSBjYXJkIGZvciBjb250cm9sbGluZyBhbiBlbnRpdHkgb2YgdGhlIGZhbiBkb21haW4uXG4gKlxuICogQGNsYXNzXG4gKiBAZXh0ZW5kcyBBYnN0cmFjdENhcmRcbiAqL1xuY2xhc3MgRmFuQ2FyZCBleHRlbmRzIEFic3RyYWN0Q2FyZCB7XG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMgb2YgdGhlIGNhcmQuXG4gICAqXG4gICAqIEB0eXBlIHtmYW5DYXJkT3B0aW9uc31cbiAgICogQHByaXZhdGVcbiAgICovXG4gICNkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICB0eXBlOiBcImN1c3RvbTptdXNocm9vbS1mYW4tY2FyZFwiLFxuICAgIGljb246IHVuZGVmaW5lZCxcbiAgICBzaG93X3BlcmNlbnRhZ2VfY29udHJvbDogdHJ1ZSxcbiAgICBzaG93X29zY2lsbGF0ZV9jb250cm9sOiB0cnVlLFxuICAgIGljb25fYW5pbWF0aW9uOiB0cnVlLFxuICB9O1xuXG4gIC8qKlxuICAgKiBDbGFzcyBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtoYXNzRW50aXR5fSBlbnRpdHkgVGhlIGhhc3MgZW50aXR5IHRvIGNyZWF0ZSBhIGNhcmQgZm9yLlxuICAgKiBAcGFyYW0ge2ZhbkNhcmRPcHRpb25zfSBbb3B0aW9ucz17fV0gT3B0aW9ucyBmb3IgdGhlIGNhcmQuXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgSGVscGVyIG1vZHVsZSBpc24ndCBpbml0aWFsaXplZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVudGl0eSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoZW50aXR5KTtcbiAgICB0aGlzLm1lcmdlT3B0aW9ucyhcbiAgICAgICAgdGhpcy4jZGVmYXVsdE9wdGlvbnMsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQge0ZhbkNhcmR9O1xuIiwiaW1wb3J0IHtBYnN0cmFjdENhcmR9IGZyb20gXCIuL0Fic3RyYWN0Q2FyZFwiO1xuXG4vKipcbiAqIExpZ2h0IENhcmQgQ2xhc3NcbiAqXG4gKiBVc2VkIHRvIGNyZWF0ZSBhIGNhcmQgZm9yIGNvbnRyb2xsaW5nIGFuIGVudGl0eSBvZiB0aGUgbGlnaHQgZG9tYWluLlxuICpcbiAqIEBjbGFzc1xuICogQGV4dGVuZHMgQWJzdHJhY3RDYXJkXG4gKi9cbmNsYXNzIExpZ2h0Q2FyZCBleHRlbmRzIEFic3RyYWN0Q2FyZCB7XG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMgb2YgdGhlIGNhcmQuXG4gICAqXG4gICAqIEB0eXBlIHtsaWdodENhcmRPcHRpb25zfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgI2RlZmF1bHRPcHRpb25zID0ge1xuICAgIHR5cGU6IFwiY3VzdG9tOm11c2hyb29tLWxpZ2h0LWNhcmRcIixcbiAgICBpY29uOiB1bmRlZmluZWQsXG4gICAgc2hvd19icmlnaHRuZXNzX2NvbnRyb2w6IHRydWUsXG4gICAgc2hvd19jb2xvcl9jb250cm9sOiB0cnVlLFxuICAgIHVzZV9saWdodF9jb2xvcjogdHJ1ZSxcbiAgICBkb3VibGVfdGFwX2FjdGlvbjoge1xuICAgICAgdGFyZ2V0OiB7XG4gICAgICAgIGVudGl0eV9pZDogdW5kZWZpbmVkLFxuICAgICAgfSxcbiAgICAgIGFjdGlvbjogXCJjYWxsLXNlcnZpY2VcIixcbiAgICAgIHNlcnZpY2U6IFwibGlnaHQudHVybl9vblwiLFxuICAgICAgZGF0YToge1xuICAgICAgICByZ2JfY29sb3I6IFsyNTUsIDI1NSwgMjU1XSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcblxuICAvKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7aGFzc0VudGl0eX0gZW50aXR5IFRoZSBoYXNzIGVudGl0eSB0byBjcmVhdGUgYSBjYXJkIGZvci5cbiAgICogQHBhcmFtIHtsaWdodENhcmRPcHRpb25zfSBbb3B0aW9ucz17fV0gT3B0aW9ucyBmb3IgdGhlIGNhcmQuXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgSGVscGVyIG1vZHVsZSBpc24ndCBpbml0aWFsaXplZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVudGl0eSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoZW50aXR5KTtcbiAgICB0aGlzLm1lcmdlT3B0aW9ucyhcbiAgICAgICAgdGhpcy4jZGVmYXVsdE9wdGlvbnMsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQge0xpZ2h0Q2FyZH07XG4iLCJpbXBvcnQge0Fic3RyYWN0Q2FyZH0gZnJvbSBcIi4vQWJzdHJhY3RDYXJkXCI7XG5cbi8qKlxuICogTWVkaWFwbGF5ZXIgQ2FyZCBDbGFzc1xuICpcbiAqIFVzZWQgdG8gY3JlYXRlIGEgY2FyZCBmb3IgY29udHJvbGxpbmcgYW4gZW50aXR5IG9mIHRoZSBtZWRpYV9wbGF5ZXIgZG9tYWluLlxuICpcbiAqIEBjbGFzc1xuICogQGV4dGVuZHMgQWJzdHJhY3RDYXJkXG4gKi9cbmNsYXNzIE1lZGlhUGxheWVyQ2FyZCBleHRlbmRzIEFic3RyYWN0Q2FyZCB7XG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMgb2YgdGhlIGNhcmQuXG4gICAqXG4gICAqIEB0eXBlIHttZWRpYVBsYXllckNhcmRPcHRpb25zfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgI2RlZmF1bHRPcHRpb25zID0ge1xuICAgIHR5cGU6IFwiY3VzdG9tOm11c2hyb29tLW1lZGlhLXBsYXllci1jYXJkXCIsXG4gICAgdXNlX21lZGlhX2luZm86IHRydWUsXG4gICAgbWVkaWFfY29udHJvbHM6IFtcbiAgICAgIFwib25fb2ZmXCIsXG4gICAgICBcInBsYXlfcGF1c2Vfc3RvcFwiLFxuICAgIF0sXG4gICAgc2hvd192b2x1bWVfbGV2ZWw6IHRydWUsXG4gICAgdm9sdW1lX2NvbnRyb2xzOiBbXG4gICAgICBcInZvbHVtZV9tdXRlXCIsXG4gICAgICBcInZvbHVtZV9zZXRcIixcbiAgICAgIFwidm9sdW1lX2J1dHRvbnNcIixcbiAgICBdLFxuICB9O1xuXG4gIC8qKlxuICAgKiBDbGFzcyBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtoYXNzRW50aXR5fSBlbnRpdHkgVGhlIGhhc3MgZW50aXR5IHRvIGNyZWF0ZSBhIGNhcmQgZm9yLlxuICAgKiBAcGFyYW0ge21lZGlhUGxheWVyQ2FyZE9wdGlvbnN9IFtvcHRpb25zPXt9XSBPcHRpb25zIGZvciB0aGUgY2FyZC5cbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBIZWxwZXIgbW9kdWxlIGlzbid0IGluaXRpYWxpemVkLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZW50aXR5LCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihlbnRpdHkpO1xuICAgIHRoaXMubWVyZ2VPcHRpb25zKFxuICAgICAgICB0aGlzLiNkZWZhdWx0T3B0aW9ucyxcbiAgICAgICAgb3B0aW9ucyxcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCB7TWVkaWFQbGF5ZXJDYXJkfTtcbiIsImltcG9ydCB7QWJzdHJhY3RDYXJkfSBmcm9tIFwiLi9BYnN0cmFjdENhcmRcIjtcblxuLyoqXG4gKiBNaXNjZWxsYW5lb3VzIENhcmQgQ2xhc3NcbiAqXG4gKiBVc2VkIHRvIGNyZWF0ZSBhIGNhcmQgYW4gZW50aXR5IG9mIGFueSBkb21haW4uXG4gKlxuICogQGNsYXNzXG4gKiBAZXh0ZW5kcyBBYnN0cmFjdENhcmRcbiAqL1xuY2xhc3MgTWlzY2VsbGFuZW91c0NhcmQgZXh0ZW5kcyBBYnN0cmFjdENhcmQge1xuICAvKipcbiAgICogRGVmYXVsdCBvcHRpb25zIG9mIHRoZSBjYXJkLlxuICAgKlxuICAgKiBAdHlwZSB7bWlzY2VsbGFuZW91c0NhcmRPcHRpb25zfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgI2RlZmF1bHRPcHRpb25zID0ge1xuICAgIHR5cGU6IFwiY3VzdG9tOm11c2hyb29tLWVudGl0eS1jYXJkXCIsXG4gICAgaWNvbl9jb2xvcjogXCJibHVlLWdyZXlcIixcbiAgfTtcblxuICAvKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7aGFzc0VudGl0eX0gZW50aXR5IFRoZSBoYXNzIGVudGl0eSB0byBjcmVhdGUgYSBjYXJkIGZvci5cbiAgICogQHBhcmFtIHttaXNjZWxsYW5lb3VzQ2FyZE9wdGlvbnN9IFtvcHRpb25zPXt9XSBPcHRpb25zIGZvciB0aGUgY2FyZC5cbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBIZWxwZXIgbW9kdWxlIGlzbid0IGluaXRpYWxpemVkLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZW50aXR5LCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihlbnRpdHkpO1xuICAgIHRoaXMubWVyZ2VPcHRpb25zKFxuICAgICAgICB0aGlzLiNkZWZhdWx0T3B0aW9ucyxcbiAgICAgICAgb3B0aW9ucyxcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCB7TWlzY2VsbGFuZW91c0NhcmR9O1xuIiwiaW1wb3J0IHtBYnN0cmFjdENhcmR9IGZyb20gXCIuL0Fic3RyYWN0Q2FyZFwiO1xuXG4vKipcbiAqIFBlcnNvbiBDYXJkIENsYXNzXG4gKlxuICogVXNlZCB0byBjcmVhdGUgYSBjYXJkIGZvciBhbiBlbnRpdHkgb2YgdGhlIHBlcnNvbiBkb21haW4uXG4gKlxuICogQGNsYXNzXG4gKiBAZXh0ZW5kcyBBYnN0cmFjdENhcmRcbiAqL1xuY2xhc3MgUGVyc29uQ2FyZCBleHRlbmRzIEFic3RyYWN0Q2FyZCB7XG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMgb2YgdGhlIGNhcmQuXG4gICAqXG4gICAqIEB0eXBlIHtwZXJzb25DYXJkT3B0aW9uc31cbiAgICogQHByaXZhdGVcbiAgICovXG4gICNkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICB0eXBlOiBcImN1c3RvbTptdXNocm9vbS1wZXJzb24tY2FyZFwiLFxuICAgIGxheW91dDogXCJ2ZXJ0aWNhbFwiLFxuICAgIHByaW1hcnlfaW5mbzogXCJub25lXCIsXG4gICAgc2Vjb25kYXJ5X2luZm86IFwibm9uZVwiLFxuICAgIGljb25fdHlwZTogXCJlbnRpdHktcGljdHVyZVwiLFxuICB9O1xuXG4gIC8qKlxuICAgKiBDbGFzcyBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtoYXNzRW50aXR5fSBlbnRpdHkgVGhlIGhhc3MgZW50aXR5IHRvIGNyZWF0ZSBhIGNhcmQgZm9yLlxuICAgKiBAcGFyYW0ge3BlcnNvbkNhcmRPcHRpb25zfSBbb3B0aW9ucz17fV0gT3B0aW9ucyBmb3IgdGhlIGNhcmQuXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgSGVscGVyIG1vZHVsZSBpc24ndCBpbml0aWFsaXplZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVudGl0eSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoZW50aXR5KTtcbiAgICB0aGlzLm1lcmdlT3B0aW9ucyhcbiAgICAgICAgdGhpcy4jZGVmYXVsdE9wdGlvbnMsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQge1BlcnNvbkNhcmR9O1xuIiwiaW1wb3J0IHtBYnN0cmFjdENhcmR9IGZyb20gXCIuL0Fic3RyYWN0Q2FyZFwiO1xuXG4vKipcbiAqIFNlbnNvciBDYXJkIENsYXNzXG4gKlxuICogVXNlZCB0byBjcmVhdGUgYSBjYXJkIGZvciBjb250cm9sbGluZyBhbiBlbnRpdHkgb2YgdGhlIHNlbnNvciBkb21haW4uXG4gKlxuICogQGNsYXNzXG4gKiBAZXh0ZW5kcyBBYnN0cmFjdENhcmRcbiAqL1xuY2xhc3MgU2Vuc29yQ2FyZCBleHRlbmRzIEFic3RyYWN0Q2FyZCB7XG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMgb2YgdGhlIGNhcmQuXG4gICAqXG4gICAqIEB0eXBlIHtzZW5zb3JDYXJkT3B0aW9uc31cbiAgICogQHByaXZhdGVcbiAgICovXG4gICNkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICB0eXBlOiBcImN1c3RvbTptdXNocm9vbS1lbnRpdHktY2FyZFwiLFxuICAgIGljb25fY29sb3I6IFwiZ3JlZW5cIixcbiAgICBhbmltYXRlOiB0cnVlLFxuICAgIGxpbmVfY29sb3I6IFwiZ3JlZW5cIixcbiAgfTtcblxuICAvKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7aGFzc0VudGl0eX0gZW50aXR5IFRoZSBoYXNzIGVudGl0eSB0byBjcmVhdGUgYSBjYXJkIGZvci5cbiAgICogQHBhcmFtIHtzZW5zb3JDYXJkT3B0aW9uc30gW29wdGlvbnM9e31dIE9wdGlvbnMgZm9yIHRoZSBjYXJkLlxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIEhlbHBlciBtb2R1bGUgaXNuJ3QgaW5pdGlhbGl6ZWQuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbnRpdHksIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKGVudGl0eSk7XG4gICAgdGhpcy5tZXJnZU9wdGlvbnMoXG4gICAgICAgIHRoaXMuI2RlZmF1bHRPcHRpb25zLFxuICAgICAgICBvcHRpb25zLFxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IHtTZW5zb3JDYXJkfTtcbiIsImltcG9ydCB7QWJzdHJhY3RDYXJkfSBmcm9tIFwiLi9BYnN0cmFjdENhcmRcIjtcblxuLyoqXG4gKiBTd2l0Y2ggQ2FyZCBDbGFzc1xuICpcbiAqIFVzZWQgdG8gY3JlYXRlIGEgY2FyZCBmb3IgY29udHJvbGxpbmcgYW4gZW50aXR5IG9mIHRoZSBzd2l0Y2ggZG9tYWluLlxuICpcbiAqIEBjbGFzc1xuICogQGV4dGVuZHMgQWJzdHJhY3RDYXJkXG4gKi9cbmNsYXNzIFN3aXRjaENhcmQgZXh0ZW5kcyBBYnN0cmFjdENhcmQge1xuICAvKipcbiAgICogRGVmYXVsdCBvcHRpb25zIG9mIHRoZSBjYXJkLlxuICAgKlxuICAgKiBAdHlwZSB7c3dpdGNoQ2FyZE9wdGlvbnN9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICAjZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgdHlwZTogXCJjdXN0b206bXVzaHJvb20tZW50aXR5LWNhcmRcIixcbiAgICBpY29uOiB1bmRlZmluZWQsXG4gICAgdGFwX2FjdGlvbjoge1xuICAgICAgYWN0aW9uOiBcInRvZ2dsZVwiLFxuICAgIH0sXG4gIH07XG5cbiAgLyoqXG4gICAqIENsYXNzIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0ge2hhc3NFbnRpdHl9IGVudGl0eSBUaGUgaGFzcyBlbnRpdHkgdG8gY3JlYXRlIGEgY2FyZCBmb3IuXG4gICAqIEBwYXJhbSB7c3dpdGNoQ2FyZE9wdGlvbnN9IFtvcHRpb25zPXt9XSBPcHRpb25zIGZvciB0aGUgY2FyZC5cbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBIZWxwZXIgbW9kdWxlIGlzbid0IGluaXRpYWxpemVkLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZW50aXR5LCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihlbnRpdHkpO1xuICAgIHRoaXMubWVyZ2VPcHRpb25zKFxuICAgICAgICB0aGlzLiNkZWZhdWx0T3B0aW9ucyxcbiAgICAgICAgb3B0aW9ucyxcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCB7U3dpdGNoQ2FyZH07XG4iLCIvKipcbiAqIFRpdGxlIENhcmQgY2xhc3MuXG4gKlxuICogVXNlZCBmb3IgY3JlYXRpbmcgYSBUaXRsZSBDYXJkLlxuICpcbiAqIEBjbGFzc1xuICovXG5jbGFzcyBUaXRsZUNhcmQge1xuICAvKipcbiAgICogQHR5cGUge3N0cmluZ1tdfSBBbiBhcnJheSBvZiBhcmVhIGlkcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gICNhcmVhSWRzO1xuXG4gIC8qKlxuICAgKiBAdHlwZSB7dGl0bGVDYXJkT3B0aW9uc31cbiAgICogQHByaXZhdGVcbiAgICovXG4gICNvcHRpb25zID0ge1xuICAgIHRpdGxlOiB1bmRlZmluZWQsXG4gICAgc3VidGl0bGU6IHVuZGVmaW5lZCxcbiAgICBzaG93Q29udHJvbHM6IHRydWUsXG4gICAgaWNvbk9uOiBcIm1kaTpwb3dlci1vblwiLFxuICAgIGljb25PZmY6IFwibWRpOnBvd2VyLW9mZlwiLFxuICAgIG9uU2VydmljZTogXCJub25lXCIsXG4gICAgb2ZmU2VydmljZTogXCJub25lXCIsXG4gIH07XG5cbiAgLyoqXG4gICAqIENsYXNzIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0ge2FyZWFFbnRpdHlbXX0gYXJlYXMgQW4gYXJyYXkgb2YgYXJlYSBlbnRpdGllcy5cbiAgICogQHBhcmFtIHt0aXRsZUNhcmRPcHRpb25zfSBvcHRpb25zIFRpdGxlIENhcmQgb3B0aW9ucy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGFyZWFzLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLiNhcmVhSWRzID0gYXJlYXMubWFwKGFyZWEgPT4gYXJlYS5hcmVhX2lkKTtcbiAgICB0aGlzLiNvcHRpb25zID0ge1xuICAgICAgLi4udGhpcy4jb3B0aW9ucyxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBUaXRsZSBjYXJkLlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IEEgVGl0bGUgY2FyZC5cbiAgICovXG4gIGNyZWF0ZUNhcmQoKSB7XG4gICAgLyoqIEB0eXBlIHtPYmplY3RbXX0gKi9cbiAgICBjb25zdCBjYXJkcyA9IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogXCJjdXN0b206bXVzaHJvb20tdGl0bGUtY2FyZFwiLFxuICAgICAgICB0aXRsZTogdGhpcy4jb3B0aW9ucy50aXRsZSxcbiAgICAgICAgc3VidGl0bGU6IHRoaXMuI29wdGlvbnMuc3VidGl0bGUsXG4gICAgICB9LFxuICAgIF07XG5cbiAgICBpZiAodGhpcy4jb3B0aW9ucy5zaG93Q29udHJvbHMpIHtcbiAgICAgIGNhcmRzLnB1c2goe1xuICAgICAgICB0eXBlOiBcImhvcml6b250YWwtc3RhY2tcIixcbiAgICAgICAgY2FyZHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImN1c3RvbTptdXNocm9vbS10ZW1wbGF0ZS1jYXJkXCIsXG4gICAgICAgICAgICBpY29uOiB0aGlzLiNvcHRpb25zLmljb25PZmYsXG4gICAgICAgICAgICBsYXlvdXQ6IFwidmVydGljYWxcIixcbiAgICAgICAgICAgIGljb25fY29sb3I6IFwicmVkXCIsXG4gICAgICAgICAgICB0YXBfYWN0aW9uOiB7XG4gICAgICAgICAgICAgIGFjdGlvbjogXCJjYWxsLXNlcnZpY2VcIixcbiAgICAgICAgICAgICAgc2VydmljZTogdGhpcy4jb3B0aW9ucy5vZmZTZXJ2aWNlLFxuICAgICAgICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgICAgICBhcmVhX2lkOiB0aGlzLiNhcmVhSWRzLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBkYXRhOiB7fSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBcImN1c3RvbTptdXNocm9vbS10ZW1wbGF0ZS1jYXJkXCIsXG4gICAgICAgICAgICBpY29uOiB0aGlzLiNvcHRpb25zLmljb25PbixcbiAgICAgICAgICAgIGxheW91dDogXCJ2ZXJ0aWNhbFwiLFxuICAgICAgICAgICAgaWNvbl9jb2xvcjogXCJhbWJlclwiLFxuICAgICAgICAgICAgdGFwX2FjdGlvbjoge1xuICAgICAgICAgICAgICBhY3Rpb246IFwiY2FsbC1zZXJ2aWNlXCIsXG4gICAgICAgICAgICAgIHNlcnZpY2U6IHRoaXMuI29wdGlvbnMub25TZXJ2aWNlLFxuICAgICAgICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgICAgICBhcmVhX2lkOiB0aGlzLiNhcmVhSWRzLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBkYXRhOiB7fSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBcImhvcml6b250YWwtc3RhY2tcIixcbiAgICAgIGNhcmRzOiBjYXJkcyxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCB7VGl0bGVDYXJkfTtcbiIsIi8qKlxuICogQG5hbWVzcGFjZSB0eXBlZGVmcy5jYXJkc1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gYWJzdHJhY3RPcHRpb25zXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdHlwZSBUaGUgdHlwZSBvZiB0aGUgY2FyZC5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpY29uIEljb24gb2YgdGhlIGNhcmQuXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSB0aXRsZUNhcmRPcHRpb25zIFRpdGxlIENhcmQgb3B0aW9ucy5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbdGl0bGVdIFRpdGxlIHRvIHJlbmRlci4gTWF5IGNvbnRhaW4gdGVtcGxhdGVzLlxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtzdWJ0aXRsZV0gU3VidGl0bGUgdG8gcmVuZGVyLiBNYXkgY29udGFpbiB0ZW1wbGF0ZXMuXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtzaG93Q29udHJvbHM9dHJ1ZV0gRmFsc2UgdG8gaGlkZSBjb250cm9scy5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbaWNvbk9uXSBJY29uIHRvIHNob3cgZm9yIHN3aXRjaGluZyBlbnRpdGllcyBmcm9tIG9mZiBzdGF0ZS5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbaWNvbk9mZl0gSWNvbiB0byBzaG93IGZvciBzd2l0Y2hpbmcgZW50aXRpZXMgdG8gb2ZmIHN0YXRlLlxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvblNlcnZpY2U9bm9uZV0gU2VydmljZSB0byBjYWxsIGZvciBzd2l0Y2hpbmcgZW50aXRpZXMgZnJvbSBvZmYgc3RhdGUuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW29mZlNlcnZpY2U9bm9uZV0gU2VydmljZSB0byBjYWxsIGZvciBzd2l0Y2hpbmcgZW50aXRpZXMgdG8gb2ZmIHN0YXRlLlxuICogQG1lbWJlck9mIHR5cGVkZWZzLmNhcmRzXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7YWJzdHJhY3RPcHRpb25zICYgT2JqZWN0fSBsaWdodENhcmRPcHRpb25zIExpZ2h0IENhcmQgb3B0aW9ucy5cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW3Nob3dfYnJpZ2h0bmVzc19jb250cm9sPXRydWVdICBTaG93IGEgc2xpZGVyIHRvIGNvbnRyb2wgYnJpZ2h0bmVzc1xuICogQHByb3BlcnR5IHtib29sZWFufSBbc2hvd19jb2xvcl9jb250cm9sPXRydWVdIFNob3cgYSBzbGlkZXIgdG8gY29udHJvbCBSR0IgY29sb3JcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW3VzZV9saWdodF9jb2xvcj10cnVlXSBDb2xvcml6ZSB0aGUgaWNvbiBhbmQgc2xpZGVyIGFjY29yZGluZyBsaWdodCB0ZW1wZXJhdHVyZSBvciBjb2xvclxuICogQHByb3BlcnR5IHt7ZG91YmxlX3RhcF9hY3Rpb246IGxpZ2h0RG91YmxlVGFwQWN0aW9ufX0gW2FjdGlvbl0gSG9tZSBhc3Npc3RhbnQgYWN0aW9uIHRvIHBlcmZvcm0gb24gZG91YmxlX3RhcFxuICogQG1lbWJlck9mIHR5cGVkZWZzLmNhcmRzXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBsaWdodERvdWJsZVRhcEFjdGlvbiBIb21lIGFzc2lzdGFudCBhY3Rpb24gdG8gcGVyZm9ybSBvbiBkb3VibGVfdGFwLlxuICogQHByb3BlcnR5IHt7ZW50aXR5X2lkOiBzdHJpbmd9fSB0YXJnZXQgVGhlIHRhcmdldCBlbnRpdHkgaWQuXG4gKiBAcHJvcGVydHkge1wiY2FsbC1zZXJ2aWNlXCJ9IGFjdGlvbiBDYWxscyBhIGhhc3Mgc2VydmljZS5cbiAqIEBwcm9wZXJ0eSB7XCJsaWdodC50dXJuX29uXCJ9IHNlcnZpY2UgVGhlIGhhc3Mgc2VydmljZSB0byBjYWxsXG4gKiBAcHJvcGVydHkge3tyZ2JfY29sb3I6IFsyNTUsIDI1NSwgMjU1XX19IGRhdGEgVGhlIGRhdGEgcGF5bG9hZCBmb3IgdGhlIHNlcnZpY2UuXG4gKiBAbWVtYmVyT2YgdHlwZWRlZnMuY2FyZHNcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHthYnN0cmFjdE9wdGlvbnMgJiBPYmplY3R9IGNvdmVyQ2FyZE9wdGlvbnMgQ292ZXIgQ2FyZCBvcHRpb25zLlxuICogQHByb3BlcnR5IHtib29sZWFufSBbc2hvd19idXR0b25zX2NvbnRyb2w9dHJ1ZV0gU2hvdyBidXR0b25zIHRvIG9wZW4sIGNsb3NlIGFuZCBzdG9wIGNvdmVyLlxuICogQHByb3BlcnR5IHtib29sZWFufSBbc2hvd19wb3NpdGlvbl9jb250cm9sPXRydWVdIFNob3cgYSBzbGlkZXIgdG8gY29udHJvbCBwb3NpdGlvbiBvZiB0aGUgY292ZXIuXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtzaG93X3RpbHRfcG9zaXRpb25fY29udHJvbD10cnVlXSBTaG93IGEgc2xpZGVyIHRvIGNvbnRyb2wgdGlsdCBwb3NpdGlvbiBvZiB0aGUgY292ZXIuXG4gKiBAbWVtYmVyT2YgdHlwZWRlZnMuY2FyZHNcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHthYnN0cmFjdE9wdGlvbnMgJiBPYmplY3R9IGZhbkNhcmRPcHRpb25zIEZhbiBDYXJkIG9wdGlvbnMuXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtzaG93X3BlcmNlbnRhZ2VfY29udHJvbD10cnVlXSBTaG93IGEgc2xpZGVyIHRvIGNvbnRyb2wgc3BlZWQuXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtzaG93X29zY2lsbGF0ZV9jb250cm9sPXRydWVdIFNob3cgYSBidXR0b24gdG8gY29udHJvbCBvc2NpbGxhdGlvbi5cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2ljb25fYW5pbWF0aW9uPXRydWVdIEFuaW1hdGUgdGhlIGljb24gd2hlbiBmYW4gaXMgb24uXG4gKiBAbWVtYmVyT2YgdHlwZWRlZnMuY2FyZHNcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHthYnN0cmFjdE9wdGlvbnMgJiBPYmplY3R9IHN3aXRjaENhcmRPcHRpb25zIFN3aXRjaCBDYXJkIG9wdGlvbnMuXG4gKiBAcHJvcGVydHkge3t0YXBfYWN0aW9uOiBzd2l0Y2hUYXBBY3Rpb259fSBbYWN0aW9uXSBIb21lIGFzc2lzdGFudCBhY3Rpb24gdG8gcGVyZm9ybSBvbiB0YXAuXG4gKiBAbWVtYmVyT2YgdHlwZWRlZnMuY2FyZHNcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IHN3aXRjaFRhcEFjdGlvbiBIb21lIGFzc2lzdGFudCBhY3Rpb24gdG8gcGVyZm9ybSBvbiB0YXAuXG4gKiBAcHJvcGVydHkge1widG9nZ2xlXCJ9IGFjdGlvbiBUb2dnbGVzIGEgaGFzcyBlbnRpdHkuXG4gKiBAbWVtYmVyT2YgdHlwZWRlZnMuY2FyZHNcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHthYnN0cmFjdE9wdGlvbnMgJiBPYmplY3R9IGNsaW1hdGVDYXJkT3B0aW9ucyBDbGltYXRlIENhcmQgb3B0aW9ucy5cbiAqIEBwcm9wZXJ0eSB7W1wib2ZmXCIsIFwiY29vbFwiLCBcImhlYXRcIiwgXCJmYW5fb25seVwiXX0gW2h2YWNfbW9kZXNdIFNob3cgYnV0dG9ucyB0byBjb250cm9sIHRhcmdldCB0ZW1wZXJhdHVyZS5cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW3Nob3dfdGVtcGVyYXR1cmVfY29udHJvbD10cnVlXSBTaG93IGJ1dHRvbnMgdG8gY29udHJvbCB0YXJnZXQgdGVtcGVyYXR1cmUuXG4gKiBAbWVtYmVyT2YgdHlwZWRlZnMuY2FyZHNcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHthYnN0cmFjdE9wdGlvbnN9IGNhbWVyYUNhcmRPcHRpb25zIENhbWVyYSBDYXJkIG9wdGlvbnMuXG4gKiBAbWVtYmVyT2YgdHlwZWRlZnMuY2FyZHNcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHthYnN0cmFjdE9wdGlvbnMgJiBPYmplY3R9IHBlcnNvbkNhcmRPcHRpb25zIFBlcnNvbiBDYXJkIG9wdGlvbnMuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW2xheW91dF0gTGF5b3V0IG9mIHRoZSBjYXJkLiBWZXJ0aWNhbCwgaG9yaXpvbnRhbCwgYW5kIGRlZmF1bHQgbGF5b3V0cyBhcmUgc3VwcG9ydGVkLlxuICogQHByb3BlcnR5IHsoXCJuYW1lXCIgfCBcInN0YXRlXCIgfCBcImxhc3QtY2hhbmdlZFwiIHwgXCJsYXN0LXVwZGF0ZWRcIiB8IFwibm9uZVwiKX0gW3ByaW1hcnlfaW5mbz1uYW1lXSBJbmZvIHRvIHNob3cgYXNcbiAqICAgICBwcmltYXJ5IGluZm8uXG4gKiBAcHJvcGVydHkgeyhcIm5hbWVcIiB8IFwic3RhdGVcIiB8IFwibGFzdC1jaGFuZ2VkXCIgfCBcImxhc3QtdXBkYXRlZFwiIHwgXCJub25lXCIpfSBbc2Vjb25kYXJ5X2luZm89c2F0ZV0gSW5mbyB0byBzaG93IGFzXG4gKiAgICAgc2Vjb25kYXJ5IGluZm8uXG4gKiBAcHJvcGVydHkgeyhcImljb25cIiB8IFwiZW50aXR5LXBpY3R1cmVcIiB8IFwibm9uZVwiKX0gW2ljb25fdHlwZV09aWNvbiBUeXBlIG9mIGljb24gdG8gZGlzcGxheS5cbiAqIEBtZW1iZXJPZiB0eXBlZGVmcy5jYXJkc1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge2Fic3RyYWN0T3B0aW9ucyAmIE9iamVjdH0gYXJlYUNhcmRPcHRpb25zIFBlcnNvbiBDYXJkIG9wdGlvbnMuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW3ByaW1hcnldIFByaW1hcnkgaW5mbyB0byByZW5kZXIuIE1heSBjb250YWluIHRlbXBsYXRlcy5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbaWNvbl0gSWNvbiB0byByZW5kZXIuIE1heSBjb250YWluIHRlbXBsYXRlcy5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbaWNvbl9jb2xvcl0gSWNvbiBjb2xvciB0byByZW5kZXIuIE1heSBjb250YWluIHRlbXBsYXRlcy5cbiAqIEBwcm9wZXJ0eSB7YXJlYVRhcEFjdGlvbn0gdGFwX2FjdGlvbiBIb21lIGFzc2lzdGFudCBhY3Rpb24gdG8gcGVyZm9ybSBvbiB0YXAuXG4gKiBAbWVtYmVyT2YgdHlwZWRlZnMuY2FyZHNcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IGFyZWFUYXBBY3Rpb24gSG9tZSBhc3Npc3RhbnQgYWN0aW9uIHRvIHBlcmZvcm0gb24gdGFwLlxuICogQHByb3BlcnR5IHtcIm5hdmlnYXRlXCJ9IGFjdGlvbiBUb2dnbGVzIGEgaGFzcyBlbnRpdHkuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gbmF2aWdhdGlvbl9wYXRoIFRoZSBpZCBvZiB0aGUgYXJlYSB0byBuYXZpZ2F0ZSB0by5cbiAqIEBtZW1iZXJPZiB0eXBlZGVmcy5jYXJkc1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge2Fic3RyYWN0T3B0aW9ucyAmIE9iamVjdH0gbWVkaWFQbGF5ZXJDYXJkT3B0aW9ucyBNZWRpYSBQbGF5ZXIgQ2FyZCBvcHRpb25zLlxuICogQHByb3BlcnR5IHtib29sZWFufSBbdXNlX21lZGlhX2luZm89dHJ1ZV0gVXNlIG1lZGlhIGluZm8gaW5zdGVhZCBvZiBuYW1lLCBzdGF0ZSwgYW5kIGljb24gd2hlbiBhIG1lZGlhIGlzIHBsYXlpbmdcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nW119IFttZWRpYV9jb250cm9scz1cIm9uX29mZlwiLCBcInBsYXlfcGF1c2Vfc3RvcFwiXSBMaXN0IG9mIGNvbnRyb2xzIHRvIGRpc3BsYXlcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChvbl9vZmYsIHNodWZmbGUsIHByZXZpb3VzLCBwbGF5X3BhdXNlX3N0b3AsIG5leHQsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBlYXQpXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtzaG93X3ZvbHVtZV9sZXZlbD10cnVlXSBTaG93IHZvbHVtZSBsZXZlbCBuZXh0IHRvIG1lZGlhIHN0YXRlIHdoZW4gbWVkaWEgaXMgcGxheWluZ1xuICogQHByb3BlcnR5IHtzdHJpbmdbXX0gW3ZvbHVtZV9jb250cm9scz1cInZvbHVtZV9tdXRlXCIsIFwidm9sdW1lX3NldFwiLCBcInZvbHVtZV9idXR0b25zXCJdIExpc3Qgb2YgY29udHJvbHMgdG8gZGlzcGxheVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh2b2x1bWVfbXV0ZSwgdm9sdW1lX3NldCxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2x1bWVfYnV0dG9ucylcbiAqIEBtZW1iZXJPZiB0eXBlZGVmcy5jYXJkc1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge2Fic3RyYWN0T3B0aW9ucyAmIE9iamVjdH0gc2Vuc29yQ2FyZE9wdGlvbnMgU2Vuc29yIENhcmQgb3B0aW9ucy5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbaWNvbl9jb2xvcj1ncmVlbl0gQ3VzdG9tIGNvbG9yIGZvciBpY29uIHdoZW4gZW50aXR5IGlzIHN0YXRlIGlzIGFjdGl2ZS5cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2FuaW1hdGU9dHJ1ZV0gQWRkIGEgcmV2ZWFsIGFuaW1hdGlvbiB0byB0aGUgZ3JhcGguXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW2xpbmVfY29sb3I9Z3JlZW5dIFNldCBhIGN1c3RvbSBjb2xvciBmb3IgdGhlIGdyYXBoIGxpbmUuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFByb3ZpZGUgYSBsaXN0IG9mIGNvbG9ycyBmb3IgbXVsdGlwbGUgZ3JhcGggZW50cmllcy5cbiAqIEBtZW1iZXJPZiB0eXBlZGVmcy5jYXJkc1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge2Fic3RyYWN0T3B0aW9ucyAmIE9iamVjdH0gbWlzY2VsbGFuZW91c0NhcmRPcHRpb25zIE1pc2NlbGxhbmVvdXMgQ2FyZCBvcHRpb25zLlxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtpY29uX2NvbG9yPWJsdWUtZ3JleV0gQ3VzdG9tIGNvbG9yIGZvciBpY29uIHdoZW4gZW50aXR5IGlzIHN0YXRlIGlzIGFjdGl2ZS5cbiAqIEBtZW1iZXJPZiB0eXBlZGVmcy5jYXJkc1xuICovXG5cbiIsInZhciBtYXAgPSB7XG5cdFwiLi9BYnN0cmFjdENhcmRcIjogW1xuXHRcdFwiLi9zcmMvY2FyZHMvQWJzdHJhY3RDYXJkLmpzXCIsXG5cdFx0OVxuXHRdLFxuXHRcIi4vQWJzdHJhY3RDYXJkLmpzXCI6IFtcblx0XHRcIi4vc3JjL2NhcmRzL0Fic3RyYWN0Q2FyZC5qc1wiLFxuXHRcdDlcblx0XSxcblx0XCIuL0FyZWFDYXJkXCI6IFtcblx0XHRcIi4vc3JjL2NhcmRzL0FyZWFDYXJkLmpzXCIsXG5cdFx0OSxcblx0XHRcIm1haW5cIlxuXHRdLFxuXHRcIi4vQXJlYUNhcmQuanNcIjogW1xuXHRcdFwiLi9zcmMvY2FyZHMvQXJlYUNhcmQuanNcIixcblx0XHQ5LFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9CaW5hcnlTZW5zb3JDYXJkXCI6IFtcblx0XHRcIi4vc3JjL2NhcmRzL0JpbmFyeVNlbnNvckNhcmQuanNcIixcblx0XHQ5LFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9CaW5hcnlTZW5zb3JDYXJkLmpzXCI6IFtcblx0XHRcIi4vc3JjL2NhcmRzL0JpbmFyeVNlbnNvckNhcmQuanNcIixcblx0XHQ5LFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9DYW1lcmFDYXJkXCI6IFtcblx0XHRcIi4vc3JjL2NhcmRzL0NhbWVyYUNhcmQuanNcIixcblx0XHQ5LFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9DYW1lcmFDYXJkLmpzXCI6IFtcblx0XHRcIi4vc3JjL2NhcmRzL0NhbWVyYUNhcmQuanNcIixcblx0XHQ5LFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9DbGltYXRlQ2FyZFwiOiBbXG5cdFx0XCIuL3NyYy9jYXJkcy9DbGltYXRlQ2FyZC5qc1wiLFxuXHRcdDksXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL0NsaW1hdGVDYXJkLmpzXCI6IFtcblx0XHRcIi4vc3JjL2NhcmRzL0NsaW1hdGVDYXJkLmpzXCIsXG5cdFx0OSxcblx0XHRcIm1haW5cIlxuXHRdLFxuXHRcIi4vQ292ZXJDYXJkXCI6IFtcblx0XHRcIi4vc3JjL2NhcmRzL0NvdmVyQ2FyZC5qc1wiLFxuXHRcdDksXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL0NvdmVyQ2FyZC5qc1wiOiBbXG5cdFx0XCIuL3NyYy9jYXJkcy9Db3ZlckNhcmQuanNcIixcblx0XHQ5LFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9GYW5DYXJkXCI6IFtcblx0XHRcIi4vc3JjL2NhcmRzL0ZhbkNhcmQuanNcIixcblx0XHQ5LFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9GYW5DYXJkLmpzXCI6IFtcblx0XHRcIi4vc3JjL2NhcmRzL0ZhbkNhcmQuanNcIixcblx0XHQ5LFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9MaWdodENhcmRcIjogW1xuXHRcdFwiLi9zcmMvY2FyZHMvTGlnaHRDYXJkLmpzXCIsXG5cdFx0OSxcblx0XHRcIm1haW5cIlxuXHRdLFxuXHRcIi4vTGlnaHRDYXJkLmpzXCI6IFtcblx0XHRcIi4vc3JjL2NhcmRzL0xpZ2h0Q2FyZC5qc1wiLFxuXHRcdDksXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL01lZGlhUGxheWVyQ2FyZFwiOiBbXG5cdFx0XCIuL3NyYy9jYXJkcy9NZWRpYVBsYXllckNhcmQuanNcIixcblx0XHQ5LFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9NZWRpYVBsYXllckNhcmQuanNcIjogW1xuXHRcdFwiLi9zcmMvY2FyZHMvTWVkaWFQbGF5ZXJDYXJkLmpzXCIsXG5cdFx0OSxcblx0XHRcIm1haW5cIlxuXHRdLFxuXHRcIi4vTWlzY2VsbGFuZW91c0NhcmRcIjogW1xuXHRcdFwiLi9zcmMvY2FyZHMvTWlzY2VsbGFuZW91c0NhcmQuanNcIixcblx0XHQ5LFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9NaXNjZWxsYW5lb3VzQ2FyZC5qc1wiOiBbXG5cdFx0XCIuL3NyYy9jYXJkcy9NaXNjZWxsYW5lb3VzQ2FyZC5qc1wiLFxuXHRcdDksXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL1BlcnNvbkNhcmRcIjogW1xuXHRcdFwiLi9zcmMvY2FyZHMvUGVyc29uQ2FyZC5qc1wiLFxuXHRcdDksXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL1BlcnNvbkNhcmQuanNcIjogW1xuXHRcdFwiLi9zcmMvY2FyZHMvUGVyc29uQ2FyZC5qc1wiLFxuXHRcdDksXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL1NlbnNvckNhcmRcIjogW1xuXHRcdFwiLi9zcmMvY2FyZHMvU2Vuc29yQ2FyZC5qc1wiLFxuXHRcdDlcblx0XSxcblx0XCIuL1NlbnNvckNhcmQuanNcIjogW1xuXHRcdFwiLi9zcmMvY2FyZHMvU2Vuc29yQ2FyZC5qc1wiLFxuXHRcdDlcblx0XSxcblx0XCIuL1N3aXRjaENhcmRcIjogW1xuXHRcdFwiLi9zcmMvY2FyZHMvU3dpdGNoQ2FyZC5qc1wiLFxuXHRcdDksXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL1N3aXRjaENhcmQuanNcIjogW1xuXHRcdFwiLi9zcmMvY2FyZHMvU3dpdGNoQ2FyZC5qc1wiLFxuXHRcdDksXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL1RpdGxlQ2FyZFwiOiBbXG5cdFx0XCIuL3NyYy9jYXJkcy9UaXRsZUNhcmQuanNcIixcblx0XHQ5XG5cdF0sXG5cdFwiLi9UaXRsZUNhcmQuanNcIjogW1xuXHRcdFwiLi9zcmMvY2FyZHMvVGl0bGVDYXJkLmpzXCIsXG5cdFx0OVxuXHRdLFxuXHRcIi4vdHlwZWRlZnNcIjogW1xuXHRcdFwiLi9zcmMvY2FyZHMvdHlwZWRlZnMuanNcIixcblx0XHQ3LFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi90eXBlZGVmcy5qc1wiOiBbXG5cdFx0XCIuL3NyYy9jYXJkcy90eXBlZGVmcy5qc1wiLFxuXHRcdDcsXG5cdFx0XCJtYWluXCJcblx0XVxufTtcbmZ1bmN0aW9uIHdlYnBhY2tBc3luY0NvbnRleHQocmVxKSB7XG5cdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8obWFwLCByZXEpKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuXHRcdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgcmVxICsgXCInXCIpO1xuXHRcdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdFx0dGhyb3cgZTtcblx0XHR9KTtcblx0fVxuXG5cdHZhciBpZHMgPSBtYXBbcmVxXSwgaWQgPSBpZHNbMF07XG5cdHJldHVybiBQcm9taXNlLmFsbChpZHMuc2xpY2UoMikubWFwKF9fd2VicGFja19yZXF1aXJlX18uZSkpLnRoZW4oKCkgPT4ge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLnQoaWQsIGlkc1sxXSB8IDE2KVxuXHR9KTtcbn1cbndlYnBhY2tBc3luY0NvbnRleHQua2V5cyA9ICgpID0+IChPYmplY3Qua2V5cyhtYXApKTtcbndlYnBhY2tBc3luY0NvbnRleHQuaWQgPSBcIi4vc3JjL2NhcmRzIGxhenkgcmVjdXJzaXZlIF5cXFxcLlxcXFwvLiokXCI7XG5tb2R1bGUuZXhwb3J0cyA9IHdlYnBhY2tBc3luY0NvbnRleHQ7IiwiaW1wb3J0IHtIZWxwZXJ9IGZyb20gXCIuLi9IZWxwZXJcIjtcblxuY2xhc3MgQ2xpbWF0ZUNoaXAge1xuICAjYXJlYUlkcztcbiAgI29wdGlvbnMgPSB7XG4gICAgLy8gTm8gZGVmYXVsdCBvcHRpb25zLlxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKGFyZWFJZHMsIG9wdGlvbnMgPSB7fSkge1xuICAgIGlmICghSGVscGVyLmlzSW5pdGlhbGl6ZWQoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIEhlbHBlciBtb2R1bGUgbXVzdCBiZSBpbml0aWFsaXplZCBiZWZvcmUgdXNpbmcgdGhpcyBvbmUuXCIpO1xuICAgIH1cblxuICAgIHRoaXMuI2FyZWFJZHMgPSBhcmVhSWRzO1xuICAgIHRoaXMuI29wdGlvbnMgPSB7XG4gICAgICAuLi50aGlzLiNvcHRpb25zLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9O1xuICB9XG5cbiAgZ2V0Q2hpcCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJ0ZW1wbGF0ZVwiLFxuICAgICAgaWNvbjogXCJtZGk6dGhlcm1vc3RhdFwiLFxuICAgICAgaWNvbl9jb2xvcjogXCJvcmFuZ2VcIixcbiAgICAgIGNvbnRlbnQ6IEhlbHBlci5nZXRDb3VudFRlbXBsYXRlKFwiY2xpbWF0ZVwiLCBcIm5lXCIsIFwib2ZmXCIpLFxuICAgICAgdGFwX2FjdGlvbjoge1xuICAgICAgICBhY3Rpb246IFwibmF2aWdhdGVcIixcbiAgICAgICAgbmF2aWdhdGlvbl9wYXRoOiBcInRoZXJtb3N0YXRzXCIsXG4gICAgICB9LFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IHtDbGltYXRlQ2hpcH07XG4iLCJpbXBvcnQge0hlbHBlcn0gZnJvbSBcIi4uL0hlbHBlclwiO1xuXG5jbGFzcyBDb3ZlckNoaXAge1xuICAjYXJlYUlkcztcbiAgI29wdGlvbnMgPSB7XG4gICAgLy8gTm8gZGVmYXVsdCBvcHRpb25zLlxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKGFyZWFJZHMsIG9wdGlvbnMgPSB7fSkge1xuICAgIGlmICghSGVscGVyLmlzSW5pdGlhbGl6ZWQoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIEhlbHBlciBtb2R1bGUgbXVzdCBiZSBpbml0aWFsaXplZCBiZWZvcmUgdXNpbmcgdGhpcyBvbmUuXCIpO1xuICAgIH1cblxuICAgIHRoaXMuI2FyZWFJZHMgPSBhcmVhSWRzO1xuICAgIHRoaXMuI29wdGlvbnMgPSB7XG4gICAgICAuLi50aGlzLiNvcHRpb25zLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9O1xuICB9XG5cbiAgZ2V0Q2hpcCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJ0ZW1wbGF0ZVwiLFxuICAgICAgaWNvbjogXCJtZGk6d2luZG93LW9wZW5cIixcbiAgICAgIGljb25fY29sb3I6IFwiY3lhblwiLFxuICAgICAgY29udGVudDogSGVscGVyLmdldENvdW50VGVtcGxhdGUoXCJjb3ZlclwiLCBcImVxXCIsIFwib3BlblwiKSxcbiAgICAgIHRhcF9hY3Rpb246IHtcbiAgICAgICAgYWN0aW9uOiBcIm5hdmlnYXRlXCIsXG4gICAgICAgIG5hdmlnYXRpb25fcGF0aDogXCJjb3ZlcnNcIixcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQge0NvdmVyQ2hpcH07XG4iLCJpbXBvcnQge0hlbHBlcn0gZnJvbSBcIi4uL0hlbHBlclwiO1xuXG5jbGFzcyBGYW5DaGlwIHtcbiAgI2FyZWFJZHM7XG4gICNvcHRpb25zID0ge1xuICAgIC8vIE5vIGRlZmF1bHQgb3B0aW9ucy5cbiAgfTtcblxuICBjb25zdHJ1Y3RvcihhcmVhSWRzLCBvcHRpb25zID0ge30pIHtcbiAgICBpZiAoIUhlbHBlci5pc0luaXRpYWxpemVkKCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBIZWxwZXIgbW9kdWxlIG11c3QgYmUgaW5pdGlhbGl6ZWQgYmVmb3JlIHVzaW5nIHRoaXMgb25lLlwiKTtcbiAgICB9XG5cbiAgICB0aGlzLiNhcmVhSWRzID0gYXJlYUlkcztcbiAgICB0aGlzLiNvcHRpb25zID0ge1xuICAgICAgLi4udGhpcy4jb3B0aW9ucyxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfTtcbiAgfVxuXG4gIGdldENoaXAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IFwidGVtcGxhdGVcIixcbiAgICAgIGljb246IFwibWRpOmZhblwiLFxuICAgICAgaWNvbl9jb2xvcjogXCJncmVlblwiLFxuICAgICAgY29udGVudDogSGVscGVyLmdldENvdW50VGVtcGxhdGUoXCJmYW5cIiwgXCJlcVwiLCBcIm9uXCIpLFxuICAgICAgdGFwX2FjdGlvbjoge1xuICAgICAgICBhY3Rpb246IFwiY2FsbC1zZXJ2aWNlXCIsXG4gICAgICAgIHNlcnZpY2U6IFwiZmFuLnR1cm5fb2ZmXCIsXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgIGFyZWFfaWQ6IHRoaXMuI2FyZWFJZHMsXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IHt9LFxuICAgICAgfSxcbiAgICAgIGhvbGRfYWN0aW9uOiB7XG4gICAgICAgIGFjdGlvbjogXCJuYXZpZ2F0ZVwiLFxuICAgICAgICBuYXZpZ2F0aW9uX3BhdGg6IFwiZmFuc1wiLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCB7RmFuQ2hpcH07XG4iLCJpbXBvcnQge0hlbHBlcn0gZnJvbSBcIi4uL0hlbHBlclwiO1xuXG5jbGFzcyBMaWdodENoaXAge1xuICAjYXJlYUlkcztcbiAgI29wdGlvbnMgPSB7XG4gICAgLy8gTm8gZGVmYXVsdCBvcHRpb25zLlxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKGFyZWFJZHMsIG9wdGlvbnMgPSB7fSkge1xuICAgIGlmICghSGVscGVyLmlzSW5pdGlhbGl6ZWQoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIEhlbHBlciBtb2R1bGUgbXVzdCBiZSBpbml0aWFsaXplZCBiZWZvcmUgdXNpbmcgdGhpcyBvbmUuXCIpO1xuICAgIH1cblxuICAgIHRoaXMuI2FyZWFJZHMgPSBhcmVhSWRzO1xuICAgIHRoaXMuI29wdGlvbnMgPSB7XG4gICAgICAuLi50aGlzLiNvcHRpb25zLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9O1xuICB9XG5cbiAgZ2V0Q2hpcCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJ0ZW1wbGF0ZVwiLFxuICAgICAgaWNvbjogXCJtZGk6bGlnaHRidWxiLWdyb3VwXCIsXG4gICAgICBpY29uX2NvbG9yOiBcImFtYmVyXCIsXG4gICAgICBjb250ZW50OiBIZWxwZXIuZ2V0Q291bnRUZW1wbGF0ZShcImxpZ2h0XCIsIFwiZXFcIiwgXCJvblwiKSxcbiAgICAgIHRhcF9hY3Rpb246IHtcbiAgICAgICAgYWN0aW9uOiBcImNhbGwtc2VydmljZVwiLFxuICAgICAgICBzZXJ2aWNlOiBcImxpZ2h0LnR1cm5fb2ZmXCIsXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgIGFyZWFfaWQ6IHRoaXMuI2FyZWFJZHMsXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IHt9LFxuICAgICAgfSxcbiAgICAgIGhvbGRfYWN0aW9uOiB7XG4gICAgICAgIGFjdGlvbjogXCJuYXZpZ2F0ZVwiLFxuICAgICAgICBuYXZpZ2F0aW9uX3BhdGg6IFwibGlnaHRzXCIsXG4gICAgICB9LFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IHtMaWdodENoaXB9O1xuIiwiaW1wb3J0IHtIZWxwZXJ9IGZyb20gXCIuLi9IZWxwZXJcIjtcblxuY2xhc3MgU3dpdGNoQ2hpcCB7XG4gICNhcmVhSWRzO1xuICAjb3B0aW9ucyA9IHtcbiAgICAvLyBObyBkZWZhdWx0IG9wdGlvbnMuXG4gIH07XG5cbiAgY29uc3RydWN0b3IoYXJlYUlkcywgb3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKCFIZWxwZXIuaXNJbml0aWFsaXplZCgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgSGVscGVyIG1vZHVsZSBtdXN0IGJlIGluaXRpYWxpemVkIGJlZm9yZSB1c2luZyB0aGlzIG9uZS5cIik7XG4gICAgfVxuXG4gICAgdGhpcy4jYXJlYUlkcyA9IGFyZWFJZHM7XG4gICAgdGhpcy4jb3B0aW9ucyA9IHtcbiAgICAgIC4uLnRoaXMuI29wdGlvbnMsXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH07XG4gIH1cblxuICBnZXRDaGlwKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBcInRlbXBsYXRlXCIsXG4gICAgICBpY29uOiBcIm1kaTpkaXAtc3dpdGNoXCIsXG4gICAgICBpY29uX2NvbG9yOiBcImJsdWVcIixcbiAgICAgIGNvbnRlbnQ6IEhlbHBlci5nZXRDb3VudFRlbXBsYXRlKFwic3dpdGNoXCIsIFwiZXFcIiwgXCJvblwiKSxcbiAgICAgIHRhcF9hY3Rpb246IHtcbiAgICAgICAgYWN0aW9uOiBcImNhbGwtc2VydmljZVwiLFxuICAgICAgICBzZXJ2aWNlOiBcInN3aXRjaC50dXJuX29mZlwiLFxuICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICBhcmVhX2lkOiB0aGlzLiNhcmVhSWRzLFxuICAgICAgICB9LFxuICAgICAgICBkYXRhOiB7fSxcbiAgICAgIH0sXG4gICAgICBob2xkX2FjdGlvbjoge1xuICAgICAgICBhY3Rpb246IFwibmF2aWdhdGVcIixcbiAgICAgICAgbmF2aWdhdGlvbl9wYXRoOiBcInN3aXRjaGVzXCIsXG4gICAgICB9LFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IHtTd2l0Y2hDaGlwfTtcbiIsImNsYXNzIFdlYXRoZXJDaGlwIHtcbiAgI2VudGl0eUlkO1xuICAjb3B0aW9ucyA9IHtcbiAgICBzaG93X3RlbXBlcmF0dXJlOiB0cnVlLFxuICAgIHNob3dfY29uZGl0aW9uczogdHJ1ZSxcbiAgfTtcblxuICBjb25zdHJ1Y3RvcihlbnRpdHlJZCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy4jZW50aXR5SWQgPSBlbnRpdHlJZDtcbiAgICB0aGlzLiNvcHRpb25zICA9IHtcbiAgICAgIC4uLnRoaXMuI29wdGlvbnMsXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH07XG4gIH1cblxuICBnZXRDaGlwKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBcIndlYXRoZXJcIixcbiAgICAgIGVudGl0eTogdGhpcy4jZW50aXR5SWQsXG4gICAgICAuLi50aGlzLiNvcHRpb25zLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IHtXZWF0aGVyQ2hpcH07XG4iLCJ2YXIgbWFwID0ge1xuXHRcIi4vQ2xpbWF0ZUNoaXBcIjogW1xuXHRcdFwiLi9zcmMvY2hpcHMvQ2xpbWF0ZUNoaXAuanNcIixcblx0XHRcIm1haW5cIlxuXHRdLFxuXHRcIi4vQ2xpbWF0ZUNoaXAuanNcIjogW1xuXHRcdFwiLi9zcmMvY2hpcHMvQ2xpbWF0ZUNoaXAuanNcIixcblx0XHRcIm1haW5cIlxuXHRdLFxuXHRcIi4vQ292ZXJDaGlwXCI6IFtcblx0XHRcIi4vc3JjL2NoaXBzL0NvdmVyQ2hpcC5qc1wiLFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9Db3ZlckNoaXAuanNcIjogW1xuXHRcdFwiLi9zcmMvY2hpcHMvQ292ZXJDaGlwLmpzXCIsXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL0ZhbkNoaXBcIjogW1xuXHRcdFwiLi9zcmMvY2hpcHMvRmFuQ2hpcC5qc1wiLFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9GYW5DaGlwLmpzXCI6IFtcblx0XHRcIi4vc3JjL2NoaXBzL0ZhbkNoaXAuanNcIixcblx0XHRcIm1haW5cIlxuXHRdLFxuXHRcIi4vTGlnaHRDaGlwXCI6IFtcblx0XHRcIi4vc3JjL2NoaXBzL0xpZ2h0Q2hpcC5qc1wiLFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9MaWdodENoaXAuanNcIjogW1xuXHRcdFwiLi9zcmMvY2hpcHMvTGlnaHRDaGlwLmpzXCIsXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL1N3aXRjaENoaXBcIjogW1xuXHRcdFwiLi9zcmMvY2hpcHMvU3dpdGNoQ2hpcC5qc1wiLFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9Td2l0Y2hDaGlwLmpzXCI6IFtcblx0XHRcIi4vc3JjL2NoaXBzL1N3aXRjaENoaXAuanNcIixcblx0XHRcIm1haW5cIlxuXHRdLFxuXHRcIi4vV2VhdGhlckNoaXBcIjogW1xuXHRcdFwiLi9zcmMvY2hpcHMvV2VhdGhlckNoaXAuanNcIixcblx0XHRcIm1haW5cIlxuXHRdLFxuXHRcIi4vV2VhdGhlckNoaXAuanNcIjogW1xuXHRcdFwiLi9zcmMvY2hpcHMvV2VhdGhlckNoaXAuanNcIixcblx0XHRcIm1haW5cIlxuXHRdXG59O1xuZnVuY3Rpb24gd2VicGFja0FzeW5jQ29udGV4dChyZXEpIHtcblx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhtYXAsIHJlcSkpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG5cdFx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyByZXEgKyBcIidcIik7XG5cdFx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0XHR0aHJvdyBlO1xuXHRcdH0pO1xuXHR9XG5cblx0dmFyIGlkcyA9IG1hcFtyZXFdLCBpZCA9IGlkc1swXTtcblx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18uZShpZHNbMV0pLnRoZW4oKCkgPT4ge1xuXHRcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKGlkKTtcblx0fSk7XG59XG53ZWJwYWNrQXN5bmNDb250ZXh0LmtleXMgPSAoKSA9PiAoT2JqZWN0LmtleXMobWFwKSk7XG53ZWJwYWNrQXN5bmNDb250ZXh0LmlkID0gXCIuL3NyYy9jaGlwcyBsYXp5IHJlY3Vyc2l2ZSBeXFxcXC5cXFxcLy4qJFwiO1xubW9kdWxlLmV4cG9ydHMgPSB3ZWJwYWNrQXN5bmNDb250ZXh0OyIsImltcG9ydCB7SGVscGVyfSBmcm9tIFwiLi4vSGVscGVyXCI7XG5pbXBvcnQge1RpdGxlQ2FyZH0gZnJvbSBcIi4uL2NhcmRzL1RpdGxlQ2FyZFwiO1xuXG4vKipcbiAqIEFic3RyYWN0IFZpZXcgQ2xhc3MuXG4gKlxuICogVG8gY3JlYXRlIGEgbmV3IHZpZXcsIGV4dGVuZCB0aGUgbmV3IGNsYXNzIHdpdGggdGhpcyBvbmUuXG4gKlxuICogQGNsYXNzXG4gKiBAYWJzdHJhY3RcbiAqL1xuY2xhc3MgQWJzdHJhY3RWaWV3IHtcbiAgLyoqXG4gICAqIE9wdGlvbnMgZm9yIGNyZWF0aW5nIGEgdmlldy5cbiAgICpcbiAgICogQHR5cGUge2Fic3RyYWN0T3B0aW9uc31cbiAgICovXG4gIG9wdGlvbnMgPSB7XG4gICAgdGl0bGU6IG51bGwsXG4gICAgcGF0aDogbnVsbCxcbiAgICBpY29uOiBcIm1kaTp2aWV3LWRhc2hib2FyZFwiLFxuICAgIHN1YnZpZXc6IGZhbHNlLFxuICB9O1xuXG4gIC8qKlxuICAgKiBBIGNhcmQgdG8gc3dpdGNoIGFsbCBlbnRpdGllcyBpbiB0aGUgdmlldy5cbiAgICpcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIHZpZXdUaXRsZUNhcmQ7XG5cbiAgLyoqXG4gICAqIENsYXNzIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdHJ5aW5nIHRvIGluc3RhbnRpYXRlIHRoaXMgY2xhc3MuXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgSGVscGVyIG1vZHVsZSBpc24ndCBpbml0aWFsaXplZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yID09PSBBYnN0cmFjdFZpZXcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkFic3RyYWN0IGNsYXNzZXMgY2FuJ3QgYmUgaW5zdGFudGlhdGVkLlwiKTtcbiAgICB9XG5cbiAgICBpZiAoIUhlbHBlci5pc0luaXRpYWxpemVkKCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBIZWxwZXIgbW9kdWxlIG11c3QgYmUgaW5pdGlhbGl6ZWQgYmVmb3JlIHVzaW5nIHRoaXMgb25lLlwiKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2UgdGhlIGRlZmF1bHQgb3B0aW9ucyBvZiB0aGlzIGNsYXNzIGFuZCB0aGUgY3VzdG9tIG9wdGlvbnMgaW50byB0aGUgb3B0aW9ucyBvZiB0aGUgcGFyZW50IGNsYXNzLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gW2RlZmF1bHRPcHRpb25zPXt9XSBEZWZhdWx0IG9wdGlvbnMgZm9yIHRoZSBjYXJkLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW2N1c3RvbU9wdGlvbnM9e31dIEN1c3RvbSBPcHRpb25zIGZvciB0aGUgY2FyZC5cbiAgICovXG4gIG1lcmdlT3B0aW9ucyhkZWZhdWx0T3B0aW9ucywgY3VzdG9tT3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgIC4uLmRlZmF1bHRPcHRpb25zLFxuICAgICAgLi4uY3VzdG9tT3B0aW9ucyxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSB0aGUgY2FyZHMgdG8gaW5jbHVkZSBpbiB0aGUgdmlldy5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0W10gfCBQcm9taXNlfSBBbiBhcnJheSBvZiBjYXJkIG9iamVjdHMuXG4gICAqL1xuICBjcmVhdGVWaWV3Q2FyZHMoKSB7XG4gICAgLyoqIEB0eXBlIE9iamVjdFtdICovXG4gICAgY29uc3Qgdmlld0NhcmRzID0gW3RoaXMudmlld1RpdGxlQ2FyZF07XG5cbiAgICAvLyBDcmVhdGUgY2FyZHMgZm9yIGVhY2ggYXJlYS5cbiAgICBmb3IgKGNvbnN0IGFyZWEgb2YgSGVscGVyLmFyZWFzKSB7XG4gICAgICBjb25zdCBhcmVhQ2FyZHMgPSBbXTtcbiAgICAgIGNvbnN0IGVudGl0aWVzICA9IEhlbHBlci5nZXREZXZpY2VFbnRpdGllcyhhcmVhLCB0aGlzW1wiZG9tYWluXCJdKTtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZSA9IEhlbHBlci5zYW5pdGl6ZUNsYXNzTmFtZSh0aGlzW1wiZG9tYWluXCJdICsgXCJDYXJkXCIpO1xuXG4gICAgICBpbXBvcnQoKGAuLi9jYXJkcy8ke2NsYXNzTmFtZX1gKSkudGhlbihjYXJkTW9kdWxlID0+IHtcbiAgICAgICAgaWYgKGVudGl0aWVzLmxlbmd0aCkge1xuICAgICAgICAgIC8vIENyZWF0ZSBhIFRpdGxlIGNhcmQgZm9yIHRoZSBjdXJyZW50IGFyZWEuXG4gICAgICAgICAgYXJlYUNhcmRzLnB1c2goXG4gICAgICAgICAgICAgIG5ldyBUaXRsZUNhcmQoW2FyZWFdLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IGFyZWEubmFtZSxcbiAgICAgICAgICAgICAgICAuLi50aGlzLm9wdGlvbnNbXCJ0aXRsZUNhcmRcIl0sXG4gICAgICAgICAgICAgIH0pLmNyZWF0ZUNhcmQoKSxcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8gQ3JlYXRlIGEgY2FyZCBmb3IgZWFjaCBkb21haW4tZW50aXR5IG9mIHRoZSBjdXJyZW50IGFyZWEuXG4gICAgICAgICAgZm9yIChjb25zdCBlbnRpdHkgb2YgZW50aXRpZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhcmQgPSAoSGVscGVyLnN0cmF0ZWd5T3B0aW9ucy5lbnRpdHlfY29uZmlnID8/IFtdKS5maW5kKFxuICAgICAgICAgICAgICAgIGNvbmZpZyA9PiBjb25maWcuZW50aXR5ID09PSBlbnRpdHkuZW50aXR5X2lkLFxuICAgICAgICAgICAgKSA/PyBuZXcgY2FyZE1vZHVsZVtjbGFzc05hbWVdKGVudGl0eSkuZ2V0Q2FyZCgpO1xuXG4gICAgICAgICAgICBhcmVhQ2FyZHMucHVzaChjYXJkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvL2FyZWFDYXJkcy5zb3J0KChhLCBiKSA9PiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpKTtcblxuICAgICAgdmlld0NhcmRzLnB1c2goe1xuICAgICAgICB0eXBlOiBcInZlcnRpY2FsLXN0YWNrXCIsXG4gICAgICAgIGNhcmRzOiBhcmVhQ2FyZHMsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmlld0NhcmRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHZpZXcgb2JqZWN0LlxuICAgKlxuICAgKiBUaGUgdmlldyBpbmNsdWRlcyB0aGUgY2FyZHMgd2hpY2ggYXJlIGNyZWF0ZWQgYnkgbWV0aG9kIGNyZWF0ZVZpZXdDYXJkcygpLlxuICAgKlxuICAgKiBAcmV0dXJucyB7dmlld09wdGlvbnMgJiB7Y2FyZHM6IE9iamVjdFtdfX0gVGhlIHZpZXcgb2JqZWN0LlxuICAgKi9cbiAgYXN5bmMgZ2V0VmlldygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgICAgY2FyZHM6IGF3YWl0IHRoaXMuY3JlYXRlVmlld0NhcmRzKCksXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQge0Fic3RyYWN0Vmlld307XG4iLCJpbXBvcnQge0hlbHBlcn0gZnJvbSBcIi4uL0hlbHBlclwiO1xuaW1wb3J0IHtUaXRsZUNhcmR9IGZyb20gXCIuLi9jYXJkcy9UaXRsZUNhcmRcIjtcbmltcG9ydCB7QWJzdHJhY3RWaWV3fSBmcm9tIFwiLi9BYnN0cmFjdFZpZXdcIjtcblxuLyoqXG4gKiBDYW1lcmEgVmlldyBDbGFzcy5cbiAqXG4gKiBVc2VkIHRvIGNyZWF0ZSBhIHZpZXcgZm9yIGVudGl0aWVzIG9mIHRoZSBjYW1lcmEgZG9tYWluLlxuICpcbiAqIEBjbGFzcyBDYW1lcmFWaWV3XG4gKiBAZXh0ZW5kcyBBYnN0cmFjdFZpZXdcbiAqL1xuY2xhc3MgQ2FtZXJhVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG4gIC8qKlxuICAgKiBEb21haW4gb2YgdGhlIHZpZXcncyBlbnRpdGllcy5cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICovXG4gICNkb21haW4gPSBcImNhbWVyYVwiO1xuXG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMgZm9yIHRoZSB2aWV3LlxuICAgKlxuICAgKiBAdHlwZSB7dmlld09wdGlvbnN9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICAjZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgdGl0bGU6IFwiQ2FtZXJhc1wiLFxuICAgIHBhdGg6IFwiY2FtZXJhc1wiLFxuICAgIGljb246IFwibWRpOmNjdHZcIixcbiAgICBzdWJ2aWV3OiBmYWxzZSxcbiAgICB0aXRsZUNhcmQ6IHtcbiAgICAgIHNob3dDb250cm9sczogZmFsc2UsXG4gICAgfSxcbiAgfTtcblxuICAvKipcbiAgICogT3B0aW9ucyBmb3IgdGhlIHZpZXcncyB0aXRsZSBjYXJkLlxuICAgKlxuICAgKiBAdHlwZSB7dmlld1RpdGxlQ2FyZE9wdGlvbnN9XG4gICAqL1xuICAjdmlld1RpdGxlQ2FyZE9wdGlvbiA9IHtcbiAgICB0aXRsZTogXCJBbGwgQ2FtZXJhc1wiLFxuICAgIC4uLnRoaXMub3B0aW9uc1tcInRpdGxlQ2FyZFwiXSxcbiAgfTtcblxuICAvKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7dmlld09wdGlvbnN9IFtvcHRpb25zPXt9XSBPcHRpb25zIGZvciB0aGUgdmlldy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5tZXJnZU9wdGlvbnMoXG4gICAgICAgIHRoaXMuI2RlZmF1bHRPcHRpb25zLFxuICAgICAgICBvcHRpb25zLFxuICAgICk7XG5cbiAgICAvLyBDcmVhdGUgYSB0aXRsZSBjYXJkIHRvIHN3aXRjaCBhbGwgZW50aXRpZXMgb2YgdGhlIGRvbWFpbi5cbiAgICB0aGlzLnZpZXdUaXRsZUNhcmQgPSBuZXcgVGl0bGVDYXJkKEhlbHBlci5hcmVhcywge1xuICAgICAgLi4udGhpcy4jdmlld1RpdGxlQ2FyZE9wdGlvbixcbiAgICAgIC4uLnRoaXMub3B0aW9uc1tcInRpdGxlQ2FyZFwiXSxcbiAgICB9KS5jcmVhdGVDYXJkKCk7XG4gIH1cblxuICBnZXQgZG9tYWluKCkge1xuICAgIHJldHVybiB0aGlzLiNkb21haW47XG4gIH1cbn1cblxuZXhwb3J0IHtDYW1lcmFWaWV3fTtcbiIsImltcG9ydCB7SGVscGVyfSBmcm9tIFwiLi4vSGVscGVyXCI7XG5pbXBvcnQge1RpdGxlQ2FyZH0gZnJvbSBcIi4uL2NhcmRzL1RpdGxlQ2FyZFwiO1xuaW1wb3J0IHtBYnN0cmFjdFZpZXd9IGZyb20gXCIuL0Fic3RyYWN0Vmlld1wiO1xuXG4vKipcbiAqIENsaW1hdGUgVmlldyBDbGFzcy5cbiAqXG4gKiBVc2VkIHRvIGNyZWF0ZSBhIHZpZXcgZm9yIGVudGl0aWVzIG9mIHRoZSBjbGltYXRlIGRvbWFpbi5cbiAqXG4gKiBAY2xhc3MgQ2xpbWF0ZVZpZXdcbiAqIEBleHRlbmRzIEFic3RyYWN0Vmlld1xuICovXG5jbGFzcyBDbGltYXRlVmlldyBleHRlbmRzIEFic3RyYWN0VmlldyB7XG4gIC8qKlxuICAgKiBEb21haW4gb2YgdGhlIHZpZXcncyBlbnRpdGllcy5cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICovXG4gICNkb21haW4gPSBcImNsaW1hdGVcIjtcblxuICAvKipcbiAgICogRGVmYXVsdCBvcHRpb25zIGZvciB0aGUgdmlldy5cbiAgICpcbiAgICogQHR5cGUge3ZpZXdPcHRpb25zfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgI2RlZmF1bHRPcHRpb25zID0ge1xuICAgIHRpdGxlOiBcIkNsaW1hdGVzXCIsXG4gICAgcGF0aDogXCJjbGltYXRlc1wiLFxuICAgIGljb246IFwibWRpOnRoZXJtb3N0YXRcIixcbiAgICBzdWJ2aWV3OiBmYWxzZSxcbiAgICB0aXRsZUNhcmQ6IHtcbiAgICAgIHNob3dDb250cm9sczogZmFsc2UsXG4gICAgfSxcbiAgfTtcblxuICAvKipcbiAgICogT3B0aW9ucyBmb3IgdGhlIHZpZXcncyB0aXRsZSBjYXJkLlxuICAgKlxuICAgKiBAdHlwZSB7dmlld1RpdGxlQ2FyZE9wdGlvbnN9XG4gICAqL1xuICAjdmlld1RpdGxlQ2FyZE9wdGlvbiA9IHtcbiAgICB0aXRsZTogXCJBbGwgQ2xpbWF0ZXNcIixcbiAgICBzdWJ0aXRsZTogSGVscGVyLmdldENvdW50VGVtcGxhdGUodGhpcy5kb21haW4sIFwibmVcIiwgXCJvZmZcIikgKyBcIiBjbGltYXRlcyBvblwiLFxuICAgIC4uLnRoaXMub3B0aW9uc1tcInRpdGxlQ2FyZFwiXSxcbiAgfTtcblxuICAvKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7dmlld09wdGlvbnN9IFtvcHRpb25zPXt9XSBPcHRpb25zIGZvciB0aGUgdmlldy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5tZXJnZU9wdGlvbnMoXG4gICAgICAgIHRoaXMuI2RlZmF1bHRPcHRpb25zLFxuICAgICAgICBvcHRpb25zLFxuICAgICk7XG5cbiAgICAvLyBDcmVhdGUgYSB0aXRsZSBjYXJkIHRvIHN3aXRjaCBhbGwgZW50aXRpZXMgb2YgdGhlIGRvbWFpbi5cbiAgICB0aGlzLnZpZXdUaXRsZUNhcmQgPSBuZXcgVGl0bGVDYXJkKEhlbHBlci5hcmVhcywge1xuICAgICAgLi4udGhpcy4jdmlld1RpdGxlQ2FyZE9wdGlvbixcbiAgICAgIC4uLnRoaXMub3B0aW9uc1tcInRpdGxlQ2FyZFwiXSxcbiAgICB9KS5jcmVhdGVDYXJkKCk7XG4gIH1cblxuICBnZXQgZG9tYWluKCkge1xuICAgIHJldHVybiB0aGlzLiNkb21haW47XG4gIH1cbn1cblxuZXhwb3J0IHtDbGltYXRlVmlld307XG4iLCJpbXBvcnQge0hlbHBlcn0gZnJvbSBcIi4uL0hlbHBlclwiO1xuaW1wb3J0IHtUaXRsZUNhcmR9IGZyb20gXCIuLi9jYXJkcy9UaXRsZUNhcmRcIjtcbmltcG9ydCB7QWJzdHJhY3RWaWV3fSBmcm9tIFwiLi9BYnN0cmFjdFZpZXdcIjtcblxuLyoqXG4gKiBDb3ZlciBWaWV3IENsYXNzLlxuICpcbiAqIFVzZWQgdG8gY3JlYXRlIGEgdmlldyBmb3IgZW50aXRpZXMgb2YgdGhlIGNvdmVyIGRvbWFpbi5cbiAqXG4gKiBAY2xhc3MgQ292ZXJWaWV3XG4gKiBAZXh0ZW5kcyBBYnN0cmFjdFZpZXdcbiAqL1xuY2xhc3MgQ292ZXJWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcbiAgLyoqXG4gICAqIERvbWFpbiBvZiB0aGUgdmlldydzIGVudGl0aWVzLlxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKi9cbiAgI2RvbWFpbiA9IFwiY292ZXJcIjtcblxuICAvKipcbiAgICogRGVmYXVsdCBvcHRpb25zIGZvciB0aGUgdmlldy5cbiAgICpcbiAgICogQHR5cGUge3ZpZXdPcHRpb25zfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgI2RlZmF1bHRPcHRpb25zID0ge1xuICAgIHRpdGxlOiBcIkNvdmVyc1wiLFxuICAgIHBhdGg6IFwiY292ZXJzXCIsXG4gICAgaWNvbjogXCJtZGk6d2luZG93LW9wZW5cIixcbiAgICBzdWJ2aWV3OiBmYWxzZSxcbiAgICB0aXRsZUNhcmQ6IHtcbiAgICAgIGljb25PbjogXCJtZGk6YXJyb3ctdXBcIixcbiAgICAgIGljb25PZmY6IFwibWRpOmFycm93LWRvd25cIixcbiAgICAgIG9uU2VydmljZTogXCJjb3Zlci5vcGVuX2NvdmVyXCIsXG4gICAgICBvZmZTZXJ2aWNlOiBcImNvdmVyLmNsb3NlX2NvdmVyXCIsXG4gICAgfSxcbiAgfTtcblxuICAvKipcbiAgICogT3B0aW9ucyBmb3IgdGhlIHZpZXcncyB0aXRsZSBjYXJkLlxuICAgKlxuICAgKiBAdHlwZSB7dmlld1RpdGxlQ2FyZE9wdGlvbnN9XG4gICAqL1xuICAjdmlld1RpdGxlQ2FyZE9wdGlvbiA9IHtcbiAgICB0aXRsZTogXCJBbGwgQ292ZXJzXCIsXG4gICAgc3VidGl0bGU6IEhlbHBlci5nZXRDb3VudFRlbXBsYXRlKHRoaXMuZG9tYWluLCBcImVxXCIsIFwib3BlblwiKSArIFwiIGNvdmVycyBvcGVuXCIsXG4gIH07XG5cbiAgLyoqXG4gICAqIENsYXNzIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0ge3ZpZXdPcHRpb25zfSBbb3B0aW9ucz17fV0gT3B0aW9ucyBmb3IgdGhlIHZpZXcuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubWVyZ2VPcHRpb25zKFxuICAgICAgICB0aGlzLiNkZWZhdWx0T3B0aW9ucyxcbiAgICAgICAgb3B0aW9ucyxcbiAgICApO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGl0bGUgY2FyZCB0byBzd2l0Y2ggYWxsIGVudGl0aWVzIG9mIHRoZSBkb21haW4uXG4gICAgdGhpcy52aWV3VGl0bGVDYXJkID0gbmV3IFRpdGxlQ2FyZChIZWxwZXIuYXJlYXMsIHtcbiAgICAgIC4uLnRoaXMuI3ZpZXdUaXRsZUNhcmRPcHRpb24sXG4gICAgICAuLi50aGlzLm9wdGlvbnNbXCJ0aXRsZUNhcmRcIl0sXG4gICAgfSkuY3JlYXRlQ2FyZCgpO1xuICB9XG5cbiAgZ2V0IGRvbWFpbigpIHtcbiAgICByZXR1cm4gdGhpcy4jZG9tYWluO1xuICB9XG59XG5cbmV4cG9ydCB7Q292ZXJWaWV3fTtcbiIsImltcG9ydCB7SGVscGVyfSBmcm9tIFwiLi4vSGVscGVyXCI7XG5pbXBvcnQge1RpdGxlQ2FyZH0gZnJvbSBcIi4uL2NhcmRzL1RpdGxlQ2FyZFwiO1xuaW1wb3J0IHtBYnN0cmFjdFZpZXd9IGZyb20gXCIuL0Fic3RyYWN0Vmlld1wiO1xuXG4vKipcbiAqIEZhbiBWaWV3IENsYXNzLlxuICpcbiAqIFVzZWQgdG8gY3JlYXRlIGEgdmlldyBmb3IgZW50aXRpZXMgb2YgdGhlIGZhbiBkb21haW4uXG4gKlxuICogQGNsYXNzIEZhblZpZXdcbiAqIEBleHRlbmRzIEFic3RyYWN0Vmlld1xuICovXG5jbGFzcyBGYW5WaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcbiAgLyoqXG4gICAqIERvbWFpbiBvZiB0aGUgdmlldydzIGVudGl0aWVzLlxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKi9cbiAgI2RvbWFpbiA9IFwiZmFuXCI7XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIHZpZXcuXG4gICAqXG4gICAqIEB0eXBlIHt2aWV3T3B0aW9uc31cbiAgICogQHByaXZhdGVcbiAgICovXG4gICNkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICB0aXRsZTogXCJGYW5zXCIsXG4gICAgcGF0aDogXCJmYW5zXCIsXG4gICAgaWNvbjogXCJtZGk6ZmFuXCIsXG4gICAgc3VidmlldzogZmFsc2UsXG4gICAgdGl0bGVDYXJkOiB7XG4gICAgICBpY29uT246IFwibWRpOmZhblwiLFxuICAgICAgaWNvbk9mZjogXCJtZGk6ZmFuLW9mZlwiLFxuICAgICAgb25TZXJ2aWNlOiBcImZhbi50dXJuX29uXCIsXG4gICAgICBvZmZTZXJ2aWNlOiBcImZhbi50dXJuX29mZlwiLFxuICAgIH0sXG4gIH07XG5cbiAgLyoqXG4gICAqIE9wdGlvbnMgZm9yIHRoZSB2aWV3J3MgdGl0bGUgY2FyZC5cbiAgICpcbiAgICogQHR5cGUge3ZpZXdUaXRsZUNhcmRPcHRpb25zfVxuICAgKi9cbiAgI3ZpZXdUaXRsZUNhcmRPcHRpb24gPSB7XG4gICAgdGl0bGU6IFwiQWxsIEZhbnNcIixcbiAgICBzdWJ0aXRsZTogSGVscGVyLmdldENvdW50VGVtcGxhdGUodGhpcy5kb21haW4sIFwiZXFcIiwgXCJvblwiKSArIFwiIGZhbnMgb25cIixcbiAgfTtcblxuICAvKipcbiAgICogQ2xhc3MgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSB7dmlld09wdGlvbnN9IFtvcHRpb25zPXt9XSBPcHRpb25zIGZvciB0aGUgdmlldy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5tZXJnZU9wdGlvbnMoXG4gICAgICAgIHRoaXMuI2RlZmF1bHRPcHRpb25zLFxuICAgICAgICBvcHRpb25zLFxuICAgICk7XG5cbiAgICAvLyBDcmVhdGUgYSB0aXRsZSBjYXJkIHRvIHN3aXRjaCBhbGwgZW50aXRpZXMgb2YgdGhlIGRvbWFpbi5cbiAgICB0aGlzLnZpZXdUaXRsZUNhcmQgPSBuZXcgVGl0bGVDYXJkKEhlbHBlci5hcmVhcywge1xuICAgICAgLi4udGhpcy4jdmlld1RpdGxlQ2FyZE9wdGlvbixcbiAgICAgIC4uLnRoaXMub3B0aW9uc1tcInRpdGxlQ2FyZFwiXSxcbiAgICB9KS5jcmVhdGVDYXJkKCk7XG4gIH1cblxuICBnZXQgZG9tYWluKCkge1xuICAgIHJldHVybiB0aGlzLiNkb21haW47XG4gIH1cbn1cblxuZXhwb3J0IHtGYW5WaWV3fTtcbiIsImltcG9ydCB7SGVscGVyfSBmcm9tIFwiLi4vSGVscGVyXCI7XG5pbXBvcnQge0Fic3RyYWN0Vmlld30gZnJvbSBcIi4vQWJzdHJhY3RWaWV3XCI7XG5cbi8qKlxuICogSG9tZSBWaWV3IENsYXNzLlxuICpcbiAqIFVzZWQgdG8gY3JlYXRlIGEgSG9tZSB2aWV3LlxuICpcbiAqIEBjbGFzcyBIb21lVmlld1xuICogQGV4dGVuZHMgQWJzdHJhY3RWaWV3XG4gKi9cbmNsYXNzIEhvbWVWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcbiAgLyoqXG4gICAqIERvbWFpbiBvZiB0aGUgdmlldydzIGVudGl0aWVzLlxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKi9cbiAgI2RvbWFpbiA9IFwiY2FtZXJhXCI7XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIHZpZXcuXG4gICAqXG4gICAqIEB0eXBlIHt2aWV3T3B0aW9uc31cbiAgICogQHByaXZhdGVcbiAgICovXG4gICNkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICB0aXRsZTogXCJIb21lXCIsXG4gICAgcGF0aDogXCJob21lXCIsXG4gICAgc3VidmlldzogZmFsc2UsXG4gIH07XG5cbiAgLyoqXG4gICAqIENsYXNzIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0ge3ZpZXdPcHRpb25zfSBbb3B0aW9ucz17fV0gT3B0aW9ucyBmb3IgdGhlIHZpZXcuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubWVyZ2VPcHRpb25zKFxuICAgICAgICB0aGlzLiNkZWZhdWx0T3B0aW9ucyxcbiAgICAgICAgb3B0aW9ucyxcbiAgICApO1xuICB9XG5cbiAgZ2V0IGRvbWFpbigpIHtcbiAgICByZXR1cm4gdGhpcy4jZG9tYWluO1xuICB9XG5cbiAgYXN5bmMgY3JlYXRlVmlld0NhcmRzKCkge1xuICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICB0aGlzLiNjcmVhdGVDaGlwcygpLFxuICAgICAgdGhpcy4jY3JlYXRlUGVyc29uQ2FyZHMoKSxcbiAgICAgIHRoaXMuI2NyZWF0ZUFyZWFDYXJkcygpLFxuICAgIF0pLnRoZW4oKFtjaGlwcywgcGVyc29uQ2FyZHMsIGFyZWFDYXJkc10pID0+IHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgICAgICAgPSBIZWxwZXIuc3RyYXRlZ3lPcHRpb25zO1xuICAgICAgY29uc3QgaG9tZVZpZXdDYXJkcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6IFwiY3VzdG9tOm11c2hyb29tLWNoaXBzLWNhcmRcIixcbiAgICAgICAgICBhbGlnbm1lbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgICAgY2hpcHM6IGNoaXBzLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogXCJob3Jpem9udGFsLXN0YWNrXCIsXG4gICAgICAgICAgY2FyZHM6IHBlcnNvbkNhcmRzLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogXCJjdXN0b206bXVzaHJvb20tdGVtcGxhdGUtY2FyZFwiLFxuICAgICAgICAgIHByaW1hcnk6IFwieyUgc2V0IHRpbWUgPSBub3coKS5ob3VyICV9IHslIGlmICh0aW1lID49IDE4KSAlfSBHb29kIEV2ZW5pbmcsIHt7dXNlcn19ISB7JSBlbGlmICh0aW1lID49IDEyKSAlfSBHb29kIEFmdGVybm9vbiwge3t1c2VyfX0hIHslIGVsaWYgKHRpbWUgPj0gNSkgJX0gR29vZCBNb3JuaW5nLCB7e3VzZXJ9fSEgeyUgZWxzZSAlfSBIZWxsbywge3t1c2VyfX0hIHslIGVuZGlmICV9XCIsXG4gICAgICAgICAgaWNvbjogXCJtZGk6aGFuZC13YXZlXCIsXG4gICAgICAgICAgaWNvbl9jb2xvcjogXCJvcmFuZ2VcIixcbiAgICAgICAgfSxcbiAgICAgIF07XG5cbiAgICAgIC8vIEFkZCBxdWljayBhY2Nlc3MgY2FyZHMuXG4gICAgICBpZiAob3B0aW9ucy5xdWlja19hY2Nlc3NfY2FyZHMpIHtcbiAgICAgICAgaG9tZVZpZXdDYXJkcy5wdXNoKC4uLm9wdGlvbnMucXVpY2tfYWNjZXNzX2NhcmRzKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIGFyZWEgY2FyZHMuXG4gICAgICBob21lVmlld0NhcmRzLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogXCJjdXN0b206bXVzaHJvb20tdGl0bGUtY2FyZFwiLFxuICAgICAgICAgICAgdGl0bGU6IFwiQXJlYXNcIixcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IFwidmVydGljYWwtc3RhY2tcIixcbiAgICAgICAgICAgIGNhcmRzOiBhcmVhQ2FyZHMsXG4gICAgICAgICAgfSk7XG5cbiAgICAgIC8vIEFkZCBjdXN0b20gY2FyZHMuXG4gICAgICBpZiAob3B0aW9ucy5leHRyYV9jYXJkcykge1xuICAgICAgICBob21lVmlld0NhcmRzLnB1c2goLi4ub3B0aW9ucy5leHRyYV9jYXJkcyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBob21lVmlld0NhcmRzO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgI2NyZWF0ZUNoaXBzKCkge1xuICAgIGNvbnN0IGNoaXBzICAgICAgICAgICA9IFtdO1xuICAgIGNvbnN0IGNoaXBPcHRpb25zICAgICA9IEhlbHBlci5zdHJhdGVneU9wdGlvbnMuY2hpcHM7XG4gICAgLy8gVE9ETzogR2V0IGRvbWFpbnMgZnJvbSBjb25maWcgKEN1cnJlbnRseSBzdHJhdGVneS5vcHRpb25zLnZpZXdzKS5cbiAgICBjb25zdCBleHBvc2VkX2RvbWFpbnMgPSBbXCJsaWdodFwiLCBcImZhblwiLCBcImNvdmVyXCIsIFwic3dpdGNoXCIsIFwiY2xpbWF0ZVwiXTtcbiAgICAvLyBDcmVhdGUgYSBsaXN0IG9mIGFyZWEtaWRzLCB1c2VkIGZvciBzd2l0Y2hpbmcgYWxsIGRldmljZXMgdmlhIGNoaXBzXG4gICAgY29uc3QgYXJlYUlkcyAgICAgICAgID0gSGVscGVyLmFyZWFzLm1hcChhcmVhID0+IGFyZWEuYXJlYV9pZCk7XG5cbiAgICBsZXQgY2hpcE1vZHVsZTtcblxuICAgIC8vIFdlYXRoZXIgY2hpcC5cbiAgICBjb25zdCB3ZWF0aGVyRW50aXR5SWQgPSBjaGlwT3B0aW9ucz8ud2VhdGhlcl9lbnRpdHkgPz8gSGVscGVyLmVudGl0aWVzLmZpbmQoXG4gICAgICAgIGVudGl0eSA9PiBlbnRpdHkuZW50aXR5X2lkLnN0YXJ0c1dpdGgoXCJ3ZWF0aGVyLlwiKSAmJiBlbnRpdHkuZGlzYWJsZWRfYnkgPT0gbnVsbCAmJiBlbnRpdHkuaGlkZGVuX2J5ID09IG51bGwsXG4gICAgKS5lbnRpdHlfaWQ7XG5cbiAgICBpZiAod2VhdGhlckVudGl0eUlkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjaGlwTW9kdWxlICAgICAgICA9IGF3YWl0IGltcG9ydChcIi4uL2NoaXBzL1dlYXRoZXJDaGlwXCIpO1xuICAgICAgICBjb25zdCB3ZWF0aGVyQ2hpcCA9IG5ldyBjaGlwTW9kdWxlLldlYXRoZXJDaGlwKHdlYXRoZXJFbnRpdHlJZCk7XG4gICAgICAgIGNoaXBzLnB1c2god2VhdGhlckNoaXAuZ2V0Q2hpcCgpKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihIZWxwZXIuZGVidWcgPyBlIDogXCJBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBjcmVhdGluZyB0aGUgd2VhdGhlciBjaGlwIVwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBOdW1lcmljIGNoaXBzLlxuICAgIGZvciAobGV0IGNoaXBUeXBlIG9mIGV4cG9zZWRfZG9tYWlucykge1xuICAgICAgaWYgKGNoaXBPcHRpb25zPy5bYCR7Y2hpcFR5cGV9X2NvdW50YF0gPz8gdHJ1ZSkge1xuICAgICAgICBjb25zdCBjbGFzc05hbWUgPSBIZWxwZXIuc2FuaXRpemVDbGFzc05hbWUoY2hpcFR5cGUgKyBcIkNoaXBcIik7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY2hpcE1vZHVsZSA9IGF3YWl0IGltcG9ydCgoYC4uL2NoaXBzLyR7Y2xhc3NOYW1lfWApKTtcbiAgICAgICAgICBjb25zdCBjaGlwID0gbmV3IGNoaXBNb2R1bGVbY2xhc3NOYW1lXShhcmVhSWRzKTtcbiAgICAgICAgICBjaGlwcy5wdXNoKGNoaXAuZ2V0Q2hpcCgpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoSGVscGVyLmRlYnVnID8gZSA6IGBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBjcmVhdGluZyB0aGUgJHtjaGlwVHlwZX0gY2hpcCFgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEV4dHJhIGNoaXBzLlxuICAgIGlmIChjaGlwT3B0aW9ucz8uZXh0cmFfY2hpcHMpIHtcbiAgICAgIGNoaXBzLnB1c2goY2hpcE9wdGlvbnMuZXh0cmFfY2hpcHMpO1xuICAgIH1cblxuICAgIHJldHVybiBjaGlwcztcbiAgfVxuXG4gICNjcmVhdGVQZXJzb25DYXJkcygpIHtcbiAgICBjb25zdCBjYXJkcyA9IFtdO1xuXG4gICAgaW1wb3J0KFwiLi4vY2FyZHMvUGVyc29uQ2FyZFwiKS50aGVuKHBlcnNvbk1vZHVsZSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IHBlcnNvbiBvZiBIZWxwZXIuZW50aXRpZXMuZmlsdGVyKGVudGl0eSA9PiBlbnRpdHkuZW50aXR5X2lkLnN0YXJ0c1dpdGgoXCJwZXJzb24uXCIpKSkge1xuICAgICAgICBjYXJkcy5wdXNoKG5ldyBwZXJzb25Nb2R1bGUuUGVyc29uQ2FyZChwZXJzb24pLmdldENhcmQoKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2FyZHM7XG4gIH1cblxuICAjY3JlYXRlQXJlYUNhcmRzKCkge1xuICAgIGNvbnN0IGdyb3VwZWRDYXJkcyA9IFtdO1xuXG4gICAgaW1wb3J0KFwiLi4vY2FyZHMvQXJlYUNhcmRcIikudGhlbihhcmVhTW9kdWxlID0+IHtcbiAgICAgIGNvbnN0IGFyZWFDYXJkcyA9IFtdO1xuXG4gICAgICBmb3IgKGNvbnN0IGFyZWEgb2YgSGVscGVyLmFyZWFzKSB7XG4gICAgICAgIGFyZWFDYXJkcy5wdXNoKG5ldyBhcmVhTW9kdWxlLkFyZWFDYXJkKGFyZWEsIEhlbHBlci5zdHJhdGVneU9wdGlvbnMuYXJlYXM/LlthcmVhLmFyZWFfaWRdKS5nZXRDYXJkKCkpO1xuICAgICAgfVxuXG4gICAgICAvLyBIb3Jpem9udGFsbHkgZ3JvdXAgZXZlcnkgdHdvIGFyZWEgY2FyZHMuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZWFDYXJkcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICBncm91cGVkQ2FyZHMucHVzaCh7XG4gICAgICAgICAgdHlwZTogXCJob3Jpem9udGFsLXN0YWNrXCIsXG4gICAgICAgICAgY2FyZHM6IGFyZWFDYXJkcy5zbGljZShpLCBpICsgMiksXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGdyb3VwZWRDYXJkcztcbiAgfVxufVxuXG5leHBvcnQge0hvbWVWaWV3fTtcbiIsImltcG9ydCB7SGVscGVyfSBmcm9tIFwiLi4vSGVscGVyXCI7XG5pbXBvcnQge1RpdGxlQ2FyZH0gZnJvbSBcIi4uL2NhcmRzL1RpdGxlQ2FyZFwiO1xuaW1wb3J0IHtBYnN0cmFjdFZpZXd9IGZyb20gXCIuL0Fic3RyYWN0Vmlld1wiO1xuXG4vKipcbiAqIExpZ2h0IFZpZXcgQ2xhc3MuXG4gKlxuICogVXNlZCB0byBjcmVhdGUgYSB2aWV3IGZvciBlbnRpdGllcyBvZiB0aGUgbGlnaHQgZG9tYWluLlxuICpcbiAqIEBjbGFzcyBMaWdodFZpZXdcbiAqIEBleHRlbmRzIEFic3RyYWN0Vmlld1xuICovXG5jbGFzcyBMaWdodFZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXcge1xuICAvKipcbiAgICogRG9tYWluIG9mIHRoZSB2aWV3J3MgZW50aXRpZXMuXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqL1xuICAjZG9tYWluID0gXCJsaWdodFwiO1xuXG4gIC8qKlxuICAgKiBEZWZhdWx0IG9wdGlvbnMgZm9yIHRoZSB2aWV3LlxuICAgKlxuICAgKiBAdHlwZSB7dmlld09wdGlvbnN9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICAjZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgdGl0bGU6IFwiTGlnaHRzXCIsXG4gICAgcGF0aDogXCJsaWdodHNcIixcbiAgICBpY29uOiBcIm1kaTpsaWdodGJ1bGItZ3JvdXBcIixcbiAgICBzdWJ2aWV3OiBmYWxzZSxcbiAgICB0aXRsZUNhcmQ6IHtcbiAgICAgIGljb25PbjogXCJtZGk6bGlnaHRidWxiXCIsXG4gICAgICBpY29uT2ZmOiBcIm1kaTpsaWdodGJ1bGItb2ZmXCIsXG4gICAgICBvblNlcnZpY2U6IFwibGlnaHQudHVybl9vblwiLFxuICAgICAgb2ZmU2VydmljZTogXCJsaWdodC50dXJuX29mZlwiLFxuICAgIH0sXG4gIH07XG5cbiAgLyoqXG4gICAqIE9wdGlvbnMgZm9yIHRoZSB2aWV3J3MgdGl0bGUgY2FyZC5cbiAgICpcbiAgICogQHR5cGUge3ZpZXdUaXRsZUNhcmRPcHRpb25zfVxuICAgKi9cbiAgI3ZpZXdUaXRsZUNhcmRPcHRpb24gPSB7XG4gICAgdGl0bGU6IFwiQWxsIExpZ2h0c1wiLFxuICAgIHN1YnRpdGxlOiBIZWxwZXIuZ2V0Q291bnRUZW1wbGF0ZSh0aGlzLmRvbWFpbiwgXCJlcVwiLCBcIm9uXCIpICsgXCIgbGlnaHRzIG9uXCIsXG4gIH07XG5cbiAgLyoqXG4gICAqIENsYXNzIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0ge3ZpZXdPcHRpb25zfSBbb3B0aW9ucz17fV0gT3B0aW9ucyBmb3IgdGhlIHZpZXcuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubWVyZ2VPcHRpb25zKFxuICAgICAgICB0aGlzLiNkZWZhdWx0T3B0aW9ucyxcbiAgICAgICAgb3B0aW9ucyxcbiAgICApO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGl0bGUgY2FyZCB0byBzd2l0Y2ggYWxsIGVudGl0aWVzIG9mIHRoZSBkb21haW4uXG4gICAgdGhpcy52aWV3VGl0bGVDYXJkID0gbmV3IFRpdGxlQ2FyZChIZWxwZXIuYXJlYXMsIHtcbiAgICAgIC4uLnRoaXMuI3ZpZXdUaXRsZUNhcmRPcHRpb24sXG4gICAgICAuLi50aGlzLm9wdGlvbnNbXCJ0aXRsZUNhcmRcIl0sXG4gICAgfSkuY3JlYXRlQ2FyZCgpO1xuICB9XG5cbiAgZ2V0IGRvbWFpbigpIHtcbiAgICByZXR1cm4gdGhpcy4jZG9tYWluO1xuICB9XG59XG5cbmV4cG9ydCB7TGlnaHRWaWV3fTtcbiIsImltcG9ydCB7SGVscGVyfSBmcm9tIFwiLi4vSGVscGVyXCI7XG5pbXBvcnQge1RpdGxlQ2FyZH0gZnJvbSBcIi4uL2NhcmRzL1RpdGxlQ2FyZFwiO1xuaW1wb3J0IHtBYnN0cmFjdFZpZXd9IGZyb20gXCIuL0Fic3RyYWN0Vmlld1wiO1xuXG4vKipcbiAqIFN3aXRjaCBWaWV3IENsYXNzLlxuICpcbiAqIFVzZWQgdG8gY3JlYXRlIGEgdmlldyBmb3IgZW50aXRpZXMgb2YgdGhlIHN3aXRjaCBkb21haW4uXG4gKlxuICogQGNsYXNzIFN3aXRjaFZpZXdcbiAqIEBleHRlbmRzIEFic3RyYWN0Vmlld1xuICovXG5jbGFzcyBTd2l0Y2hWaWV3IGV4dGVuZHMgQWJzdHJhY3RWaWV3IHtcbiAgLyoqXG4gICAqIERvbWFpbiBvZiB0aGUgdmlldydzIGVudGl0aWVzLlxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKi9cbiAgI2RvbWFpbiA9IFwic3dpdGNoXCI7XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIHZpZXcuXG4gICAqXG4gICAqIEB0eXBlIHt2aWV3T3B0aW9uc31cbiAgICogQHByaXZhdGVcbiAgICovXG4gICNkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICB0aXRsZTogXCJTd2l0Y2hlc1wiLFxuICAgIHBhdGg6IFwic3dpdGNoZXNcIixcbiAgICBpY29uOiBcIm1kaTpkaXAtc3dpdGNoXCIsXG4gICAgc3VidmlldzogZmFsc2UsXG4gICAgdGl0bGVDYXJkOiB7XG4gICAgICBpY29uT246IFwibWRpOnBvd2VyLXBsdWdcIixcbiAgICAgIGljb25PZmY6IFwibWRpOnBvd2VyLXBsdWctb2ZmXCIsXG4gICAgICBvblNlcnZpY2U6IFwic3dpdGNoLnR1cm5fb25cIixcbiAgICAgIG9mZlNlcnZpY2U6IFwic3dpdGNoLnR1cm5fb2ZmXCIsXG4gICAgfSxcbiAgfTtcblxuICAvKipcbiAgICogT3B0aW9ucyBmb3IgdGhlIHZpZXcncyB0aXRsZSBjYXJkLlxuICAgKlxuICAgKiBAdHlwZSB7dmlld1RpdGxlQ2FyZE9wdGlvbnN9XG4gICAqL1xuICAjdmlld1RpdGxlQ2FyZE9wdGlvbiA9IHtcbiAgICB0aXRsZTogXCJBbGwgU3dpdGNoZXNcIixcbiAgICBzdWJ0aXRsZTogSGVscGVyLmdldENvdW50VGVtcGxhdGUodGhpcy5kb21haW4sIFwiZXFcIiwgXCJvblwiKSArIFwiIHN3aXRjaGVzIG9uXCIsXG4gIH07XG5cbiAgLyoqXG4gICAqIENsYXNzIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0ge3ZpZXdPcHRpb25zfSBbb3B0aW9ucz17fV0gT3B0aW9ucyBmb3IgdGhlIHZpZXcuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubWVyZ2VPcHRpb25zKFxuICAgICAgICB0aGlzLiNkZWZhdWx0T3B0aW9ucyxcbiAgICAgICAgb3B0aW9ucyxcbiAgICApO1xuXG4gICAgLy8gQ3JlYXRlIGEgdGl0bGUgY2FyZCB0byBzd2l0Y2ggYWxsIGVudGl0aWVzIG9mIHRoZSBkb21haW4uXG4gICAgdGhpcy52aWV3VGl0bGVDYXJkID0gbmV3IFRpdGxlQ2FyZChIZWxwZXIuYXJlYXMsIHtcbiAgICAgIC4uLnRoaXMuI3ZpZXdUaXRsZUNhcmRPcHRpb24sXG4gICAgICAuLi50aGlzLm9wdGlvbnNbXCJ0aXRsZUNhcmRcIl0sXG4gICAgfSkuY3JlYXRlQ2FyZCgpO1xuICB9XG5cbiAgZ2V0IGRvbWFpbigpIHtcbiAgICByZXR1cm4gdGhpcy4jZG9tYWluO1xuICB9XG59XG5cbmV4cG9ydCB7U3dpdGNoVmlld307XG4iLCIvKipcbiAqIEBuYW1lc3BhY2UgdHlwZWRlZnMudmlld3NcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IGFic3RyYWN0T3B0aW9ucyBPcHRpb25zIHRvIGNyZWF0ZSBhIHZpZXcuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW3RpdGxlXSBUaGUgdGl0bGUgb3IgbmFtZS5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbcGF0aF0gUGF0aHMgYXJlIHVzZWQgaW4gdGhlIFVSTC5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbaWNvbl0gVGhlIGljb24gb2YgdGhlIHZpZXcuXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IHN1YnZpZXcgIE1hcmsgdGhlIHZpZXcgYXMg4oCcU3Vidmlld+KAnS5cbiAqIEBtZW1iZXJPZiB0eXBlZGVmcy52aWV3c1xuICogQHNlZSBodHRwczovL3d3dy5ob21lLWFzc2lzdGFudC5pby9kYXNoYm9hcmRzL3ZpZXdzL1xuICovXG5cbi8qKlxuICogQHR5cGVkZWYge2Fic3RyYWN0T3B0aW9ucyAmIE9iamVjdH0gdmlld09wdGlvbnMgT3B0aW9ucyBmb3IgdGhlIGV4dGVuZGVkIFZpZXcgY2xhc3MuXG4gKiBAcHJvcGVydHkge3RpdGxlQ2FyZE9wdGlvbnN9IFt0aXRsZUNhcmRdIE9wdGlvbnMgZm9yIHRoZSB0aXRsZSBjYXJkIG9mIHRoZSB2aWV3LlxuICogQG1lbWJlck9mIHR5cGVkZWZzLnZpZXdzXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSB0aXRsZUNhcmRPcHRpb25zIE9wdGlvbnMgZm9yIHRoZSB0aXRsZSBjYXJkIG9mIHRoZSB2aWV3LlxuICogQHByb3BlcnR5IHtzdHJpbmd9IGljb25PbiBJY29uIHRvIHNob3cgZm9yIHN3aXRjaGluZyBlbnRpdGllcyBmcm9tIG9mZiBzdGF0ZS5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBpY29uT2ZmIEljb24gdG8gc2hvdyBmb3Igc3dpdGNoaW5nIGVudGl0aWVzIHRvIG9mZiBzdGF0ZS5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBvblNlcnZpY2UgU2VydmljZSB0byBjYWxsIGZvciBzd2l0Y2hpbmcgZW50aXRpZXMgZnJvbSBvZmYgc3RhdGUuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gb2ZmU2VydmljZSBTZXJ2aWNlIHRvIGNhbGwgZm9yIHN3aXRjaGluZyBlbnRpdGllcyB0byBvZmYgc3RhdGUuXG4gKiBAbWVtYmVyT2YgdHlwZWRlZnMudmlld3NcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IHZpZXdUaXRsZUNhcmRPcHRpb25zIE9wdGlvbnMgZm9yIHRoZSB2aWV3J3MgdGl0bGUgY2FyZC5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbdGl0bGVdIFRpdGxlIHRvIHJlbmRlci4gTWF5IGNvbnRhaW4gdGVtcGxhdGVzLlxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtzdWJ0aXRsZV0gU3VidGl0bGUgdG8gcmVuZGVyLiBNYXkgY29udGFpbiB0ZW1wbGF0ZXMuXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtzaG93Q29udHJvbHM9dHJ1ZV0gRmFsc2UgdG8gaGlkZSBjb250cm9scy5cbiAqIEBtZW1iZXJPZiB0eXBlZGVmcy52aWV3c1xuICovXG5cbmV4cG9ydCB7fTtcbiIsInZhciBtYXAgPSB7XG5cdFwiLi9BYnN0cmFjdFZpZXdcIjogW1xuXHRcdFwiLi9zcmMvdmlld3MvQWJzdHJhY3RWaWV3LmpzXCIsXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL0Fic3RyYWN0Vmlldy5qc1wiOiBbXG5cdFx0XCIuL3NyYy92aWV3cy9BYnN0cmFjdFZpZXcuanNcIixcblx0XHRcIm1haW5cIlxuXHRdLFxuXHRcIi4vQ2FtZXJhVmlld1wiOiBbXG5cdFx0XCIuL3NyYy92aWV3cy9DYW1lcmFWaWV3LmpzXCIsXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL0NhbWVyYVZpZXcuanNcIjogW1xuXHRcdFwiLi9zcmMvdmlld3MvQ2FtZXJhVmlldy5qc1wiLFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9DbGltYXRlVmlld1wiOiBbXG5cdFx0XCIuL3NyYy92aWV3cy9DbGltYXRlVmlldy5qc1wiLFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9DbGltYXRlVmlldy5qc1wiOiBbXG5cdFx0XCIuL3NyYy92aWV3cy9DbGltYXRlVmlldy5qc1wiLFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9Db3ZlclZpZXdcIjogW1xuXHRcdFwiLi9zcmMvdmlld3MvQ292ZXJWaWV3LmpzXCIsXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL0NvdmVyVmlldy5qc1wiOiBbXG5cdFx0XCIuL3NyYy92aWV3cy9Db3ZlclZpZXcuanNcIixcblx0XHRcIm1haW5cIlxuXHRdLFxuXHRcIi4vRmFuVmlld1wiOiBbXG5cdFx0XCIuL3NyYy92aWV3cy9GYW5WaWV3LmpzXCIsXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL0ZhblZpZXcuanNcIjogW1xuXHRcdFwiLi9zcmMvdmlld3MvRmFuVmlldy5qc1wiLFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9Ib21lVmlld1wiOiBbXG5cdFx0XCIuL3NyYy92aWV3cy9Ib21lVmlldy5qc1wiLFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9Ib21lVmlldy5qc1wiOiBbXG5cdFx0XCIuL3NyYy92aWV3cy9Ib21lVmlldy5qc1wiLFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi9MaWdodFZpZXdcIjogW1xuXHRcdFwiLi9zcmMvdmlld3MvTGlnaHRWaWV3LmpzXCIsXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL0xpZ2h0Vmlldy5qc1wiOiBbXG5cdFx0XCIuL3NyYy92aWV3cy9MaWdodFZpZXcuanNcIixcblx0XHRcIm1haW5cIlxuXHRdLFxuXHRcIi4vU3dpdGNoVmlld1wiOiBbXG5cdFx0XCIuL3NyYy92aWV3cy9Td2l0Y2hWaWV3LmpzXCIsXG5cdFx0XCJtYWluXCJcblx0XSxcblx0XCIuL1N3aXRjaFZpZXcuanNcIjogW1xuXHRcdFwiLi9zcmMvdmlld3MvU3dpdGNoVmlldy5qc1wiLFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi90eXBlZGVmc1wiOiBbXG5cdFx0XCIuL3NyYy92aWV3cy90eXBlZGVmcy5qc1wiLFxuXHRcdFwibWFpblwiXG5cdF0sXG5cdFwiLi90eXBlZGVmcy5qc1wiOiBbXG5cdFx0XCIuL3NyYy92aWV3cy90eXBlZGVmcy5qc1wiLFxuXHRcdFwibWFpblwiXG5cdF1cbn07XG5mdW5jdGlvbiB3ZWJwYWNrQXN5bmNDb250ZXh0KHJlcSkge1xuXHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1hcCwgcmVxKSkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcblx0XHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIHJlcSArIFwiJ1wiKTtcblx0XHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHRcdHRocm93IGU7XG5cdFx0fSk7XG5cdH1cblxuXHR2YXIgaWRzID0gbWFwW3JlcV0sIGlkID0gaWRzWzBdO1xuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5lKGlkc1sxXSkudGhlbigoKSA9PiB7XG5cdFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oaWQpO1xuXHR9KTtcbn1cbndlYnBhY2tBc3luY0NvbnRleHQua2V5cyA9ICgpID0+IChPYmplY3Qua2V5cyhtYXApKTtcbndlYnBhY2tBc3luY0NvbnRleHQuaWQgPSBcIi4vc3JjL3ZpZXdzIGxhenkgcmVjdXJzaXZlIF5cXFxcLlxcXFwvLiokXCI7XG5tb2R1bGUuZXhwb3J0cyA9IHdlYnBhY2tBc3luY0NvbnRleHQ7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsInZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiA/IChvYmopID0+IChPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSkgOiAob2JqKSA9PiAob2JqLl9fcHJvdG9fXyk7XG52YXIgbGVhZlByb3RvdHlwZXM7XG4vLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3Rcbi8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuLy8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4vLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3Rcbi8vIG1vZGUgJiAxNjogcmV0dXJuIHZhbHVlIHdoZW4gaXQncyBQcm9taXNlLWxpa2Vcbi8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbl9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG5cdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IHRoaXModmFsdWUpO1xuXHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuXHRpZih0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlKSB7XG5cdFx0aWYoKG1vZGUgJiA0KSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG5cdFx0aWYoKG1vZGUgJiAxNikgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09ICdmdW5jdGlvbicpIHJldHVybiB2YWx1ZTtcblx0fVxuXHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuXHR2YXIgZGVmID0ge307XG5cdGxlYWZQcm90b3R5cGVzID0gbGVhZlByb3RvdHlwZXMgfHwgW251bGwsIGdldFByb3RvKHt9KSwgZ2V0UHJvdG8oW10pLCBnZXRQcm90byhnZXRQcm90byldO1xuXHRmb3IodmFyIGN1cnJlbnQgPSBtb2RlICYgMiAmJiB2YWx1ZTsgdHlwZW9mIGN1cnJlbnQgPT0gJ29iamVjdCcgJiYgIX5sZWFmUHJvdG90eXBlcy5pbmRleE9mKGN1cnJlbnQpOyBjdXJyZW50ID0gZ2V0UHJvdG8oY3VycmVudCkpIHtcblx0XHRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjdXJyZW50KS5mb3JFYWNoKChrZXkpID0+IChkZWZba2V5XSA9ICgpID0+ICh2YWx1ZVtrZXldKSkpO1xuXHR9XG5cdGRlZlsnZGVmYXVsdCddID0gKCkgPT4gKHZhbHVlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBkZWYpO1xuXHRyZXR1cm4gbnM7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIi8vIFRoZSBjaHVuayBsb2FkaW5nIGZ1bmN0aW9uIGZvciBhZGRpdGlvbmFsIGNodW5rc1xuLy8gU2luY2UgYWxsIHJlZmVyZW5jZWQgY2h1bmtzIGFyZSBhbHJlYWR5IGluY2x1ZGVkXG4vLyBpbiB0aGlzIGZpbGUsIHRoaXMgZnVuY3Rpb24gaXMgZW1wdHkgaGVyZS5cbl9fd2VicGFja19yZXF1aXJlX18uZSA9ICgpID0+IChQcm9taXNlLnJlc29sdmUoKSk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7SGVscGVyfSBmcm9tIFwiLi9IZWxwZXJcIjtcclxuaW1wb3J0IHtTZW5zb3JDYXJkfSBmcm9tIFwiLi9jYXJkcy9TZW5zb3JDYXJkXCI7XHJcbmltcG9ydCB7VGl0bGVDYXJkfSBmcm9tIFwiLi9jYXJkcy9UaXRsZUNhcmRcIjtcclxuXHJcbi8qKlxyXG4gKiBNdXNocm9vbSBEYXNoYm9hcmQgU3RyYXRlZ3kuPGJyPlxyXG4gKiA8YnI+XHJcbiAqIE11c2hyb29tIGRhc2hib2FyZCBzdHJhdGVneSBwcm92aWRlcyBhIHN0cmF0ZWd5IGZvciBIb21lLUFzc2lzdGFudCB0byBjcmVhdGUgYSBkYXNoYm9hcmQgYXV0b21hdGljYWxseS48YnI+XHJcbiAqIFRoZSBzdHJhdGVneSBtYWtlcyB1c2UgTXVzaHJvb20sIE1pbmkgR3JhcGggYW5kIFdlYlJUQyBjYXJkcyB0byByZXByZXNlbnQgeW91ciBlbnRpdGllcy48YnI+XHJcbiAqIDxicj5cclxuICogRmVhdHVyZXM6PGJyPlxyXG4gKiAgICAg8J+boCBBdXRvbWF0aWNhbGx5IGNyZWF0ZSBkYXNoYm9hcmQgd2l0aCAzIGxpbmVzIG9mIHlhbWwuPGJyPlxyXG4gKiAgICAg8J+YjSBCdWlsdC1pbiBWaWV3cyBmb3Igc2V2ZXJhbCBzdGFuZGFyZCBkb21haW5zLjxicj5cclxuICogICAgIPCfjqggTWFueSBvcHRpb25zIHRvIGN1c3RvbWl6ZSB0byB5b3VyIG5lZWRzLjxicj5cclxuICogPGJyPlxyXG4gKiBDaGVjayB0aGUgW1JlcG9zaXRvcnlde0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9BYWxpYW5LaGFuL211c2hyb29tLXN0cmF0ZWd5fSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICovXHJcbmNsYXNzIE11c2hyb29tU3RyYXRlZ3kge1xyXG4gIC8qKlxyXG4gICAqIEdlbmVyYXRlIGEgZGFzaGJvYXJkLlxyXG4gICAqXHJcbiAgICogQ2FsbGVkIHdoZW4gb3BlbmluZyBhIGRhc2hib2FyZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7ZGFzaEJvYXJkSW5mb30gaW5mbyBEYXNoYm9hcmQgc3RyYXRlZ3kgaW5mb3JtYXRpb24gb2JqZWN0LlxyXG4gICAqIEByZXR1cm4ge1Byb21pc2U8e3ZpZXdzOiBPYmplY3RbXX0+fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhc3luYyBnZW5lcmF0ZURhc2hib2FyZChpbmZvKSB7XHJcbiAgICBhd2FpdCBIZWxwZXIuaW5pdGlhbGl6ZShpbmZvKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdmlld3MuXHJcbiAgICAvLyBUT0RPOiBHZXQgZG9tYWlucyBmcm9tIGNvbmZpZyAoQ3VycmVudGx5IHN0cmF0ZWd5Lm9wdGlvbnMudmlld3MpLlxyXG4gICAgY29uc3QgZXhwb3NlZERvbWFpbnMgPSBbXCJIb21lXCIsIFwibGlnaHRcIiwgXCJmYW5cIiwgXCJjb3ZlclwiLCBcInN3aXRjaFwiLCBcImNsaW1hdGVcIiwgXCJjYW1lcmFcIl07XHJcbiAgICBjb25zdCB2aWV3cyAgICAgICAgICA9IFtdO1xyXG5cclxuICAgIGxldCB2aWV3TW9kdWxlO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHZpZXcgZm9yIGVhY2ggZXhwb3NlZCBkb21haW4uXHJcbiAgICBmb3IgKGxldCB2aWV3VHlwZSBvZiBleHBvc2VkRG9tYWlucykge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHZpZXdUeXBlICAgPSBIZWxwZXIuc2FuaXRpemVDbGFzc05hbWUodmlld1R5cGUgKyBcIlZpZXdcIik7XHJcbiAgICAgICAgdmlld01vZHVsZSA9IGF3YWl0IGltcG9ydChgLi92aWV3cy8ke3ZpZXdUeXBlfWApO1xyXG4gICAgICAgIGNvbnN0IHZpZXcgPSBhd2FpdCBuZXcgdmlld01vZHVsZVt2aWV3VHlwZV0oKS5nZXRWaWV3KCk7XHJcblxyXG4gICAgICAgIHZpZXdzLnB1c2godmlldyk7XHJcblxyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihIZWxwZXIuZGVidWcgPyBlIDogYFZpZXcgJyR7dmlld1R5cGV9JyBjb3VsZG4ndCBiZSBsb2FkZWQhYCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgc3Vidmlld3MgZm9yIGVhY2ggYXJlYS5cclxuICAgIGZvciAoY29uc3QgYXJlYSBvZiBIZWxwZXIuYXJlYXMpIHtcclxuICAgICAgdmlld3MucHVzaCh7XHJcbiAgICAgICAgdGl0bGU6IGFyZWEubmFtZSxcclxuICAgICAgICBwYXRoOiBhcmVhLmFyZWFfaWQsXHJcbiAgICAgICAgc3VidmlldzogdHJ1ZSxcclxuICAgICAgICBzdHJhdGVneToge1xyXG4gICAgICAgICAgdHlwZTogXCJjdXN0b206bXVzaHJvb20tc3RyYXRlZ3lcIixcclxuICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgYXJlYSxcclxuICAgICAgICAgICAgXCJlbnRpdHlfY29uZmlnXCI6IEhlbHBlci5zdHJhdGVneU9wdGlvbnMuZW50aXR5X2NvbmZpZyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIGN1c3RvbSB2aWV3cy5cclxuICAgIGlmIChIZWxwZXIuc3RyYXRlZ3lPcHRpb25zLmV4dHJhX3ZpZXdzKSB7XHJcbiAgICAgIHZpZXdzLnB1c2goLi4uSGVscGVyLnN0cmF0ZWd5T3B0aW9ucy5leHRyYV92aWV3cyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmV0dXJuIHRoZSBjcmVhdGVkIHZpZXdzLlxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdmlld3M6IHZpZXdzLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdlbmVyYXRlIGEgdmlldy5cclxuICAgKlxyXG4gICAqIENhbGxlZCB3aGVuIG9wZW5pbmcgYSBzdWJ2aWV3LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHt2aWV3SW5mb30gaW5mbyBUaGUgdmlldydzIHN0cmF0ZWd5IGluZm9ybWF0aW9uIG9iamVjdC5cclxuICAgKiBAcmV0dXJuIHtQcm9taXNlPHtjYXJkczogT2JqZWN0W119Pn1cclxuICAgKi9cclxuICBzdGF0aWMgYXN5bmMgZ2VuZXJhdGVWaWV3KGluZm8pIHtcclxuICAgIGNvbnN0IGFyZWEgICAgICAgICAgICA9IGluZm8udmlldy5zdHJhdGVneS5vcHRpb25zLmFyZWE7XHJcbiAgICBjb25zdCB2aWV3Q2FyZHMgICAgICAgPSBhcmVhLmV4dHJhX2NhcmRzID8/IFtdO1xyXG4gICAgY29uc3Qgc3RyYXRlZ3lPcHRpb25zID0ge1xyXG4gICAgICBlbnRpdHlDb25maWc6IGluZm8udmlldy5zdHJhdGVneS5vcHRpb25zLmVudGl0eV9jb25maWcsXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFRPRE86IEdldCBkb21haW5zIGZyb20gY29uZmlnIChDdXJyZW50bHkgc3RyYXRlZ3kub3B0aW9ucy52aWV3cykuXHJcbiAgICBjb25zdCBleHBvc2VkRG9tYWlucyA9IFtcclxuICAgICAgXCJsaWdodFwiLFxyXG4gICAgICBcImZhblwiLFxyXG4gICAgICBcImNvdmVyXCIsXHJcbiAgICAgIFwic3dpdGNoXCIsXHJcbiAgICAgIFwiY2xpbWF0ZVwiLFxyXG4gICAgICBcImNhbWVyYVwiLFxyXG4gICAgICBcIm1lZGlhX3BsYXllclwiLFxyXG4gICAgICBcInNlbnNvclwiLFxyXG4gICAgICBcImJpbmFyeV9zZW5zb3JcIixcclxuICAgIF07XHJcblxyXG4gICAgY29uc3QgdGl0bGVDYXJkT3B0aW9ucyA9IHtcclxuICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgIHRpdGxlOiBcIk1pc2NlbGxhbmVvdXNcIixcclxuICAgICAgICBzaG93Q29udHJvbHM6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgICBsaWdodDoge1xyXG4gICAgICAgIHRpdGxlOiBcIkxpZ2h0c1wiLFxyXG4gICAgICAgIHNob3dDb250cm9sczogdHJ1ZSxcclxuICAgICAgICBpY29uT246IFwibWRpOmxpZ2h0YnVsYlwiLFxyXG4gICAgICAgIGljb25PZmY6IFwibWRpOmxpZ2h0YnVsYi1vZmZcIixcclxuICAgICAgICBvblNlcnZpY2U6IFwibGlnaHQudHVybl9vblwiLFxyXG4gICAgICAgIG9mZlNlcnZpY2U6IFwibGlnaHQudHVybl9vZmZcIixcclxuICAgICAgfSxcclxuICAgICAgZmFuOiB7XHJcbiAgICAgICAgdGl0bGU6IFwiRmFuc1wiLFxyXG4gICAgICAgIHNob3dDb250cm9sczogdHJ1ZSxcclxuICAgICAgICBpY29uT246IFwibWRpOmZhblwiLFxyXG4gICAgICAgIGljb25PZmY6IFwibWRpOmZhbi1vZmZcIixcclxuICAgICAgICBvblNlcnZpY2U6IFwiZmFuLnR1cm5fb25cIixcclxuICAgICAgICBvZmZTZXJ2aWNlOiBcImZhbi50dXJuX29mZlwiLFxyXG4gICAgICB9LFxyXG4gICAgICBjb3Zlcjoge1xyXG4gICAgICAgIHRpdGxlOiBcIkNvdmVyc1wiLFxyXG4gICAgICAgIHNob3dDb250cm9sczogdHJ1ZSxcclxuICAgICAgICBpY29uT246IFwibWRpOmFycm93LXVwXCIsXHJcbiAgICAgICAgaWNvbk9mZjogXCJtZGk6YXJyb3ctZG93blwiLFxyXG4gICAgICAgIG9uU2VydmljZTogXCJjb3Zlci5vcGVuX2NvdmVyXCIsXHJcbiAgICAgICAgb2ZmU2VydmljZTogXCJjb3Zlci5jbG9zZV9jb3ZlclwiLFxyXG4gICAgICB9LFxyXG4gICAgICBzd2l0Y2g6IHtcclxuICAgICAgICB0aXRsZTogXCJTd2l0Y2hlc1wiLFxyXG4gICAgICAgIHNob3dDb250cm9sczogdHJ1ZSxcclxuICAgICAgICBpY29uT246IFwibWRpOnBvd2VyLXBsdWdcIixcclxuICAgICAgICBpY29uT2ZmOiBcIm1kaTpwb3dlci1wbHVnLW9mZlwiLFxyXG4gICAgICAgIG9uU2VydmljZTogXCJzd2l0Y2gudHVybl9vblwiLFxyXG4gICAgICAgIG9mZlNlcnZpY2U6IFwic3dpdGNoLnR1cm5fb2ZmXCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIGNhbWVyYToge1xyXG4gICAgICAgIHRpdGxlOiBcIkNhbWVyYXNcIixcclxuICAgICAgICBzaG93Q29udHJvbHM6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgICBjbGltYXRlOiB7XHJcbiAgICAgICAgdGl0bGU6IFwiQ2xpbWF0ZXNcIixcclxuICAgICAgICBzaG93Q29udHJvbHM6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgICBtZWRpYV9wbGF5ZXI6IHtcclxuICAgICAgICB0aXRsZTogXCJNZWRpYSBQbGF5ZXJzXCIsXHJcbiAgICAgICAgc2hvd0NvbnRyb2xzOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgICAgc2Vuc29yOiB7XHJcbiAgICAgICAgdGl0bGU6IFwiU2Vuc29yc1wiLFxyXG4gICAgICAgIHNob3dDb250cm9sczogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICAgIGJpbmFyeV9zZW5zb3I6IHtcclxuICAgICAgICB0aXRsZTogXCJCaW5hcnkgU2Vuc29yc1wiLFxyXG4gICAgICAgIHNob3dDb250cm9sczogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENyZWF0ZSBjYXJkcyBmb3IgZWFjaCBkb21haW4uXHJcbiAgICBmb3IgKGNvbnN0IGRvbWFpbiBvZiBleHBvc2VkRG9tYWlucykge1xyXG4gICAgICBjb25zdCBjbGFzc05hbWUgPSBIZWxwZXIuc2FuaXRpemVDbGFzc05hbWUoZG9tYWluICsgXCJDYXJkXCIpO1xyXG5cclxuICAgICAgbGV0IGRvbWFpbkNhcmRzID0gW107XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGRvbWFpbkNhcmRzID0gYXdhaXQgaW1wb3J0KGAuL2NhcmRzLyR7Y2xhc3NOYW1lfWApLnRoZW4oY2FyZE1vZHVsZSA9PiB7XHJcbiAgICAgICAgICBsZXQgZG9tYWluQ2FyZHMgPSBbXTtcclxuICAgICAgICAgIGNvbnN0IGVudGl0aWVzICA9IEhlbHBlci5nZXREZXZpY2VFbnRpdGllcyhhcmVhLCBkb21haW4pO1xyXG5cclxuICAgICAgICAgIGlmIChlbnRpdGllcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgLy8gQ3JlYXRlIGEgVGl0bGUgY2FyZCBmb3IgdGhlIGN1cnJlbnQgZG9tYWluLlxyXG4gICAgICAgICAgICBjb25zdCB0aXRsZUNhcmQgPSBuZXcgVGl0bGVDYXJkKFthcmVhXSxcclxuICAgICAgICAgICAgICAgIHRpdGxlQ2FyZE9wdGlvbnNbZG9tYWluXSA/PyB0aXRsZUNhcmRPcHRpb25zW1wiZGVmYXVsdFwiXSkuY3JlYXRlQ2FyZCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRvbWFpbiA9PT0gXCJzZW5zb3JcIikge1xyXG4gICAgICAgICAgICAgIC8vIENyZWF0ZSBhIGNhcmQgZm9yIGVhY2ggZW50aXR5LXNlbnNvciBvZiB0aGUgY3VycmVudCBhcmVhLlxyXG4gICAgICAgICAgICAgIGNvbnN0IHNlbnNvclN0YXRlcyA9IEhlbHBlci5nZXRTdGF0ZUVudGl0aWVzKGFyZWEsIFwic2Vuc29yXCIpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHNlbnNvckNhcmRzICA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICBmb3IgKGNvbnN0IHNlbnNvciBvZiBlbnRpdGllcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNhcmQgPSAoc3RyYXRlZ3lPcHRpb25zLmVudGl0eUNvbmZpZz8uZmluZChjb25maWcgPT4gY29uZmlnLmVudGl0eV9pZCA9PT0gc2Vuc29yLmVudGl0eV9pZCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjYXJkKSB7XHJcbiAgICAgICAgICAgICAgICAgIHNlbnNvckNhcmRzLnB1c2goY2FyZCk7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIHN0YXRlIG9mIHRoZSBjdXJyZW50IHNlbnNvci5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlbnNvclN0YXRlID0gc2Vuc29yU3RhdGVzLmZpbmQoc3RhdGUgPT4gc3RhdGUuZW50aXR5X2lkID09PSBzZW5zb3IuZW50aXR5X2lkKTtcclxuICAgICAgICAgICAgICAgIGxldCBjYXJkT3B0aW9ucyAgID0ge307XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNlbnNvclN0YXRlLmF0dHJpYnV0ZXMudW5pdF9vZl9tZWFzdXJlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICBjYXJkT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImN1c3RvbTptaW5pLWdyYXBoLWNhcmRcIixcclxuICAgICAgICAgICAgICAgICAgICBlbnRpdGllczogW3NlbnNvci5lbnRpdHlfaWRdLFxyXG4gICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHNlbnNvckNhcmRzLnB1c2gobmV3IFNlbnNvckNhcmQoc2Vuc29yLCBjYXJkT3B0aW9ucykuZ2V0Q2FyZCgpKTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGRvbWFpbkNhcmRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJ2ZXJ0aWNhbC1zdGFja1wiLFxyXG4gICAgICAgICAgICAgICAgY2FyZHM6IHNlbnNvckNhcmRzLFxyXG4gICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICBkb21haW5DYXJkcy51bnNoaWZ0KHRpdGxlQ2FyZCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGRvbWFpbkNhcmRzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgYSBjYXJkIGZvciBlYWNoIGRvbWFpbi1lbnRpdHkgb2YgdGhlIGN1cnJlbnQgYXJlYS5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBlbnRpdHkgb2YgZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgICBjb25zdCBjYXJkID0gKEhlbHBlci5zdHJhdGVneU9wdGlvbnMuZW50aXR5X2NvbmZpZyA/PyBbXSkuZmluZChcclxuICAgICAgICAgICAgICAgICAgY29uZmlnID0+IGNvbmZpZy5lbnRpdHkgPT09IGVudGl0eS5lbnRpdHlfaWQsXHJcbiAgICAgICAgICAgICAgKSA/PyBuZXcgY2FyZE1vZHVsZVtjbGFzc05hbWVdKGVudGl0eSkuZ2V0Q2FyZCgpO1xyXG5cclxuICAgICAgICAgICAgICBkb21haW5DYXJkcy5wdXNoKGNhcmQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZG9tYWluID09PSBcImJpbmFyeV9zZW5zb3JcIikge1xyXG4gICAgICAgICAgICAgIC8vIEhvcml6b250YWxseSBncm91cCBldmVyeSB0d28gYmluYXJ5IHNlbnNvciBjYXJkcy5cclxuICAgICAgICAgICAgICBjb25zdCBob3Jpem9udGFsQ2FyZHMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkb21haW5DYXJkcy5sZW5ndGg7IGkgKz0gMikge1xyXG4gICAgICAgICAgICAgICAgaG9yaXpvbnRhbENhcmRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICB0eXBlOiBcImhvcml6b250YWwtc3RhY2tcIixcclxuICAgICAgICAgICAgICAgICAgY2FyZHM6IGRvbWFpbkNhcmRzLnNsaWNlKGksIGkgKyAyKSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgZG9tYWluQ2FyZHMgPSBob3Jpem9udGFsQ2FyZHM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRvbWFpbkNhcmRzLnVuc2hpZnQodGl0bGVDYXJkKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gZG9tYWluQ2FyZHM7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKEhlbHBlci5kZWJ1ZyA/IGUgOiBcIkFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGNyZWF0aW5nIHRoZSBkb21haW4gY2FyZHMhXCIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZG9tYWluQ2FyZHMubGVuZ3RoKSB7XHJcbiAgICAgICAgdmlld0NhcmRzLnB1c2goe1xyXG4gICAgICAgICAgdHlwZTogXCJ2ZXJ0aWNhbC1zdGFja1wiLFxyXG4gICAgICAgICAgY2FyZHM6IGRvbWFpbkNhcmRzLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIGNhcmRzIGZvciBhbnkgb3RoZXIgZG9tYWluLlxyXG4gICAgLy8gQ29sbGVjdCBkZXZpY2UgZW50aXRpZXMgb2YgdGhlIGN1cnJlbnQgYXJlYS5cclxuICAgIGNvbnN0IGFyZWFEZXZpY2VzID0gSGVscGVyLmRldmljZXMuZmlsdGVyKGRldmljZSA9PiBkZXZpY2UuYXJlYV9pZCA9PT0gYXJlYS5hcmVhX2lkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGRldmljZSA9PiBkZXZpY2UuaWQpO1xyXG5cclxuICAgIC8vIENvbGxlY3QgdGhlIHJlbWFpbmluZyBlbnRpdGllcyBvZiB3aGljaCBhbGwgY29uZGl0aW9ucyBiZWxvdyBhcmUgbWV0OlxyXG4gICAgLy8gMS4gVGhlIGVudGl0eSBpcyBsaW5rZWQgdG8gYSBkZXZpY2Ugd2hpY2ggaXMgbGlua2VkIHRvIHRoZSBjdXJyZW50IGFyZWEsXHJcbiAgICAvLyAgICBvciB0aGUgZW50aXR5IGl0c2VsZiBpcyBsaW5rZWQgdG8gdGhlIGN1cnJlbnQgYXJlYS5cclxuICAgIC8vIDIuIFRoZSBlbnRpdHkgaXMgbm90IGhpZGRlbiBhbmQgaXMgbm90IGRpc2FibGVkLlxyXG4gICAgY29uc3QgbWlzY2VsbGFuZW91c0VudGl0aWVzID0gSGVscGVyLmVudGl0aWVzLmZpbHRlcihlbnRpdHkgPT4ge1xyXG4gICAgICByZXR1cm4gKGFyZWFEZXZpY2VzLmluY2x1ZGVzKGVudGl0eS5kZXZpY2VfaWQpIHx8IGVudGl0eS5hcmVhX2lkID09PSBhcmVhLmFyZWFfaWQpXHJcbiAgICAgICAgICAmJiBlbnRpdHkuaGlkZGVuX2J5ID09IG51bGxcclxuICAgICAgICAgICYmIGVudGl0eS5kaXNhYmxlZF9ieSA9PSBudWxsXHJcbiAgICAgICAgICAmJiAhZXhwb3NlZERvbWFpbnMuaW5jbHVkZXMoZW50aXR5LmVudGl0eV9pZC5zcGxpdChcIi5cIiwgMSlbMF0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgY29sdW1uIG9mIG1pc2NlbGxhbmVvdXMgZW50aXR5IGNhcmRzLlxyXG4gICAgaWYgKG1pc2NlbGxhbmVvdXNFbnRpdGllcy5sZW5ndGgpIHtcclxuICAgICAgbGV0IG1pc2NlbGxhbmVvdXNDYXJkcyA9IFtdO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBtaXNjZWxsYW5lb3VzQ2FyZHMgPSBhd2FpdCBpbXBvcnQoXCIuL2NhcmRzL01pc2NlbGxhbmVvdXNDYXJkXCIpLnRoZW4oY2FyZE1vZHVsZSA9PiB7XHJcbiAgICAgICAgICAvKiogQHR5cGUgT2JqZWN0W10gKi9cclxuICAgICAgICAgIGNvbnN0IG1pc2NlbGxhbmVvdXNDYXJkcyA9IFtcclxuICAgICAgICAgICAgbmV3IFRpdGxlQ2FyZChbYXJlYV0sIHt0aXRsZTogXCJNaXNjZWxsYW5lb3VzXCIsIHNob3dDb250cm9sczogZmFsc2V9KS5jcmVhdGVDYXJkKCksXHJcbiAgICAgICAgICBdO1xyXG4gICAgICAgICAgZm9yIChjb25zdCBlbnRpdHkgb2YgbWlzY2VsbGFuZW91c0VudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNhcmQgPSAoSGVscGVyLnN0cmF0ZWd5T3B0aW9ucy5lbnRpdHlfY29uZmlnID8/IFtdKS5maW5kKFxyXG4gICAgICAgICAgICAgICAgY29uZmlnID0+IGNvbmZpZy5lbnRpdHkgPT09IGVudGl0eS5lbnRpdHlfaWQsXHJcbiAgICAgICAgICAgICkgPz8gbmV3IGNhcmRNb2R1bGUuTWlzY2VsbGFuZW91c0NhcmQoZW50aXR5KS5nZXRDYXJkKCk7XHJcblxyXG4gICAgICAgICAgICBtaXNjZWxsYW5lb3VzQ2FyZHMucHVzaChjYXJkKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gbWlzY2VsbGFuZW91c0NhcmRzO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihIZWxwZXIuZGVidWcgPyBlIDogXCJBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBjcmVhdGluZyB0aGUgZG9tYWluIGNhcmRzIVwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmlld0NhcmRzLnB1c2goe1xyXG4gICAgICAgIHR5cGU6IFwidmVydGljYWwtc3RhY2tcIixcclxuICAgICAgICBjYXJkczogbWlzY2VsbGFuZW91c0NhcmRzLFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXR1cm4gY2FyZHMuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjYXJkczogdmlld0NhcmRzLFxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbi8vIG5vaW5zcGVjdGlvbiBKU1VucmVzb2x2ZWRSZWZlcmVuY2VcclxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwibGwtc3RyYXRlZ3ktbXVzaHJvb20tc3RyYXRlZ3lcIiwgTXVzaHJvb21TdHJhdGVneSk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==