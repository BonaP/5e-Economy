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
//  Formulário de Gerenciar Moedas
// -------------------------------
class ManageCurrenciesForm extends FormApplication {
    
    // Adicione um construtor para garantir que o estado interno seja o único ponto de verdade
    constructor(...args) {
        super(...args);
        // Usa o estado salvo como ponto de partida
        this.currencies = foundry.utils.duplicate(game.settings.get("5e-economy", "extraCurrencies")) || [];
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
    // Recupera moedas salvas no estado interno (this.currencies)
    return {
      currencies: this.currencies
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".new-currency").click(this._onAddCurrency.bind(this));
    html.find(".remove-currency").click(this._onRemoveCurrency.bind(this));
    
    // **IMPORTANTE**: O listener 'input change' foi removido aqui também.
  }

  /** Adiciona nova moeda, mantendo os dados atuais digitados */
  _onAddCurrency(event) {
    event.preventDefault();

    // 1. Captura o formulário atual e os valores digitados (usando this.element)
    this.currencies = this._collectCurrentCurrencies(this.element);

    // 2. Adiciona uma nova moeda ao estado interno
    this.currencies.push({ name: "Nova Moeda", icon: "", value: 1 });

    // 3. Salva no settings (para persistência no mundo)
    game.settings.set("5e-economy", "extraCurrencies", this.currencies);

    // 4. Renderiza novamente o formulário com os dados preservados
    this.render(true);
  }

  /** Remove uma moeda da lista */
  _onRemoveCurrency(event) {
    event.preventDefault();
    const index = Number(event.currentTarget.dataset.index);

    // 1. Captura os dados atuais
    this.currencies = this._collectCurrentCurrencies(this.element); 
    
    // 2. Remove do estado interno
    this.currencies.splice(index, 1);

    // 3. Salva no settings
    game.settings.set("5e-economy", "extraCurrencies", this.currencies);
    
    // 4. Renderiza
    this.render(true);
  }

  /** * Captura os valores atualmente digitados no formulário.
   * @param {jQuery} element O contêiner do formulário.
   */
  _collectCurrentCurrencies(element) {
    const currencies = [];
    
    // Garante que a busca é apenas dentro da janela do formulário
    element[0].querySelectorAll(".currency-row").forEach(row => { 
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

    // Garante a coleta final do DOM antes de salvar
    this.currencies = this._collectCurrentCurrencies(this.element);

    await game.settings.set("5e-economy", "extraCurrencies", this.currencies);
    ui.notifications.info("Moedas salvas com sucesso!");
  }
}
