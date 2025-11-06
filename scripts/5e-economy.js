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

// -------------------------------
//  Formulário de Gerenciar Moedas
// -------------------------------
class ManageCurrenciesForm extends FormApplication {
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
    // Recupera moedas salvas no world
    return {
      currencies: game.settings.get("5e-economy", "extraCurrencies") || []
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".new-currency").click(this._onAddCurrency.bind(this));
    html.find(".remove-currency").click(this._onRemoveCurrency.bind(this));
  }

  /** Adiciona nova moeda, mantendo os dados atuais digitados */
  _onAddCurrency(event) {
    event.preventDefault();

    // Captura o formulário atual e os valores digitados antes de adicionar a nova moeda
    const currencies = this._collectCurrentCurrencies();

    // Adiciona uma nova moeda sem sobrescrever as anteriores
    currencies.push({ name: "Nova Moeda", icon: "", value: 1 });

    // Atualiza o settings para refletir a lista atualizada (opcional)
    game.settings.set("5e-economy", "extraCurrencies", currencies);

    // Renderiza novamente o formulário com os dados preservados
    this.render(true);
  }

  /** Remove uma moeda da lista */
  _onRemoveCurrency(event) {
    event.preventDefault();
    const index = Number(event.currentTarget.dataset.index);

    const currencies = this._collectCurrentCurrencies();
    currencies.splice(index, 1);

    game.settings.set("5e-economy", "extraCurrencies", currencies);
    this.render(true);
  }

/** Captura os valores atualmente digitados no formulário */
  _collectCurrentCurrencies() {
    const currencies = [];
    
    // **CORREÇÃO AQUI**: Usa this.element (o DOM da janela) em vez de document
    this.element[0].querySelectorAll(".currency-row").forEach(row => { 
      const name = row.querySelector('[data-field="name"]')?.value || "Nova Moeda";
      const icon = row.querySelector('[data-field="icon"]')?.value || "";
      const value = parseFloat(row.querySelector('[data-field="value"]')?.value) || 1;
      currencies.push({ name, icon, value });
    });
    return currencies;
  }

  /** Salva tudo ao clicar em “Salvar” */
  async _updateObject(event, formData) {
    event.preventDefault();

    const currencies = this._collectCurrentCurrencies();

    await game.settings.set("5e-economy", "extraCurrencies", currencies);
    ui.notifications.info("Moedas salvas com sucesso!");
  }
}
