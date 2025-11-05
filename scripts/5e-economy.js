// ===================================================
// 5e-economy.js | Script principal do módulo
// ===================================================

import { registerSettings } from "./settings.js";

Hooks.once("init", () => {
  console.log("5e-economy | Inicializando módulo de economia personalizada");
  registerSettings();
});

Hooks.once("ready", () => {
  console.log("5e-economy | 5e Economy pronto!");
});
