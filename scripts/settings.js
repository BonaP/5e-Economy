// ===================================================
// settings.js | Registro de configurações do módulo
// ===================================================

export class ManageCurrenciesForm extends FormApplication {
    // ... (restante do construtor e defaultOptions) ...

    constructor(...args) {
        super(...args);
        // Garante que this.currencies está sempre inicializado com a configuração atual
        this.currencies = foundry.utils.duplicate(game.settings.get("5e-economy", "currencies")) || [];
    }
    
    // ... (getData) ...

    activateListeners(html) {
        super.activateListeners(html);

        // 🪙 Adicionar nova moeda
        html.find(".new-currency").on("click", async (ev) => {
            ev.preventDefault();

            // 1. **COLETA CORRETA**: Captura o estado atual do formulário e ATUALIZA this.currencies
            this._collectCurrentValues(html); 

            // 2. Adiciona nova moeda (o texto digitado está agora em this.currencies)
            this.currencies.push({
                name: "Nova Moeda",
                icon: "fa-coins",
                value: 1,
            });

            // 3. Opcional, mas mantém a persistência imediata
            await game.settings.set("5e-economy", "currencies", this.currencies);

            // 4. Força re-render completo com os dados atualizados (this.currencies)
            // Agora, o re-render usará os dados capturados E a nova linha.
            this.render(true);
        });

        // ... (restante de remove-currency) ...
        
        // 📝 Atualizar conforme digitação (Mantenha este listener)
        html.find("input").on("input change", (ev) => {
            const row = ev.currentTarget.closest(".currency-row"); // Use apenas .currency-row se for o seletor correto
            if (!row) return; // Adicione esta verificação de segurança

            // Nota: O index deve ser calculado a partir dos 'currency-list' children.
            // Se o HTML tem apenas .currency-row dentro do .currency-list, use:
            const index = Array.from(row.parentElement.children).indexOf(row);
            
            const field = ev.currentTarget.dataset.field;
            const value = ev.currentTarget.type === "number" ? parseFloat(ev.currentTarget.value) : ev.currentTarget.value;
            
            // Certifique-se que o índice existe
            if (this.currencies[index] && field) {
                 this.currencies[index][field] = value;
            }
        });
    }

    /** Captura valores atuais digitados e ATUALIZA this.currencies */
    _collectCurrentValues(html) {
        const rows = html[0].querySelectorAll(".currency-row"); // Garanta que o seletor é o correto
        const updated = [];

        rows.forEach((row) => {
            const name = row.querySelector('[data-field="name"]')?.value || "Nova Moeda";
            const icon = row.querySelector('[data-field="icon"]')?.value || "fa-coins";
            const value = parseFloat(row.querySelector('[data-field="value"]')?.value) || 1;
            updated.push({ name, icon, value });
        });

        // **A CHAVE:** ATUALIZA A VARIÁVEL DE ESTADO DO FORMULÁRIO
        this.currencies = updated; 
    }
    
    // ... (restante da classe, como _updateObject)
}
