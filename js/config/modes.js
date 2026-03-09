export const GAME_MODES = [
  {
    id: "march",
    title: "8 Марта",
    subtitle: "Стреляй букетами по волнам мужчин",
    menuEmoji: "💐",
    cardClass: "mode-march",
    theme: { bg: "#150810", accent: "#e8346a", glow: "#ff4d8d", card: "linear-gradient(135deg,#c41a5e,#ff6b35)" },
    projectile: "💐",
    enemies: ["👨", "👴", "🧔", "👨‍🦱", "👨‍🦲", "🕵️", "👮‍♂️", "🧑‍🦲"],
    enemyName: "мужчин",
    difficulty: { baseLives: 5, startWave: 1 }
  },
  {
    id: "feb",
    title: "23 Февраля",
    subtitle: "Стреляй носками по волнам женщин",
    menuEmoji: "🧦",
    cardClass: "mode-feb",
    theme: { bg: "#080e1a", accent: "#2b6cf0", glow: "#5b9bff", card: "linear-gradient(135deg,#1a3fcf,#0099cc)" },
    projectile: "🧦",
    enemies: ["👩", "👩‍🦱", "👩‍🦰", "👩‍🦳", "💃", "🧕", "👸", "🧑"],
    enemyName: "женщин",
    difficulty: { baseLives: 5, startWave: 1 }
  },
  {
    id: "new-year",
    title: "Новый год",
    subtitle: "Бросай снежки в праздничный десант",
    menuEmoji: "🎄",
    cardClass: "mode-ny",
    theme: { bg: "#071424", accent: "#14b8a6", glow: "#77f2e6", card: "linear-gradient(135deg,#0f766e,#14b8a6)" },
    projectile: "❄️",
    enemies: ["🎅", "🧌", "👹", "🦌", "🎁", "🧙", "👾", "🛸"],
    enemyName: "праздничных целей",
    difficulty: { baseLives: 6, startWave: 1 }
  },
  {
    id: "valentine",
    title: "14 Февраля",
    subtitle: "Запускай сердца и держи линию",
    menuEmoji: "💝",
    cardClass: "mode-val",
    theme: { bg: "#1a0b18", accent: "#f43f86", glow: "#ff8fb9", card: "linear-gradient(135deg,#be185d,#f43f86)" },
    projectile: "💘",
    enemies: ["😈", "💔", "🫠", "🙀", "👺", "👻", "🕷️", "🧛"],
    enemyName: "сердцеедов",
    difficulty: { baseLives: 5, startWave: 1 }
  }
];

export function getModeById(modeId) {
  return GAME_MODES.find((mode) => mode.id === modeId) ?? GAME_MODES[0];
}
