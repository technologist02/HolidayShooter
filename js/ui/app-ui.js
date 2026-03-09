export class AppUi {
  constructor() {
    this.menu = document.getElementById("menu");
    this.modeCards = document.getElementById("mode-cards");
    this.gameScreen = document.getElementById("game-screen");
    this.canvasWrap = document.getElementById("canvas-wrap");

    this.scoreVal = document.getElementById("score-val");
    this.livesVal = document.getElementById("lives-val");
    this.waveVal = document.getElementById("wave-num");
    this.hint = document.getElementById("hint");

    this.waveAnn = document.getElementById("wave-ann");
    this.overlay = document.getElementById("overlay");
    this.overlayTitle = document.getElementById("overlay-title");
    this.overlaySub = document.getElementById("overlay-sub");
    this.overlayScore = document.getElementById("overlay-score");
    this.overlayMainBtn = document.getElementById("overlay-main-btn");
    this.overlayMenuBtn = document.getElementById("overlay-menu-btn");
    this.scoreForm = document.getElementById("score-form");
    this.playerName = document.getElementById("player-name");
    this.saveScoreBtn = document.getElementById("save-score-btn");
    this.overlayStatus = document.getElementById("overlay-status");
  }

  renderModeCards(modes, onSelect) {
    this.modeCards.innerHTML = "";
    for (const mode of modes) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "mode-card";
      card.style.background = mode.theme.card;
      card.innerHTML = `
        <span class="mode-emoji">${mode.menuEmoji}</span>
        <span>
          <div class="mode-title">${mode.title}</div>
          <div class="mode-sub">${mode.subtitle}</div>
        </span>
        <span class="mode-arrow">›</span>
      `;
      card.addEventListener("click", () => onSelect(mode.id));
      this.modeCards.append(card);
    }
  }

  showMenu() {
    this.menu.style.display = "flex";
    this.gameScreen.style.display = "none";
  }

  showGame() {
    this.menu.style.display = "none";
    this.gameScreen.style.display = "flex";
  }

  updateHud({ score, lives, wave }) {
    this.scoreVal.textContent = String(score);
    this.livesVal.textContent = String(lives);
    this.waveVal.textContent = String(wave);
  }

  updateHint(isDesktop) {
    this.hint.textContent = isDesktop
      ? "Click/Space: выстрел • Mouse/A,D/←,→: движение"
      : "Tap: выстрел • Drag: движение";
  }

  showWaveAnnouncement(wave) {
    this.waveAnn.textContent = `🌊 Волна ${wave}`;
    this.waveAnn.style.opacity = "1";
    window.setTimeout(() => {
      this.waveAnn.style.opacity = "0";
    }, 1400);
  }

  showOverlay({ title, sub, score = null, mainBtnText, showSaveForm = false, status = "" }) {
    this.overlayTitle.textContent = title;
    this.overlaySub.textContent = sub;
    this.overlayMainBtn.textContent = mainBtnText;
    this.overlayStatus.textContent = status;

    if (score === null) {
      this.overlayScore.classList.add("hidden");
    } else {
      this.overlayScore.classList.remove("hidden");
      this.overlayScore.textContent = `${score} очков`;
    }

    this.scoreForm.classList.toggle("show", showSaveForm);
    this.overlay.classList.add("show");
  }

  hideOverlay() {
    this.overlay.classList.remove("show");
    this.overlayStatus.textContent = "";
  }

  setTheme(mode) {
    document.documentElement.style.setProperty("--bg", mode.theme.bg);
    this.overlayMainBtn.style.background = mode.theme.card;
  }

  onOverlayMain(handler) {
    this.overlayMainBtn.addEventListener("click", handler);
  }

  onOverlayMenu(handler) {
    this.overlayMenuBtn.addEventListener("click", handler);
  }

  onSaveScore(handler) {
    this.saveScoreBtn.addEventListener("click", handler);
  }

  getPlayerName() {
    return this.playerName.value.trim();
  }

  setPlayerName(name) {
    this.playerName.value = name;
  }

  setSaveStatus(status) {
    this.overlayStatus.textContent = status;
  }
}
