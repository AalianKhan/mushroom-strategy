import {Helper} from "../Helper";

class LightChip {
  #areaIds;
  #options = {
    // No default options.
  };
  turn_off_action = {
    action: "call-service",
    service: "light.turn_off",
    target: {
      area_id: this.#areaIds,
    },
    data: {},
  };
  navigate_action = {
    action: "navigate",
    navigation_path: "lights",
  }

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
      icon: "mdi:lightbulb-group",
      icon_color: "amber",
      content: Helper.getCountTemplate("light", "eq", "on"),
      tap_action: this.#options.tapToNavigate ? this.navigate_action : this.turn_off_action,
      hold_action: this.#options.tapToNavigate ? this.turn_off_action : this.navigate_action,
    };
  }
}

export {LightChip};
