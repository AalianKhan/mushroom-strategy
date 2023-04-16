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
 * @property {string} area_id The Area which the device is placed in.
 * @property {string} id Unique ID of device (generated by Home Assistant).
 * @property {string[]|null} disabled_by Indicates by what this entity is disabled.
 * @property {string[]|null} hidden_by Indicates by what this entity is hidden.
 * @memberof typedefs
 */

/**
 * @typedef {Object} areaEntity Area Entity.
 * @property {string[]} aliases Array of aliases of this entity.
 * @property {string} area_id The id of this entity.
 * @property {string} name Name of this entity.
 * @property {string} picture URL to a picture that should be used instead of showing the domain icon.
 * @property {boolean} hidden True if the entity should be hidden from the dashboard.
 *                            This property is added by the custom strategy.
 * @property {Object[]} extra_cards An array of card configurations.
 *                                  The configured cards are added to the dashboard.
 *                                  This property is added by the custom strategy.
 * @memberof typedefs
 */

/**
 * @typedef {Object} dashBoardInfo Strategy information object.
 * @property {dashboardConfig} config User supplied dashboard configuration, if any.
 * @property {hassObject} hass The Home Assistant object.
 * @property {boolean} narrow If the current user interface is rendered in narrow mode or not.
 * @memberof typedefs
 * @see https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/#dashboard-strategies
 */

/**
 * @typedef {Object} viewInfo Strategy information object.
 * @property {Object} view Configuration of the current view.
 * @property {viewConfig} config Dashboard configuration.
 * @property {hassObject} hass The Home Assistant object.
 * @property {boolean} narrow If the current user interface is rendered in narrow mode or not.
 * @memberof typedefs
 * @see https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/#view-strategies
 */

/**
 * @typedef {Object} dashboardConfig User supplied dashboard configuration.
 * @property {strategyObject} strategy User supplied dashboard configuration.
 * @memberof typedefs
 */

/**
 * @typedef {Object} viewConfig Dashboard configuration.
 * @property {Object[]} strategy Array of views generated by the strategy.
 * @memberof typedefs
 */

/**
 * @typedef {Object} strategyObject User supplied dashboard configuration.
 * @property {strategyOptions} options Custom strategy configuration.
 * @property {string} type Strategy type.
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
 * The frontend passes a single hass object around.
 * This object contains the latest state and allows you to send commands back to the server.
 *
 * @typedef {Object} hassObject Home Assistant object.
 * @property {Object<string, stateObject>} states An object containing the states of all entities in Home Assistant.
 *                                                The key is the entity_id, the value is the state object.
 * @property {hassUser} user The logged in user.
 * @property {function} callWS Call a WebSocket command on the backend.
 * @memberof typedefs
 * @see https://developers.home-assistant.io/docs/frontend/data/
 */

/**
 * The logged in user.
 *
 * @typedef {Object} hassUser The logged in user.
 * @property {string} name Name of the user.
 * @property {boolean} is_owner True if the user is the owner.
 * @property {boolean} is_owner True if the user is an administrator.
 * @property {Object[]} credentials Authentication credentials.
 * @memberof typedefs
 * @see https://developers.home-assistant.io/docs/frontend/data/#hassuser
 */

/**
 * States are a current representation of the entity.
 *
 * All states will always have an entity id, a state and a timestamp when last updated and last changed.
 *
 * @typedef {Object} stateObject State object.
 * @property {string} state String representation of the current state of the entity.
 *                          Example `off`.
 * @property {string} entity_id Entity ID.
 *                              Format: <domain>.<object_id>.
 *                              Example: `light.kitchen`.
 * @property {string} domain Domain of the entity.
 *                           Example: `light`.
 * @property {string} object_id Object ID of entity.
 *                              Example: `kitchen`.
 * @property {string} name Name of the entity.
 *                         Based on `friendly_name` attribute with fall back to object ID.
 *                         Example: `Kitchen Ceiling`.
 * @property {string} last_updated Time the state was written to the state machine in UTC time.
 *                                 Note that writing the exact same state including attributes will not result in this
 *                                 field being updated.
 *                                 Example: `2017-10-28 08:13:36.715874+00:00`.
 * @property {string} last_changed Time the state changed in the state machine in UTC time.
 *                                 This is not updated when there are only updated attributes.
 *                                 Example: `2017-10-28 08:13:36.715874+00:00`.
 * @property {stateAttributes} attributes A dictionary with extra attributes related to the current state.
 * @property {stateContext} context A dictionary with extra attributes related to the context of the state.
 * @memberof typedefs
 * @see https://www.home-assistant.io/docs/configuration/state_object/
 */

/**
 * The attributes of an entity are optional.
 *
 * There are a few attributes that are used by Home Assistant for representing the entity in a specific way.
 * Each integration will also have its own attributes to represent extra state data about the entity.
 * For example, the light integration has attributes for the current brightness and color of the light.
 *
 * When an attribute is not available, Home Assistant will not write it to the state.
 *
 * @typedef {Object} stateAttributes State attributes.
 * @property {string} friendly_name Name of the entity.
 *                                  Example: `Kitchen Ceiling`.
 * @property {string} icon Icon to use for the entity in the frontend.
 *                         Example: `mdi:home`.
 * @property {string} entity_picture URL to a picture that should be used instead of showing the domain icon.
 * @property {string} assumed_state Boolean if the current state is an assumption.
 * @property {string} unit_of_measurement The unit of measurement the state is expressed in.
 *                                        Used for grouping graphs or understanding the entity.
 *                                        Example: `°C`.
 * @memberof typedefs
 * @see https://www.home-assistant.io/docs/configuration/state_object/#attributes
 */

/**
 * Context is used to tie events and states together in Home Assistant. Whenever an automation or user interaction
 * causes states to change, a new context is assigned. This context will be attached to all events and states that
 * happen as result of the change.
 *
 * @typedef {Object} stateContext State context.
 * @property {string} context_id Unique identifier for the context.
 * @property {string} user_id Unique identifier of the user that started the change.
 *                            Will be None if action was not started by a user (ie. started by an automation)
 * @property {string} parent_id Unique identifier of the parent context that started the change, if available.
 *                              For example, if an automation is triggered, the context of the trigger will be set as
 *                              parent.
 * @see https://www.home-assistant.io/docs/configuration/state_object/#context
 * @memberof typedefs
 */

export {};
