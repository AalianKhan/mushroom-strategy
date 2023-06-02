import {Helper} from "./Helper";
import {SensorCard} from "./cards/SensorCard";
import {TitleCard} from "./cards/TitleCard";

/**
 * Mushroom Dashboard Strategy.<br>
 * <br>
 * Mushroom dashboard strategy provides a strategy for Home-Assistant to create a dashboard automatically.<br>
 * The strategy makes use Mushroom, Mini Graph and WebRTC cards to represent your entities.<br>
 * <br>
 * Features:<br>
 *     🛠 Automatically create dashboard with 3 lines of yaml.<br>
 *     😍 Built-in Views for several standard domains.<br>
 *     🎨 Many options to customize to your needs.<br>
 * <br>
 * Check the [Repository]{@link https://github.com/AalianKhan/mushroom-strategy} for more information.
 */
class MushroomStrategy {
  /**
   * Generate a dashboard.
   *
   * Called when opening a dashboard.
   *
   * @param {dashBoardInfo} info Dashboard strategy information object.
   * @return {Promise<{views: Object[]}>}
   */
  static async generateDashboard(info) {
    await Helper.initialize(info);

    // Create views.
    const views          = [];

    let viewModule;

    // Create a view for each exposed domain.
    for (let viewId of Helper.getExposedViews()) {
      try {
        const viewType   = Helper.sanitizeClassName(viewId + "View");
        viewModule = await import(`./views/${viewType}`);
        const view = await new viewModule[viewType](Helper.strategyOptions.views[viewId]).getView();

        views.push(view);

      } catch (e) {
        console.error(Helper.debug ? e : `View '${viewType}' couldn't be loaded!`);
      }
    }

    // Create subviews for each area.
    for (let area of Helper.areas) {
      if (!area.hidden) {
        views.push({
          title: area.name,
          path: area.area_id ?? area.name,
          subview: true,
          strategy: {
            type: "custom:mushroom-strategy",
            options: {
              area,
              "entity_config": Helper.strategyOptions.entity_config,
            },
          },
        });
      }
    }

    // Add custom views.
    if (Helper.strategyOptions.extra_views) {
      views.push(...Helper.strategyOptions.extra_views);
    }

    // Return the created views.
    return {
      views: views,
    };
  }

