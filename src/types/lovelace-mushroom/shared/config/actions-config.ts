import {ActionConfig} from "../../../homeassistant/data/lovelace";

export type ActionsSharedConfig = {
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
};
