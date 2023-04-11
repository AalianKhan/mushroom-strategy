/**
 * @namespace typedefs
 */

/**
 * @typedef {Object} hassEntity Home assistant entity.
 * @property {string} entity_id The id of this entity.
 * @property {string} device_id The id of the device to which this entity is linked.
 * @property {string} area_id The id of the area to which this entity is linked.
 * @property {string[]|null} disabled_by Indicates by what this entity is disabled.
 * @property {string[]|null} hidden_by Indicates by what this entity is hidden.
 * @memberof typedefs
 */

/**
 * @typedef {Object} deviceEntity Device Entity.
 * @property {string} id The id of this entity.
 * @property {string} area_id The id of the area to which this entity is linked.
 * @property {string[]|null} disabled_by Indicates by what this entity is disabled.
 * @property {string[]|null} hidden_by Indicates by what this entity is hidden.
 * @memberof typedefs
 */

/**
 * @typedef {Object} areaEntity Area Entity.
 * @property {string} area_id The id of this entity.
 * @property {string} name Name of this entity.
 * @memberof typedefs
 */

/**
 * @typedef {Object} infoObject Strategy information object.
 * @property {Object=} view View configuration (Only if View strategy).
 * @property {dashboardConfig} config User supplied dashboard configuration.
 * @property {hassObject} hass The Home Assistant object.
 * @property {boolean} narrow If the current user interface is rendered in narrow mode or not.
 * @memberof typedefs
 */

/**
 * @typedef {dashboardConfig} dashboardConfig User supplied dashboard configuration.
 * @property {Object} strategy User supplied dashboard configuration.
 * @memberof typedefs
 */

/**
 * @typedef {Object} strategy User supplied dashboard configuration.
 * @property {strategyOptions} options Custom strategy configuration.
 * @memberof typedefs
 */

/**
 * @typedef {Object} strategyOptions Custom strategy configuration.
 * @property {Object[]} areas List of areas.
 * @property {Object[]} entity_config Card definition for an entity.
 * @property {views[]} views List of pre-built views to show.
 * @property {chip[]} chips List of chips to show in the Home view.
 * @property {Object[]} quick_access_cards List of cards to show between welcome card and rooms cards.
 * @property {Object[]} extra_cards List of cards to show below room cards.
 * @property {Object[]} extra_views List of views to add to the dashboard.
 * @memberof typedefs
 */

/**
 * @typedef {Object} chip List of chips to show in the Home view.
 * @property {boolean} light_count Chip to display the number of lights on.
 * @property {boolean} fan_count Chip to display the number of fans on.
 * @property {boolean} cover_count Chip to display the number of unclosed covers.
 * @property {boolean} switch_count Chip to display the number of switches on.
 * @property {boolean} climate_count Chip to display the number of climates which are not off.
 * @property {string} weather_entity Entity ID for the weather chip to use, accepts `weather.` only.
 * @property {Object[]} extra_chips List of extra chips.
 * @memberof typedefs
 */

/**
 * @typedef {Object} views List of chips to show in the Home view.
 * @property {boolean} lights View to control all lights and lights of each area.
 * @property {boolean} fans View to control all fans and fans of each area.
 * @property {boolean} covers View to control all covers and covers of each area.
 * @property {boolean} switches View to control all switches and switches of each area.
 * @property {boolean} climates View to control climate devices such as thermostats. Seperated by each area.
 * @property {boolean} cameras View to show all cameras using WebRTC cards. Seperated by each area.
 * @memberof typedefs
 */

/**
 * @typedef {Object} entityConfig Custom card-configuration for an entity on a view card.
 * @property {string} entity The id of the entity to create a card for.
 * @property {string} type Type of card for the entity
 * @memberof typedefs
 */

/**
 * @typedef {Object} hassObject Home Assistant object.
 * @property {Object<string, stateObject>} states The Home Assistant state object.
 * @property {function} callWS Call a WebSocket command on the backend.
 * @memberof typedefs
 */

/**
 * @typedef {Object} stateObject Entity state object.
 * @property {string} entity_id The id of this state.
 * @property {string} state The current state.
 * @property {stateAttributes} attributes The state attributes.
 * @property {Object} context The context of this state.
 * @property {string} last_changed The date and time the state is last changed.
 * @property {string} last_updated The date and time the state is last updated.
 * @memberof typedefs
 */

/**
 * @typedef {Object} stateAttributes State attributes.
 * @property {string} unit_of_measurement The unit of measurement.
 * @memberof typedefs
 */


export {};
