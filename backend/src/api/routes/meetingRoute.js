const controller = require("../controllers/meetingController");

module.exports = function (app) {
  app.post("/api/create/meeting", controller.createMeeting);
  app.get("/api/get-single-meeting/:meetingId", controller.getMeetingById);
  app.get("/api/get-all/meeting/:projectId", controller.getAllMeetings);
  app.post("/api/verify-meeting-passcode", controller.verifyModeratorMeetingPasscode);
  app.delete("/api/delete-meeting/:meetingId", controller.deleteMeeting)

};
