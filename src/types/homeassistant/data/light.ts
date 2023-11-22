export type LightColor =
  | { color_temp_kelvin: number; }
  | { hs_color: [number, number]; }
  | { rgb_color: [number, number, number]; }
  | { rgbw_color: [number, number, number, number]; }
  | { rgbww_color: [number, number, number, number, number]; };
