import { GAME_MODES } from "../config/modes.js";

const modeMap = new Map(GAME_MODES.map((mode) => [mode.id, mode.title]));

function formatDate(input) {
  const dt = new Date(input);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
}

function renderItems(container, entries) {
  container.innerHTML = "";
  if (!entries.length) {
    container.innerHTML = "<div class='score-item'>Пока нет данных</div>";
    return;
  }

  entries.forEach((entry, idx) => {
    const modeTitle = entry.modeTitle ?? modeMap.get(entry.modeId) ?? entry.modeId ?? "-";
    const item = document.createElement("div");
    item.className = "score-item";
    item.innerHTML = `
      <div class="score-rank">#${idx + 1}</div>
      <div>
        <div>${entry.playerName} · ${entry.score}</div>
        <div class="score-meta">${modeTitle} · волна ${entry.wave} · ${formatDate(entry.endedAt)}</div>
      </div>
      <div>🏆</div>
    `;
    container.append(item);
  });
}

export function initStatsPage({ scoreService }) {
  const topList = document.getElementById("top-list");
  const recentList = document.getElementById("recent-list");
  const modeFilter = document.getElementById("mode-filter");

  modeFilter.innerHTML = `<option value="">Все режимы</option>${GAME_MODES.map((m) => `<option value="${m.id}">${m.title}</option>`).join("")}`;

  async function refresh() {
    const modeId = modeFilter.value || null;
    try {
      const [top, recent] = await Promise.all([
        scoreService.getTopScores(modeId),
        scoreService.getRecentScores(modeId)
      ]);
      renderItems(topList, top.items ?? []);
      renderItems(recentList, recent.items ?? []);
    } catch {
      topList.innerHTML = "<div class='score-item'>Ошибка загрузки</div>";
      recentList.innerHTML = "<div class='score-item'>Проверьте API</div>";
    }
  }

  modeFilter.addEventListener("change", refresh);
  refresh();
}
