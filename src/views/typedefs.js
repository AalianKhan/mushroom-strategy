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

export {};
