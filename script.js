const characters = [
  // DPS
  {
    name: "Jinhsi",
    role: "Spectro DPS",
    element: "Spectro",
    combatFunction: "DPS",
    image: "assets/images/characters/jinhsi.png",
    description:
      "DPS de alto impacto focado em dano Spectro com forte presença em campo. Possui janelas de burst extremamente poderosas e escalonamento consistente, sendo excelente para eliminar alvos prioritários rapidamente.",
    build: ["Arma: Ages of Harvest", "Echo Set: Celestial Light", "Main Echo: Jue", "Stats: Crit DMG / (ATK/Spec DMG) / ATK"],
    secondaryStats: ["Crit Rate", "Crit DMG", "ATK%", "Resonance Skill DMG"],
    talents: ["Forte Circuit","Resonance Liberation", "Resonance Skill", "Basic Attack", "Intro Skill"],
    team: ["Cantarella", "Verina"],
  },
  {
    name: "Hiyuki",
    role: "Glacio DPS",
    element: "Glacio",
    combatFunction: "DPS",
    image: "assets/images/characters/hiyuki.png",
    description:
      "DPS ágil com foco em combos rápidos e pressão contínua, aonde o seu maior dano e na ultimate. Se destaca pela mobilidade e capacidade de manter dano consistente ao longo da luta.",
    build: ["Arma: Frostburn", "Echo Set: Wishes of Quiet Snowfall", "Main Echo: Threnodian", "Stats: Crit Rate / Glacio DMG / ATK"],
    secondaryStats: ["Crit Rate", "Crit DMG", "Energy Regen (115%)", "ATK", "Resonance Liberation"],
    talents: ["Resonance Liberation", "Forte Circuit", "Basic Attack","Resonance Skill", "Intro Skill"],
    team: ["Mornye"],
  },
  {
    name: "Jiyan",
    role: "Aero DPS",
    element: "Aero",
    combatFunction: "DPS",
    image: "assets/images/characters/jiyan.png",
    description:
      "DPS principal com forte controle de grupo e ataques em área. Seu estilo combina mobilidade com grande alcance, permitindo dominar múltiplos inimigos com eficiência.",
    build: ["Arma: Verdant Summit", "Echo Set: Sierra Gale", "Main Echo: Feilian Beringal", "Stats: Crit Rate / (Aero DMG/ATK) / ATK"],
    secondaryStats: ["Crit Rate", "Crit DMG", "ATK%","Heavy Attack DMG","Energy Regen"],
    talents: ["Forte Circuit","Resonance Liberation", "Resonance Skill", "Basic Attack", "Intro Skill"],
    team: ["Mortefi"],
  },
  {
    name: "Calcharo",
    role: "Electro DPS",
    element: "Electro",
    combatFunction: "DPS",
    image: "assets/images/characters/calcharo.png",
    description:
      "DPS agressivo com alto dano explosivo e ritmo acelerado. Brilha em combates diretos, recompensando execução precisa com números elevados.",
    build: ["Arma: Verdant Summit", "Echo Set: Void Thunder", "Main Echo: Nightmare - Thundering Mephis", "Stats: Crit Rate / (Electro DMG/ATK) / ATK"],
    secondaryStats: ["Crit Rate", "Crit DMG", "ATK%", "Resonance Liberation" , "Energy Regen"],
    talents: ["Forte Circuit","Resonance Liberation", "Resonance Skill", "Intro Skill", "Basic Attack"],
    team: ["Yinlin"],
  },
  {
    name: "Encore",
    role: "Fusion DPS",
    element: "Fusion",
    combatFunction: "DPS",
    image: "assets/images/characters/encore.png",
    description:
      "DPS focada em dano elemental contínuo com forte presença em campo. Seus ataques causam grande pressão constante, sendo ideal para derreter inimigos ao longo do tempo.",
    build: ["Arma: Augment", "Echo Set: Molten Rift", "Main Echo: Nightmare - Inferno Rider", "Stats: Crit DMG / (ATK/Fusion DMG) / ATK"],
    secondaryStats: ["Crit Rate", "Crit DMG", "ATK%", "Basic Attack DMG" ,"Energy Regen"],
    talents: ["Resonance Liberation", "Resonance Skill", "Forte Circuit", "Intro Skill", "Basic Attack"],
    team: ["Sanhua"],
  },
  {
    name: "Rover",
    role: "Havoc DPS",
    element: "Havoc",
    combatFunction: "DPS",
    image: "assets/images/characters/rover-havoc.png",
    description:
      "Versão ofensiva do protagonista com foco em dano Havoc. Equilibra mobilidade, versatilidade e dano consistente, sendo uma opção sólida para diversas composições, e uma dupla perfeita com a danjin.",
    build: ["Arma: Emerald of Genesis", "Echo Set: Havoc Eclipse", "Main Echo: Dreamless", "Stats: Crit Rate / (ATK/Havoc DMG) / ATK"],
    secondaryStats: ["Crit Rate", "Crit DMG", "ATK%", "Resonance Liberation" , "Basic Attack DMG","Heavy Attack DMG"],
    talents: ["Forte Circuit", "Resonance Liberation", "Resonance Skill", "Basic Attack", "Intro Skill"],
    team: ["Danjin", "Shorekeeper"],
  },
  {
    name: "Danjin",
    role: "Havoc DPS",
    element: "Havoc",
    combatFunction: "DPS",
    image: "assets/images/characters/danjin.png",
    description:
      "DPS de alto risco e alta recompensa, sacrificando vida para causar dano massivo. Ideal para jogadores que buscam um estilo agressivo e preciso.",
    build: ["Arma: Emerald of Genesis", "Echo Set: Midnight Veil", "Main Echo: Nightmare - Impermanence Heron", "Stats: Crit Rate / (Havoc DMG/ATK) / ATK"],
    secondaryStats: ["Crit Rate", "Crit DMG", "ATK%", "Basic Attack DMG", "Heavy Attack DMG", "Energy Regen"],
    talents: ["Forte Circuit","Resonance Skill","Resonance Liberation","Basic Attack", "Intro Skill"],
    team: ["Rover", "Shorekeeper"],
  },

  // Sub-DPS
  {
    name: "Cantarella",
    role: "Havoc Sub-DPS",
    element: "Havoc",
    combatFunction: "Sub-DPS",
    image: "assets/images/characters/cantarella.png",
    description:
      "Personagem versátil que combina suporte e dano secundário. Oferece utilidade para o time enquanto contribui com dano consistente fora de campo, ajudando na fluidez das rotações.",
    build: ["Arma: Whispers of Sirens", "Echo Set: Moonlit Clouds", "Main Echo: Impermanence Heron", "Stats: Crit Rate / Havoc DMG / ATK"],
    secondaryStats: ["Crit Rate", "Crit DMG", "ATK%", "Basic Attack DMG", "Energy Regen"],
    talents: ["Forte Circuit", "Resonance Skill", "Resonance Liberation", "Basic Attack", "Intro Skill"],
    team: ["Jinhsi"],
  },
  {
    name: "Yinlin",
    role: "Electro Sub-DPS",
    element: "Electro",
    combatFunction: "Sub-DPS",
    image: "assets/images/characters/yinlin.png",
    description:
      "Sub-DPS focada em dano elétrico fora de campo, com excelente sinergia em equipes voltadas para reações e dano contínuo. Amplifica o potencial ofensivo do time com facilidade.",
    build: ["Arma: Stringmaster", "Echo Set: Empyrean Anthem", "Main Echo: Hecate", "Stats: Crit Rate / Electro DMG / ATK"],
    secondaryStats: ["Crit Rate", "Crit DMG", "ATK%", "Resonance Skill", "Energy Regen"],
    talents: ["Forte Circuit", "Resonance Liberation", "Resonance Skill", "Intro Skill", "Basic Attack"],
    team: ["Calcharo"],
  },
  {
    name: "Sanhua",
    role: "Glacio Sub-DPS",
    element: "Glacio",
    combatFunction: "Sub-DPS",
    image: "assets/images/characters/sanhua.png",
    description:
      "Oferece dano rápido e buffs valiosos para o time. Excelente em rotações curtas, contribuindo com utilidade e dano sem exigir muito tempo em campo.",
    build: ["Arma: Emerald of Genesis", "Echo Set: Moonlit Clouds", "Main Echo: Impermanence Heron", "Stats: Crit Rate / (ATK/Glacio DMG) / ATK"],
    secondaryStats: ["Crit Rate", "Crit DMG", "Heavy Attack DMG", "Resonance Liberation", "Energy Regen"],
    talents: ["Forte Circuit", "Resonance Liberation", "Resonance Skill", "Intro Skill", "Basic Attack"],
    team: ["Encore"],
  },
  {
    name: "Mortefi",
    role: "Fusion Sub-DPS",
    element: "Fusion",
    combatFunction: "Sub-DPS",
    image: "assets/images/characters/mortefi.png",
    description:
      "Especialista em dano fora de campo com ataques coordenados. Aumenta significativamente o dano do time enquanto mantém presença ofensiva constante.",
    build: ["Arma: Static Mist", "Echo Set: Moonlit Clouds", "Main Echo: Impermanence Heron", "Stats: Crit Rate / (Energy Regen/Fusion DMG) / ATK"],
    secondaryStats: ["Energy Regen", "Crit Rate", "Crit DMG", "ATK%"],
    talents: ["Resonance Liberation", "Forte Circuit", "Resonance Skill", "Basic Attack", "Intro Skill"],
    team: ["Jiyan"],
  },

  // Support
  {
    name: "Shorekeeper",
    role: "Support",
    element: "Spectro",
    combatFunction: "Support",
    image: "assets/images/characters/shorekeeper.png",
    description:
      "Especialista em sustentação de equipe, fornecendo cura constante, utilidades defensivas e fornecendo critico e dano. Ideal para composições que precisam de estabilidade em combates prolongados.",
    build: ["Arma: Variation", "Echo Set: Rejuvenating Glow", "Main Echo: Fallacy of No Return", "Stats: Crit DMG / (Energy Regen/Spectrum DMG) / HP"],
    secondaryStats: ["Energy Regen 230%", "HP%", "Crit DMG"],
    talents: ["Resonance Skill", "Resonance Liberation", "Intro Skill", "Basic Attack", "Forte Circuit"],
    team: ["Verina", "Mornye", "Baizhi"],
  },
  {
    name: "Verina",
    role: "Support",
    element: "Spectro",
    combatFunction: "Support",
    image: "assets/images/characters/verina.png",
    description:
      "Suporte completo que combina cura eficiente com buffs para a equipe. Essencial para manter o time saudável enquanto aumenta o desempenho geral em combate.",
    build: ["Arma: Variation", "Echo Set: Rejuvenating Glow", "Main Echo: Fallacy of No Return", "Stats:  Healing Bonus / Energy Regen / ATK"],
    secondaryStats: ["Energy Regen", "ATK%"],
    talents: ["Resonance Liberation", "Forte Circuit", "Resonance Skill", "Basic Attack", "Intro Skill"],
    team: ["Shorekeeper", "Mornye", "Baizhi"],
  },
  {
    name: "Mornye",
    role: "Support",
    element: "Fusion",
    combatFunction: "Support",
    image: "assets/images/characters/mornye.png",
    description:
      "Suporte focada em sustentação e resistência da equipe. Fornece cura consistente enquanto aumenta a defesa dos aliados, tornando o time mais estável e preparado para combates prolongados.",
    build: ["Arma: Discord", "Echo Set: Halo of Starry Radiance", "Main Echo: Reactor Husk", "Stats: Healing Bonus / (Energy Regen/DEF%) / DEF"],
    secondaryStats: ["Energy Regen 260%", "3000+ DEF%"],
    talents: ["Forte Circuit", "Resonance Liberation", "Resonance Skill", "Basic Attack", "Intro Skill"],
    team: ["Shorekeeper", "Verina", "Baizhi"],
  },
  {
    name: "Baizhi",
    role: "Support",
    element: "Glacio",
    combatFunction: "Support",
    image: "assets/images/characters/baizhi.png",
    description:
      "Suporte focada em cura contínua e geração de energia. Aplica sustain fora de campo e concede buff ao próximo personagem, garantindo estabilidade e fluidez nas rotações.",
    build: ["Arma: Variation", "Echo Set: Rejuvenating Glow", "Main Echo: Bell-Borne Geochelone", "Stats: Healing Bonus / Energy Regen / HP"],
    secondaryStats: ["Energy Regen 220%", "30000 HP%"],
    talents: ["Forte Circuit", "Resonance Liberation", "Resonance Skill", "Basic Attack", "Intro Skill"],
    team: ["Shorekeeper", "Verina", "Mornye"],
  }
];

