// ===================================================
// settings.js | Registro de configurações do módulo
// ===================================================

export class ManageCurrenciesForm extends FormApplication {
  constructor(...args) {
    super(...args);
    // O 'currencies' agora terá apenas 'name' e 'icon' (e talvez um 'value' se estiver salvo, mas o HTML não o renderiza)
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
      
      this.currencies = this._collectCurrentValues(this.element);

      // ALTERADO: Remoção do campo 'value'
      this.currencies.push({
        name: "Nova Moeda",
        icon: "fa-coins", // Valor padrão para o ícone
      });

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
    
    // O listener de input change foi removido na última correção, o que é bom.
  }

  /** * Captura valores atuais digitados do DOM e retorna o array atualizado. */
  _collectCurrentValues(element) {
    const domElement = element instanceof jQuery ? element[0] : element;
    
    const rows = domElement.querySelectorAll(".currency-row");
    const updated = [];

    rows.forEach((row) => {
      const name = row.querySelector('[data-field="name"]')?.value || "Nova Moeda";
      const icon = row.querySelector('[data-field="icon"]')?.value || "fa-coins"; // Mantém o ícone
      
      // REMOVIDO: Coleta do campo 'value'
      
      updated.push({ name, icon }); // Objeto agora tem apenas 'name' e 'icon'
    });
    
    return updated;
  }

  /** Método obrigatório que é chamado ao submeter (clicar em Salvar) */
  async _updateObject(event, formData) {
      this.currencies = this._collectCurrentValues(this.element);
      
      // Remove a propriedade 'value' de todos os objetos antes de salvar, 
      // caso o game.settings.get("5e-economy", "currencies") ainda contenha dados antigos.
      const cleanedCurrencies = this.currencies.map(({ name, icon }) => ({ name, icon }));
      
      await game.settings.set("5e-economy", "currencies", cleanedCurrencies);
  }
}
