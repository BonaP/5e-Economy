// ===================================================
// settings.js | Registro de configurações do módulo
// ===================================================

export class ManageCurrenciesForm extends FormApplication {
  constructor(...args) {
    super(...args);
    // Inicializa com a configuração atual, garantindo que o estado interno do formulário reflita a configuração
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
    // Usa o estado interno atualizado (this.currencies) para renderizar
    return { currencies: this.currencies };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // 🪙 Adicionar nova moeda
    html.find(".new-currency").on("click", async (ev) => {
      ev.preventDefault();

      // 1. Captura o estado atual do formulário (valores digitados) e ATUALIZA this.currencies
      this._collectCurrentValues(html);

      // 2. Adiciona a nova moeda ao array interno atualizado
      this.currencies.push({
        name: "Nova Moeda",
        icon: "fa-coins",
        value: 1,
      });

      // 3. Força re-render completo (garante atualização imediata e preservação dos dados)
      this.render(true);

      // A chamada ao settings.set foi removida daqui, pois ela só deve acontecer ao salvar 
      // ou após o render, para evitar salvar um estado inconsistente.
    });

    // 🗑️ Remover moeda
    html.find(".remove-currency").on("click", async (ev) => {
      ev.preventDefault();
      const index = Number(ev.currentTarget.dataset.index);

      // Garante que os valores atuais são capturados antes da remoção
      this._collectCurrentValues(html);
      
      this.currencies.splice(index, 1);
      
      // O render fará o update, e o _updateObject cuidará do save final
      this.render(true);
    });
    
    // 📝 Atualizar conforme digitação: Apenas para manter o estado interno (this.currencies) 
    // enquanto o usuário digita.
    html.find("input").on("input change", (ev) => {
      // Encontra o índice dentro da lista de moedas
      const rows = html.find(".currency-list .currency-row");
      const row = ev.currentTarget.closest(".currency-row");
      const index = Array.from(rows).indexOf(row);
      
      const field = ev.currentTarget.dataset.field;
      const value = ev.currentTarget.type === "number" ? parseFloat(ev.currentTarget.value) : ev.currentTarget.value;
      
      if (this.currencies[index] && field) {
         this.currencies[index][field] = value;
      }
    });
  }

  /** * Captura valores atuais digitados do DOM e ATUALIZA o estado interno (this.currencies). 
   * Esta é a chave para a persistência do texto.
   */
  _collectCurrentValues(html) {
    const rows = html[0].querySelectorAll(".currency-row");
    const updated = [];

    rows.forEach((row) => {
      const name = row.querySelector('[data-field="name"]')?.value || "Nova Moeda";
      const icon = row.querySelector('[data-field="icon"]')?.value || "fa-coins";
      // Não esqueça do fallback para 1.0 se for NaN
      const value = parseFloat(row.querySelector('[data-field="value"]')?.value) || 1.0; 
      updated.push({ name, icon, value });
    });

    // ATUALIZA O ESTADO INTERNO
    this.currencies = updated;
  }
  
  /** Método obrigatório para FormApplication (salva o objeto) */
  async _updateObject(event, formData) {
      // Garante que o último estado digitado é salvo (embora o listener 'input change' já ajude)
      this._collectCurrentValues(this.element); 
      
      // Salva no game settings
      await game.settings.set("5e-economy", "currencies", this.currencies);
  }
}
