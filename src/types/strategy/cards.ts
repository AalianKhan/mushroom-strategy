import {LovelaceCardConfig} from "../homeassistant/data/lovelace";
import {TitleCardConfig} from "../lovelace-mushroom/cards/title-card-config";
import {EntitySharedConfig} from "../lovelace-mushroom/shared/config/entity-config";
import {AppearanceSharedConfig} from "../lovelace-mushroom/shared/config/appearance-config";
import {ActionsSharedConfig} from "../lovelace-mushroom/shared/config/actions-config";
import {TemplateCardConfig} from "../lovelace-mushroom/cards/template-card-config";
import {EntityCardConfig} from "../lovelace-mushroom/cards/entity-card-config";
import {PictureEntityCardConfig} from "../homeassistant/panels/lovelave/cards/types";
import {ClimateCardConfig} from "../lovelace-mushroom/cards/climate-card-config";
import {CoverCardConfig} from "../lovelace-mushroom/cards/cover-card-config";
import {FanCardConfig} from "../lovelace-mushroom/cards/fan-card-config";
import {AreaCardConfig} from "../homeassistant/lovelace/cards/types";
import {LightCardConfig} from "../lovelace-mushroom/cards/light-card-config";
import {LockCardConfig} from "../lovelace-mushroom/cards/lock-card-config";
import {MediaPlayerCardConfig} from "../lovelace-mushroom/cards/media-player-card-config";
import {NumberCardConfig} from "../lovelace-mushroom/cards/number-card-config";
import {PersonCardConfig} from "../lovelace-mushroom/cards/person-card-config";
import {VacuumCardConfig} from "../lovelace-mushroom/cards/vacuum-card-config";
import {SelectCardConfig} from '../lovelace-mushroom/cards/select-card-config';

export namespace cards {
  /**
   * Abstract Card Config.
   */
  export type AbstractCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    AppearanceSharedConfig &
    ActionsSharedConfig;

  /**
   * Controller Card Config.
   *
   * @property {boolean} [showControls=true] False to hide controls.
   * @property {string} [iconOn] Icon to show for switching entities from off state.
   * @property {string} [iconOff] Icon to show for switching entities to off state.
   * @property {string} [onService=none] Service to call for switching entities from off state.
   * @property {string} [offService=none] Service to call for switching entities to off state.
   */
  export interface ControllerCardConfig extends TitleCardConfig {
    type: "mushroom-title-card",
    showControls?: boolean;
    iconOn?: string;
    iconOff?: string;
    onService?: string;
    offService?: string;
  }

  export type AreaCardOptions = Omit<AreaCardConfig, "type">;
  export type ClimateCardOptions = Omit<ClimateCardConfig, "type">;
  export type ControllerCardOptions = Omit<ControllerCardConfig, "type">;
  export type CoverCardOptions = Omit<CoverCardConfig, "type">;
  export type EntityCardOptions = Omit<EntityCardConfig, "type">;
  export type FanCardOptions = Omit<FanCardConfig, "type">;
  export type LightCardOptions = Omit<LightCardConfig, "type">;
  export type LockCardOptions = Omit<LockCardConfig, "type">;
  export type MediaPlayerCardOptions = Omit<MediaPlayerCardConfig, "type">;
  export type NumberCardOptions = Omit<NumberCardConfig, "type">;
  export type PersonCardOptions = Omit<PersonCardConfig, "type">;
  export type PictureEntityCardOptions = Omit<PictureEntityCardConfig, "type">;
  export type TemplateCardOptions = Omit<TemplateCardConfig, "type">;
  export type VacuumCardOptions = Omit<VacuumCardConfig, "type">;
  export type SelectCardOptions = Omit<SelectCardConfig, "type">;
  export type InputSelectCardOptions = Omit<SelectCardConfig, "type">;
}









