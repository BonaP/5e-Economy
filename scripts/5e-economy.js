// 5e-economy.js | Inicialização do módulo de economia personalizada

Hooks.once("init", () => {
  console.log("5e-economy | Initializing custom economy module");

  game.settings.register("5e-economy", "extraCurrencies", {
    name: "Moedas Extras",
    scope: "world",
    config: false,
    type: Array,
    default: []
  });

  game.settings.registerMenu("5e-economy", "manageCurrencies", {
    name: "Gerenciar Moedas",
    label: "Abrir Gerenciar Moedas",
    hint: "Abra uma janela para criar e editar moedas personalizadas.",
    icon: "fas fa-coins",
    type: ManageCurrenciesForm,
    restricted: true
  });
});

Hooks.once("ready", () => {
  console.log("5e-economy | Ready");
});

// --------------------------------------
//  Classe de Gerenciamento de Moedas
// --------------------------------------
class ManageCurrenciesForm extends FormApplication {
  constructor(...args) {
    super(...args);
    this.currencies = foundry.utils.duplicate(
      game.settings.get("5e-economy", "extraCurrencies")
    ) || [];
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "manage-currencies-form",
      title: "Gerenciar Moedas Personalizadas",
      template: "modules/5e-economy/templates/manage-currencies.html",
      width: 550,
      height: "auto"
    });
  }

  getData() {
    return { currencies: this.currencies };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".new-currency").click(this._onAddCurrency.bind(this));
    html.find(".remove-currency").click(this._onRemoveCurrency.bind(this));

    // 🖼️ FilePicker para seleção de imagem
    html.find(".file-picker").on("click", ev => {
      ev.preventDefault();
      const field = ev.currentTarget.closest(".image-input").querySelector('[data-field="icon"]');

      new FilePicker({
        type: "image",
        current: field.value,
        callback: path => {
          field.value = path;
          this.render(false); // Atualiza o preview sem resetar campos
        }
      }).browse();
    });
  }

  // ➕ Adicionar nova moeda (mantendo os dados atuais)
  _onAddCurrency(event) {
    event.preventDefault();
    this.currencies = this._collectCurrentCurrencies(this.element);

    this.currencies.push({
      name: "Nova Moeda",
      icon: "icons/svg/coin.svg"
    });

    game.settings.set("5e-economy", "extraCurrencies", this.currencies);
    this.render(true);
  }

  // 🗑️ Remover moeda
  _onRemoveCurrency(event) {
    event.preventDefault();
    const index = Number(event.currentTarget.dataset.index);
    this.currencies = this._collectCurrentCurrencies(this.element);
    this.currencies.splice(index, 1);
    game.settings.set("5e-economy", "extraCurrencies", this.currencies);
    this.render(true);
  }

  // 📦 Captura valores atuais do DOM
  _collectCurrentCurrencies(element) {
    const currencies = [];
    element[0].querySelectorAll(".currency-row").forEach(row => {
      const name = row.querySelector('[data-field="name"]')?.value || "Nova Moeda";
      const icon = row.querySelector('[data-field="icon"]')?.value || "icons/svg/coin.svg";
      currencies.push({ name, icon });
    });
    return currencies;
  }

  // 💾 Salvar alterações
  async _updateObject(event, formData) {
    event.preventDefault();
    this.currencies = this._collectCurrentCurrencies(this.element);
    await game.settings.set("5e-economy", "extraCurrencies", this.currencies);
    ui.notifications.info("Moedas salvas com sucesso!");
  }
}
