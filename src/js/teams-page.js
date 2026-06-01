function getTeamMemberCharacter(member) {
  return characters.find((character) => character.name === member.name) || null;
}

function getTeamMainElement(team) {
  return getTeamMemberCharacter(team.members[0])?.element || "Neutral";
}

function getTeamFilters() {
  const baseFilters = ["Todos", "Hypercarry", "Quick Swap", "High Risk"];
  const elementFilters = [...new Set(characters.map((character) => character.element))].sort();

  return [...baseFilters, ...elementFilters];
}

function teamMatchesFilter(team, filter) {
  if (filter === "Todos") {
    return true;
  }

  const mainElement = getTeamMainElement(team);
  const tagMatches = team.tags.some((tag) => tag.toLowerCase() === filter.toLowerCase());
  const elementMatches = mainElement === filter;

  return tagMatches || elementMatches;
}

function getTeamElementClass(team) {
  return `team-element-${getTeamMainElement(team).toLowerCase()}`;
}

function renderTeamPageCard(team) {
  const mainElement = getTeamMainElement(team);

  return `
    <article class="team-card team-page-card ${getTeamElementClass(team)}">
      <div class="team-ribbon" aria-hidden="true">
        <span>${escapeHtml(mainElement)}</span>
      </div>
      <div class="team-card-content">
        <div class="team-card-head">
          <div>
            <span>${escapeHtml(mainElement)} Team</span>
            <h2>${escapeHtml(team.name)}</h2>
          </div>
          <div class="team-tags">
            ${team.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
          </div>
        </div>
        <p>${escapeHtml(team.lead)}</p>
        <div class="team-members">
          ${team.members
            .map((member, index) => {
              const character = getTeamMemberCharacter(member);

              return `
                <a class="team-member" href="${character ? getBuildHref(character) : "#"}">
                  <div class="team-avatar-wrap">
                    <img src="${assetUrl(escapeHtml(member.image))}" alt="${escapeHtml(member.name)} em estilo chibi" loading="lazy" decoding="async" />
                  </div>
                  <strong>${escapeHtml(member.name)}</strong>
                  <span>${escapeHtml(member.role)}</span>
                  <small>${escapeHtml(member.note)}</small>
                </a>
                ${index < team.members.length - 1 ? `<span class="team-link" aria-hidden="true"></span>` : ""}
              `;
            })
            .join("")}
        </div>
      </div>
    </article>
  `;
}

function renderTeamsPage() {
  const root = document.querySelector("#teamsRoot");
  const filterRoot = document.querySelector("#teamFilterRoot");

  if (!root || !filterRoot || typeof characterTeams === "undefined") {
    return;
  }

  let activeFilter = "Todos";
  const filters = getTeamFilters();

  function updateTeams() {
    const filteredTeams = characterTeams.filter((team) => teamMatchesFilter(team, activeFilter));

    filterRoot.innerHTML = filters
      .map(
        (filter) => `
          <button class="${filter === activeFilter ? "is-active" : ""}" type="button" data-team-filter="${escapeHtml(filter)}">
            ${escapeHtml(filter)}
          </button>
        `
      )
      .join("");

    root.innerHTML =
      filteredTeams.length > 0
        ? filteredTeams.map(renderTeamPageCard).join("")
        : `<article class="empty-state"><h2>Nenhum time encontrado</h2><p>Escolha outro filtro para ver mais composicoes.</p></article>`;

    filterRoot.querySelectorAll("[data-team-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.teamFilter;
        updateTeams();
      });
    });
  }

  updateTeams();
}
