import {Helper} from "../Helper";
import {TitleCard} from "../cards/TitleCard";

/**
 * Abstract View Class.
 *
 * To create a new view, extend the new class with this one.
 *
 * @class
 * @abstract
 */
class AbstractView {
  /**
   * Options for creating a view.
   *
   * @type {abstractOptions}
   */
  options = {
    title: null,
    path: null,
    icon: "mdi:view-dashboard",
    subview: false,
  };

  /**
   * A card to switch all entities in the view.
   *
   * @type {Object}
   */
  viewTitleCard;

  /**
   * Class constructor.
   *
   * @throws {Error} If trying to instantiate this class.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor() {
    if (this.constructor === AbstractView) {
      throw new Error("Abstract classes can't be instantiated.");
    }

    if (!Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }
  }

  /**
   * Merge the default options of this class and the custom options into the options of the parent class.
   *
   * @param {Object} [defaultOptions={}] Default options for the card.
   * @param {Object} [customOptions={}] Custom Options for the card.
   */
  mergeOptions(defaultOptions, customOptions) {
    this.options = {
      ...defaultOptions,
      ...customOptions,
    };
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Object[] | Promise} An array of card objects.
   */
  async createViewCards() {
    /** @type Object[] */
    const viewCards      = [this.viewTitleCard];

    // Create cards for each area.
    for (const area of Helper.areas) {
      const areaCards  = [];
      const entities   = Helper.getDeviceEntities(area, this["domain"]);
      const className  = Helper.sanitizeClassName(this["domain"] + "Card");
      const cardModule = await import(`../cards/${className}`);

      // Create a card for each domain-entity of the current area.
      for (const entity of entities) {
        let cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id] ?? {};

        if (cardOptions.hidden) {
          continue;
        }

        areaCards.push(new cardModule[className](entity, cardOptions).getCard());
      }

      if (areaCards.length) {
        // Create a Title card for the current area if it has entities.
        areaCards.unshift(new TitleCard(
            [area],
            {
              title: area.name,
              ...this.options["titleCard"],
            },
            this["domain"],
        ).createCard());

        viewCards.push({
          type: "vertical-stack",
          cards: areaCards,
        });
      }
    }

    viewCards.unshift(viewCards.length ? this.viewTitleCard : {
      type: "custom:mushroom-title-card",
      title: "No Entities Available",
      subtitle: "They're either hidden by the configuration or by Home Assistant.",
    });

    return viewCards;
  }

  /**
   * Get a view object.
   *
   * The view includes the cards which are created by method createViewCards().
   *
   * @returns {viewOptions & {cards: Object[]}} The view object.
   */
  async getView() {
    return {
      ...this.options,
      cards: await this.createViewCards(),
    };
  }
}

export {AbstractView};
