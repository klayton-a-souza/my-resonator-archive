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

const teamOrderStorageKey = "ww-team-order";

function loadTeamOrder() {
  const defaultOrder = characterTeams.map((team) => team.id);

  try {
    const savedOrder = JSON.parse(localStorage.getItem(teamOrderStorageKey));

    if (!Array.isArray(savedOrder)) {
      return defaultOrder;
    }

    const validIds = new Set(defaultOrder);
    const order = savedOrder.filter((id, index) => validIds.has(id) && savedOrder.indexOf(id) === index);

    defaultOrder.forEach((id) => {
      if (!order.includes(id)) {
        order.push(id);
      }
    });

    return order;
  } catch {
    return defaultOrder;
  }
}

function saveTeamOrder(order) {
  try {
    localStorage.setItem(teamOrderStorageKey, JSON.stringify(order));
  } catch {
    // O site continua utilizavel mesmo quando o navegador bloqueia o storage.
  }
}

function sortTeamsByOrder(teams, order) {
  const positions = new Map(order.map((id, index) => [id, index]));

  return [...teams].sort(
    (left, right) =>
      (positions.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
      (positions.get(right.id) ?? Number.MAX_SAFE_INTEGER)
  );
}

function renderTeamPageCard(team, orderEnabled) {
  const mainElement = getTeamMainElement(team);

  return `
    <article
      class="team-card team-page-card ${getTeamElementClass(team)}"
      data-team-id="${escapeHtml(team.id)}"
    >
      <div class="team-ribbon" aria-hidden="true">
        <span>${escapeHtml(mainElement)}</span>
      </div>
      <div class="team-card-content">
        <div class="team-card-head">
          <div>
            <span>${escapeHtml(mainElement)} Team</span>
            <h2>${escapeHtml(team.name)}</h2>
          </div>
          <div class="team-card-tools">
            <div class="team-tags">
              ${team.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
            </div>
            <div class="team-order-controls" aria-label="Alterar posicao de ${escapeHtml(team.name)}">
              <button type="button" data-team-move="-1" title="Mover para cima" aria-label="Mover ${escapeHtml(team.name)} para cima" ${orderEnabled ? "" : "disabled"}>&uarr;</button>
              <button type="button" data-team-drag draggable="${orderEnabled}" title="Arraste para reorganizar" aria-label="Arraste ${escapeHtml(team.name)} para reorganizar" ${orderEnabled ? "" : "disabled"}>&#10247;</button>
              <button type="button" data-team-move="1" title="Mover para baixo" aria-label="Mover ${escapeHtml(team.name)} para baixo" ${orderEnabled ? "" : "disabled"}>&darr;</button>
            </div>
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
  const orderHint = document.querySelector("#teamOrderHint");
  const orderStatus = document.querySelector("#teamOrderStatus");
  const resetOrderButton = document.querySelector("#resetTeamOrder");

  if (!root || !filterRoot || typeof characterTeams === "undefined") {
    return;
  }

  let activeFilter = "Todos";
  let teamOrder = loadTeamOrder();
  let draggedTeamId = null;
  const filters = getTeamFilters();

  function announceOrder(message) {
    if (orderStatus) {
      orderStatus.textContent = message;
    }
  }

  function moveTeam(teamId, direction) {
    const currentIndex = teamOrder.indexOf(teamId);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= teamOrder.length) {
      return;
    }

    [teamOrder[currentIndex], teamOrder[targetIndex]] = [teamOrder[targetIndex], teamOrder[currentIndex]];
    saveTeamOrder(teamOrder);

    const team = characterTeams.find((item) => item.id === teamId);
    announceOrder(`${team?.name || "Time"} movido para a posicao ${targetIndex + 1}.`);
    updateTeams();
  }

  function updateTeams() {
    const orderEnabled = activeFilter === "Todos";
    const orderedTeams = sortTeamsByOrder(characterTeams, teamOrder);
    const filteredTeams = orderedTeams.filter((team) => teamMatchesFilter(team, activeFilter));

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
        ? filteredTeams.map((team) => renderTeamPageCard(team, orderEnabled)).join("")
        : `<article class="empty-state"><h2>Nenhum time encontrado</h2><p>Escolha outro filtro para ver mais composicoes.</p></article>`;

    if (orderHint) {
      orderHint.textContent = orderEnabled
        ? "Arraste os cards para reorganizar ou use as setas."
        : 'Selecione "Todos" para alterar a ordem dos times.';
    }

    filterRoot.querySelectorAll("[data-team-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.teamFilter;
        updateTeams();
      });
    });

    root.querySelectorAll("[data-team-move]").forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest("[data-team-id]");
        moveTeam(card?.dataset.teamId, Number(button.dataset.teamMove));
      });
    });

    root.querySelectorAll("[data-team-id]").forEach((card) => {
      card.addEventListener("dragstart", (event) => {
        if (!orderEnabled || !event.target.closest("[data-team-drag]")) {
          event.preventDefault();
          return;
        }

        draggedTeamId = card.dataset.teamId;
        card.classList.add("is-dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", draggedTeamId);
      });

      card.addEventListener("dragend", () => {
        draggedTeamId = null;
        root.querySelectorAll("[data-team-id]").forEach((item) => {
          item.classList.remove("is-dragging", "is-drag-target");
        });
      });

      card.addEventListener("dragover", (event) => {
        if (!draggedTeamId || card.dataset.teamId === draggedTeamId) {
          return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        root.querySelectorAll(".is-drag-target").forEach((item) => item.classList.remove("is-drag-target"));
        card.classList.add("is-drag-target");
      });

      card.addEventListener("drop", (event) => {
        event.preventDefault();

        const targetTeamId = card.dataset.teamId;
        const fromIndex = teamOrder.indexOf(draggedTeamId);
        const targetIndex = teamOrder.indexOf(targetTeamId);

        if (fromIndex < 0 || targetIndex < 0 || fromIndex === targetIndex) {
          return;
        }

        const targetRect = card.getBoundingClientRect();
        const insertAfter = event.clientY > targetRect.top + targetRect.height / 2;
        const [movedTeamId] = teamOrder.splice(fromIndex, 1);
        let insertIndex = teamOrder.indexOf(targetTeamId) + (insertAfter ? 1 : 0);
        teamOrder.splice(insertIndex, 0, movedTeamId);
        saveTeamOrder(teamOrder);

        const team = characterTeams.find((item) => item.id === movedTeamId);
        announceOrder(`${team?.name || "Time"} movido para a posicao ${insertIndex + 1}.`);
        updateTeams();
      });
    });
  }

  resetOrderButton?.addEventListener("click", () => {
    teamOrder = characterTeams.map((team) => team.id);
    saveTeamOrder(teamOrder);
    announceOrder("Ordem original dos times restaurada.");
    updateTeams();
  });

  updateTeams();
}