const charactersGrid = document.querySelector("#charactersGrid");
const filtersToggle = document.querySelector("#filtersToggle");
const filtersPanel = document.querySelector("#filtersPanel");
const elementFilters = document.querySelector("#elementFilters");
const teamFilters = document.querySelector("#teamFilters");
const filterCount = document.querySelector("#filterCount");
const detailsPanel = document.querySelector("#detailsPanel");
const detailsOverlay = document.querySelector("#detailsOverlay");
const closeDetailsButton = document.querySelector("#closeDetailsButton");
const detailsImage = document.querySelector("#detailsImage");
const detailsRole = document.querySelector("#detailsRole");
const detailsTitle = document.querySelector("#detailsTitle");
const detailsDescription = document.querySelector("#detailsDescription");
const buildsButton = document.querySelector("#buildsButton");
const detailsBuild = document.querySelector("#detailsBuild");
const detailsTeam = document.querySelector("#detailsTeam");

const activeFilters = {
  element: "Todos",
  teamLeader: "Todos",
};

function createElement(tag, className, textContent) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
}

function getUniqueOptions(key) {
  return ["Todos", ...new Set(characters.map((character) => character[key]))];
}

function getUniqueTeamOptions() {
  return [
    "Todos",
    ...characters
      .filter((character) => character.combatFunction === "DPS")
      .map((character) => character.name)
      .sort(),
  ];
}

