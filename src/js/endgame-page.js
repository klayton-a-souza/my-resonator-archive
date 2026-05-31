const endgameCycleStorageKey = "ww-endgame-cycles";
const endgameProgressStorageKey = "ww-endgame-progress";
let endgameCountdownInterval = null;

function loadEndgameCycles() {
  try {
    const savedCycles = localStorage.getItem(endgameCycleStorageKey);

    return savedCycles ? JSON.parse(savedCycles) : {};
  } catch {
    return {};
  }
}

function saveEndgameCycles(cycles) {
  try {
    localStorage.setItem(endgameCycleStorageKey, JSON.stringify(cycles));
  } catch {
    return;
  }
}

function loadEndgameProgress() {
  try {
    const savedProgress = localStorage.getItem(endgameProgressStorageKey);

    return savedProgress ? JSON.parse(savedProgress) : {};
  } catch {
    return {};
  }
}

function saveEndgameProgress(progressByMode) {
  try {
    localStorage.setItem(endgameProgressStorageKey, JSON.stringify(progressByMode));
  } catch {
    return;
  }
}

function getEndgameModeKey(mode) {
  return mode.key || mode.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function getModeProgress(mode, progressByMode) {
  const savedProgress = progressByMode[getEndgameModeKey(mode)] || {};

  return {
    current: Number.isFinite(Number(savedProgress.current))
      ? Number(savedProgress.current)
      : mode.progress?.current || 0,
    total: Number.isFinite(Number(savedProgress.total))
      ? Number(savedProgress.total)
      : mode.progress?.total || 1,
  };
}

function getEndgameProgressPercent(progress) {
  const current = progress.current || 0;
  const total = progress.total || 1;

  return Math.min(Math.round((current / total) * 100), 100);
}

function getEndgameTimer(mode) {
  const endTime = new Date(mode.cycle?.end).getTime();

  if (!Number.isFinite(endTime)) {
    return mode.timer || "";
  }

  const remainingMs = endTime - Date.now();

  if (remainingMs <= 0) {
    return "Finalizado";
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const roundedMs =
    mode.cycle?.rounding === "ceil"
      ? Math.ceil(remainingMs / hourMs) * hourMs
      : Math.floor(remainingMs / hourMs) * hourMs;
  const days = Math.floor(roundedMs / dayMs);
  const hours = Math.floor((roundedMs % dayMs) / hourMs);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  const minutes = Math.max(Math.floor((remainingMs % hourMs) / (60 * 1000)), 1);

  return `${hours}h ${minutes}m`;
}

function getModeCycleHistory(mode, cycles) {
  const modeKey = getEndgameModeKey(mode);
  const finishedCycles = cycles[modeKey] || [];

  return [
    ...finishedCycles,
    ...mode.history,
  ].slice(0, 5);
}

function updateEndgameProgress(mode, progress) {
  const progressByMode = loadEndgameProgress();
  const modeKey = getEndgameModeKey(mode);

  saveEndgameProgress({
    ...progressByMode,
    [modeKey]: {
      current: Math.max(Number(progress.current) || 0, 0),
      total: Math.max(Number(progress.total) || 1, 1),
    },
  });
}

function finishEndgameCycle(mode, progress) {
  const cycles = loadEndgameCycles();
  const modeKey = getEndgameModeKey(mode);
  const finishedAt = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const result = `${progress.current}/${progress.total}`;
  const nextCycles = [
    {
      cycle: `Ciclo finalizado - ${finishedAt}`,
      result,
      note: `${mode.metricLabel}: ${result}`,
    },
    ...(cycles[modeKey] || []),
  ].slice(0, 8);

  saveEndgameCycles({
    ...cycles,
    [modeKey]: nextCycles,
  });
}

function renderEndgameMode(mode, cycles, progressByMode) {
  const progress = getModeProgress(mode, progressByMode);
  const progressPercent = getEndgameProgressPercent(progress);
  const history = getModeCycleHistory(mode, cycles);
  const modeKey = getEndgameModeKey(mode);

  return `
    <article class="endgame-card">
      <div class="endgame-metric-row">
        <div class="endgame-mode-icon" aria-hidden="true">
          ${
            mode.icon
              ? `<img src="${assetUrl(escapeHtml(mode.icon))}" alt="" loading="lazy" decoding="async" />`
              : escapeHtml(mode.shortName)
          }
        </div>
        <div class="endgame-metric-body">
          <div class="endgame-metric-head">
            <div>
              <h2>${escapeHtml(mode.name)}</h2>
              <small data-endgame-timer="${escapeHtml(modeKey)}">${escapeHtml(getEndgameTimer(mode))}</small>
            </div>
            <button type="button" data-finish-cycle="${escapeHtml(modeKey)}">
              Finalizar ciclo
            </button>
          </div>
          <div class="endgame-metric-bar" aria-label="${escapeHtml(mode.metricLabel)} ${progress.current}/${progress.total}">
            <span>${escapeHtml(mode.metricLabel)}</span>
            <strong>${progress.current}/${progress.total}</strong>
            <i style="width: ${progressPercent}%"></i>
          </div>
          <form class="endgame-progress-form" data-progress-form="${escapeHtml(modeKey)}">
            <label>
              <span>Atual</span>
              <input type="number" min="0" value="${progress.current}" data-progress-current />
            </label>
            <label>
              <span>Total</span>
              <input type="number" min="1" value="${progress.total}" data-progress-total />
            </label>
            <button type="submit">Salvar</button>
          </form>
        </div>
      </div>

      <div class="endgame-results">
        <div>
          <span>Ultimo resultado</span>
          <strong>${escapeHtml(mode.last)}</strong>
        </div>
        <div>
          <span>Melhor resultado</span>
          <strong>${escapeHtml(mode.best)}</strong>
        </div>
      </div>

      <div class="timeline">
        ${history
          .map(
            (item) => `
              <div class="timeline-item">
                <span></span>
                <div>
                  <strong>${escapeHtml(item.cycle)} - ${escapeHtml(item.result)}</strong>
                  <p>${escapeHtml(item.note)}</p>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderEndgame() {
  const root = document.querySelector("#endgameRoot");

  if (!root) {
    return;
  }

  const cycles = loadEndgameCycles();
  const progressByMode = loadEndgameProgress();

  root.innerHTML = endgameModes
    .map((mode) => renderEndgameMode(mode, cycles, progressByMode))
    .join("");

  root.querySelectorAll("[data-progress-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const mode = endgameModes.find((endgameMode) => {
        return getEndgameModeKey(endgameMode) === form.dataset.progressForm;
      });

      if (!mode) {
        return;
      }

      updateEndgameProgress(mode, {
        current: form.querySelector("[data-progress-current]").value,
        total: form.querySelector("[data-progress-total]").value,
      });
      renderEndgame();
    });
  });

  root.querySelectorAll("[data-finish-cycle]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = endgameModes.find((endgameMode) => {
        return getEndgameModeKey(endgameMode) === button.dataset.finishCycle;
      });

      if (!mode) {
        return;
      }

      finishEndgameCycle(mode, getModeProgress(mode, loadEndgameProgress()));
      renderEndgame();
    });
  });

  if (endgameCountdownInterval) {
    clearInterval(endgameCountdownInterval);
  }

  endgameCountdownInterval = setInterval(() => {
    root.querySelectorAll("[data-endgame-timer]").forEach((node) => {
      const mode = endgameModes.find((endgameMode) => {
        return getEndgameModeKey(endgameMode) === node.dataset.endgameTimer;
      });

      if (mode) {
        node.textContent = getEndgameTimer(mode);
      }
    });
  }, 60 * 1000);
}
