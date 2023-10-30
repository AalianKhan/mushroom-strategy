import {ActionsSharedConfig} from "../shared/config/actions-config";
import {LovelaceCardConfig} from "../../homeassistant/data/lovelace";
import {EntitySharedConfig} from "../shared/config/entity-config";
import {AppearanceSharedConfig} from "../shared/config/appearance-config";

export const MEDIA_LAYER_MEDIA_CONTROLS = [
  "on_off",
  "shuffle",
  "previous",
  "play_pause_stop",
  "next",
  "repeat",
] as const;

export type MediaPlayerMediaControl = (typeof MEDIA_LAYER_MEDIA_CONTROLS)[number];

export const MEDIA_PLAYER_VOLUME_CONTROLS = [
  "volume_mute",
  "volume_set",
  "volume_buttons",
] as const;

export type MediaPlayerVolumeControl = (typeof MEDIA_PLAYER_VOLUME_CONTROLS)[number];

/**
 * Media Player Card Config.
 *
 * @property {boolean} [use_media_info=false] Use media info instead of name, state, and icon when media is playing.
 * @property {boolean} [show_volume_level=false] Show volume level next to media state when media is playing.
 * @property {MediaPlayerVolumeControl[]} [volume_controls] List of controls to display (volume_mute, volume_set, volume_buttons)
 * @property {MediaPlayerMediaControl[]} [media_controls] List of controls to display (on_off, shuffle, previous, play_pause_stop, next, repeat)
 * @property {boolean} [collapsible_controls=false] Collapse controls when off
 *
 * @see https://github.com/piitaya/lovelace-mushroom/blob/main/docs/cards/media-player.md
 */
export type MediaPlayerCardConfig = LovelaceCardConfig &
  EntitySharedConfig &
  AppearanceSharedConfig &
  ActionsSharedConfig & {
  use_media_info?: boolean;
  show_volume_level?: boolean;
  volume_controls?: MediaPlayerVolumeControl[];
  media_controls?: MediaPlayerMediaControl[];
  collapsible_controls?: boolean;
};
