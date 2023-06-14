class WeatherChip {
  #entityId;
  #options = {
    show_temperature: true,
    show_conditions: true,
  };

  constructor(entityId, options = {}) {
    this.#entityId = entityId;
    this.#options  = {
      ...this.#options,
      ...options,
    };
  }

  getChip() {
    return {
      type: "weather",
      entity: this.#entityId,
      ...this.#options,
    };
  }
}

export {WeatherChip};
