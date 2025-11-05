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
// Formulário de Gerenciamento das Moedas
// ===================================================
class ManageCurrenciesForm extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "manage-currencies-form",
      title: "Gerenciar Moedas Personalizadas",
      template: "modules/5e-economy/templates/manage-currencies.html",
      width: 520,
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

    // Botão "Nova Moeda"
    html.find(".new-currency").click(ev => this._onAddCurrency(ev, html));

    // Botão de remover moeda
    html.find(".remove-currency").click(this._onRemoveCurrency.bind(this));
  }

  /** Adiciona nova linha de moeda sem recarregar o formulário */
  _onAddCurrency(event, html) {
    event.preventDefault();

    const list = html.find(".currency-list");

    // Cria a nova linha de campos
    const newRow = $(`
      <div class="form-group currency-row flexrow">
        <label>Nome</label>
        <input type="text" value="Nova Moeda" data-field="name">
        <label>Ícone</label>
        <input type="text" placeholder="ex: fa-coins" data-field="icon">
        <label>Valor (em PO)</label>
        <input type="number" step="0.01" value="1" data-field="value">
        <button type="button" class="remove-currency"><i class="fas fa-trash"></i></button>
      </div>
    `);

    // Adiciona dinamicamente ao DOM
    list.append(newRow);

    // Reanexa listener de remoção à nova linha
    newRow.find(".remove-currency").click(this._onRemoveCurrency.bind(this));
  }

  /** Remove linha da moeda */
  _onRemoveCurrency(event) {
    event.preventDefault();
    $(event.currentTarget).closest(".currency-row").remove();
  }

  /** Salva os dados no game.settings */
  async _updateObject(event, formData) {
    event.preventDefault();

    const currencies = [];
    this.element.find(".currency-row").each(function () {
      const name = $(this).find('[data-field="name"]').val() || "Nova Moeda";
      const icon = $(this).find('[data-field="icon"]').val() || "";
      const value = parseFloat($(this).find('[data-field="value"]').val()) || 1;
      currencies.push({ name, icon, value });
    });

    await game.settings.set("5e-economy", "extraCurrencies", currencies);
  }
}
