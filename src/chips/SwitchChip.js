import {Helper} from "../Helper";

class SwitchChip {
  #areaIds;
  #options = {
    // No default options.
  };
  turnOffAction = {
    action: "call-service",
    service: "switch.turn_off",
    target: {
      area_id: this.#areaIds,
    },
    data: {},
  };
  navigateAction = {
    action: "navigate",
    navigation_path: "switches",
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
      icon: "mdi:dip-switch",
      icon_color: "blue",
      content: Helper.getCountTemplate("switch", "eq", "on"),
      tap_action: this.#options.tapToNavigate ? this.navigateAction : this.turnOffAction,
      hold_action: this.#options.tapToNavigate ? this.turnOffAction : this.navigateAction,
    };
  }
}

export {SwitchChip};
