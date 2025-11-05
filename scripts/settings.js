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

    // Adicionar nova moeda
    html.find(".new-currency").on("click", (ev) => {
      ev.preventDefault();
      this.currencies.push({
        name: "Nova Moeda",
        icon: "fa-coins",
        value: 1,
      });
      this.render(false);
    });

    // Remover moeda
    html.find(".remove-currency").on("click", (ev) => {
      ev.preventDefault();
      const index = Number(ev.currentTarget.dataset.index);
      this.currencies.splice(index, 1);
      this.render(false);
    });

    // Atualizar valores no array quando o usuário digitar
    html.find("input").on("change", (ev) => {
      const row = ev.currentTarget.closest(".currency-row, .form-group");
      const index = Array.from(row.parentElement.children).indexOf(row);
      const field = ev.currentTarget.dataset.field;
      const value = ev.currentTarget.type === "number" ? parseFloat(ev.currentTarget.value) : ev.currentTarget.value;
      this.currencies[index][field] = value;
    });
  }

  async _updateObject(_event, _formData) {
    await game.settings.set("5e-economy", "currencies", this.currencies);
    ui.notifications.info("Moedas salvas com sucesso!");
  }
}

// ===================================================
// Função que registra o menu e a configuração global
// ===================================================

export function registerSettings() {
  // Registro do objeto principal que guarda as moedas
  game.settings.register("5e-economy", "currencies", {
    name: "Moedas Personalizadas",
    scope: "world",
    config: false,
    type: Array,
    default: [],
  });

  // Adiciona o menu de configurações do Foundry
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
