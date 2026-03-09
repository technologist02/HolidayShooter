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

function loop() {
  animationId = requestAnimationFrame(loop);

  if (input) {
    const nextX = input.applyKeyboardStep(engine.cannon.targetX);
    engine.moveTargetX(nextX);
  }

  const result = engine.step();
  updateHud();
  renderFrame();

  if (result.waveCompleted) {
    ui.showWaveAnnouncement(engine.wave);
    ui.showOverlay({
      title: `Волна ${engine.wave}`,
      sub: `Атакуют ${engine.toSpawn} ${currentMode.enemyName}`,
      mainBtnText: "Держать оборону"
    });
    overlayContext = "wave";
    if (input) input.setEnabled(false);
  }

  if (result.gameOver) {
    overlayContext = "gameOver";
    if (input) input.setEnabled(false);
    ui.showOverlay({
      title: "💥 Прорвались!",
      sub: "Сохрани результат в таблице лидеров",
      score: engine.score,
      mainBtnText: "Играть снова",
      showSaveForm: true
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
    mainBtnText: "Атака"
  });
}

function startPlaying() {
  engine.start();
  ui.hideOverlay();
  if (input) input.setEnabled(true);
  startLoop();
}

function showMenu() {
  cancelAnimationFrame(animationId);
  if (input) input.setEnabled(false);
  ui.showMenu();
}

async function saveScore() {
  const playerName = ui.getPlayerName();
  if (playerName.length < 2) {
    ui.setSaveStatus("Введите имя от 2 символов");
    return;
  }

  ui.setSaveStatus("Сохраняем...");

  try {
    await scoreService.saveScore({
      playerName,
      modeId: currentMode.id,
      score: engine.score,
      wave: engine.wave,
      endedAt: new Date().toISOString()
    });

    localStorage.setItem("holiday-shooter-player-name", playerName);
    ui.setSaveStatus("Результат сохранен");
  } catch (error) {
    ui.setSaveStatus(`Ошибка: ${error.message}`);
  }
}

ui.renderModeCards(GAME_MODES, startMode);
ui.onOverlayMain(() => {
  if (overlayContext === "gameOver") {
    startMode(currentMode.id);
    return;
  }
  startPlaying();
});
ui.onOverlayMenu(showMenu);
ui.onSaveScore(saveScore);

ui.setPlayerName(localStorage.getItem("holiday-shooter-player-name") ?? "");
window.addEventListener("resize", applySize);
window.addEventListener("orientationchange", applySize);

showMenu();
