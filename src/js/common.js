const focusCharacterName = "Jinhsi";
const dashboardPrefsStorageKey = "ww-dashboard-preferences";
const checklistItems = [
  ["characterLevel", "Nivel"],
  ["weaponLevel", "Arma"],
  ["talents", "Talentos"],
  ["echoes", "Ecos"],
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getCharacterByName(name) {
  return characters.find((character) => character.name === name) || characters[0];
}

function getDefaultDashboardPreferences() {
  const favoriteNames = characters
    .filter((character) => character.favorite)
    .map((character) => character.name);
  const checklistNames = [
    focusCharacterName,
    ...favoriteNames.filter((name) => name !== focusCharacterName),
  ].slice(0, 4);

  return {
    focusCharacterName,
    favoriteNames,
    checklistNames,
    goalsByCharacterName: {},
  };
}

function loadDashboardPreferences() {
  const defaults = getDefaultDashboardPreferences();

  try {
    const savedPreferences = localStorage.getItem(dashboardPrefsStorageKey);

    if (!savedPreferences) {
      return defaults;
    }

    return {
      ...defaults,
      ...JSON.parse(savedPreferences),
    };
  } catch {
    return defaults;
  }
}

function saveDashboardPreferences(preferences) {
  try {
    localStorage.setItem(
      dashboardPrefsStorageKey,
      JSON.stringify({
        ...loadDashboardPreferences(),
        ...preferences,
      })
    );
  } catch {
    return;
  }
}

function getDashboardFocusCharacter() {
  return getCharacterByName(loadDashboardPreferences().focusCharacterName);
}

function getDashboardFavoriteCharacters() {
  const favoriteNames = new Set(loadDashboardPreferences().favoriteNames || []);

  return characters.filter((character) => favoriteNames.has(character.name));
}

function getDashboardChecklistCharacters() {
  const checklistNames = loadDashboardPreferences().checklistNames || [];

  return checklistNames
    .map((characterName) => characters.find((character) => character.name === characterName))
    .filter(Boolean);
}

function isDashboardFocusCharacter(character) {
  return loadDashboardPreferences().focusCharacterName === character.name;
}

function isDashboardFavoriteCharacter(character) {
  return (loadDashboardPreferences().favoriteNames || []).includes(character.name);
}

function isDashboardChecklistCharacter(character) {
  return (loadDashboardPreferences().checklistNames || []).includes(character.name);
}

function setDashboardFocusCharacter(character) {
  const preferences = loadDashboardPreferences();
  const checklistNames = [
    character.name,
    ...(preferences.checklistNames || []).filter((name) => name !== character.name),
  ];

  saveDashboardPreferences({
    focusCharacterName: character.name,
    checklistNames,
  });
}

function toggleDashboardFavoriteCharacter(character) {
  const preferences = loadDashboardPreferences();
  const favoriteNames = new Set(preferences.favoriteNames || []);

  if (favoriteNames.has(character.name)) {
    favoriteNames.delete(character.name);
  } else {
    favoriteNames.add(character.name);
  }

  saveDashboardPreferences({
    favoriteNames: [...favoriteNames],
  });
}

function toggleDashboardChecklistCharacter(character) {
  const preferences = loadDashboardPreferences();
  const checklistNames = new Set(preferences.checklistNames || []);

  if (checklistNames.has(character.name)) {
    checklistNames.delete(character.name);
  } else {
    checklistNames.add(character.name);
  }

  saveDashboardPreferences({
    checklistNames: [...checklistNames],
  });
}

function getCharacterGoal(character) {
  const goalsByCharacterName = loadDashboardPreferences().goalsByCharacterName || {};
  const customGoal = goalsByCharacterName[character.name];

  return customGoal || character.goal;
}

function setCharacterGoal(character, goal) {
  const preferences = loadDashboardPreferences();
  const goalsByCharacterName = {
    ...(preferences.goalsByCharacterName || {}),
  };
  const nextGoal = goal.trim();

  if (nextGoal) {
    goalsByCharacterName[character.name] = nextGoal;
  } else {
    delete goalsByCharacterName[character.name];
  }

  saveDashboardPreferences({
    goalsByCharacterName,
  });
}

function isInPagesDir() {
  return window.location.pathname.includes("/pages/");
}

function pageUrl(pageName) {
  return isInPagesDir() ? pageName : `pages/${pageName}`;
}

function assetUrl(path) {
  return isInPagesDir() ? `../${path}` : path;
}

function getBuildHref(character) {
  return `${pageUrl("build.html")}?char=${encodeURIComponent(character.name)}`;
}

function getBuildImageSlug(characterName) {
  return characterName
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getBuildOverviewImage(character) {
  return (
    character.buildImage ||
    `assets/images/builds/optimized/${getBuildImageSlug(character.name)}_build.jpg`
  );
}

const echoRollMaximums = {
  "Crit Rate": 10.5,
  "Crit DMG": 21,
  "ATK%": 11.6,
  "HP%": 11.6,
  "DEF%": 14.7,
  "Energy Regen": 12.4,
  "Resonance Skill DMG": 11.6,
  "Basic Attack DMG": 11.6,
  "Heavy Attack DMG": 11.6,
  "Resonance Liberation DMG": 11.6,
  "ATK": 60,
  "HP": 580,
  "DEF": 70,
};

function normalizeStatName(statName) {
  const aliases = {
    "Crit. Rate": "Crit Rate",
    "Crit. DMG": "Crit DMG",
    "Skill DMG": "Resonance Skill DMG",
    "Liberation DMG": "Resonance Liberation DMG",
    "Resonance Liberation": "Resonance Liberation DMG",
    "Resonance Skill": "Resonance Skill DMG",
    "Spectro DMG Bonus": "Spectro DMG",
  };

  return aliases[statName] || statName;
}

function formatDecimal(value, digits = 1) {
  return Number(value || 0).toFixed(digits);
}

function getEchoSubstats(echo) {
  if (!echo || !Array.isArray(echo.substats)) {
    return [];
  }

  return echo.substats.map((substat) => ({
    ...substat,
    normalizedType: normalizeStatName(substat.type),
  }));
}

function calculateEchoCV(echo) {
  const substats = getEchoSubstats(echo);
  const critRate = substats.find((substat) => substat.normalizedType === "Crit Rate")?.value || 0;
  const critDamage = substats.find((substat) => substat.normalizedType === "Crit DMG")?.value || 0;

  return critRate * 2 + critDamage;
}

function calculateCharacterCV(accountBuild) {
  const stats = accountBuild?.character?.stats || {};
  const critRate = Number(stats.critRate || 0);
  const critDamage = Number(stats.critDamage || 0);

  return critRate * 2 + critDamage;
}

function calculateCritScore(accountBuild) {
  const stats = accountBuild?.character?.stats || {};
  const critRate = Number(stats.critRate || 0);
  const critDamage = Number(stats.critDamage || 0);
  const critRateScore = Math.min((critRate / 100) * 100, 100);
  const critDamageScore = (critDamage / 300) * 100;

  return critRateScore * 0.5 + critDamageScore * 0.5;
}

function getTotalCvFromEchoes(echoes) {
  return echoes.reduce((total, echo) => total + calculateEchoCV(echo), 0);
}

function getTotalCv(character) {
  return character.echoes.reduce((total, echo) => total + (echo.cv || 0), 0).toFixed(1);
}

function getEchoCv(echo) {
  return calculateEchoCV(echo);
}

function getAccountDataUrl() {
  return assetUrl("assets/images/builds/account.json");
}

async function loadAccountBuilds() {
  const response = await fetch(getAccountDataUrl());

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar account.json.");
  }

  return response.json();
}

function getAccountBuildForCharacter(accountBuilds, character) {
  if (!Array.isArray(accountBuilds)) {
    return null;
  }

  const normalizeCharacterName = (name) => {
    return String(name || "")
      .toLowerCase()
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/[^a-z0-9]/g, "");
  };
  const characterName = normalizeCharacterName(character.name);

  return accountBuilds.find((build) => {
    const buildCharacterName =
      typeof build.character === "string"
        ? build.character
        : build.character?.name;

    return normalizeCharacterName(buildCharacterName) === characterName;
  });
}

