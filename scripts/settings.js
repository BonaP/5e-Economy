// ===================================================
// settings.js | Registro de configurações do módulo
// ===================================================

export class ManageCurrenciesForm extends FormApplication {
  constructor(...args) {
    super(...args);
    this.currencies = game.settings.get("5e-economy", "currencies") || [];
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "manage-currencies",
      title: "Gerenciar Moedas",
      template: "modules/5e-economy/templates/manage-currencies.html",
      width: 600,
      height: "auto",
      closeOnSubmit: true,
    });
  }

  getData() {
    return {
      currencies: this.currencies,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Botão "Nova Moeda"
    html.find(".new-currency").on("click", (ev) => {
      ev.preventDefault();

      // 🔹 Captura os valores atuais do formulário antes de adicionar a nova moeda
      this._collectCurrentValues(html);

      // 🔹 Adiciona uma nova moeda à lista local
      this.currencies.push({
        name: "Nova Moeda",
        icon: "fa-coins",
        value: 1,
      });

      // 🔹 Renderiza novamente preservando o estado
      this.render(false);
    });

    // Botão "Remover"
    html.find(".remove-currency").on("click", (ev) => {
      ev.preventDefault();
      const index = Number(ev.currentTarget.dataset.index);

      this._collectCurrentValues(html);
      this.currencies.splice(index, 1);
      this.render(false);
    });

    // Atualiza o array local conforme o usuário digita
    html.find("input").on("change", (ev) => {
      const row = ev.currentTarget.closest(".currency-row, .form-group");
      const index = Array.from(row.parentElement.children).indexOf(row);
      const field = ev.currentTarget.dataset.field;
      const value = ev.currentTarget.type === "number" ? parseFloat(ev.currentTarget.value) : ev.currentTarget.value;
      this.currencies[index][field] = value;
    });
  }

  /** 🔹 Função que coleta os valores atuais do formulário */
  _collectCurrentValues(html) {
    const rows = html.find(".currency-row, .form-group");
    const updated = [];

    rows.each((i, row) => {
      const name = row.querySelector('[data-field="name"]')?.value || "Nova Moeda";
      const icon = row.querySelector('[data-field="icon"]')?.value || "fa-coins";
      const value = parseFloat(row.querySelector('[data-field="value"]')?.value) || 1;
      updated.push({ name, icon, value });
    });

    this.currencies = updated;
  }

  async _updateObject(_event, _formData) {
    // Antes de salvar, garante que os últimos valores foram coletados
    this._collectCurrentValues(this.element);
    await game.settings.set("5e-economy", "currencies", this.currencies);
    ui.notifications.info("Moedas salvas com sucesso!");
  }
}

// ===================================================
// Função que registra o menu e a configuração global
// ===================================================

export function registerSettings() {
  game.settings.register("5e-economy", "currencies", {
    name: "Moedas Personalizadas",
    scope: "world",
    config: false,
    type: Array,
    default: [],
  });

  game.settings.registerMenu("5e-economy", "manageCurrencies", {
    name: "Gerenciar Moedas",
    label: "Abrir Gerenciador",
    hint: "Adicione, remova ou edite moedas personalizadas usadas no mundo.",
    icon: "fas fa-coins",
    type: ManageCurrenciesForm,
    restricted: true,
  });

  console.log("5e-economy | Configurações registradas.");
}
