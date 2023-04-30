import {Helper} from "../Helper";

class FanChip {
  #areaIds;
  #options = {
    // No default options.
  };

  constructor(areaIds, options = {}) {
    if (!Helper.isInitialized()) {
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
      content: Helper.getCountTemplate("fan", "eq", "on"),
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

export {FanChip};
