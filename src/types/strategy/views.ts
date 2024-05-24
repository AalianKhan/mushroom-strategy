import {cards} from "./cards";
import {LovelaceViewConfig} from "../homeassistant/data/lovelace";

export namespace views {
  /**
   * Options for the extended View class.
   *
   * @property {cards.ControllerCardConfig} [controllerCardOptions] Options for the Controller card.
   */
  export interface ViewConfig extends LovelaceViewConfig {
    id: string;
    controllerCardOptions?: cards.ControllerCardOptions;
  }
}




