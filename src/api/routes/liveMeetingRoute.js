const controller = require("../controllers/liveMeetingController");

module.exports = function(app) {
  app.post("/api/live-meeting/start-meeting", controller.startMeeting);
  app.post("/api/live-meeting/join-meeting-participant", controller.joinMeetingParticipant);
  app.post("/api/live-meeting/join-meeting-observer", controller.joinMeetingObserver);
  app.get("/api/live-meeting/waiting-list/:meetingId", controller.getWaitingList);
  app.put("/api/live-meeting/accept-from-waiting-list", controller.acceptFromWaitingRoom);
  app.get("/api/live-meeting/participant-list/:meetingId", controller.getParticipantList);
  app.get("/api/live-meeting/observer-list/:meetingId", controller.getObserverList);
  app.get("/api/live-meeting/get-meeting-status/:meetingId", controller.getMeetingStatus);
}