import { registerEconomySettings } from "./settings.js";

Hooks.once("init", () => {
  console.log("5E Economy | Inicializando módulo de economia personalizada");
  registerEconomySettings();
});

Hooks.on("renderActorSheet5eCharacter", (sheet, html) => {
  const actor = sheet.actor;
  const currencies = game.settings.get("5e-economy", "currencies") || [];

  if (!currencies.length) return;

  const currencySection = html.find(".currency");
  if (!currencySection.length) return;

  // Adiciona cada moeda personalizada à ficha
  currencies.forEach(cur => {
    const key = cur.name.toLowerCase().replace(/\s+/g, "_");
    if (!actor.system.currency[key]) actor.system.currency[key] = 0;

    const newRow = $(`
      <div class="currency-item flexrow" data-currency="${key}">
        <label>${cur.name} (${cur.abbr})</label>
        <input type="number" name="system.currency.${key}" 
               value="${actor.system.currency[key] || 0}" data-dtype="Number"/>
        <span class="conversion">(1 ${cur.abbr} = ${cur.value} gp)</span>
      </div>
    `);

    currencySection.append(newRow);
  });
});
