const controller = require("../controllers/projectController");

module.exports = function (app) {
  app.post("/api/create/project", controller.createProject);
  app.post("/api/create-project-by-external-admin", controller.createProjectByExternalAdmin)
  app.post("/api/create-project-by-amplify-admin", controller.createProjectByAmplifyAdmin)
  app.get("/api/get/project-id", controller.getProjectById);
  app.get("/api/get/get-project-by-userId/:id", controller.getProjectByUserId);
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
  app.put("/api/project/assignTagsToProject", controller.assignTagsToProject);
  app.get("/api/project/getAllProjectsForAmplify", controller.getAllProjectsForAmplify);
  app.post("/api/send-email-to-new-contact", controller.sendEmailToNewContact)

  // Project details form 
  app.post("/api/save-progress", controller.saveProgress)
  app.post("/api/email-project-info", controller.emailProjectInfo)

  // Project usages details
  app.get("/api/remaining-credits/:userId", controller.getCreditBalance)
  app.get("/api/project-minutes-usage/:userId", controller.getProjectMinutesUsage)
};

// for usage of this search Api
// GET /api/search/contact?firstName=John
