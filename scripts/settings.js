export function registerEconomySettings() {
  game.settings.register("5e-economy", "currencies", {
    name: "Moedas Personalizadas",
    hint: "Defina moedas extras, suas abreviações e valor relativo (1 unidade desta moeda = X peças de ouro).",
    scope: "world",
    config: true,
    type: Array,
    default: [],
    onChange: () => window.location.reload(),
  });

  game.settings.registerMenu("5e-economy", "currencyConfig", {
    name: "Configurar Moedas",
    label: "Abrir Gerenciador de Moedas",
    icon: "fas fa-coins",
    type: CurrencyConfigApp,
    restricted: true
  });
}

// =====================
// Interface de Configuração
// =====================
class CurrencyConfigApp extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "currency-config-app",
      title: "Gerenciador de Moedas",
      template: "modules/5e-economy/templates/currency-config.html",
      width: 600,
      height: "auto"
    });
  }

  getData() {
    return { currencies: game.settings.get("5e-economy", "currencies") };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".add-currency").click(this._onAddCurrency.bind(this));
    html.find(".remove-currency").click(this._onRemoveCurrency.bind(this));
  }

  async _onAddCurrency() {
    const data = game.settings.get("5e-economy", "currencies");
    data.push({ name: "Nova Moeda", abbr: "NM", value: 1 });
    await game.settings.set("5e-economy", "currencies", data);
    this.render();
  }

  async _onRemoveCurrency(ev) {
    const index = Number(ev.currentTarget.dataset.index);
    const data = game.settings.get("5e-economy", "currencies");
    data.splice(index, 1);
    await game.settings.set("5e-economy", "currencies", data);
    this.render();
  }

  async _updateObject(_event, formData) {
    const entries = Object.entries(formData);
    const result = [];

    for (let i = 0; i < entries.length; i += 3) {
      result.push({
        name: entries[i][1],
        abbr: entries[i + 1][1],
        value: Number(entries[i + 2][1])
      });
    }

    await game.settings.set("5e-economy", "currencies", result);
  }
}
