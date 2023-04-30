import {Helper} from "../Helper";

class SwitchChip {
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
      icon: "mdi:dip-switch",
      icon_color: "blue",
      content: Helper.getCountTemplate("switch", "eq", "on"),
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

export {SwitchChip};
