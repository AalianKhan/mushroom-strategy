import {AbstractCard} from "./AbstractCard";

/**
 * Device Card Class
 *
 * Used to create a card for opening device entities in a popup.
 *
 * @class
 * @extends AbstractCard
 */
class DeviceCard extends AbstractCard {
  /**
   * Default options of the card.
   *
   * @type {deviceCardOptions}
   * @private
   */
  #defaultOptions = {
    type: "custom:mushroom-template-card",
    primary: undefined,
    icon: "mdi:power-plug",
    icon_color: "cyan",
    tap_action: {
      action: "call-service",
      service: "browser_mod.popup",
      data: {
        dismissable: true,
        autoclose: false,
        content: undefined,
      },
      target: {
        device_id: "this"
      },
    },
  };

  /**
   * Class constructor.
   *
   * @param {deviceEntity} device The area entity to create a card for.
   * @param {deviceCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(device, options = {}) {
    super(device);

    this.#defaultOptions.primary                    = device.name;

    /// this.#defaultOptions.tap_action.data.content    = options.tap_action.data.content;

    // // Set card type to default if a type "default" is given in strategy options.
    // if (options.type === "default") {
    //   options.type = this.#defaultOptions.type;
    // }

    this.mergeOptions(
        this.#defaultOptions,
        options,
    );

    // // Override the area's name with a custom name, unless a custom primary text is set.
    // if (!options.primary && options.name) {
    //   this.options.primary = options.name;
    // }
  }
}

export {DeviceCard};