function getDesiredSubstatsFromAccountBuild(accountBuild, character = null) {
  const rawSubstats =
    accountBuild?.substats ||
    accountBuild?.desiredSubstats ||
    accountBuild?.prioritySubstats ||
    character?.substats ||
    accountBuild?.character?.substats ||
    accountBuild?.character?.desiredSubstats ||
    accountBuild?.character?.prioritySubstats;

  if (Array.isArray(rawSubstats) && rawSubstats.length > 0) {
    return rawSubstats.map(normalizeStatName);
  }

  const fallbackStats = [
    "Crit Rate",
    "Crit DMG",
    ...(character?.substats || accountBuild?.character?.bonusStats || []).map(normalizeStatName),
  ];

  return [...new Set(fallbackStats)].slice(0, 5);
}

function calculateEchoMatch(echo, desiredSubstats) {
  const substatTypes = new Set(getEchoSubstats(echo).map((substat) => substat.normalizedType));
  const matched = desiredSubstats.filter((substat) => substatTypes.has(substat)).length;

  return {
    matched,
    total: desiredSubstats.length,
  };
}

function calculateBuildMatch(echoes, desiredSubstats) {
  const echoMatches = echoes.map((echo) => calculateEchoMatch(echo, desiredSubstats));
  const matched = echoMatches.reduce((total, match) => total + match.matched, 0);
  const total = echoMatches.reduce((sum, match) => sum + match.total, 0);

  return {
    matched,
    total,
    score: total > 0 ? (matched / total) * 100 : 0,
  };
}

