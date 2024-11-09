import {
  CallServiceActionConfig,
  LovelaceCardConfig,
  LovelaceConfig,
  LovelaceViewConfig
} from "../homeassistant/data/lovelace";
import {HomeAssistant} from "../homeassistant/types";
import {AreaRegistryEntry} from "../homeassistant/data/area_registry";
import {cards} from "./cards";
import {EntityRegistryEntry} from "../homeassistant/data/entity_registry";
import {LovelaceChipConfig} from "../lovelace-mushroom/utils/lovelace/chip/types";
import {HassServiceTarget} from "home-assistant-js-websocket";

export namespace generic {
  /**
   * An entry out of a Home Assistant Register.
   */
  export type RegistryEntry =
    | AreaRegistryEntry
    | DataTransfer
    | EntityRegistryEntry

  /**
   * View Entity.
   *
   * @property {number} [order] Ordering position of the entity in the list of available views.
   * @property {boolean} [hidden] True if the entity should be hidden from the dashboard.
   */
  export interface ViewConfig extends LovelaceViewConfig {
    hidden?: boolean;
    order?: number;
  }

  /**
   * Domain Configuration.
   *
   * @property {number} [order] Ordering position of the entity in the list of available views.
   * @property {boolean} [hidden] True if the entity should be hidden from the dashboard.
   * @property {boolean} [hide_config_entities] True if the entity's categorie is "config" and should be hidden from the
   *                                            dashboard.
   * @property {boolean} [hide_diagnostic_entities] True if the entity's categorie is "diagnostic" and should be hidden from the
   *                                                dashboard.
   */
  export interface DomainConfig extends Partial<cards.ControllerCardConfig> {
    hidden?: boolean;
    order?: number;
    hide_config_entities?: boolean
    hide_diagnostic_entities?: boolean
  }

  /**
   * Dashboard Information Object.
   *
   * Home Assistant passes this object to the Dashboard Generator method.
   *
   * @property {LovelaceConfig} config Dashboard configuration.
   * @property {HomeAssistant} hass The Home Assistant object.
   *
   * @see https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/#dashboard-strategies
   */
  export interface DashBoardInfo {
    config?: LovelaceConfig & {
      strategy: {
        options?: StrategyConfig
      }
    };
    hass: HomeAssistant;
  }

  /**
   * View Information Object.
   *
   * Home Assistant passes this object to the View Generator method.
   *
   * @property {LovelaceViewConfig} view View configuration.
   * @property {LovelaceConfig} config Dashboard configuration.
   * @property {HomeAssistant} hass The Home Assistant object.
   *
   * @see https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/#view-strategies
   */
  export interface ViewInfo {
    view: LovelaceViewConfig & {
      strategy?: {
        options?: StrategyConfig & { area: StrategyArea }
      }
    };
    config: LovelaceConfig
    hass: HomeAssistant;
  }

  /**
   * Strategy Configuration.
   *
   * @property {Object.<AreaRegistryEntry>} areas List of areas.
   * @property {Object.<CustomCardConfig>} [card_options] Card options for entities.
   * @property {chips} [chips] List of chips to show in the Home view.
   * @property {boolean} [debug] Set to true for more verbose debugging info.
   * @property {Object.<DomainConfig>} domains List of domains.
   * @property {object[]} [extra_cards] List of cards to show below room cards.
   * @property {object[]} [extra_views] List of views to add to the dashboard.
   * @property {object[]} [quick_access_cards] List of cards to show between welcome card and rooms cards.
   * @property {Object.<ViewConfig>} views List of views.
   */
  export interface StrategyConfig {
    areas: { [k: string]: StrategyArea };
    card_options?: { [k: string]: CustomCardConfig };
    chips?: Chips;
    debug: boolean;
    domains: { [k: string]: DomainConfig };
    extra_cards?: LovelaceCardConfig[];
    extra_views?: ViewConfig[];
    home_view: {
      hidden: HiddenSectionType[]
    }
    quick_access_cards?: LovelaceCardConfig[];
    views: { [k: string]: ViewConfig };
  }

  const hiddenSectionList = ["chips", "persons", "greeting", "areas", "areasTitle"] as const;
  export type HiddenSectionType = typeof hiddenSectionList[number];

  /**
   * Represents the default configuration for a strategy.
   */
  export interface StrategyDefaults extends StrategyConfig {
    areas: {
      undisclosed: StrategyArea & {
        area_id: "undisclosed",
      },
      [k: string]: StrategyArea,
    },
    domains: {
      default: DomainConfig,
      [k: string]: DomainConfig,
    }
  }

  /**
   * Strategy Area.
   *
   * @property {number} [order] Ordering position of the area in the list of available areas.
   * @property {boolean} [hidden] True if the entity should be hidden from the dashboard.
   * @property {object[]} [extra_cards] An array of card configurations.
   *                                    The configured cards are added to the dashboard.
   * @property {string} [type=default] The type of area card.
   */
  export interface StrategyArea extends AreaRegistryEntry {
    order?: number;
    hidden?: boolean;
    extra_cards?: LovelaceCardConfig[];
    type?: string;
  }

  /**
   * A list of chips to show in the Home view.
   *
   * @property {boolean} light_count Chip to display the number of lights on.
   * @property {boolean} fan_count Chip to display the number of fans on.
   * @property {boolean} cover_count Chip to display the number of unclosed covers.
   * @property {boolean} switch_count Chip to display the number of switches on.
   * @property {boolean} climate_count Chip to display the number of climates which are not off.
   * @property {string} weather_entity Entity ID for the weather chip to use, accepts `weather.` only.
   * @property {object[]} extra_chips List of extra chips.
   */
  export interface Chips {
    extra_chips: LovelaceChipConfig[];

    light_count: boolean;
    fan_count: boolean;
    cover_count: boolean;
    switch_count: boolean;
    climate_count: boolean;
    weather_entity: string;

    [key: string]: any;
  }

  /**
   * Custom Card Configuration for an entity.
   *
   * @property {boolean} hidden True if the entity should be hidden from the dashboard.
   */
  export interface CustomCardConfig extends LovelaceCardConfig {
    hidden?: boolean;
  }

  /**
   * Area Filter Context.
   *
   * @property {AreaRegistryEntry} area Area Entity.
   * @property {string[]} areaDeviceIds The id of devices which are linked to the area entity.
   * @property {string} domain Domain of the entity.
   *                           Example: `light`.
   */
  export interface AreaFilterContext {
    area: AreaRegistryEntry;
    areaDeviceIds: string[];
    domain: string;
  }

  /**
   * Checks if the given object is an instance of CallServiceActionConfig.
   *
   * @param {any} obj - The object to be checked.
   * @return {boolean} - Returns true if the object is an instance of CallServiceActionConfig, otherwise false.
   */
  export function isCallServiceActionConfig(obj: any): obj is CallServiceActionConfig {
    return obj && obj.action === "call-service" && ["action", "service"].every(key => key in obj);
  }

  /**
   * Checks if the given object is an instance of HassServiceTarget.
   *
   * @param {any} obj - The object to check.
   * @return {boolean} - True if the object is an instance of HassServiceTarget, false otherwise.
   */
  export function isCallServiceActionTarget(obj: any): obj is HassServiceTarget {
    return obj && ["entity_id", "device_id", "area_id"].some(key => key in obj);
  }
}
