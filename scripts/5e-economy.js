Hooks.once("init", () => {
  console.log("5e-economy | Initializing custom economy module");

  // Registrar configuração principal
  game.settings.registerMenu("5e-economy", "manageCurrencies", {
    name: "Gerenciar Moedas",
    label: "Abrir Gerenciar Moedas",
    hint: "Abra uma janela para criar e editar moedas personalizadas.",
    icon: "fas fa-coins",
    type: ManageCurrenciesForm,
    restricted: true
  });

  // Guardar lista de moedas
  game.settings.register("5e-economy", "extraCurrencies", {
    name: "Moedas Extras",
    scope: "world",
    config: false,
    type: Array,
    default: []
  });
});

Hooks.once("ready", () => {
  console.log("5e-economy | Ready");
});

// -------------------------------
//  Formulário de Gerenciar Moedas
// -------------------------------
class ManageCurrenciesForm extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "manage-currencies-form",
      title: "Gerenciar Moedas Personalizadas",
      template: "modules/5e-economy/templates/manage-currencies.html",
      width: 500,
      height: "auto"
    });
  }

  getData() {
    return {
      currencies: game.settings.get("5e-economy", "extraCurrencies") || []
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".add-currency").click(this._onAddCurrency.bind(this));
    html.find(".remove-currency").click(this._onRemoveCurrency.bind(this));
  }

  _onAddCurrency(event) {
    event.preventDefault();
    const currencies = game.settings.get("5e-economy", "extraCurrencies");
    currencies.push({ name: "Nova Moeda", icon: "", value: 1 });
    game.settings.set("5e-economy", "extraCurrencies", currencies);
    this.render();
  }

  _onRemoveCurrency(event) {
    event.preventDefault();
    const index = Number(event.currentTarget.dataset.index);
    const currencies = game.settings.get("5e-economy", "extraCurrencies");
    currencies.splice(index, 1);
    game.settings.set("5e-economy", "extraCurrencies", currencies);
    this.render();
  }

  async _updateObject(event, formData) {
    event.preventDefault();
    const data = foundry.utils.expandObject(formData);
    const currencies = Object.values(data.currencies || {});
    await game.settings.set("5e-economy", "extraCurrencies", currencies);
  }
}
