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
    const views = [];

    let viewModule;

    // Create a view for each exposed domain.
    for (let viewId of Helper.getExposedViewIds()) {
      try {
        const viewType = Helper.sanitizeClassName(viewId + "View");
        viewModule     = await import(`./views/${viewType}`);
        const view     = await new viewModule[viewType](Helper.strategyOptions.views[viewId]).getView();

        views.push(view);

      } catch (e) {
        console.error(Helper.debug ? e : `View '${viewId}' couldn't be loaded!`);
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
    const exposedDomainIds = Helper.getExposedDomainIds();
    const area             = info.view.strategy.options.area;
    const viewCards        = [...(area.extra_cards ?? [])];

    // Create cards for each domain.
    for (const domain of exposedDomainIds) {
      if (domain === "default") {
        continue;
      }

      const className = Helper.sanitizeClassName(domain + "Card");

      let domainCards = [];

      try {
        domainCards = await import(`./cards/${className}`).then(cardModule => {
          let domainCards = [];
          const entities  = Helper.getDeviceEntities(area, domain);

          if (entities.length) {
            // Create a Title card for the current domain.
            const titleCard = new TitleCard(
                [area],
                Helper.strategyOptions.domains[domain],
            ).createCard();

            if (domain === "sensor") {
              // Create a card for each entity-sensor of the current area.
              const sensorStates = Helper.getStateEntities(area, "sensor");
              const sensorCards  = [];

              for (const sensor of entities) {
                // Find the state of the current sensor.
                const sensorState = sensorStates.find(state => state.entity_id === sensor.entity_id);
                let cardOptions   = Helper.strategyOptions.card_options?.[sensor.entity_id] ?? {};

                if (!cardOptions.hidden) {
                  if (sensorState?.attributes.unit_of_measurement) {
                    cardOptions = {
                      ...{
                        type: "custom:mini-graph-card",
                        entities: [sensor.entity_id],
                      },
                      ...cardOptions,
                    };
                  }

                  sensorCards.push(new SensorCard(sensor, cardOptions).getCard());
                }
              }

              if (sensorCards.length) {
                domainCards.push({
                  type: "vertical-stack",
                  cards: sensorCards,
                });

                domainCards.unshift(titleCard);
              }

              return domainCards;
            }

            // Create a card for each domain-entity of the current area.
            for (const entity of entities) {
              let cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id] ?? {};

              if (!cardOptions.hidden) {
                domainCards.push(new cardModule[className](entity, cardOptions).getCard());
              }
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

            if (domainCards.length) {
              domainCards.unshift(titleCard);
            }
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

    if (!Helper.strategyOptions.domains.default.hidden) {
      // TODO: Check if default is hidden
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
            && !exposedDomainIds.includes(entity.entity_id.split(".", 1)[0]);
      });
  
      // Create a column of miscellaneous entity cards.
      if (miscellaneousEntities.length) {
        let miscellaneousCards = [];
  
        try {
          miscellaneousCards = await import("./cards/MiscellaneousCard").then(cardModule => {
            /** @type Object[] */
            const miscellaneousCards = [
              new TitleCard([area], Helper.strategyOptions.domains.default).createCard(),
            ];
  
            for (const entity of miscellaneousEntities) {
              let cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id] ?? {};
  
              if (!cardOptions.hidden) {
                miscellaneousCards.push(new cardModule.MiscellaneousCard(entity, cardOptions).getCard());
              }
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
    }

    // Return cards.
    return {
      cards: viewCards,
    };
  }
}

// noinspection JSUnresolvedReference
customElements.define("ll-strategy-mushroom-strategy", MushroomStrategy);
