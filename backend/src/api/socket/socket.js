const { Server } = require("socket.io");
const Meeting = require("../models/meetingModel");
const LiveMeeting = require("../models/liveMeetingModel");
const { v4: uuidv4 } = require('uuid');

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

    // socket.on("joinMeeting", async (data) => {
    //   console.log("Received joinMeeting event:", data);

    //   socket.emit("joinMeetingResponse", {
    //     success: true,
    //     message: "Successfully joined the meeting",
    //     data: data
    //   });
    // });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

module.exports = setupSocket;