function calculateEchoRV(echo, desiredSubstats) {
  const desiredSet = new Set(desiredSubstats);
  const matchingRolls = getEchoSubstats(echo).filter((substat) => {
    return desiredSet.has(substat.normalizedType) && echoRollMaximums[substat.normalizedType];
  });

  if (matchingRolls.length === 0) {
    return 0;
  }

  const totalPercent = matchingRolls.reduce((total, substat) => {
    return total + (substat.value / echoRollMaximums[substat.normalizedType]) * 100;
  }, 0);

  return totalPercent / matchingRolls.length;
}

function calculateBuildRV(echoes, desiredSubstats) {
  if (!Array.isArray(echoes) || echoes.length === 0) {
    return 0;
  }

  const totalRv = echoes.reduce((total, echo) => {
    return total + calculateEchoRV(echo, desiredSubstats);
  }, 0);

  return totalRv / echoes.length;
}

function getEchoMatch(echo, desiredSubstats) {
  return calculateEchoMatch(echo, desiredSubstats);
}

function getEchoRv(echo, desiredSubstats) {
  return calculateEchoRV(echo, desiredSubstats);
}

function isSupportBuild(character) {
  return String(character?.role || "").toLowerCase() === "support";
}

function calculateBuildScore({ role, critScore, rv, matchScore }) {
  const rawScore =
    String(role || "").toLowerCase() === "support"
      ? rv * 0.7 + matchScore * 0.3
      : critScore * 0.4 + rv * 0.4 + matchScore * 0.2;

  return Math.min(Math.max(rawScore, 0), 100);
}

function getBuildAnalysis(character, accountBuild) {
  const accountEchoes = Array.isArray(accountBuild?.echoes) ? accountBuild.echoes : [];
  const fallbackEchoes = character.echoes.map((echo) => ({
    ...echo,
    substats: [],
  }));
  const echoes = accountEchoes.length > 0 ? accountEchoes : fallbackEchoes;
  const desiredSubstats = getDesiredSubstatsFromAccountBuild(accountBuild, character);
  const support = isSupportBuild(character);
  const echoAnalyses = echoes.map((echo, index) => {
    const match = calculateEchoMatch(echo, desiredSubstats);
    const cv = getEchoSubstats(echo).length > 0 ? calculateEchoCV(echo) : echo.cv || 0;
    const rv = calculateEchoRV(echo, desiredSubstats);

    return {
      name: echo.name || character.echoes[index]?.name || `Eco ${index + 1}`,
      cost: echo.cost || character.echoes[index]?.cost || 1,
      main: normalizeStatName(echo.mainStatType || character.echoes[index]?.main || ""),
      cv,
      rv,
      match,
    };
  });
  const totalCv = getTotalCvFromEchoes(echoes);
  const characterCv = calculateCharacterCV(accountBuild);
  const critScore = calculateCritScore(accountBuild);
  const averageRv = calculateBuildRV(echoes, desiredSubstats);
  const match = calculateBuildMatch(echoes, desiredSubstats);
  const buildScore = calculateBuildScore({
    role: character.role,
    critScore,
    rv: averageRv,
    matchScore: match.score,
  });

  return {
    support,
    desiredSubstats,
    echoes: echoAnalyses,
    totalCv,
    characterCv,
    averageRv,
    match,
    critScore,
    buildScore,
  };
}

function sortBuilds(builds) {
  return [...builds].sort((left, right) => {
    const leftSupport = isSupportBuild(left.character);
    const rightSupport = isSupportBuild(right.character);

    if (leftSupport !== rightSupport) {
      return leftSupport ? -1 : 1;
    }

    if (leftSupport) {
      return right.analysis.buildScore - left.analysis.buildScore;
    }

    const cvDifference = right.analysis.characterCv - left.analysis.characterCv;

    if (cvDifference !== 0) {
      return cvDifference;
    }

    return left.character.name.localeCompare(right.character.name);
  });
}

function getProgressStorageKey(character) {
  return `ww-build-checklist:${character.name}`;
}

function getDefaultProgress() {
  return {
    characterLevel: false,
    weaponLevel: false,
    talents: false,
    echoes: false,
  };
}

function loadProgress(character) {
  try {
    const savedProgress = localStorage.getItem(getProgressStorageKey(character));

    if (!savedProgress) {
      return getDefaultProgress();
    }

    return {
      ...getDefaultProgress(),
      ...JSON.parse(savedProgress),
    };
  } catch {
    return getDefaultProgress();
  }
}

