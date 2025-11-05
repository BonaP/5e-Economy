// ===================================================
// 5e-economy | settings.js
// Configurações principais do módulo de economia
// ===================================================

export function registerSettings() {
  console.log("5e-economy | Registrando configurações");

  // Configuração oculta para armazenar moedas personalizadas
  game.settings.register("5e-economy", "extraCurrencies", {
    name: "Moedas Extras",
    scope: "world",
    config: false,
    type: Array,
    default: []
  });

  // Menu de gerenciamento de moedas
  game.settings.registerMenu("5e-economy", "manageCurrenciesMenu", {
    name: "Gerenciar Moedas",
    label: "Abrir Gerenciar Moedas",
    hint: "Permite criar, editar e remover moedas personalizadas.",
    icon: "fas fa-coins",
    type: ManageCurrenciesForm,
    restricted: true
  });
}

// ===================================================
// Formulário de Gerenciamento das Moedas
// ===================================================
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

  // ============================================
  // Adicionar nova moeda (sem resetar as antigas)
  // ============================================
  async _onAddCurrency(event) {
    event.preventDefault();

    // 1️⃣ Captura os valores já preenchidos no formulário
    const formData = new FormData(this.form);
    const data = foundry.utils.expandObject(Object.fromEntries(formData.entries()));
    const existing = Object.values(data.currencies || {});

    // 2️⃣ Adiciona uma nova moeda sem apagar as anteriores
    existing.push({
      name: "Nova Moeda",
      icon: "",
      value: 1
    });

    // 3️⃣ Salva no game.settings
    await game.settings.set("5e-economy", "extraCurrencies", existing);

    // 4️⃣ Re-renderiza o formulário mantendo os dados
    this.render(false);
  }

  _onRemoveCurrency(event) {
    event.preventDefault();
    const index = Number(event.currentTarget.dataset.index);
    const currencies = game.settings.get("5e-economy", "extraCurrencies") || [];
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
