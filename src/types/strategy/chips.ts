import {TemplateChipConfig, WeatherChipConfig} from "../lovelace-mushroom/utils/lovelace/chip/types";

export namespace chips {
  export type TemplateChipOptions = Omit<TemplateChipConfig, "type">;
  export type WeatherChipOptions = Omit<WeatherChipConfig, "type">;
}
