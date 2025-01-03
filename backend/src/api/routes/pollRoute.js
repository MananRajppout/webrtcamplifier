const controller = require("../controllers/pollController");

module.exports = function (app) {
  app.post("/api/create/poll", controller.createPoll);
  app.get("/api/get/poll-id/:id", controller.getPollById);
  app.get("/api/get-all/poll/:projectId", controller.getAllPolls);
  app.put("/api/update-poll/:id", controller.updatePoll);
  app.delete("/api/delete/poll/:id", controller.deletePoll);
  app.post("/api/answer-poll", controller.submitPollResponse);
  app.patch('/api/change-active-status/:id', controller.changeActiveStatus);
  app.post("/api/start-poll", controller.startPoll)
};