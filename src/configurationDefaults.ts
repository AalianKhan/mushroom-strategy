import {generic} from "./types/strategy/generic";
import StrategyDefaults = generic.StrategyDefaults;

/**
 * Default configuration for the mushroom strategy.
 */
export const getConfigurationDefaults = (localize: Function): StrategyDefaults => {
  return {
    areas: {
      undisclosed: {
        area_id: "undisclosed",
        floor_id: null,
        name: "Undisclosed",
        picture: null,
        icon: "mdi:floor-plan",
        labels: [],
        aliases: [],
        hidden: false,
      }
    },
    debug: false,
    domains: {
      _: {
        hide_config_entities: true,
        hide_diagnostic_entities: true,
      },
      default: {
        title: localize("generic.miscellaneous"),
        showControls: false,
        hidden: false,
      },
      light: {
        title: localize("light.lights"),
        showControls: true,
        iconOn: "mdi:lightbulb",
        iconOff: "mdi:lightbulb-off",
        onService: "light.turn_on",
        offService: "light.turn_off",
        hidden: false,
      },
      scene: {
        title: localize("scene.scenes"),
        showControls: false,
        onService: "scene.turn_on",
        hidden: false,
      },
      fan: {
        title: localize("fan.fans"),
        showControls: true,
        iconOn: "mdi:fan",
        iconOff: "mdi:fan-off",
        onService: "fan.turn_on",
        offService: "fan.turn_off",
        hidden: false,
      },
      cover: {
        title: localize("cover.covers"),
        showControls: true,
        iconOn: "mdi:arrow-up",
        iconOff: "mdi:arrow-down",
        onService: "cover.open_cover",
        offService: "cover.close_cover",
        hidden: false,
      },
      switch: {
        title: localize("switch.switches"),
        showControls: true,
        iconOn: "mdi:power-plug",
        iconOff: "mdi:power-plug-off",
        onService: "switch.turn_on",
        offService: "switch.turn_off",
        hidden: false,
      },
      camera: {
        title: localize("camera.cameras"),
        showControls: false,
        hidden: false,
      },
      lock: {
        title: localize("lock.locks"),
        showControls: false,
        hidden: false,
      },
      climate: {
        title: localize("climate.climates"),
        showControls: false,
        hidden: false,
      },
      media_player: {
        title: localize("media_player.media_players"),
        showControls: false,
        hidden: false,
      },
      sensor: {
        title: localize("sensor.sensors"),
        showControls: false,
        hidden: false,
      },
      binary_sensor: {
        title: `${localize("sensor.binary")} ` + localize("sensor.sensors"),
        showControls: false,
        hidden: false,
      },
      number: {
        title: localize("generic.numbers"),
        showControls: false,
        hidden: false,
      },
      vacuum: {
        title: localize("vacuum.vacuums"),
        showControls: true,
        hidden: false,
      },
      select: {
        title: localize("select.selects"),
        showControls: false,
        hidden: false,
      },
      input_select: {
        title: localize("input_select.input_selects"),
        showControls: false,
        hidden: false,
      },
    },
    home_view: {
      hidden: [],
    },
    views: {
      home: {
        order: 1,
        hidden: false,
      },
      light: {
        order: 2,
        hidden: false,
      },
      fan: {
        order: 3,
        hidden: false,
      },
      cover: {
        order: 4,
        hidden: false,
      },
      switch: {
        order: 5,
        hidden: false,
      },
      climate: {
        order: 6,
        hidden: false,
      },
      camera: {
        order: 7,
        hidden: false,
      },
      vacuum: {
        order: 8,
        hidden: false,
      },
      scene: {
        order: 9,
        hidden: false,
      },
    }
  };
};
