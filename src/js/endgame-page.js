function renderEndgame() {
  const root = document.querySelector("#endgameRoot");

  if (!root) {
    return;
  }

  root.innerHTML = endgameModes
    .map(
      (mode) => `
        <article class="endgame-card">
          <div class="endgame-card-head">
            <div>
              <span>${escapeHtml(mode.status)}</span>
              <h2>${escapeHtml(mode.name)}</h2>
            </div>
            <strong>${escapeHtml(mode.trend)}</strong>
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
            ${mode.history
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
      `
    )
    .join("");
}

