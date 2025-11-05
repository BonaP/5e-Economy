// ===================================================
// 5e-economy | settings.js (versão robusta)
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
      width: 640,
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

    // Use delegation sobre this.element (mais confiável)
    // Observação: this.element é um jQuery wrapper do root element do FormApplication
    this.element.on("click", ".new-currency", this._onAddCurrency.bind(this));
    this.element.on("click", ".remove-currency", this._onRemoveCurrency.bind(this));

    // Opcional: log para debug
    console.debug("5e-economy | activateListeners attached");
  }

  /** Cria a estrutura DOM de uma linha de moeda */
  _createCurrencyRow(data = { name: "Nova Moeda", icon: "", value: 1 }) {
    const escapedName = Handlebars.Utils.escapeExpression(data.name || "Nova Moeda");
    const escapedIcon = Handlebars.Utils.escapeExpression(data.icon || "");
    const val = Number.isFinite(Number(data.value)) ? Number(data.value) : 1;

    const $row = $(`
      <div class="form-group currency-row flexrow" style="align-items:center; gap:8px; margin-bottom:8px;">
        <label style="width:70px; margin:0;">Nome</label>
        <input type="text" class="currency-name" value="${escapedName}" data-field="name" style="flex:1;" placeholder="Nome da moeda">
        <label style="width:60px; margin:0;">Ícone</label>
        <input type="text" class="currency-icon" value="${escapedIcon}" data-field="icon" style="width:140px;" placeholder="ex: fa-coins ou caminho.png">
        <label style="width:80px; margin:0;">Valor (PO)</label>
        <input type="number" class="currency-value" data-field="value" value="${val}" step="0.01" style="width:100px;">
        <button type="button" class="remove-currency" title="Remover" style="margin-left:6px;">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `);
    return $row;
  }

  /** Handler: adiciona nova linha dinamicamente sem re-render */
  _onAddCurrency(event) {
    event.preventDefault();
    console.debug("5e-economy | _onAddCurrency clicked");

    // Encontra o container (usamos this.element, que é confiável)
    const $list = this.element.find(".currency-list");
    if (!$list.length) {
      console.warn("5e-economy | currency-list não encontrado no template");
      return;
    }

    // Cria a linha e anexa
    const $row = this._createCurrencyRow({ name: "Nova Moeda", icon: "", value: 1 });
    $list.append($row);

    // Foca no input do nome para permitir edição imediata
    $row.find('.currency-name').focus();

    // Não chamamos this.render() aqui — salvamos somente quando o usuário clicar em Salvar
  }

  /** Handler: remove linha */
  _onRemoveCurrency(event) {
    event.preventDefault();
    const $btn = $(event.currentTarget);
    const $row = $btn.closest(".currency-row");
    if ($row.length) {
      $row.remove();
    }
  }

  /** Coleta todos os valores visíveis no formulário (incluindo linhas adicionadas dinamicamente) */
  _collectFormValues() {
    const values = [];
    this.element.find(".currency-row").each(function () {
      const $row = $(this);
      const name = $row.find('[data-field="name"]').val() ?? "Nova Moeda";
      const icon = $row.find('[data-field="icon"]').val() ?? "";
      const valueRaw = $row.find('[data-field="value"]').val();
      const value = (valueRaw === "" || valueRaw === undefined) ? 1 : parseFloat(valueRaw);
      values.push({ name, icon, value });
    });
    return values;
  }

  /** Salva no game.settings quando o formulário é submetido */
  async _updateObject(event, formData) {
    event.preventDefault();

    // Em vez de confiar somente no formData (que pode não conter inputs dinâmicos),
    // lemos o DOM (coleta robusta)
    const currencies = this._collectFormValues();
    console.debug("5e-economy | Salvando moedas:", currencies);

    await game.settings.set("5e-economy", "extraCurrencies", currencies);

    // opcional: notificação
    ui.notifications.info("Moedas salvas.");
  }
}
