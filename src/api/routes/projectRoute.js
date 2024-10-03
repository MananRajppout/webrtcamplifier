const controller = require("../controllers/projectController");

module.exports = function (app) {
  app.post("/api/create/project", controller.createProject);
  app.get("/api/get/project-id", controller.getProjectById);
  app.get("/api/get-all/project/:id", controller.getAllProjects);
  app.put("/api/update-project", controller.updateProject);
  app.delete("/api/delete/project/:id", controller.deleteProject);
  // New search API for contacts by first name
  app.get("/api/search/project", controller.searchProjectsByFirstName);

  //Following are restored from the previous code
  app.put("/api/change-project-status/:projectId", controller.projectStatusChange);
  app.put("/api/update-general-project-info/:projectId", controller.updateGeneralProjectInfo);
  app.put("/api/app-people-to-project", controller.addPeopleIntoProject);
  app.put("/api/edit-member-role/:projectId", controller.editMemberRole);
  app.delete("/api/delete-member-from-project/:projectId/:memberId", controller.deleteMemberFromProject);
  app.put("/api/project/updateBulkMembers", controller.updateBulkMembers);
};

// for usage of this search Api
// GET /api/search/contact?firstName=John
