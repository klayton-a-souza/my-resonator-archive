const plannedCharacters = [
  {
    name: "Chisa",
    image: "assets/images/characters/chisa.png",
    chibi: "assets/images/characters/chibi/chisa_chibi.png",
    status: "Desejada",
    priority: "Alta prioridade",
    goal: "Testar uma variacao futura no core da Hiyuki.",
    teamIds: ["hiyuki-chisa-planned"],
  },
  {
    name: "Lynae",
    image: "assets/images/characters/lynae.png",
    chibi: "assets/images/characters/chibi/lynae_chibi.png",
    status: "Desejada",
    priority: "Flexivel",
    goal: "Montar dupla com Mornye para encaixar varios DPS.",
    teamIds: ["lynae-mornye-duo"],
  },
];

const plannedTeams = [
  {
    id: "hiyuki-chisa-planned",
    name: "Hiyuki + Chisa",
    lead: "Variacao futura para testar Chisa junto de Hiyuki e Lucilla, mantendo apenas Chisa como alvo desejado.",
    tags: ["Planejado", "Glacio", "Chisa"],
    members: [
      {
        name: "Hiyuki",
        role: "Main DPS",
        image: "assets/images/characters/chibi/hiyuki_chibi.png",
        note: "Ja na conta",
      },
      {
        name: "Lucilla",
        role: "Sub-DPS",
        image: "assets/images/characters/chibi/lucilla_chibi.png",
        note: "Ja na conta",
      },
      {
        name: "Chisa",
        role: "Support",
        image: "assets/images/characters/chibi/chisa_chibi.png",
        note: "Alvo desejado",
        planned: true,
      },
    ],
  },
  {
    id: "lynae-mornye-duo",
    name: "Lynae + Mornye",
    lead: "Dupla planejada como nucleo flexivel; o DPS final fica aberto para nao transformar a wishlist em lista grande.",
    tags: ["Planejado", "Duo", "Flex"],
    members: [
      {
        name: "Lynae",
        role: "Core",
        image: "assets/images/characters/chibi/lynae_chibi.png",
        note: "Alvo desejado",
        planned: true,
      },
      {
        name: "Mornye",
        role: "Support",
        image: "assets/images/characters/chibi/mornye_chibi.png",
        note: "Ja na conta",
      },
    ],
  },
];

function getPlanningMemberCharacter(member) {
  return characters.find((character) => character.name === member.name) || null;
}

function getPlanningTeamsForCharacter(plannedCharacter) {
  return plannedCharacter.teamIds
    .map((teamId) => plannedTeams.find((team) => team.id === teamId))
    .filter(Boolean);
}

function renderPlannedCharacterCard(plannedCharacter) {
  const teams = getPlanningTeamsForCharacter(plannedCharacter);

  return `
    <article class="planned-character-card">
      <img src="${assetUrl(escapeHtml(plannedCharacter.image))}" alt="${escapeHtml(plannedCharacter.name)}" loading="lazy" decoding="async" />
      <div class="planned-character-overlay">
        <div>
          <span>${escapeHtml(plannedCharacter.status)}</span>
          <h2>${escapeHtml(plannedCharacter.name)}</h2>
        </div>
        <strong>${escapeHtml(plannedCharacter.priority)}</strong>
        <p>${escapeHtml(plannedCharacter.goal)}</p>
        <div class="planned-character-teams">
          ${teams.map((team) => `<span>${escapeHtml(team.name)}</span>`).join("")}
        </div>
      </div>
    </article>
  `;
}

function renderPlannedTeam(team) {
  return `
    <article class="planned-team">
      <div class="planned-team-head">
        <span>Time futuro</span>
        <strong>${escapeHtml(team.name)}</strong>
      </div>
      <div class="planned-team-tags">
        ${team.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
      </div>
      <p>${escapeHtml(team.lead)}</p>
      <div class="team-members team-members-${team.members.length}">
        ${team.members
          .map((member, index) => {
            const character = getPlanningMemberCharacter(member);
            const isPlanned = Boolean(member.planned);
            const memberContent = `
              <div class="team-avatar-wrap">
                <img src="${assetUrl(escapeHtml(member.image))}" alt="${escapeHtml(member.name)} em estilo chibi" loading="lazy" decoding="async" />
              </div>
              <strong>${escapeHtml(member.name)}</strong>
              <span>${escapeHtml(member.role)}</span>
              <small>${escapeHtml(member.note)}</small>
            `;

            return `
              ${
                character && !isPlanned
                  ? `<a class="team-member" href="${getBuildHref(character)}">${memberContent}</a>`
                  : `<div class="team-member ${isPlanned ? "is-current" : ""}">${memberContent}</div>`
              }
              ${index < team.members.length - 1 ? `<span class="team-link" aria-hidden="true"></span>` : ""}
            `;
          })
          .join("")}
      </div>
    </article>
  `;
}

function renderPlanningPage() {
  const root = document.querySelector("#planningRoot");

  if (!root) {
    return;
  }

  root.innerHTML = `
    <section class="planned-character-grid" aria-label="Personagens desejados">
      ${plannedCharacters.map(renderPlannedCharacterCard).join("")}
    </section>
    <section class="planned-team-section" aria-labelledby="plannedTeamsTitle">
      <div class="section-title">
        <div>
          <p class="eyebrow">Composicoes</p>
          <h2 id="plannedTeamsTitle">Times planejados</h2>
        </div>
      </div>
      <div class="planned-team-grid">
        ${plannedTeams.map(renderPlannedTeam).join("")}
      </div>
    </section>
  `;
}
