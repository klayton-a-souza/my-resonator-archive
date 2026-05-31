function renderEchoAnalysisList(analysis, mode) {
  return analysis.echoes
    .map((echo) => {
      const value =
        mode === "rv"
          ? `
            <div class="echo-metric-stack">
              <strong>RV: ${formatDecimal(echo.rv, 0)}%</strong>
              <span>Match: ${echo.match.matched}/${echo.match.total}</span>
            </div>
          `
          : `<strong>${formatDecimal(echo.cv)} CV</strong>`;

      return `
        <article class="echo-card">
          <div class="echo-icon">${echo.cost}</div>
          <div>
            <h3>${escapeHtml(echo.name)}</h3>
            <span>${escapeHtml(echo.main)}</span>
          </div>
          ${value}
        </article>
      `;
    })
    .join("");
}

function renderBuildAnalysis(character, buildOverviewImage, analysis, mode) {
  const activeMode = mode === "rv" ? "rv" : "cv";
  const characterGoal = getCharacterGoal(character);
  const metricTitle =
    activeMode === "rv" ? "RV medio da build" : "CV total da build";
  const metricValue =
    activeMode === "rv"
      ? `${formatDecimal(analysis.averageRv)}%`
      : formatDecimal(analysis.totalCv);

  return `
    <article class="character-build">
      <section class="build-main-area">
        <header class="build-page-header">
          <div>
            <p class="eyebrow">Visao geral da build</p>
            <h1>${escapeHtml(character.name)}</h1>
            <div class="build-dashboard-actions" aria-label="Acoes da dashboard">
              <button class="${isDashboardFocusCharacter(character) ? "is-active" : ""}" type="button" data-dashboard-action="focus">
                ${isDashboardFocusCharacter(character) ? "Em construcao" : "Definir construcao"}
              </button>
              <button class="${isDashboardFavoriteCharacter(character) ? "is-active" : ""}" type="button" data-dashboard-action="favorite">
                ${isDashboardFavoriteCharacter(character) ? "Favorito" : "Adicionar favorito"}
              </button>
              <button class="${isDashboardChecklistCharacter(character) ? "is-active" : ""}" type="button" data-dashboard-action="checklist">
                ${isDashboardChecklistCharacter(character) ? "No checklist" : "Adicionar checklist"}
              </button>
            </div>
            <form class="build-focus-form" data-focus-form>
              <label for="characterFocusInput">Foco do personagem</label>
              <div>
                <input id="characterFocusInput" type="text" value="${escapeHtml(characterGoal)}" placeholder="Ex: Aumentar nivel dos talentos" />
                <button type="submit">Salvar foco</button>
              </div>
            </form>
          </div>
          <div class="build-title-block">
            <p class="eyebrow">Build equipada</p>
            <h2>${escapeHtml(character.buildName)}</h2>
          </div>
        </header>

        <div class="build-showcase-media">
          <img src="${assetUrl(escapeHtml(buildOverviewImage))}" alt="Visao geral da build de ${escapeHtml(character.name)}" />
        </div>

        <div class="build-panels">
          <section class="main-stats-panel">
            <h3>Main stats</h3>
            <div class="tag-row">
              ${character.mainStats.map((stat) => `<span>${escapeHtml(stat)}</span>`).join("")}
            </div>
          </section>
          <section class="main-stats-panel">
            <h3>Substats alvo</h3>
            <div class="tag-row">
              ${analysis.desiredSubstats.map((stat) => `<span>${escapeHtml(stat)}</span>`).join("")}
            </div>
          </section>
        </div>
      </section>

      <aside class="build-sidebar">
        <section class="cv-card">
          <div class="build-score-header">
            <span>Build Score</span>
            <div class="metric-toggle" aria-label="Alternar metrica dos ecos">
              <button class="${activeMode === "cv" ? "is-active" : ""}" type="button" data-build-mode="cv">CV</button>
              <button class="${activeMode === "rv" ? "is-active" : ""}" type="button" data-build-mode="rv">RV</button>
            </div>
          </div>
          <strong>${analysis.buildScore}/100</strong>
          <div class="build-score-breakdown">
            <span>CV: ${formatDecimal(analysis.totalCv)}</span>
            <span>RV: ${formatDecimal(analysis.averageRv)}%</span>
            <span>Match: ${analysis.match.matched}/${analysis.match.total}</span>
          </div>
        </section>

        <section class="echo-list-card" aria-label="Analise individual dos ecos">
          <div class="echo-list-header">
            <span>${metricTitle}</span>
            <strong>${metricValue}</strong>
          </div>
          <div class="echo-grid">
            ${renderEchoAnalysisList(analysis, activeMode)}
          </div>
        </section>

        <section class="weapon-card">
          <h2>Arma</h2>
          <strong>${escapeHtml(character.weapon)}</strong>
          <span>${escapeHtml(character.echoSet)}</span>
          <small>Main Echo: ${escapeHtml(character.mainEcho)}</small>
        </section>
        <section class="build-progress-block">
          <div class="progress-card-head">
            <div>
              <h3>Checklist</h3>
              <span>${escapeHtml(characterGoal)}</span>
            </div>
            <strong data-progress-value="${escapeHtml(character.name)}">${getProgressPercent(character)}%</strong>
          </div>
          <div class="progress-track">
            <span data-progress-bar="${escapeHtml(character.name)}" style="width: ${getProgressPercent(character)}%"></span>
          </div>
          ${renderChecklist(character)}
        </section>
      </aside>
    </article>
  `;
}

async function renderBuildPage() {
  const root = document.querySelector("#buildRoot");

  if (!root) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const character = getCharacterByName(params.get("char"));
  const buildOverviewImage = getBuildOverviewImage(character);
  let accountBuild = null;
  let activeMode = "cv";

  root.innerHTML = `
    <article class="empty-state">
      <h2>Carregando build</h2>
      <p>Calculando CV, RV, Match e Build Score.</p>
    </article>
  `;

  try {
    const accountBuilds = await loadAccountBuilds();
    accountBuild = getAccountBuildForCharacter(accountBuilds, character);
  } catch {
    accountBuild = null;
  }

  function updateBuildView() {
    const analysis = getBuildAnalysis(character, accountBuild);

    root.innerHTML = renderBuildAnalysis(
      character,
      buildOverviewImage,
      analysis,
      activeMode
    );
    bindChecklists(root);

    root.querySelectorAll("[data-build-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        activeMode = button.dataset.buildMode;
        updateBuildView();
      });
    });

    root.querySelectorAll("[data-dashboard-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.dashboardAction;

        if (action === "focus") {
          setDashboardFocusCharacter(character);
        }

        if (action === "favorite") {
          toggleDashboardFavoriteCharacter(character);
        }

        if (action === "checklist") {
          toggleDashboardChecklistCharacter(character);
        }

        updateBuildView();
      });
    });

    const focusForm = root.querySelector("[data-focus-form]");

    if (focusForm) {
      focusForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const input = focusForm.querySelector("input");
        setCharacterGoal(character, input.value);
        updateBuildView();
      });
    }
  }

  updateBuildView();
}