function getFilteredCharacters() {
  const selectedLeader = characters.find(
    (character) => character.name === activeFilters.teamLeader
  );
  const selectedTeamNames = selectedLeader
    ? [selectedLeader.name, ...selectedLeader.team]
    : [];

  return characters.filter((character) => {
    const matchesElement =
      activeFilters.element === "Todos" || character.element === activeFilters.element;
    const matchesTeam =
      activeFilters.teamLeader === "Todos" ||
      selectedTeamNames.includes(character.name);

    return matchesElement && matchesTeam;
  });
}

function renderFilterButtons(container, key, options) {
  const buttons = options.map((option) => {
    const button = createElement("button", "filter-button", option);

    button.type = "button";
    button.dataset.filterValue = option;
    button.setAttribute("aria-pressed", String(activeFilters[key] === option));

    if (activeFilters[key] === option) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => {
      activeFilters[key] = option;
      renderFilters();
      renderCharacters();
    });

    return button;
  });

  container.replaceChildren(...buttons);
}

function renderFilters() {
  renderFilterButtons(elementFilters, "element", getUniqueOptions("element"));
  renderFilterButtons(teamFilters, "teamLeader", getUniqueTeamOptions());
}

function renderCharacters() {
  const fragment = document.createDocumentFragment();
  const filteredCharacters = getFilteredCharacters();

  filteredCharacters.forEach((character, index) => {
    const card = createElement("button", "character-card");
    const image = createElement("img");
    const content = createElement("div", "card-content");
    const role = createElement("p", "card-role", character.role);
    const title = createElement("h3", null, character.name);
    const description = createElement("p", null, character.description);

    card.type = "button";
    card.style.animation = `fadeRise 650ms ease-in-out both ${index * 80}ms`;
    image.src = character.image;
    image.alt = character.name;
    image.loading = "lazy";

    content.append(role, title, description);
    card.append(image, content);
    card.addEventListener("click", () => openCharacterDetails(character));
    fragment.append(card);
  });

  if (filteredCharacters.length === 0) {
    const emptyState = createElement(
      "p",
      "empty-state",
      "Nenhum personagem encontrado com esses filtros."
    );
    fragment.append(emptyState);
  }

  filterCount.textContent = `${filteredCharacters.length} de ${characters.length} personagens`;
  charactersGrid.replaceChildren(fragment);
}

