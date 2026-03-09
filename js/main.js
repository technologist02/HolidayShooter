import { APP_CONFIG } from "./config/app-config.js";
import { GAME_MODES, getModeById } from "./config/modes.js";
import { GameEngine } from "./game/engine.js";
import { GameRenderer } from "./game/renderer.js";
import { InputController } from "./game/input.js";
import { ScoresService } from "./services/scores-service.js";
import { AppUi } from "./ui/app-ui.js";

const ui = new AppUi();
const canvas = document.getElementById("game-canvas");
const renderer = new GameRenderer(canvas);
const scoreService = new ScoresService();

let engine = new GameEngine(GAME_MODES[0]);
let input = null;
let currentMode = GAME_MODES[0];
let animationId = 0;
let overlayContext = "start";
let runStarted = false;
let runScoreSaved = false;

function isDesktopLike() {
  return window.matchMedia("(pointer:fine)").matches;
}

function applySize() {
  const rect = ui.canvasWrap.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, APP_CONFIG.maxDpr);
  renderer.resize(rect.width, rect.height, dpr);
  engine.resize(rect.width, rect.height);
  ui.updateHint(isDesktopLike());
}

function updateHud() {
  const snap = engine.getSnapshot();
  ui.updateHud({ score: snap.score, lives: snap.lives, wave: snap.wave });
}

function renderFrame() {
  const snap = engine.getSnapshot();
  renderer.draw(snap);
}

function stopInputAndLoop() {
  cancelAnimationFrame(animationId);
  if (input) input.setEnabled(false);
}

function loop() {
  animationId = requestAnimationFrame(loop);

  if (input) {
    const nextX = input.applyKeyboardStep(engine.cannon.targetX);
    engine.moveTargetX(nextX);
  }

  const result = engine.step();
  updateHud();
  renderFrame();

  if (result.bossSpawned) {
    ui.showWaveAnnouncement(`👑 Босс: ${currentMode.boss.name}`);
  }

  if (result.waveCompleted) {
    stopInputAndLoop();
    ui.showWaveAnnouncement(`🌊 Волна ${engine.wave}`);
    ui.showOverlay({
      title: `Волна ${engine.wave}`,
      sub: `Атакуют ${engine.toSpawn} ${currentMode.enemyName}`,
      mainBtnText: "Держать оборону",
      menuBtnText: "В меню",
      showSaveForm: false
    });
    overlayContext = "wave";
    return;
  }

  if (result.gameOver) {
    stopInputAndLoop();
    overlayContext = "gameOver";
    ui.showOverlay({
      title: "💥 Прорвались!",
      sub: "Сохрани результат в таблице лидеров",
      score: engine.score,
      mainBtnText: "Играть снова",
      menuBtnText: "В меню",
      showSaveForm: true,
      saveBtnText: runScoreSaved ? "Уже сохранено" : "Сохранить"
    });
  }
}

function startLoop() {
  cancelAnimationFrame(animationId);
  loop();
}

function setupInput() {
  if (input) {
    input.unbind();
  }

  input = new InputController({
    canvas,
    dragThresholdPx: APP_CONFIG.dragThresholdPx,
    onMove: (x) => engine.moveTargetX(x),
    onShoot: (x, y) => engine.shootAt(x, y)
  });

  input.bind();
  input.setEnabled(false);
}

function startMode(modeId) {
  currentMode = getModeById(modeId);
  engine = new GameEngine(currentMode);
  runStarted = false;
  runScoreSaved = false;
  ui.setTheme(currentMode);
  ui.showGame();
  applySize();
  setupInput();
  updateHud();
  renderFrame();
  overlayContext = "start";
  ui.showOverlay({
    title: "Готов?",
    sub: `Волна 1: идут ${engine.toSpawn} ${currentMode.enemyName}`,
    mainBtnText: "Атака",
    menuBtnText: "В меню"
  });
}

function startPlaying() {
  runStarted = true;
  engine.start();
  ui.hideOverlay();
  if (input) input.setEnabled(true);
  startLoop();
}

function showMenu() {
  stopInputAndLoop();
  ui.showMenu();
}

function resolveResultWave(context) {
  if (context === "waveExitSave" || context === "wave") {
    return Math.max(1, engine.wave - 1);
  }
  return Math.max(1, engine.wave);
}

async function persistScore(context = overlayContext) {
  if (runScoreSaved) {
    ui.setSaveStatus("Этот результат уже сохранен");
    return { ok: true, alreadySaved: true };
  }

  const playerName = ui.getPlayerName();
  if (playerName.length < 2) {
    ui.setSaveStatus("Введите имя от 2 символов");
    return { ok: false };
  }

  ui.setSaveStatus("Сохраняем...");

  try {
    await scoreService.saveScore({
      playerName,
      modeId: currentMode.id,
      score: engine.score,
      wave: resolveResultWave(context),
      endedAt: new Date().toISOString()
    });

    localStorage.setItem("holiday-shooter-player-name", playerName);
    runScoreSaved = true;
    ui.setSaveStatus("Результат сохранен");
    return { ok: true };
  } catch (error) {
    ui.setSaveStatus(`Ошибка: ${error.message}`);
    return { ok: false };
  }
}

function showExitSaveOverlay() {
  stopInputAndLoop();
  overlayContext = "waveExitSave";
  ui.showOverlay({
    title: "🏁 Забег завершен",
    sub: "Сохрани результат перед выходом в меню",
    score: engine.score,
    mainBtnText: "Сохранить и выйти",
    menuBtnText: "Выйти без сохранения",
    showSaveForm: true,
    saveBtnText: runScoreSaved ? "Уже сохранено" : "Сохранить"
  });
}

ui.renderModeCards(GAME_MODES, startMode);
ui.onOverlayMain(async () => {
  if (overlayContext === "gameOver") {
    startMode(currentMode.id);
    return;
  }

  if (overlayContext === "waveExitSave") {
    const result = await persistScore("waveExitSave");
    if (result.ok) showMenu();
    return;
  }

  startPlaying();
});

ui.onOverlayMenu(() => {
  if (overlayContext === "wave" && runStarted) {
    showExitSaveOverlay();
    return;
  }
  showMenu();
});

ui.onSaveScore(async () => {
  await persistScore(overlayContext);
});

ui.setPlayerName(localStorage.getItem("holiday-shooter-player-name") ?? "");
window.addEventListener("resize", applySize);
window.addEventListener("orientationchange", applySize);

showMenu();
