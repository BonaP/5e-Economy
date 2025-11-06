// ===================================================
// settings.js | Registro de configurações do módulo
// ===================================================

export class ManageCurrenciesForm extends FormApplication {
  constructor(...args) {
    super(...args);
    // Usa o setting 'currencies' (provavelmente o setting padrão, não 'extraCurrencies')
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
      
      // 1. Coleta o estado atual do DOM para preservar o texto digitado
      this.currencies = this._collectCurrentValues(this.element);

      // 2. Adiciona a nova moeda
      this.currencies.push({
        name: "Nova Moeda",
        icon: "fa-coins",
      });

      // 3. Re-renderiza para mostrar o novo item
      this.render(true);
    });

    // 🗑️ Remover moeda
    html.find(".remove-currency").on("click", async (ev) => {
      ev.preventDefault();
      const index = Number(ev.currentTarget.dataset.index);

      this.currencies = this._collectCurrentValues(this.element);
      
      this.currencies.splice(index, 1);
      
      this.render(true);
    });
  }

  /** * Captura valores atuais digitados do DOM e retorna o array atualizado. */
  _collectCurrentValues(element) {
    const domElement = element instanceof jQuery ? element[0] : element;
    
    const rows = domElement.querySelectorAll(".currency-row");
    const updated = [];

    rows.forEach((row) => {
      const name = row.querySelector('[data-field="name"]')?.value || "Nova Moeda";
      const icon = row.querySelector('[data-field="icon"]')?.value || "fa-coins";
      
      updated.push({ name, icon }); 
    });
    
    return updated;
  }

  /** Método obrigatório que é chamado ao submeter (clicar em Salvar) */
  async _updateObject(event, formData) {
      // Garante a coleta final do DOM antes de salvar
      this.currencies = this._collectCurrentValues(this.element);
      
      // Garante que apenas 'name' e 'icon' sejam salvos
      const cleanedCurrencies = this.currencies.map(({ name, icon }) => ({ name, icon }));
      
      // Usa o setting 'currencies' (como no construtor)
      await game.settings.set("5e-economy", "currencies", cleanedCurrencies);
  }
}