  /**
   * Generate a view.
   *
   * Called when opening a subview.
   *
   * @param {viewInfo} info The view's strategy information object.
   * @return {Promise<{cards: Object[]}>}
   */
  static async generateView(info) {
    const area            = info.view.strategy.options.area;
    const viewCards       = [...(area.extra_cards ?? [])];
    const strategyOptions = {
      entityConfig: info.view.strategy.options.entity_config,
    };

    // TODO: Get domains from config (Currently strategy.options.views).
    const exposedDomains = [
      "light",
      "fan",
      "cover",
      "switch",
      "climate",
      "camera",
      "media_player",
      "sensor",
      "binary_sensor",
    ];

    const titleCardOptions = {
      default: {
        title: "Miscellaneous",
        showControls: false,
      },
      light: {
        title: "Lights",
        showControls: true,
        iconOn: "mdi:lightbulb",
        iconOff: "mdi:lightbulb-off",
        onService: "light.turn_on",
        offService: "light.turn_off",
      },
      fan: {
        title: "Fans",
        showControls: true,
        iconOn: "mdi:fan",
        iconOff: "mdi:fan-off",
        onService: "fan.turn_on",
        offService: "fan.turn_off",
      },
      cover: {
        title: "Covers",
        showControls: true,
        iconOn: "mdi:arrow-up",
        iconOff: "mdi:arrow-down",
        onService: "cover.open_cover",
        offService: "cover.close_cover",
      },
      switch: {
        title: "Switches",
        showControls: true,
        iconOn: "mdi:power-plug",
        iconOff: "mdi:power-plug-off",
        onService: "switch.turn_on",
        offService: "switch.turn_off",
      },
      camera: {
        title: "Cameras",
        showControls: false,
      },
      climate: {
        title: "Climates",
        showControls: false,
      },
      media_player: {
        title: "Media Players",
        showControls: false,
      },
      sensor: {
        title: "Sensors",
        showControls: false,
      },
      binary_sensor: {
        title: "Binary Sensors",
        showControls: false,
      },
    };

    // Create cards for each domain.
    for (const domain of exposedDomains) {
      const className = Helper.sanitizeClassName(domain + "Card");

      let domainCards = [];

      try {
        domainCards = await import(`./cards/${className}`).then(cardModule => {
          let domainCards = [];
          const entities  = Helper.getDeviceEntities(area, domain);

          if (entities.length) {
            // Create a Title card for the current domain.
            const titleCard = new TitleCard([area],
                titleCardOptions[domain] ?? titleCardOptions["default"]).createCard();

            if (domain === "sensor") {
              // Create a card for each entity-sensor of the current area.
              const sensorStates = Helper.getStateEntities(area, "sensor");
              const sensorCards  = [];

              for (const sensor of entities) {
                let card = (strategyOptions.entityConfig?.find(config => config.entity_id === sensor.entity_id));

                if (card) {
                  sensorCards.push(card);
                  continue;
                }

                // Find the state of the current sensor.
                const sensorState = sensorStates.find(state => state.entity_id === sensor.entity_id);
                let cardOptions   = {};

                if (sensorState?.attributes.unit_of_measurement) {
                  cardOptions = {
                    type: "custom:mini-graph-card",
                    entities: [sensor.entity_id],
                  };
                }

                sensorCards.push(new SensorCard(sensor, cardOptions).getCard());
              }

              domainCards.push({
                type: "vertical-stack",
                cards: sensorCards,
              });

              domainCards.unshift(titleCard);
              return domainCards;
            }

            // Create a card for each domain-entity of the current area.
            for (const entity of entities) {
              const card = (Helper.strategyOptions.entity_config ?? []).find(
                  config => config.entity === entity.entity_id,
              ) ?? new cardModule[className](entity).getCard();

              domainCards.push(card);
            }

            if (domain === "binary_sensor") {
              // Horizontally group every two binary sensor cards.
              const horizontalCards = [];

              for (let i = 0; i < domainCards.length; i += 2) {
                horizontalCards.push({
                  type: "horizontal-stack",
                  cards: domainCards.slice(i, i + 2),
                });
              }

              domainCards = horizontalCards;
            }

            domainCards.unshift(titleCard);
          }

          return domainCards;
        });
      } catch (e) {
        console.error(Helper.debug ? e : "An error occurred while creating the domain cards!");
      }

      if (domainCards.length) {
        viewCards.push({
          type: "vertical-stack",
          cards: domainCards,
        });
      }
    }

    // Create cards for any other domain.
    // Collect device entities of the current area.
    const areaDevices = Helper.devices.filter(device => device.area_id === area.area_id)
        .map(device => device.id);

    // Collect the remaining entities of which all conditions below are met:
    // 1. The entity is linked to a device which is linked to the current area,
    //    or the entity itself is linked to the current area.
    // 2. The entity is not hidden and is not disabled.
    const miscellaneousEntities = Helper.entities.filter(entity => {
      return (areaDevices.includes(entity.device_id) || entity.area_id === area.area_id)
          && entity.hidden_by == null
          && entity.disabled_by == null
          && !exposedDomains.includes(entity.entity_id.split(".", 1)[0]);
    });

    // Create a column of miscellaneous entity cards.
    if (miscellaneousEntities.length) {
      let miscellaneousCards = [];

      try {
        miscellaneousCards = await import("./cards/MiscellaneousCard").then(cardModule => {
          /** @type Object[] */
          const miscellaneousCards = [
            new TitleCard([area], {title: "Miscellaneous", showControls: false}).createCard(),
          ];
          for (const entity of miscellaneousEntities) {
            const card = (Helper.strategyOptions.entity_config ?? []).find(
                config => config.entity === entity.entity_id,
            ) ?? new cardModule.MiscellaneousCard(entity).getCard();

            miscellaneousCards.push(card);
          }

          return miscellaneousCards;
        });
      } catch (e) {
        console.error(Helper.debug ? e : "An error occurred while creating the domain cards!");
      }

      viewCards.push({
        type: "vertical-stack",
        cards: miscellaneousCards,
      });
    }

    // Return cards.
    return {
      cards: viewCards,
    };
  }
}

// noinspection JSUnresolvedReference
customElements.define("ll-strategy-mushroom-strategy", MushroomStrategy);
