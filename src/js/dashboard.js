let favoriteCarouselIndex = 0;
let expandedEndgameSummaryKey = null;

async function getDashboardFocusLevel(focusCharacter) {
  try {
    const accountBuilds = await loadAccountBuilds();
    const accountBuild = getAccountBuildForCharacter(accountBuilds, focusCharacter);

    return accountBuild?.character?.level || focusCharacter.level;
  } catch {
    return focusCharacter.level;
  }
}

function renderFavoriteCarousel(favoriteCharacters) {
  if (favoriteCharacters.length === 0) {
    return `<p class="panel-empty">Nenhum favorito selecionado.</p>`;
  }

  const safeActiveIndex = Math.min(favoriteCarouselIndex, favoriteCharacters.length - 1);
  favoriteCarouselIndex = safeActiveIndex;

  return `
    <div class="favorite-carousel" data-favorite-carousel>
      <button class="favorite-carousel-control previous" type="button" data-favorite-carousel-step="-1" aria-label="Personagem favorito anterior"></button>
      <div class="favorite-carousel-stage">
        ${favoriteCharacters
          .map((character, index) => {
            let offset = index - safeActiveIndex;
            const half = favoriteCharacters.length / 2;

            if (offset > half) {
              offset -= favoriteCharacters.length;
            }

            if (offset < -half) {
              offset += favoriteCharacters.length;
            }

            const isVisible = Math.abs(offset) <= 2;

            return `
              <a
                class="favorite-slide ${offset === 0 ? "is-active" : ""}"
                href="${getBuildHref(character)}"
                style="--slide-offset: ${offset};"
                data-slide-offset="${offset}"
                aria-hidden="${isVisible ? "false" : "true"}"
                ${isVisible ? "" : `tabindex="-1"`}
                aria-label="Ver build de ${escapeHtml(character.name)}"
                title="${escapeHtml(character.name)}"
              >
                <img src="${assetUrl(escapeHtml(character.image))}" alt="${escapeHtml(character.name)}" loading="lazy" decoding="async" />
                <div>
                  <strong>${escapeHtml(character.name)}</strong>
                  <span>${escapeHtml(character.element)} / ${escapeHtml(character.role)}</span>
                </div>
              </a>
            `;
          })
          .join("")}
      </div>
      <button class="favorite-carousel-control next" type="button" data-favorite-carousel-step="1" aria-label="Proximo personagem favorito"></button>
      <div class="favorite-carousel-dots" aria-label="Selecionar personagem favorito">
        ${favoriteCharacters
          .map(
            (_, index) => `
              <button class="${index === safeActiveIndex ? "is-active" : ""}" type="button" data-favorite-carousel-index="${index}" aria-label="Ir para favorito ${index + 1}"></button>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderDashboard() {
  const root = document.querySelector("#dashboardRoot");

  if (!root) {
    return;
  }

  const focusCharacter = getDashboardFocusCharacter();
  const favoriteCharacters = getDashboardFavoriteCharacters();
  const checklistCharacters = getDashboardChecklistCharacters();
  const focusGoal = getCharacterGoal(focusCharacter);
  const endgameProgressByMode = loadEndgameProgress();

  root.innerHTML = `
    <div class="dashboard-grid">
      <article class="focus-card">
        <div class="focus-copy">
          <p class="eyebrow">Personagem em construcao</p>
          <h2>${escapeHtml(focusCharacter.name)}</h2>
          <div class="meta-row">
            <span>${escapeHtml(focusCharacter.element)}</span>
            <span>${escapeHtml(focusCharacter.role)}</span>
            <span data-focus-level>Nivel ${focusCharacter.level}</span>
          </div>
          <div class="objective-pill">
            <span>Objetivo atual</span>
            <strong>${escapeHtml(focusGoal)}</strong>
          </div>
          <div class="focus-actions">
            <a class="button primary" href="${getBuildHref(focusCharacter)}">Ver build</a>
          </div>
        </div>
        <div class="focus-art">
          <img src="${assetUrl(escapeHtml(focusCharacter.image))}" alt="${escapeHtml(focusCharacter.name)}" decoding="async" fetchpriority="high" />
        </div>
      </article>

      <section class="dashboard-panel favorite-panel" aria-labelledby="favoritesTitle">
        <div class="section-title">
          <p class="eyebrow">Favoritos</p>
          <h2 id="favoritesTitle">Personagens</h2>
        </div>
        ${renderFavoriteCarousel(favoriteCharacters)}
      </section>

      <section class="dashboard-panel endgame-summary" aria-labelledby="endgameSummaryTitle">
        <div class="section-title">
          <p class="eyebrow">Resumo</p>
          <h2 id="endgameSummaryTitle">Endgame</h2>
        </div>
        <div class="summary-grid">
          ${endgameModes
            .map((mode) => {
              const progress = getModeProgress(mode, endgameProgressByMode);
              const progressPercent = getEndgameProgressPercent(progress);

              return `
                <article class="summary-card ${expandedEndgameSummaryKey === getEndgameModeKey(mode) ? "is-expanded" : ""}" data-endgame-summary="${escapeHtml(getEndgameModeKey(mode))}">
                  <button class="summary-card-toggle" type="button" data-endgame-summary-toggle="${escapeHtml(getEndgameModeKey(mode))}" aria-expanded="${expandedEndgameSummaryKey === getEndgameModeKey(mode)}">
                    <div class="summary-card-head">
                      ${
                        mode.icon
                          ? `<img src="${assetUrl(escapeHtml(mode.icon))}" alt="" loading="lazy" decoding="async" />`
                          : `<span>${escapeHtml(mode.shortName)}</span>`
                      }
                      <h3>${escapeHtml(mode.name)}</h3>
                    </div>
                    <div class="summary-progress">
                      <div>
                        <span>${escapeHtml(mode.metricLabel)}</span>
                        <strong>${progress.current}/${progress.total}</strong>
                      </div>
                      <i><b style="width: ${progressPercent}%"></b></i>
                    </div>
                  </button>
                  ${
                    expandedEndgameSummaryKey === getEndgameModeKey(mode)
                      ? `
                        <form class="summary-progress-form" data-dashboard-endgame-form="${escapeHtml(getEndgameModeKey(mode))}">
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
                      `
                      : ""
                  }
                </article>
              `;
            })
            .join("")}
        </div>
      </section>

      <section class="dashboard-panel checklist-panel" aria-labelledby="checklistTitle">
        <div class="section-title">
          <p class="eyebrow">Progresso</p>
          <h2 id="checklistTitle">Checklists</h2>
        </div>
        <div class="checklist-grid">
          ${
            checklistCharacters.length > 0
              ? checklistCharacters
                  .map(
                    (character) => `
                      <article class="progress-card">
                        <div class="progress-card-head">
                          <div>
                            <h3>${escapeHtml(character.name)}</h3>
                            <span>${escapeHtml(getCharacterGoal(character))}</span>
                          </div>
                          <strong data-progress-value="${escapeHtml(character.name)}">${getProgressPercent(character)}%</strong>
                        </div>
                        <div class="progress-track">
                          <span data-progress-bar="${escapeHtml(character.name)}" style="width: ${getProgressPercent(character)}%"></span>
                        </div>
                        ${renderChecklist(character, true)}
                      </article>
                    `
                  )
                  .join("")
              : `<p class="panel-empty">Nenhum personagem no checklist.</p>`
          }
        </div>
      </section>
    </div>
  `;

  bindChecklists(root);

  root.querySelectorAll("[data-endgame-summary-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextKey = button.dataset.endgameSummaryToggle;

      expandedEndgameSummaryKey =
        expandedEndgameSummaryKey === nextKey ? null : nextKey;
      renderDashboard();
    });
  });

  root.querySelectorAll("[data-dashboard-endgame-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const mode = endgameModes.find((endgameMode) => {
        return getEndgameModeKey(endgameMode) === form.dataset.dashboardEndgameForm;
      });

      if (!mode) {
        return;
      }

      updateEndgameProgress(mode, {
        current: form.querySelector("[data-progress-current]").value,
        total: form.querySelector("[data-progress-total]").value,
      });
      renderDashboard();
    });
  });

  root.querySelectorAll("[data-favorite-carousel-step]").forEach((button) => {
    button.addEventListener("click", () => {
      const step = Number(button.dataset.favoriteCarouselStep);
      const total = favoriteCharacters.length;

      if (total === 0) {
        return;
      }

      favoriteCarouselIndex = (favoriteCarouselIndex + step + total) % total;
      renderDashboard();
    });
  });

  root.querySelectorAll("[data-favorite-carousel-index]").forEach((button) => {
    button.addEventListener("click", () => {
      favoriteCarouselIndex = Number(button.dataset.favoriteCarouselIndex);
      renderDashboard();
    });
  });

  getDashboardFocusLevel(focusCharacter).then((level) => {
    root.querySelectorAll("[data-focus-level]").forEach((node) => {
      node.textContent = `Nivel ${level}`;
    });
  });
}

