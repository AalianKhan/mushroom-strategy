import {Helper} from "./Helper";
import {SensorCard} from "./cards/SensorCard";
import {ControllerCard} from "./cards/ControllerCard";
import {generic} from "./types/strategy/generic";
import {LovelaceCardConfig, LovelaceConfig, LovelaceViewConfig} from "./types/homeassistant/data/lovelace";
import {StackCardConfig} from "./types/homeassistant/lovelace/cards/types";
import {EntityCardConfig} from "./types/lovelace-mushroom/cards/entity-card-config";
import {HassServiceTarget} from "home-assistant-js-websocket";
import StrategyArea = generic.StrategyArea;
import ViewConfig = generic.ViewConfig;
import {EntityRegistryEntry} from "./types/homeassistant/data/entity_registry";
import {capitalizeFirstLetter} from "./utils/string";

/**
 * Mushroom Dashboard Strategy.<br>
 * <br>
 * Mushroom dashboard strategy provides a strategy for Home-Assistant to create a dashboard automatically.<br>
 * The strategy makes use Mushroom and Mini Graph cards to represent your entities.<br>
 * <br>
 * Features:<br>
 *     🛠 Automatically create dashboard with three lines of yaml.<br>
 *     😍 Built-in Views for several standard domains.<br>
 *     🎨 Many options to customize to your needs.<br>
 * <br>
 * Check the [Repository]{@link https://github.com/AalianKhan/mushroom-strategy} for more information.
 */
