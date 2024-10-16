const { Server } = require("socket.io");
const Meeting = require("../models/meetingModel");
const LiveMeeting = require("../models/liveMeetingModel");
const { v4: uuidv4 } = require("uuid");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_BASE_URL, "http://localhost:3000"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("startMeeting", async (data) => {
      console.log("Received startMeeting event:", data);
      const { meetingId, user } = data;
      const existingMeeting = await Meeting.findById(meetingId);

      if (!existingMeeting) {
        socket.emit("startMeetingResponse", {
          success: false,
          message: "Meeting not found",
          meetingId: meetingId,
        });
        return; // Exit if no meeting exists
      }

      const liveMeeting = await LiveMeeting.findOne({ meetingId });

      if (liveMeeting) {
        if (liveMeeting.ongoing) {
          socket.emit("startMeetingResponse", {
            success: false,
            message: "Meeting is already in progress",
            meetingId: meetingId,
          });
        } else {
          liveMeeting.ongoing = true;
          liveMeeting.webRtcRoomId = meetingId;
          await liveMeeting.save();
          socket.emit("startMeetingResponse", {
            success: true,
            message: "Meeting resumed",
            liveMeeting: liveMeeting,
          });
        }
      }

      const moderatorId = uuidv4();

      const newLiveMeeting = new LiveMeeting({
        meetingId: meetingId,
        ongoing: true,
        webRtcRoomId: meetingId,
        moderator: {
          name: user.fullName,
          id: moderatorId,
          role: "Moderator",
        },
      });

      await newLiveMeeting.save();

      socket.emit("startMeetingResponse", {
        success: true,
        message: "Live meeting started successfully",
        liveMeeting: newLiveMeeting,
      });

      // console.log("existingMeeting", existingMeeting);
    });

    socket.on("participantJoinMeeting", async (data) => {
      console.log("Received participantJoinMeeting event:", data);
      const { meetingId, name, role } = data;
      console.log("meetingId", meetingId);

      let liveMeeting = await LiveMeeting.findOne({ meetingId: meetingId });

      if (!liveMeeting) {
        socket.emit("participantJoinMeetingResponse", {
          success: false,
          message: "Meeting not found",
          meetingId: meetingId,
        });
        return;
      }

      const isInWaitingRoom = liveMeeting.waitingRoom.some(
        (participant) => participant.name === name
      );

      if (isInWaitingRoom) {
        socket.emit("participantJoinMeetingResponse", {
          success: false,
          message: "Participant already in waiting room",
          meetingId: meetingId,
        });
        return;
      }

      const isInParticipantsList = liveMeeting.participantsList.some(
        (participant) => participant.name === name
      );
      if (isInParticipantsList) {
        socket.emit("participantJoinMeetingResponse", {
          success: false,
          message: "Participant already in the meeting",
          meetingId: meetingId,
        });
        return;
      }

      liveMeeting.waitingRoom.push({ name, role });
      await liveMeeting.save();

      socket.emit("participantJoinMeetingResponse", {
        success: true,
        message: "Participant added to waiting room",
        participant: { name, role },
      });
    });

    socket.on("observerJoinMeeting", async (data) => {
      console.log("Received observerJoinMeeting event:", data);
      const { meetingId, name, role, passcode } = data;
      console.log("meetingId", meetingId);

      const meeting = await Meeting.findById(meetingId);
      if (!meeting) {
        socket.emit("observerJoinMeetingResponse", {
          success: false,
          message: "Meeting not found",
          meetingId: meetingId,
        });
        return;
      }

      if (meeting.meetingPasscode !== passcode) {
        socket.emit("observerJoinMeetingResponse", {
          success: false,
          message: "Invalid passcode",
          meetingId: meetingId,
        });
        return;
      }
      console.log("meeting", meeting);
      let liveMeeting = await LiveMeeting.findOne({ meetingId });
      if (!liveMeeting) {
        socket.emit("observerJoinMeetingResponse", {
          success: false,
          message: "Live meeting not found",
          meetingId: meetingId,
        });
        return;
      }
      console.log("liveMeeting", liveMeeting);
      const isInObserverList = liveMeeting.observerList.some(
        (observer) => observer.name === name
      );
      if (isInObserverList) {
        socket.emit("observerJoinMeetingResponse", {
          success: false,
          message: "Observer already added to the meeting",
          meetingId: meetingId,
        });
        return;
      }

      const observerId = uuidv4();

      liveMeeting.observerList.push({ name, role, id: observerId });
      await liveMeeting.save();
      console.log("liveMeeting", liveMeeting);

      socket.emit("observerJoinMeetingResponse", {
        success: true,
        message: "Observer added to the meeting",
        observer: { name, role },
        isStreaming: liveMeeting.isStreaming,
      });
    });

    socket.on("getWaitingList", async (data) => {
      console.log("Received getWaitingList event:", data);
      const { meetingId } = data;
      try {
        const liveMeeting = await LiveMeeting.findOne({ meetingId });
        if (!liveMeeting) {
          socket.emit("getWaitingListResponse", {
            success: false,
            message: "Live meeting not found",
            meetingId: meetingId,
          });
          return;
        }
        socket.emit("getWaitingListResponse", {
          success: true,
          message: "Waiting list retrieved",
          waitingRoom: liveMeeting.waitingRoom,
        });
      } catch (error) {
        console.error("Error in getWaitingList:", error);
        socket.emit("getWaitingListResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });

    socket.on("acceptFromWaitingRoom", async (data) => {
      console.log("Received acceptFromWaitingRoom event:", data);
      const { meetingId, participant } = data;
      try {
        const liveMeeting = await LiveMeeting.findOne({ meetingId });
        if (!liveMeeting) {
          socket.emit("acceptFromWaitingRoomResponse", {
            success: false,
            message: "Live meeting not found",
            meetingId: meetingId,
          });
          return;
        }
        const participantIndex = liveMeeting.waitingRoom.findIndex(
          (p) => p.name === participant.name
        );

        if (participantIndex === -1) {
          socket.emit("acceptFromWaitingRoomResponse", {
            success: false,
            message: "Participant not found in waiting room",
            meetingId: meetingId,
          });
          return;
        }

        const [removedParticipant] = liveMeeting.waitingRoom.splice(
          participantIndex,
          1
        );

        const participantWithId = {
          ...removedParticipant.toObject(),
          id: uuidv4(),
        };

        liveMeeting.participantsList.push(participantWithId);
        await liveMeeting.save();

        socket.emit("participantList", {
          success: true,
          message: "Participant added to participants list",
          participantList: liveMeeting.participantsList,
        });
      } catch (error) {
        console.error("Error in acceptFromWaitingRoom:", error);
        socket.emit("acceptFromWaitingRoomResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });

    socket.on("getParticipantList", async (data) => {
      console.log("Received getParticipantList event:", data);
      const { meetingId } = data;
      try {
        const liveMeeting = await LiveMeeting.findOne({ meetingId });
        if (!liveMeeting) {
          socket.emit("getParticipantListResponse", {
            success: false,
            message: "Live meeting not found",
            meetingId: meetingId,
          });
          return;
        }

        const fullParticipantList = [
          liveMeeting.moderator,
          ...liveMeeting.participantsList,
        ];

        socket.emit("getParticipantListResponse", {
          success: true,
          message: "Participant list retrieved",
          participantList: fullParticipantList,
        });
      } catch (error) {
        console.error("Error in getParticipantList:", error);
        socket.emit("getParticipantListResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });

    socket.on("removeParticipantFromMeeting", async (data) => {
      console.log("Received removeParticipantFromMeeting event:", data);
      const { meetingId, name, role } = data;
      try {
        const liveMeeting = await LiveMeeting.findOne({ meetingId });
        if (!liveMeeting) {
          socket.emit("removeParticipantFromMeetingResponse", {
            success: false,
            message: "Live meeting not found",
            meetingId: meetingId,
          });
          return;
        }

        if (role === "Participant") {
          const initialParticipantsLength = liveMeeting.participantsList.length;

          // Remove the participant from participantsList
          const participantToRemove = liveMeeting.participantsList.find(
            (participant) => participant.name === name
          );

          liveMeeting.participantsList = liveMeeting.participantsList.filter(
            (participant) => participant.name !== name
          );

          // Add the removed participant to removedParticipants list
          liveMeeting.removedParticipants.push({
            name: name,
            role: role,
          });
          await liveMeeting.save();

          socket.emit("removeParticipantFromMeetingResponse", {
            success: true,
            message: "Participant removed from meeting",
            removeParticipantList: liveMeeting.removedParticipants,
          });
          socket.emit("participantList", {
            success: true,
            message: "Participant list retrieved",
            participantList: liveMeeting.participantsList,
          });
        }
      } catch (error) {
        console.error("Error in removeParticipantFromMeeting:", error);
        socket.emit("removeParticipantFromMeetingResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

module.exports = setupSocket;
