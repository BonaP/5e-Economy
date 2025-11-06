// ===================================================
// settings.js | Registro de configurações do módulo
// ===================================================

export class ManageCurrenciesForm extends FormApplication {
  constructor(...args) {
    super(...args);
    this.currencies = foundry.utils.duplicate(game.settings.get("5e-economy", "currencies")) || [];
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
    return { currencies: this.currencies };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // 🪙 Adicionar nova moeda
    html.find(".new-currency").on("click", async (ev) => {
      ev.preventDefault();

      // Captura o estado atual do formulário antes de adicionar
      this._collectCurrentValues(html);

      // Adiciona nova moeda
      this.currencies.push({
        name: "Nova Moeda",
        icon: "fa-coins",
        value: 1,
      });

      // Atualiza o settings para manter persistência imediata
      await game.settings.set("5e-economy", "currencies", this.currencies);

      // Força re-render completo (garante atualização imediata)
      this.render(true);
    });

    // 🗑️ Remover moeda
    html.find(".remove-currency").on("click", async (ev) => {
      ev.preventDefault();
      const index = Number(ev.currentTarget.dataset.index);

      this._collectCurrentValues(html);
      this.currencies.splice(index, 1);
      await game.settings.set("5e-economy", "currencies", this.currencies);

      this.render(true);
    });

    // 📝 Atualizar conforme digitação
    html.find("input").on("input change", (ev) => {
      const row = ev.currentTarget.closest(".currency-row, .form-group");
      const index = Array.from(row.parentElement.children).indexOf(row);
      const field = ev.currentTarget.dataset.field;
      const value = ev.currentTarget.type === "number" ? parseFloat(ev.currentTarget.value) : ev.currentTarget.value;
      this.currencies[index][field] = value;
    });
  }

  /** Captura valores atuais digitados */
  _collectCurrentValues(html) {
    const rows = html[0].querySelectorAll(".currency-row, .form-group");
    const updated = [];

    rows.forEach((row) => {
      const name = row.querySelector('[data-field="name"]')?.value || "Nova Moeda";
      const icon = row.querySelector('[data-field="icon"]')?.value || "fa-coins";
      const value = parseFloat(row.querySelector('[data-field="value"]')?.value) || 1;
      updated.push({ name, icon, value });
    });

    thi