class MushroomStrategy extends HTMLTemplateElement {
  /**
   * Generate a dashboard.
   *
   * Called when opening a dashboard.
   *
   * @param {generic.DashBoardInfo} info Dashboard strategy information object.
   * @return {Promise<LovelaceConfig>}
   */
  static async generateDashboard(info: generic.DashBoardInfo): Promise<LovelaceConfig> {
    await Helper.initialize(info);

    // Create views.
    const views: LovelaceViewConfig[] = info.config?.views ?? [];

    let viewModule;

    // Create a view for each exposed domain.
    let tabViews: ViewConfig[] = [];
    for (let viewId of Helper.getViewIds()) {
      try {
        const viewType = Helper.sanitizeClassName(viewId + "View");
        viewModule = await import(`./views/${viewType}`);
        (await new viewModule[viewType]().getView())
          .filter((v: ViewConfig) => !Helper.strategyOptions.views[v.id]?.hidden)
          .filter((v: ViewConfig) => v.cards?.length)
          .forEach((v: ViewConfig) => tabViews.push(v));

      } catch (e) {
        Helper.logError(`View '${viewId}' couldn't be loaded!`, e);
      }
    }

    // Add custom views.
    if (Helper.strategyOptions.extra_views) {
      tabViews.push(...Helper.strategyOptions.extra_views);
    }
    views.push(...Helper.sortViews(tabViews));

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
   * @param {generic.ViewInfo} info The view's strategy information object.
   * @return {Promise<LovelaceViewConfig>}
   */
  static async generateView(info: generic.ViewInfo): Promise<LovelaceViewConfig> {
    const exposedDomainIds = Helper.getExposedDomainIds();
    const area = info.view.strategy?.options?.area ?? {} as StrategyArea;
    const viewCards: LovelaceCardConfig[] = [...(area.extra_cards ?? [])];

    // Set the target for controller cards to the current area.
    let target: HassServiceTarget = {
      area_id: [area.area_id],
    };

    // Create cards for each domain.
    for (const domain of exposedDomainIds) {
      if (domain === "default") {
        continue;
      }

      const className = Helper.sanitizeClassName(domain + "Card");

      let allDomainCards: LovelaceCardConfig[] = [];

      try {
        allDomainCards = await import(`./cards/${className}`).then(cardModule => {
          const entities = Helper.getDeviceEntities(area, domain);
          let configEntityHidden =
                Helper.strategyOptions.domains[domain ?? "_"].hide_config_entities
                || Helper.strategyOptions.domains["_"].hide_config_entities;

          // Set the target for controller cards to entities without an area.
          if (area.area_id === "undisclosed") {
            target = {
              entity_id: entities.map(entity => entity.entity_id),
            }
          }
          const labelPrefix = Helper.getLabelPrefix(domain)
          const msLabelsOfDomain = Helper.labelsOfDomain(domain);
          const entriesGroupedByLabel = msLabelsOfDomain
            .map(label => entities
              .filter(entity => entity.labels.includes(label.label_id)))

          const labelLessEntities = entities
            .filter(entity => !entity.labels
              .some(label => label.startsWith(labelPrefix)));
          return [labelLessEntities, ...entriesGroupedByLabel]
            .flatMap((groupedEntities: EntityRegistryEntry[], index) => {
              let domainCards: LovelaceCardConfig[] = [];

              if (groupedEntities.length) {
                // Create a Controller card for the current domain.
                const title = msLabelsOfDomain[index - 1]?.name?.replace(labelPrefix, "") ?? Helper.strategyOptions.domains[domain].title;
                const titleCard = new ControllerCard(
                  Helper.toTargetEntities(groupedEntities),
                  {
                    ...Helper.strategyOptions.domains[domain],
                    title: capitalizeFirstLetter(title),
                  },
                ).createCard();

                if (domain === "sensor") {
                  // Create a card for each entity-sensor of the current area.
                  const sensorStates = Helper.getStateEntities(area, "sensor");
                  const sensorCards: EntityCardConfig[] = [];

                  for (const sensor of groupedEntities) {
                    // Find the state of the current sensor.
                    const sensorState = sensorStates.find(state => state.entity_id === sensor.entity_id);
                    let cardOptions = Helper.strategyOptions.card_options?.[sensor.entity_id];
                    let deviceOptions = Helper.strategyOptions.card_options?.[sensor.device_id ?? "null"];

                    if (!cardOptions?.hidden && !deviceOptions?.hidden) {
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

                // Create a card for each other domain-entity of the current area.
                for (const entity of groupedEntities) {
                  let deviceOptions;
                  let cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id];

                  if (entity.device_id) {
                    deviceOptions = Helper.strategyOptions.card_options?.[entity.device_id];
                  }

                  // Don't include the entity if hidden in the strategy options.
                  if (cardOptions?.hidden || deviceOptions?.hidden) {
                    continue;
                  }

                  // Don't include the config-entity if hidden in the strategy options.
                  if (entity.entity_category === "config" && configEntityHidden) {
                    continue;
                  }

                  domainCards.push(new cardModule[className](entity, cardOptions).getCard());
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
            })
        });
      } catch (e) {
        Helper.logError("An error occurred while creating the domain cards!", e);
      }

      if (allDomainCards.length) {
        viewCards.push({
          type: "vertical-stack",
          cards: allDomainCards,
        });
      }
    }

    if (!Helper.strategyOptions.domains.default.hidden) {
      // Create cards for any other domain.
      // Collect device entities of the current area.
      const areaDevices = Helper.devices.filter((device) => device.area_id === area.area_id)
        .map((device) => device.id);

      // Collect the remaining entities of which all conditions below are met:
      // 1. The entity is not hidden.
      // 2. The entity's domain isn't exposed (entities of exposed domains are already included).
      // 3. The entity is linked to a device which is linked to the current area,
      //    or the entity itself is linked to the current area.
      const miscellaneousEntities = Helper.entities.filter((entity) => {
        const entityLinked = areaDevices.includes(entity.device_id ?? "null") || entity.area_id === area.area_id;
        const entityUnhidden = entity.hidden_by === null && entity.disabled_by === null;
        const domainExposed = exposedDomainIds.includes(entity.entity_id.split(".", 1)[0]);

        return entityUnhidden && !domainExposed && entityLinked;
      });

      // Create a column of miscellaneous entity cards.
      if (miscellaneousEntities.length) {
        let miscellaneousCards: (StackCardConfig | EntityCardConfig)[] = [];

        try {
          miscellaneousCards = await import("./cards/MiscellaneousCard").then(cardModule => {
            const miscellaneousCards: (StackCardConfig | EntityCardConfig)[] = [
              new ControllerCard(target, Helper.strategyOptions.domains.default).createCard(),
            ];

            for (const entity of miscellaneousEntities) {
              let cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id];
              let deviceOptions = Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];

              // Don't include the entity if hidden in the strategy options.
              if (cardOptions?.hidden || deviceOptions?.hidden) {
                continue;
              }

              // Don't include the config-entity if hidden in the strategy options
              if (entity.entity_category === "config" && Helper.strategyOptions.domains["_"].hide_config_entities) {
                continue;
              }

              miscellaneousCards.push(new cardModule.MiscellaneousCard(entity, cardOptions).getCard());
            }

            return miscellaneousCards;
          });
        } catch (e) {
          Helper.logError("An error occurred while creating the domain cards!", e);
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

customElements.define("ll-strategy-mushroom-strategy", MushroomStrategy);

const version = "v2.1.0";
console.info(
  "%c Mushroom Strategy %c ".concat(version, " "),
  "color: white; background: coral; font-weight: 700;", "color: coral; background: white; font-weight: 700;"
);
