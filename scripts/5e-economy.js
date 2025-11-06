// scripts/5e-economy.js
import { ManageCurrenciesForm } from "./settings.js"; 

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
    type: ManageCurrenciesForm, // Usa a classe importada
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
    
    constructor(...args) {
        super(...args);
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
    return {
      currencies: this.currencies
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

    this.currencies = this._collectCurrentCurrencies(this.element);

    // ALTERADO: Remoção do campo 'value'
    this.currencies.push({ name: "Nova Moeda", icon: "fa-coins" });

    game.settings.set("5e-economy", "extraCurrencies", this.currencies);

    this.render(true);
  }

  /** Remove uma moeda da lista */
  _onRemoveCurrency(event) {
    event.preventDefault();
    const index = Number(event.currentTarget.dataset.index);

    this.currencies = this._collectCurrentCurrencies(this.element); 
    
    this.currencies.splice(index, 1);

    game.settings.set("5e-economy", "extraCurrencies", this.currencies);
    this.render(true);
  }

  /** * Captura os valores atualmente digitados no formulário.
    * @param {jQuery} element O contêiner do formulário.
    */
  _collectCurrentCurrencies(element) {
    const currencies = [];
    
    element[0].querySelectorAll(".currency-row").forEach(row => { 
      const name = row.querySelector('[data-field="name"]')?.value || "Nova Moeda";
      const icon = row.querySelector('[data-field="icon"]')?.value || "";
      
      // REMOVIDO: Coleta do campo 'value'
      
      currencies.push({ name, icon }); // Objeto agora tem apenas 'name' e 'icon'
    });
    return currencies;
  }

  /** Salva tudo ao clicar em “Salvar” */
  async _updateObject(event, formData) {
    event.preventDefault();

    this.currencies = this._collectCurrentCurrencies(this.element);

    // Garante que apenas 'name' e 'icon' sejam salvos
    const cleanedCurrencies = this.currencies.map(({ name, icon }) => ({ name, icon }));

    await game.settings.set("5e-economy", "extraCurrencies", cleanedCurrencies);
    ui.notifications.info("Moedas salvas com sucesso!");
  }
}