function saveProgress(character, progress) {
  try {
    localStorage.setItem(getProgressStorageKey(character), JSON.stringify(progress));
  } catch {
    return;
  }
}

function getProgressPercent(character) {
  const progress = loadProgress(character);
  const checked = Object.values(progress).filter(Boolean).length;

  return Math.round((checked / checklistItems.length) * 100);
}

function renderChecklist(character, compact = false) {
  const progress = loadProgress(character);

  return `
    <div class="${compact ? "mini-checklist" : "checklist"}" data-checklist="${escapeHtml(character.name)}">
      ${checklistItems
        .map(([key, label]) => {
          const checked = progress[key];

          return `
            <label class="check-item ${checked ? "is-done" : ""}">
              <input type="checkbox" data-progress-key="${key}" ${checked ? "checked" : ""} />
              <span>${label}</span>
            </label>
          `;
        })
        .join("")}
    </div>
  `;
}

function bindChecklists(root) {
  root.querySelectorAll("[data-checklist]").forEach((checklist) => {
    const character = getCharacterByName(checklist.dataset.checklist);

    checklist.addEventListener("change", () => {
      const progress = loadProgress(character);

      checklist.querySelectorAll("[data-progress-key]").forEach((input) => {
        progress[input.dataset.progressKey] = input.checked;
        input.closest(".check-item").classList.toggle("is-done", input.checked);
      });

      saveProgress(character, progress);
      root.querySelectorAll(`[data-progress-value="${character.name}"]`).forEach((node) => {
        node.textContent = `${getProgressPercent(character)}%`;
      });
      root.querySelectorAll(`[data-progress-bar="${character.name}"]`).forEach((node) => {
        node.style.width = `${getProgressPercent(character)}%`;
      });
    });
  });
}

function parseStoredJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getAppBackupData() {
  const characterProgress = {};

  characters.forEach((character) => {
    characterProgress[character.name] = loadProgress(character);
  });

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    dashboardPreferences: loadDashboardPreferences(),
    characterProgress,
    endgameProgress: parseStoredJson("ww-endgame-progress", {}),
    endgameCycles: parseStoredJson("ww-endgame-cycles", {}),
  };
}

function downloadAppBackup() {
  const backup = getAppBackupData();
  const file = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(file);
  const date = new Date().toISOString().slice(0, 10);
  const link = document.createElement("a");

  link.href = url;
  link.download = `wave-account-hub-backup-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function importAppBackup(backup) {
  if (!backup || typeof backup !== "object") {
    throw new Error("Arquivo de backup invalido.");
  }

  if (backup.dashboardPreferences) {
    localStorage.setItem(
      dashboardPrefsStorageKey,
      JSON.stringify({
        ...getDefaultDashboardPreferences(),
        ...backup.dashboardPreferences,
      })
    );
  }

  if (backup.characterProgress && typeof backup.characterProgress === "object") {
    characters.forEach((character) => {
      const progress = backup.characterProgress[character.name];

      if (progress) {
        saveProgress(character, {
          ...getDefaultProgress(),
          ...progress,
        });
      }
    });
  }

  if (backup.endgameProgress) {
    localStorage.setItem("ww-endgame-progress", JSON.stringify(backup.endgameProgress));
  }

  if (backup.endgameCycles) {
    localStorage.setItem("ww-endgame-cycles", JSON.stringify(backup.endgameCycles));
  }
}

function renderDataTools() {
  if (document.querySelector("[data-data-tools]")) {
    return;
  }

  const tools = document.createElement("div");

  tools.className = "data-tools";
  tools.dataset.dataTools = "true";
  tools.innerHTML = `
    <button class="data-tools-toggle" type="button" data-toggle-data-tools aria-expanded="false">Dados</button>
    <div class="data-tools-menu" data-data-tools-menu hidden>
      <button type="button" data-export-data>Exportar dados</button>
      <label>
        <span>Importar dados</span>
        <input type="file" accept="application/json,.json" data-import-data />
      </label>
    </div>
  `;
  document.body.appendChild(tools);

  tools.querySelector("[data-toggle-data-tools]").addEventListener("click", (event) => {
    const menu = tools.querySelector("[data-data-tools-menu]");
    const isOpen = !menu.hidden;

    menu.hidden = isOpen;
    event.currentTarget.setAttribute("aria-expanded", String(!isOpen));
  });

  tools.querySelector("[data-export-data]").addEventListener("click", () => {
    downloadAppBackup();
  });

  tools.querySelector("[data-import-data]").addEventListener("change", (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      try {
        importAppBackup(JSON.parse(reader.result));
        window.location.reload();
      } catch {
        alert("Nao foi possivel importar esse backup.");
      }
    });
    reader.readAsText(file);
  });
}

