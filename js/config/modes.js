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
    difficulty: { baseLives: 5, startWave: 1 },
    boss: {
      emoji: "🤦‍♂️",
      name: "Непробиваемый Галант",
      baseHp: 16,
      hpPerWave: 2,
      baseSpeed: 0.42,
      speedPerWave: 0.04,
      hpBarColor: "#ff77a8",
      deathBonus: 260,
      counterAttack: {
        emoji: "💩",
        speed: 5.2,
        cooldownFrames: 130
      }
    }
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
    difficulty: { baseLives: 5, startWave: 1 },
    boss: {
      emoji: "👸",
      name: "Железная Леди",
      baseHp: 16,
      hpPerWave: 2,
      baseSpeed: 0.44,
      speedPerWave: 0.04,
      hpBarColor: "#77a4ff",
      deathBonus: 260,
      counterAttack: {
        emoji: "💩",
        speed: 5.4,
        cooldownFrames: 125
      }
    }
  },
  {
    id: "new-year",
    title: "Новый год",
    subtitle: "Мандариновый обстрел по новогодним волнам",
    menuEmoji: "🎄",
    cardClass: "mode-ny",
    theme: { bg: "#071424", accent: "#14b8a6", glow: "#77f2e6", card: "linear-gradient(135deg,#0f766e,#14b8a6)" },
    projectile: "🍊",
    enemies: ["👨", "👩", "👴", "👵", "🧔", "👩‍🦱", "🧑", "👨‍🦰"],
    enemyName: "праздношатающихся",
    difficulty: { baseLives: 6, startWave: 1 },
    boss: {
      emoji: "🎅",
      name: "Дед Мороз",
      baseHp: 18,
      hpPerWave: 2,
      baseSpeed: 0.35,
      speedPerWave: 0.035,
      hpBarColor: "#ff9a36",
      deathBonus: 320,
      counterAttack: {
        emoji: "🧦",
        speed: 4.8,
        cooldownFrames: 120
      },
      behavior: "new-year"
    }
  },
  {
    id: "valentine",
    title: "14 Февраля",
    subtitle: "Сердечная атака по слишком счастливой толпе",
    menuEmoji: "💝",
    cardClass: "mode-val",
    theme: { bg: "#1a0b18", accent: "#f43f86", glow: "#ff8fb9", card: "linear-gradient(135deg,#be185d,#f43f86)" },
    projectile: "❤️",
    enemies: ["👨", "👩", "👦", "👧", "💁‍♂️", "💁‍♀️", "👫", "👩‍❤️‍👨"],
    enemyName: "влюбленных",
    difficulty: { baseLives: 5, startWave: 1 },
    boss: {
      emoji: "🙍",
      name: "Грусть тоска",
      baseHp: 17,
      hpPerWave: 2,
      baseSpeed: 0.34,
      speedPerWave: 0.04,
      hpBarColor: "#ff4d6d",
      deathBonus: 320,
      counterAttack: {
        emoji: "💩",
        speed: 5.0,
        cooldownFrames: 118
      },
      behavior: "valentine"
    }
  }
];

export function getModeById(modeId) {
  return GAME_MODES.find((mode) => mode.id === modeId) ?? GAME_MODES[0];
}
