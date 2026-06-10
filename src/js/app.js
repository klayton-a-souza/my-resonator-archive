renderDataTools();
renderDashboard();
renderBuildPage();
renderLibrary();
if (typeof renderTeamsPage === "function") {
  renderTeamsPage();
}
if (typeof renderPlanningPage === "function") {
  renderPlanningPage();
}
renderEndgame();
