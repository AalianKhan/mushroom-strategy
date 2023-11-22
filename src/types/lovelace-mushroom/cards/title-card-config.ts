import {ActionConfig, LovelaceCardConfig} from "../../homeassistant/data/lovelace";

/**
 * Title Card Config.
 *
 * @property {string} [title] Title to render. May contain templates.
 * @property {string} [subtitle] Subtitle to render. May contain templates.
 * @property {ActionConfig} [title_tap_action=none] Home assistant action to perform on title tap.
 * @property {ActionConfig} [subtitle_tap_action=none] Home assistant action to perform on subtitle tap.
 *
 * @see https://github.com/piitaya/lovelace-mushroom/blob/main/docs/cards/title.md
 */
export interface TitleCardConfig extends LovelaceCardConfig {
  title?: string;
  subtitle?: string;
  alignment?: string;
  title_tap_action?: ActionConfig;
  subtitle_tap_action?: ActionConfig;
}


