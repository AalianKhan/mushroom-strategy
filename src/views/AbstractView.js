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
  createViewCards() {
    /** @type Object[] */
    const viewCards      = [this.viewTitleCard];
    const addedEntityIds = [];

    // Create cards for each area.
    for (const area of Helper.areas) {
      const areaCards = [];
      const entities  = Helper.getDeviceEntities(area, this["domain"]);
      const className = Helper.sanitizeClassName(this["domain"] + "Card");

      import((`../cards/${className}`)).then(cardModule => {
        if (entities.length) {
          // Create a Title card for the current area.
          areaCards.push(
              new TitleCard([area], {
                title: area.name,
                ...this.options["titleCard"],
              }).createCard(),
          );

          // Create a card for each domain-entity of the current area.
          for (const entity of entities) {
            if (!addedEntityIds.includes(entity.entity_id)) {
              const card = (Helper.strategyOptions.entity_config ?? []).find(
                  config => config.entity === entity.entity_id,
              ) ?? new cardModule[className](entity).getCard();

            areaCards.push(card);
            addedEntityIds.push(entity.entity_id);
            }
          }
        }
      });

      //areaCards.sort((a, b) => a.name.localeCompare(b.name));

      viewCards.push({
        type: "vertical-stack",
        cards: areaCards,
      });
    }

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
