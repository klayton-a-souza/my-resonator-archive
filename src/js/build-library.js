function populateLibrarySelect(select, options) {
  select.innerHTML = options
    .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
    .join("");
}

async function renderLibrary() {
  const root = document.querySelector("#buildLibraryRoot");
  const nameFilter = document.querySelector("#nameFilter");
  const elementFilter = document.querySelector("#elementFilter");
  const functionFilter = document.querySelector("#functionFilter");

  if (!root || !nameFilter || !elementFilter || !functionFilter) {
    return;
  }

  const elements = [
    "Todos",
    ...[...new Set(characters.map((character) => character.element))].sort(),
  ];
  const roles = [
    "Todos",
    ...[...new Set(characters.map((character) => character.role))].sort(),
  ];

  populateLibrarySelect(elementFilter, elements);
  populateLibrarySelect(functionFilter, roles);

  let accountBuilds = [];

  root.innerHTML = `
    <article class="empty-state">
      <h2>Carregando builds</h2>
      <p>Calculando Build Score, RV, Match e Character CV.</p>
    </article>
  `;

  try {
    accountBuilds = await loadAccountBuilds();
  } catch {
    accountBuilds = [];
  }

  function updateLibrary() {
    const search = nameFilter.value.trim().toLowerCase();
    const selectedElement = elementFilter.value;
    const selectedRole = functionFilter.value;
    const filteredBuilds = sortBuilds(
      characters
        .filter((character) => {
          const matchesName = character.name.toLowerCase().includes(search);
          const matchesElement = selectedElement === "Todos" || character.element === selectedElement;
          const matchesRole = selectedRole === "Todos" || character.role === selectedRole;

          return matchesName && matchesElement && matchesRole;
        })
        .map((character) => {
          const accountBuild = getAccountBuildForCharacter(accountBuilds, character);

          return {
            character,
            analysis: getBuildAnalysis(character, accountBuild),
          };
        })
    );

    root.innerHTML =
      filteredBuilds.length > 0
        ? filteredBuilds
            .map(
              ({ character, analysis }) => {
                const metricLabel = analysis.support ? "Build Score" : "Character CV";
                const metricValue = analysis.support
                  ? `${formatDecimal(analysis.buildScore)}/100`
                  : formatDecimal(analysis.characterCv);

                return `
                <a class="library-card" href="${getBuildHref(character)}">
                  <img src="${assetUrl(escapeHtml(character.image))}" alt="${escapeHtml(character.name)}" loading="lazy" decoding="async" />
                  <div class="library-card-body">
                    <div>
                      <span>${escapeHtml(character.element)} / ${escapeHtml(character.role)}</span>
                      <h2>${escapeHtml(character.name)}</h2>
                    </div>
                    <dl>
                      <div><dt>Build</dt><dd>${escapeHtml(character.buildName)}</dd></div>
                      <div><dt>Arma</dt><dd>${escapeHtml(character.weapon)}</dd></div>
                      <div><dt>${metricLabel}</dt><dd>${metricValue}</dd></div>
                    </dl>
                  </div>
                </a>
              `;
              }
            )
            .join("")
        : `<article class="empty-state"><h2>Nenhuma build encontrada</h2><p>Ajuste os filtros para consultar outros personagens.</p></article>`;
  }

  [nameFilter, elementFilter, functionFilter].forEach((input) => {
    input.addEventListener("input", updateLibrary);
    input.addEventListener("change", updateLibrary);
  });

  updateLibrary();
}

