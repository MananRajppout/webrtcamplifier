const controller = require("../controllers/meetingController");
const upload = require("../../middleware/upload")

module.exports = function (app) {
  app.post("/api/create/meeting", controller.createMeeting);
  app.get("/api/get-single-meeting/:meetingId", controller.getMeetingById);
  app.get("/api/get-all/meeting/:projectId", controller.getAllMeetings);
  app.post("/api/verify-meeting-passcode", controller.verifyModeratorMeetingPasscode);
  app.delete("/api/delete-meeting/:meetingId", controller.deleteMeeting);
  app.put("/api/edit-meeting", controller.editMeeting);
  app.post("/api/bulk-meeting-upload", upload.single('file'), controller.bulkUploadMeeting)
  
};
