import {cards} from "../types/strategy/cards";
import {StackCardConfig} from "../types/homeassistant/lovelace/cards/types";
import {LovelaceCardConfig} from "../types/homeassistant/data/lovelace";
import {HassServiceTarget} from "home-assistant-js-websocket";

/**
 * Controller Card class.
 *
 * Used for creating a Title Card with controls.
 *
 * @class
 */
class ControllerCard {
  /**
   * @type {HassServiceTarget} The target to control the entities of.
   * @private
   */
  readonly #target: HassServiceTarget;

  /**
   * Default configuration of the card.
   *
   * @type {cards.ControllerCardConfig}
   * @private
   */
  readonly #defaultConfig: cards.ControllerCardConfig = {
    type: "mushroom-title-card",
    showControls: true,
    iconOn: "mdi:power-on",
    iconOff: "mdi:power-off",
    onService: "none",
    offService: "none",
  };

  /**
   * Class constructor.
   *
   * @param {HassServiceTarget} target The target to control the entities of.
   * @param {cards.ControllerCardOptions} options Controller Card options.
   */
  constructor(target: HassServiceTarget, options: cards.ControllerCardOptions = {}) {
    this.#target = target;
    this.#defaultConfig = {
      ...this.#defaultConfig,
      ...options,
    };
  }

  /**
   * Create a Controller card.
   *
   * @return {StackCardConfig} A Controller card.
   */
  createCard(): StackCardConfig {
    const cards: LovelaceCardConfig[] = [
      {
        type: "custom:mushroom-title-card",
        title: this.#defaultConfig.title,
        subtitle: this.#defaultConfig.subtitle,
      },
    ];

    if (this.#defaultConfig.showControls) {
      cards.push({
        type: "horizontal-stack",
        cards: [
          {
            type: "custom:mushroom-template-card",
            icon: this.#defaultConfig.iconOff,
            layout: "vertical",
            icon_color: "red",
            tap_action: {
              action: "call-service",
              service: this.#defaultConfig.offService,
              target: this.#target,
              data: {},
            },
          },
          {
            type: "custom:mushroom-template-card",
            icon: this.#defaultConfig.iconOn,
            layout: "vertical",
            icon_color: "amber",
            tap_action: {
              action: "call-service",
              service: this.#defaultConfig.onService,
              target: this.#target,
              data: {},
            },
          },
        ],
      });
    }

    return {
      type: "horizontal-stack",
      cards: cards,
    };
  }
}

export {ControllerCard};
