export const optionDefaults = {
  debug: false,
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
    }
  },
  areas: {
    undisclosed: {
      aliases: [],
      area_id: null,
      name: "Undisclosed",
      picture: null,
      hidden: false,
    }
  },
  domains: {
    default: {
      title: "Miscellaneous",
      showControls: false,
      hidden: false,
    },
    light: {
      title: "Lights",
      showControls: true,
      iconOn: "mdi:lightbulb",
      iconOff: "mdi:lightbulb-off",
      onService: "light.turn_on",
      offService: "light.turn_off",
      hidden: false,
    },
    fan: {
      title: "Fans",
      showControls: true,
      iconOn: "mdi:fan",
      iconOff: "mdi:fan-off",
      onService: "fan.turn_on",
      offService: "fan.turn_off",
      hidden: false,
    },
    cover: {
      title: "Covers",
      showControls: true,
      iconOn: "mdi:arrow-up",
      iconOff: "mdi:arrow-down",
      onService: "cover.open_cover",
      offService: "cover.close_cover",
      hidden: false,
    },
    switch: {
      title: "Switches",
      showControls: true,
      iconOn: "mdi:power-plug",
      iconOff: "mdi:power-plug-off",
      onService: "switch.turn_on",
      offService: "switch.turn_off",
      hidden: false,
    },
    camera: {
      title: "Cameras",
      showControls: false,
      hidden: false,
    },
    lock: {
      title: "Locks",
      showControls: false,
      hidden: false,
    },
    climate: {
      title: "Climates",
      showControls: false,
      hidden: false,
    },
    media_player: {
      title: "Media Players",
      showControls: false,
      hidden: false,
    },
    sensor: {
      title: "Sensors",
      showControls: false,
      hidden: false,
    },
    binary_sensor: {
      title: "Binary Sensors",
      showControls: false,
      hidden: false,
    },
    number: {
      title: "Numbers",
      showControls: false,
      hidden: false,
    },
  }
}
