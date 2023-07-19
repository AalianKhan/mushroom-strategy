import {Helper} from "../Helper";

class ClimateChip {
  #areaIds;
  #options = {
    // No default options.
  };

  constructor(areaIds, options = {}) {
    if (!Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }

    this.#areaIds = areaIds.filter(areaId => areaId);
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
      content: Helper.getCountTemplate("climate", "ne", "off"),
      tap_action: {
        action: "navigate",
        navigation_path: "climates",
      },
      hold_action: {
        action: "navigate",
        navigation_path: "climates",
      },
    };
  }
}

export {ClimateChip};
