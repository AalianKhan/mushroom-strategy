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
  }
}