function openCharacterDetails(character) {
  detailsImage.src = character.image;
  detailsImage.alt = character.name;
  detailsRole.textContent = character.role;
  detailsTitle.textContent = character.name;
  detailsDescription.textContent = character.description;
  buildsButton.dataset.characterName = character.name;

  detailsBuild.replaceChildren(
    ...character.build.map((item) => createElement("li", null, item))
  );

  detailsTeam.replaceChildren(
    ...character.team.map((member) => createElement("span", "team-pill", member))
  );

  document.body.classList.add("details-open");
  detailsOverlay.classList.add("is-active");
  detailsPanel.classList.add("is-active");
  detailsOverlay.setAttribute("aria-hidden", "false");
  detailsPanel.setAttribute("aria-hidden", "false");
  closeDetailsButton.focus();
}

function closeDetails() {
  document.body.classList.remove("details-open");
  detailsOverlay.classList.remove("is-active");
  detailsPanel.classList.remove("is-active");
  detailsOverlay.setAttribute("aria-hidden", "true");
  detailsPanel.setAttribute("aria-hidden", "true");
}

function redirectToBuild(characterName) {
  if (!characterName) {
    return;
  }

  const encodedCharacter = encodeURIComponent(characterName);

  window.location.href = `build.html?char=${encodedCharacter}`;
}

function initHomePage() {
  if (!charactersGrid) {
    return;
  }

  closeDetailsButton.addEventListener("click", closeDetails);
  detailsOverlay.addEventListener("click", closeDetails);
  filtersToggle.addEventListener("click", () => {
    const isOpening = filtersPanel.hidden;

    filtersPanel.hidden = !isOpening;
    filtersToggle.setAttribute("aria-expanded", String(isOpening));
    filtersToggle.classList.toggle("is-active", isOpening);
  });
  buildsButton.addEventListener("click", () => {
    redirectToBuild(buildsButton.dataset.characterName);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && detailsPanel.classList.contains("is-active")) {
      closeDetails();
    }
  });

  renderFilters();
  renderCharacters();
}

initHomePage();
