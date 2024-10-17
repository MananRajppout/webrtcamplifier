const { Server } = require("socket.io");
const Meeting = require("../models/meetingModel");
const LiveMeeting = require("../models/liveMeetingModel");
const { v4: uuidv4 } = require("uuid");
const ChatMessage = require("../models/chatModel");

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

    });

    socket.on("participantJoinMeeting", async (data) => {
      const { meetingId, name, role } = data;

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
      const { meetingId, name, role, passcode } = data;

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
      let liveMeeting = await LiveMeeting.findOne({ meetingId });
      if (!liveMeeting) {
        socket.emit("observerJoinMeetingResponse", {
          success: false,
          message: "Live meeting not found",
          meetingId: meetingId,
        });
        return;
      }
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

      socket.emit("observerJoinMeetingResponse", {
        success: true,
        message: "Observer added to the meeting",
        observer: { name, role },
        isStreaming: liveMeeting.isStreaming,
      });
    });

    socket.on("getWaitingList", async (data) => {
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
      const { meetingId, name, role } = data;
      console.log("name in removeParticipantFromMeeting", name, role, meetingId);
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

          io.emit("participantRemoved", { name, role });

          socket.emit("removeParticipantFromMeetingResponse", {
            success: true,
            message: "Participant removed from meeting",
            removeParticipantList: liveMeeting.removedParticipants,
          });
          console.log("liveMeeting.participantsList in removeParticipantFromMeeting", liveMeeting.removedParticipants);
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

    socket.on("participantSendMessage", async (data) => {
      const { meetingId, message } = data;
      try {
        const liveMeeting = await LiveMeeting.findOne({ meetingId });
        if (!liveMeeting) {
          socket.emit("participantSendMessageResponse", {
            success: false,
            message: "Live meeting not found",
            meetingId: meetingId,
          });
          return;
        }

        // Create a new ChatMessage document
        const newChatMessage = new ChatMessage({
          senderName: message.senderName,
          receiverName: message.receiverName,
          message: message.message,
        });

        // Save the new chat message
        const savedChatMessage = await newChatMessage.save(); 

        liveMeeting.participantChat.push(savedChatMessage._id);
        await liveMeeting.save();

        const updatedLiveMeeting = await LiveMeeting.findOne({ meetingId }).populate('participantChat');

        socket.emit("participantChatResponse", {
          success: true,
          message: "Message sent to participant",
          participantMessages: updatedLiveMeeting.participantChat,
        }); 
      } catch (error) {
        console.error("Error in participantSendMessage:", error);
        socket.emit("participantChatResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });

    socket.on("getParticipantChat", async (data) => {
      const { meetingId } = data;
      try {
        const liveMeeting = await LiveMeeting.findOne({ meetingId }).populate('participantChat');
        if (!liveMeeting) {
          socket.emit("participantChatResponse", {
            success: false,
            message: "Live meeting not found",
            meetingId: meetingId,
          });
          return;
        }

        if (!liveMeeting.participantChat || liveMeeting.participantChat.length === 0) {
          socket.emit("participantChatResponse", {
            success: false,
            message: "No chat messages found for this meeting",
            meetingId: meetingId,
          });
          return;
        }

        socket.emit("participantChatResponse", {
          success: true,
          message: "Participant chat retrieved successfully",
          participantMessages: liveMeeting.participantChat,
        });
      } catch (error) {
        console.error("Error in getParticipantChat:", error);
        socket.emit("participantChatResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });

    socket.on("getObserverList", async (data) => {
      ("Received getObserverList event:", data);
      const { meetingId } = data;
      try {
        const liveMeeting = await LiveMeeting.findOne({ meetingId });
        if (!liveMeeting) {
          socket.emit("getObserverListResponse", {
            success: false,
            message: "Live meeting not found",
            meetingId: meetingId,   
          });
          return;
        }

        const fullObserverList = [
          liveMeeting.moderator,
          ...liveMeeting.observerList,
        ];
        
        socket.emit("getObserverListResponse", {
          success: true,
          message: "Observer list retrieved successfully",
          observersList: fullObserverList,
        });
      } catch (error) {
        console.error("Error in getObserverList:", error);
        socket.emit("getObserverListResponse", {
          success: false, 
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });

    socket.on("sendMessageObserver", async (data) => {
      const { meetingId, message } = data;
      try {
        const liveMeeting = await LiveMeeting.findOne({ meetingId });
        if (!liveMeeting) {
          socket.emit("sendMessageObserverResponse", {
            success: false,
            message: "Live meeting not found",
            meetingId: meetingId,
          });
          return;
        }

        // Create a new ChatMessage document
        const newChatMessage = new ChatMessage({
          senderName: message.senderName,
          receiverName: message.receiverName,
          message: message.message,
        });

        // Save the new chat message
        const savedChatMessage = await newChatMessage.save();

        // Add the saved chat message's ID to the liveMeeting's observerChat array
        liveMeeting.observerChat.push(savedChatMessage._id);
        await liveMeeting.save();

        const updatedLiveMeeting = await LiveMeeting.findOne({ meetingId }).populate('observerChat');
        // console.log("updatedLiveMeeting in sendMessageObserver", updatedLiveMeeting);

        socket.emit("observerChatResponse", {
          success: true,
          message: "Message sent to observer",
          observerMessages: updatedLiveMeeting.observerChat,
        });
      } catch (error) {
        console.error("Error in sendMessageObserver:", error);
        socket.emit("observerChatResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });

    socket.on("getObserverChat", async (data) => {
      const { meetingId } = data;
      console.log("meetingId", meetingId);
      try {
        const liveMeeting = await LiveMeeting.findOne({ meetingId }).populate('observerChat');
        if (!liveMeeting) {
          socket.emit("observerChatResponse", {
            success: false,
            message: "Live meeting not found",
            meetingId: meetingId,
          });
          return;
        }

        if (!liveMeeting.observerChat || liveMeeting.observerChat.length === 0) {
          socket.emit("observerChatResponse", {
            success: false,
            message: "No chat messages found for this meeting",
            meetingId: meetingId,
          });
          return;
        }
        socket.emit("observerChatResponse", {
          success: true,
          message: "Observer chat retrieved successfully",
          observerMessages: liveMeeting.observerChat,
        });
      } catch (error) {
    
        console.error("Error in getObserverChat:", error);
        socket.emit("observerChatResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });

    socket.on("startStreaming", async (data) => {
      const { meetingId } = data;
      try {
        const liveMeeting = await LiveMeeting.findOne({ meetingId });
        if (!liveMeeting) {
          socket.emit("startStreamingResponse", {
            success: false,
            message: "Live meeting not found",
            meetingId: meetingId,
          });
          return;
        }
        liveMeeting.isStreaming = true;
        await liveMeeting.save();
        socket.emit("getStreamingStatusResponse", {
          success: true,
          message: "Streaming started successfully",
          isStreaming: liveMeeting.isStreaming,
        });
      } catch (error) {
        console.error("Error in startStreaming:", error);
        socket.emit("startStreamingResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });

    socket.on("getStreamingStatus", async (data) => {
      const { meetingId } = data;
      try {
        const liveMeeting = await LiveMeeting.findOne({ meetingId });
        if (!liveMeeting) {
          socket.emit("getStreamingStatusResponse", {
            success: false,
            message: "Live meeting not found",
            meetingId: meetingId,
          });
          return;
        }
        socket.emit("getStreamingStatusResponse", {
          success: true,
          message: "Streaming status retrieved successfully",
          isStreaming: liveMeeting.isStreaming,
          
        });
      } catch (error) {
        console.error("Error in getStreamingStatus:", error);
        socket.emit("getStreamingStatusResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });

    socket.on("removeFromWaitingRoom", async (data) => {
      const { meetingId, participant } = data;
      try {
        const liveMeeting = await LiveMeeting.findOne({ meetingId });
        if (!liveMeeting) {
          socket.emit("removeFromWaitingRoomResponse", {
            success: false,
            message: "Live meeting not found",
            meetingId: meetingId,
          });
          return;
        }
    
        // Remove the participant from the waiting room
        liveMeeting.waitingRoom = liveMeeting.waitingRoom.filter(
          (p) => p.name !== participant.name
        );
        await liveMeeting.save();
    
        socket.emit("removeFromWaitingRoomResponse", {
          success: true,
          message: "Participant removed from waiting room",
          removedParticipant: participant,
        });
    
        // Notify the removed participant
        io.emit("participantRemovedFromWaiting", { name: participant.name, role: participant.role });
    
      } catch (error) {
        console.error("Error in removeFromWaitingRoom:", error);
        socket.emit("removeFromWaitingRoomResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });

    socket.on("admitAllFromWaitingRoom", async (data) => {
      const { meetingId } = data;
      try {
        const liveMeeting = await LiveMeeting.findOne({ meetingId });
        if (!liveMeeting) {
          socket.emit("admitAllFromWaitingRoomResponse", {
            success: false,
            message: "Live meeting not found",
            meetingId: meetingId,
          });
          return;
        }
    
        // Move all participants from waiting room to participants list
        const participantsToAdmit = liveMeeting.waitingRoom.map(participant => ({
          ...participant.toObject(),
          id: uuidv4()
        }));
    
        liveMeeting.participantsList.push(...participantsToAdmit);
        liveMeeting.waitingRoom = [];
        await liveMeeting.save();
    
        socket.emit("admitAllFromWaitingRoomResponse", {
          success: true,
          message: "All participants admitted",
          admittedParticipants: participantsToAdmit,
        });
    
        // Notify all admitted participants
        io.emit("participantsAdmitted", { admittedParticipants: participantsToAdmit });
    
      } catch (error) {
        console.error("Error in admitAllFromWaitingRoom:", error);
        socket.emit("admitAllFromWaitingRoomResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });
  
    

// * disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

module.exports = setupSocket;
