const endgameProgressStorageKey = "ww-endgame-progress";

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
