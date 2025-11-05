// ===================================================
// 5e-economy | settings.js
// ===================================================

export function registerSettings() {
  console.log("5e-economy | Registrando configurações");

  game.settings.register("5e-economy", "extraCurrencies", {
    name: "Moedas Extras",
    scope: "world",
    config: false,
    type: Array,
    default: []
  });

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
// Classe de gerenciamento de moedas
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

  /**
   * Captura todos os valores preenchidos no formulário antes de adicionar uma nova moeda
   */
  _collectFormData() {
    const currencies = [];
    this.element.find(".currency-row").each(function () {
      const name = $(this).find('input[name*="name"]').val();
      const icon = $(this).find('input[name*="icon"]').val();
      const value = parseFloat($(this).find('input[name*="value"]').val()) || 0;
      currencies.push({ name, icon, value });
    });
    return currencies;
  }

  _onAddCurrency(event) {
    event.preventDefault();

    // 🔹 Captura o que já está no formulário
    const current = this._collectFormData();

    // 🔹 Adiciona a nova moeda sem perder as anteriores
    current.push({
      name: "Nova Moeda",
      icon: "",
      value: 1
    });

    // 🔹 Salva e re-renderiza o formulário
    game.settings.set("5e-economy", "extraCurrencies", current);
    this.render();
  }

  _onRemoveCurrency(event) {
    event.preventDefault();
    const index = Number(event.currentTarget.dataset.index);

    const current = this._collectFormData();
    current.splice(index, 1);

    game.settings.set("5e-economy", "extraCurrencies", current);
    this.render();
  }

  async _updateObject(event, formData) {
    event.preventDefault();
    const data = foundry.utils.expandObject(formData);
    const currencies = Object.values(data.currencies || {});
    await game.settings.set("5e-economy", "extraCurrencies", currencies);
  }
}
