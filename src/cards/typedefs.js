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
 * @typedef {abstractOptions & Object} lockCardOptions Lock Card options.
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

