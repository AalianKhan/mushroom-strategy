import {LovelaceCardConfig} from "../../data/lovelace";

/**
 * Home Assistant Stack Card Config.
 *
 * @property {string} type The stack type.
 * @property {Object[]} cards The content of the stack.
 *
 * @see https://www.home-assistant.io/dashboards/horizontal-stack/
 * @see https://www.home-assistant.io/dashboards/vertical-stack/
 */
export interface StackCardConfig extends LovelaceCardConfig {
  cards: LovelaceCardConfig[];
  title?: string;
}

/**
 * Home Assistant Area Card Config.
 *
 * @see https://www.home-assistant.io/dashboards/area/
 */
export interface AreaCardConfig extends LovelaceCardConfig {
  area: string;
  navigation_path?: string;
  show_camera?: boolean;
}
