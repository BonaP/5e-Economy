Hooks.once("init", () => {
  console.log("5e-economy | Initializing custom economy module");

  // Registrar menu e configuração
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
    return {
      currencies: game.settings.get("5e-economy", "extraCurrencies") || []
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Corrige a classe do botão ("new-currency" em vez de "add-currency")
    html.find(".new-currency").click(this._onAddCurrency.bind(this));
    html.find(".remove-currency").click(this._onRemoveCurrency.bind(this));
  }

  _onAddCurrency(event) {
    event.preventDefault();

    // Em vez de renderizar de novo, adicionamos a linha direto no DOM
    const $list = $(event.currentTarget).closest("form").find(".currency-list");
    const $row = $(`
      <div class="form-group currency-row flexrow">
        <label>Nome</label>
        <input type="text" value="Nova Moeda" data-field="name">
        <label>Ícone</label>
        <input type="text" value="" data-field="icon" placeholder="ex: fa-coins">
        <label>Valor (em PO)</label>
        <input type="number" step="0.01" value="1" data-field="value">
        <button type="button" class="remove-currency">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `);

    // Anexa a nova linha e reativa o botão de remover nela
    $list.append($row);
    $row.find(".remove-currency").click(this._onRemoveCurrency.bind(this));
  }

  _onRemoveCurrency(event) {
    event.preventDefault();
    $(event.currentTarget).closest(".currency-row").remove();
  }

  async _updateObject(event, formData) {
    event.preventDefault();

    // Coletar todos os dados do formulário (inclusive linhas novas)
    const currencies = [];
    $(event.currentTarget).closest("form").find(".currency-row").each(function () {
      const name = $(this).find('[data-field="name"]').val() || "Nova Moeda";
      const icon = $(this).find('[data-field="icon"]').val() || "";
      const value = parseFloat($(this).find('[data-field="value"]').val()) || 1;
      currencies.push({ name, icon, value });
    });

    await game.settings.set("5e-economy", "extraCurrencies", currencies);
    ui.notifications.info("Moedas salvas com sucesso!");
  }
}
