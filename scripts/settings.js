// ===================================================
// settings.js | Registro de configurações do módulo
// ===================================================

export class ManageCurrenciesForm extends FormApplication {
  constructor(...args) {
    super(...args);
    // Inicializa o estado interno com a configuração
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
    // Retorna o estado interno, que será atualizado antes de cada render
    return { currencies: this.currencies };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // 🪙 Adicionar nova moeda
    html.find(".new-currency").on("click", async (ev) => {
      ev.preventDefault();
      
      // 1. **COLETA E ATUALIZAÇÃO**: Coleta dados do DOM e atualiza o estado interno (this.currencies)
      // Usamos 'this.element' (a referência jQuery do formulário) para garantir o escopo correto.
      this.currencies = this._collectCurrentValues(this.element);

      // 2. Adiciona nova moeda ao estado interno já atualizado
      this.currencies.push({
        name: "Nova Moeda",
        icon: "fa-coins",
        value: 1,
      });

      // 3. Força re-render completo (usará a lista atualizada com o novo item e os textos preservados)
      this.render(true);
    });

    // 🗑️ Remover moeda
    html.find(".remove-currency").on("click", async (ev) => {
      ev.preventDefault();
      const index = Number(ev.currentTarget.dataset.index);

      // 1. Coleta dados do DOM e atualiza o estado interno
      this.currencies = this._collectCurrentValues(this.element);
      
      // 2. Remove do estado interno
      this.currencies.splice(index, 1);
      
      // 3. Força re-render
      this.render(true);
    });
    
    // **IMPORTANTE**: O listener 'input change' foi removido para simplificar a lógica
    // e forçar a coleta de dados apenas no momento necessário (clique em "Nova Moeda" ou "Remover").
  }

  /** * Captura valores atuais digitados do DOM e retorna o array atualizado.
   * Recebe o elemento jQuery ou DOM para garantir o escopo.
   */
  _collectCurrentValues(element) {
    // Converte a referência do elemento para DOM se for jQuery (this.element é jQuery)
    const domElement = element instanceof jQuery ? element[0] : element;
    
    const rows = domElement.querySelectorAll(".currency-row");
    const updated = [];

    rows.forEach((row) => {
      const name = row.querySelector('[data-field="name"]')?.value || "Nova Moeda";
      const icon = row.querySelector('[data-field="icon"]')?.value || "fa-coins";
      // Usa o Foundry's casting para garantir o tipo correto
      const value = parseFloat(row.querySelector('[data-field="value"]')?.value) || 1.0; 
      updated.push({ name, icon, value });
    });
    
    // Retorna a nova lista de moedas
    return updated;
  }

  /** Método obrigatório que é chamado ao submeter (clicar em Salvar) */
  async _updateObject(event, formData) {
      // Garante que o estado interno 'this.currencies' reflete o último digitado no DOM antes de salvar
      this.currencies = this._collectCurrentValues(this.element);
      
      // Salva a lista final
      await game.settings.set("5e-economy", "currencies", this.currencies);
  }
}
