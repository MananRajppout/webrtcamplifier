const { Server } = require("socket.io");
const Meeting = require("../models/meetingModel");
const LiveMeeting = require("../models/liveMeetingModel");
const { v4: uuidv4 } = require("uuid");
const ChatMessage = require("../models/chatModel");
const GroupMessage = require('../models/groupMessage');
const MediaBoxModel = require('../models/mediaBox.js');

let messageBatch = [];
const FLUSH_INTERVAL = 10000;

function addMessageToBatch(message) {
  messageBatch.push(message);
}


async function flushMessages() {
  if (messageBatch.length === 0) {
    return;
  }

  // Create a copy of the batch and reset the main array
  const batchToInsert = [...messageBatch];
  messageBatch = [];
  try {
    await GroupMessage.insertMany(batchToInsert);
    console.log(`Successfully inserted ${batchToInsert.length} messages`);
  } catch (error) {
    console.error('Failed to insert messages:', error);
    messageBatch.push(...batchToInsert);
  }
}

async function checkMeetingExists(meetingId, socket, event) {
  const existingMeeting = await Meeting.findById(meetingId);

  if (!existingMeeting) {
    socket.emit(event, {
      success: false,
      message: "Meeting not found",
      meetingId,
    });
    return false;
  }

  return existingMeeting;
}
async function checkLiveMeetingExists(meetingId, socket, event) {
  const existingMeeting = await LiveMeeting.findOne({ meetingId: meetingId });

  if (!existingMeeting) {
    socket.emit(event, {
      success: false,
      message: "Meeting not found",
      meetingId,
    });
    return false;
  }

  return existingMeeting;
}


setInterval(flushMessages, FLUSH_INTERVAL);

async function getGroupMessage(meetingId) {
  const noAddedMessage = messageBatch.filter(m => m.meetingId == meetingId);
  const addedMessage = await GroupMessage.find({ meetingId });
  return [...addedMessage, ...noAddedMessage]
}

const usernames = {};
const userchangeroom = {};


const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("join-room", async ({ roomid, name, email, roomname, role }, callback) => {

      socket.join(roomid);
      // for group chat
      socket.join(`${roomid}-${roomname}`);
      usernames[socket.id] = {
        name,
        roomid,
        email,
        role
      };
      console.log(`User with name ${name} joined meeting ${roomid} role ${role}`)
      const newname = email + roomid;
      delete userchangeroom[newname];

      if (role == "Participant") {
        const liveMeeting = await LiveMeeting.findOne({ meetingId: roomid });
        const participantIndex = liveMeeting.participantsList.findIndex(p => p.email == email);
        if (participantIndex != -1 && liveMeeting.participantsList[participantIndex]) {
          liveMeeting.participantsList[participantIndex].status = "online";
          liveMeeting.participantsList[participantIndex].joiningTime = Date.now();
          await liveMeeting.save();
        }

        const fullParticipantList = [
          liveMeeting.moderator,
          ...liveMeeting.participantsList,
        ];

        io.to(liveMeeting.meetingId.toString()).emit("participantList", {
          success: true,
          message: "Participant added to participants list",
          waitingRoom: liveMeeting.waitingRoom,
          participantList: fullParticipantList,
        });
      }

      if (role == "Moderator") {
        const liveMeeting = await LiveMeeting.findOne({ meetingId: roomid });
        if (liveMeeting) {
          liveMeeting.startTime = Date.now();
          liveMeeting.moderator.joiningTime = Date.now();
          liveMeeting.moderator.status = "online";
          await liveMeeting.save();

          const fullParticipantList = [
            liveMeeting.moderator,
            ...liveMeeting.participantsList,
          ];

          io.to(liveMeeting.meetingId.toString()).emit("participantList", {
            success: true,
            message: "Participant added to participants list",
            waitingRoom: liveMeeting.waitingRoom,
            participantList: fullParticipantList,
          });
        }


      }



      if (role == "Observer") {
        const liveMeeting = await LiveMeeting.findOne({ meetingId: roomid });
        if (liveMeeting) {
          const observerIndex = liveMeeting.observerList.findIndex(b => b.email == email);
          console.log(observerIndex)
          if (liveMeeting.observerList[observerIndex]) {
            liveMeeting.observerList[observerIndex].joiningTime = Date.now();
            liveMeeting.observerList[observerIndex].status = "online";

            await liveMeeting.save();


            const fullObserverList = [
              liveMeeting.moderator,
              ...liveMeeting.observerList,
            ];

            io.to(liveMeeting.meetingId.toString()).emit("getObserverListResponse", {
              success: true,
              message: "Observer list retrieved successfully",
              observersList: fullObserverList,
            });
          }
        }


      }

      const meeting = await Meeting.findById(roomid).populate("moderator");
      callback(socket.id, meeting);
    })

    socket.on("startMeeting", async (data) => {
      const { meetingId, user } = data;

      const existingMeeting = await checkMeetingExists(meetingId, socket, "meeting-not-found");
      if (!existingMeeting) return;


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

    socket.on("participantWantToJoin", async (data) => {
      const { meetingId, name, role, email } = data;

      let liveMeeting = await checkLiveMeetingExists(meetingId, socket, "meeting-not-found");
      if (!liveMeeting) return;



      const isInWaitingRoom = liveMeeting.waitingRoom.some(
        (participant) => participant.email === email
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
        (participant) => participant.email === email
      );
      if (isInParticipantsList) {
        socket.emit("participantJoinMeetingResponse", {
          success: false,
          message: "Participant already in the meeting",
          meetingId: meetingId,
        });
        return;
      }

      liveMeeting.waitingRoom.push({ name, role, email });
      await liveMeeting.save();

      socket.emit("participantJoinMeetingResponse", {
        success: true,
        message: "Participant added to waiting room",
        participant: { name, role, email },
      });

      // Broadcast the updated waiting room list to all clients in the meeting room
      io.to(meetingId).emit("participantWaiting", {
        waitingRoom: liveMeeting.waitingRoom,
      });
    });

    socket.on("acceptFromWaitingRoom", async (data) => {
      const { meetingId, participant } = data;
      try {
        console.log(io.sockets.adapter.rooms);


        let liveMeeting = await checkLiveMeetingExists(meetingId, socket, "meeting-not-found");
        if (!liveMeeting) return;


        const participantIndex = liveMeeting.waitingRoom.findIndex(
          (p) => p.email === participant.email
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
          status: "online",
        };

        liveMeeting.participantsList.push(participantWithId);
        await liveMeeting.save();

        const fullParticipantList = [
          liveMeeting.moderator,
          ...liveMeeting.participantsList,
        ];
        io.to(meetingId).emit("participantList", {
          success: true,
          message: "Participant added to participants list",
          waitingRoom: liveMeeting.waitingRoom,
          participantList: fullParticipantList,
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

        const liveMeeting = await checkLiveMeetingExists(meetingId, socket, "meeting-not-found");
        if (!liveMeeting) return;


        const fullParticipantList = [
          liveMeeting.moderator,
          ...liveMeeting.participantsList,
        ];

        let breakoutRooms = liveMeeting.breakRooms?.map((r) => r.roomName) || [];
        breakoutRooms = ["Main", ...breakoutRooms];

        io.to(meetingId).emit("participantList", {
          success: true,
          message: "Participant added to participants list",
          waitingRoom: liveMeeting.waitingRoom,
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


    socket.on("removeFromWaitingRoom", async (data) => {
      const { meetingId, participant } = data;
      try {
        const liveMeeting = await checkLiveMeetingExists(meetingId, socket, "meeting-not-found");
        if (!liveMeeting) return;


        // Remove the participant from the waiting room
        liveMeeting.waitingRoom = liveMeeting.waitingRoom.filter(
          (p) => p.name !== participant.name
        );
        await liveMeeting.save();



        // Notify the removed participant
        io.emit("participantRemovedFromWaiting", { name: participant.name, role: participant.role, email: participant.email });

        io.to(meetingId).emit("participantWaiting", {
          waitingRoom: liveMeeting.waitingRoom,
        });

      } catch (error) {
        console.error("Error in removeFromWaitingRoom:", error);
        socket.emit("removeFromWaitingRoomResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });

    socket.on("toggleStreaming", async (data) => {
      const { meetingId } = data;
      try {

        const liveMeeting = await checkLiveMeetingExists(meetingId, socket, "meeting-not-found");
        if (!liveMeeting) return;



        liveMeeting.isStreaming = !liveMeeting.isStreaming;
        await liveMeeting.save();

        socket.emit("getStreamingStatusResponse", {
          success: true,
          message: `Streaming ${liveMeeting.isStreaming ? "started" : "stopped"} successfully`,
          isStreaming: liveMeeting.isStreaming,
        });

        // Notify observers based on streaming status
        if (liveMeeting.isStreaming) {
          console.log('navigateToMeeting')
          io.emit("navigateToMeeting", { meetingId });
        } else {
          console.log('navigateToObserverWaitingRoom')
          io.emit("navigateToObserverWaitingRoom", { meetingId });
        }
      } catch (error) {
        console.error("Error in toggleStreaming:", error);
        socket.emit("toggleStreamingResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });

    socket.on("observerJoinMeeting", async (data) => {
      const { meetingId, name, role, passcode, email } = data;

      const meeting = await checkMeetingExists(meetingId, socket, "meeting-not-found");
      if (!meeting) return;


      if (meeting.meetingPasscode !== passcode) {
        socket.emit("observerJoinMeetingResponse", {
          success: false,
          message: "Invalid passcode",
          meetingId: meetingId,
        });
        return;
      }

      let liveMeeting = await checkLiveMeetingExists(meetingId, socket, "meeting-not-found");
      if (!liveMeeting) return;

      const isInObserverList = liveMeeting.observerList.some(
        (observer) => observer.name === name
      );
      if (isInObserverList) {
        socket.emit("observerJoinMeetingResponse", {
          success: false,
          message: "Observer already added to the meeting",
          meetingId: meetingId
        });
        return;
      }

      const observerId = uuidv4();

      liveMeeting.observerList.push({ name, role, id: observerId, email });
      await liveMeeting.save();


      const fullObserverList = [
        liveMeeting.moderator,
        ...liveMeeting.observerList,
      ];

      io.to(meetingId).emit("getObserverListResponse", {
        success: true,
        message: "Observer list retrieved successfully",
        observersList: fullObserverList,
      });

      socket.emit("observerJoinMeetingResponse", {
        success: true,
        message: "Observer added to the meeting",
        observer: { name, role },
        isStreaming: liveMeeting.isStreaming,
      });
    });

    socket.on("removeParticipantFromMeeting", async (data) => {
      const { meetingId, name, role, email } = data;
      console.log('removeParticipantFromMeeting', data)

      try {

        const liveMeeting = await checkLiveMeetingExists(meetingId, socket, "meeting-not-found");
        if (!liveMeeting) return;

        if (role === "Participant") {
          const initialParticipantsLength = liveMeeting.participantsList.length;

          // Remove the participant from participantsList
          const participantToRemove = liveMeeting.participantsList.find(
            (participant) => participant.email === email
          );

          console.log('participantToRemove', participantToRemove)

          liveMeeting.participantsList = liveMeeting.participantsList.filter(
            (participant) => participant.email !== email
          );

          // Add the removed participant to removedParticipants list
          liveMeeting.removedParticipants.push({
            name: name,
            role: role,
            email: participantToRemove.email
          });
          await liveMeeting.save();

          const fullParticipantList = [
            liveMeeting.moderator,
            ...liveMeeting.participantsList,
          ];

          io.emit("participantRemoved", { name, role, email });

          socket.emit("removeParticipantFromMeetingResponse", {
            success: true,
            message: "Participant removed from meeting",
            removeParticipantList: liveMeeting.removedParticipants,
          });

          io.emit("participantList", {
            success: true,
            message: "Participant list retrieved",
            participantList: fullParticipantList,
            waitingRoom: liveMeeting.waitingRoom
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


    socket.on("moveParticipantToWaitingRoom", async (data) => {
      const { meetingId, name, role, email } = data;
      console.log('moveParticipantToWaitingRoom', data)

      try {

        const liveMeeting = await checkLiveMeetingExists(meetingId, socket, "meeting-not-found");
        if (!liveMeeting) return;

        if (role === "Participant") {

          // Remove the participant from participantsList
          const participantToRemove = liveMeeting.participantsList.find(
            (participant) => participant.email === email
          );


          liveMeeting.participantsList = liveMeeting.participantsList.filter(
            (participant) => participant.email !== email
          );

          // Add the removed participant to removedParticipants list
          liveMeeting.waitingRoom.push({
            name: name,
            role: role,
            email: participantToRemove.email
          });
          await liveMeeting.save();

          const fullParticipantList = [
            liveMeeting.moderator,
            ...liveMeeting.participantsList,
          ];

          io.to(meetingId).emit("participantMovedToWaitingRoom", { name, role, email });


          io.to(meetingId).emit("participantList", {
            success: true,
            message: "Participant list retrieved",
            participantList: fullParticipantList,
            waitingRoom: liveMeeting.waitingRoom
          });
        }
      } catch (error) {
        console.error("Error in participantMovedToWaitingRoom:", error);

      }
    });

    socket.on("getMeetingStatus", async (data) => {
      const { meetingId } = data;
      try {

        const liveMeeting = await checkLiveMeetingExists(meetingId, socket, "meeting-not-found");
        if (!liveMeeting) return;

        socket.emit("getMeetingStatusResponse", {
          success: true,
          message: "Meeting status retrieved",
          meetingStatus: liveMeeting.ongoing,
        });
      } catch (error) {
        console.error("Error in getMeetingStatus:", error);
        socket.emit("getMeetingStatusResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });


    //get all previous chat when medirator joined
    socket.on("getParticipantsChat", async (data) => {
      const { meetingId } = data;
      try {

        const liveMeeting = await checkLiveMeetingExists(meetingId, socket, "meeting-not-found");
        if (!liveMeeting) return;

        const updatedLiveMeeting = await LiveMeeting.findOne({ meetingId }).populate('participantChat');
        const allBreakRoomsNameList = updatedLiveMeeting.breakRooms.map((room) => room.roomName).filter(name => !!name);
        io.emit("participantChatResponse", {
          success: true,
          message: "Message sent to participant",
          participantMessages: updatedLiveMeeting.participantChat,
          allBreakRoomsNameList
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

    socket.on("participantSendMessage", async (data) => {
      const { meetingId, message } = data;
      try {

        const liveMeeting = await checkLiveMeetingExists(meetingId, socket, "meeting-not-found");
        if (!liveMeeting) return;

        // Create a new ChatMessage document
        const newChatMessage = new ChatMessage({
          senderName: message.senderName,
          receiverName: message.receiverName,
          message: message.message,
          senderEmail: message.senderEmail,
          receiverEmail: message.receiverEmail
        });

        // Save the new chat message
        const savedChatMessage = await newChatMessage.save();


        liveMeeting.participantChat.push(savedChatMessage._id);
        await liveMeeting.save();

        const updatedLiveMeeting = await LiveMeeting.findOne({ meetingId }).populate('participantChat');


        io.emit("participantChatResponse", {
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

    socket.on("create-breakout-room", async ({ meetingId, breakroomname, participants }, callback) => {
      const existingMeeting = await Meeting.findById(meetingId);
      if (!existingMeeting) {
        callback(null, "Meeting Not Exist.");
        return
      }

      const liveMeeting = await LiveMeeting.findOne({ meetingId });
      if (!liveMeeting) {
        callback(null, "Live Meeting Not Exist.");
        return
      }


      for (let index = 0; index < participants.length; index++) {
        const element = participants[index];
        const name = element.email + meetingId;
        userchangeroom[name] = true;
      }


      const newRoom = [];
      const isMainRoomExist = liveMeeting.breakRooms.some(room => room.roomName == 'main');
      console.log('main room not exist', isMainRoomExist);
      if (!isMainRoomExist) {
        newRoom.push({ roomName: "main" });
      }

      newRoom.push({ roomName: breakroomname });

      liveMeeting.breakRooms = [...liveMeeting.breakRooms, ...newRoom];
      liveMeeting.participantsList = liveMeeting.participantsList.map(p => {

        const participant = participants.find(part => part.email == p.email);
        if (participant) {
          p.roomName = breakroomname;
        }
        return p;
      });


      await liveMeeting.save();
      const fullParticipantList = [
        liveMeeting.moderator,
        ...liveMeeting.participantsList,
      ];


      for (let index = 0; index < participants.length; index++) {
        const element = participants[index];
        const name = element.email + meetingId;
        userchangeroom[name] = true;
      }

      const allBreakRoomsNameList = liveMeeting.breakRooms.map((room) => room.roomName).filter(name => !!name);
      callback({ fullParticipantList, breakroomname, breakoutsRooms: allBreakRoomsNameList }, null);
      socket.to(meetingId).emit('change-room', { participantList: participants, roomName: breakroomname });
    });


    socket.on("user-move", async ({ meetingId, breakroomname, participants }, callback) => {
      const existingMeeting = await Meeting.findById(meetingId);
      if (!existingMeeting) {
        callback(null, "Meeting Not Exist.");
        return
      }

      const liveMeeting = await LiveMeeting.findOne({ meetingId });
      if (!liveMeeting) {
        callback(null, "Live Meeting Not Exist.");
        return
      }

      for (let index = 0; index < participants.length; index++) {
        const element = participants[index];
        const name = element.email + meetingId;
        userchangeroom[name] = true;
      }


      liveMeeting.participantsList = liveMeeting.participantsList.map(p => {
        const participant = participants.find(part => part.email == p.email);
        if (participant) {
          p.roomName = breakroomname;
        }
        return p;
      });


      await liveMeeting.save();
      const fullParticipantList = [
        liveMeeting.moderator,
        ...liveMeeting.participantsList,
      ];

      callback({ fullParticipantList, breakroomname }, null);
      socket.to(meetingId).emit('change-room', { participantList: participants, roomName: breakroomname });
    });



    //rename user name
    socket.on("change-participant-name", async ({ meetingId, newname, userid }, callback) => {
      const existingMeeting = await Meeting.findById(meetingId);
      if (!existingMeeting) {
        callback(null, "Meeting Not Exist.");
        return
      }

      const liveMeeting = await LiveMeeting.findOne({ meetingId });
      if (!liveMeeting) {
        callback(null, "Live Meeting Not Exist.");
        return
      }




      liveMeeting.participantsList = liveMeeting.participantsList.map(p => {
        if (p?.id?.toString() == userid?.toString()) {
          p.name = newname;
        }
        return p;
      });


      await liveMeeting.save();
      const fullParticipantList = [
        liveMeeting.moderator,
        ...liveMeeting.participantsList,
      ];

      callback({ fullParticipantList }, null);
    });

    socket.on('grounp:send-message', ({ meetingId, email, content, name, roomname }) => {
      const id = `${meetingId}-${roomname}`;
      const newMessage = {
        meetingId: id,
        senderEmail: email,
        content,
        name,
        timestamp: Date.now()
      }
      addMessageToBatch(newMessage);
      socket.to(id).emit('group:receive-message', newMessage);
    });

    socket.on('grounp:get-message', async ({ meetingId, roomname }, callback) => {
      const id = `${meetingId}-${roomname}`;
      const messages = await getGroupMessage(id);

      callback(messages);
    })

    socket.on('mediabox:on-get-media', async ({ meetingId,projectId }, callback) => {
      const media = await MediaBoxModel.find({ projectId });
      callback(media);
    });




    //get observer list
    socket.on("getObserverList", async (data) => {
      ("Received getObserverList event:", data);
      const { meetingId } = data;
      try {
        const liveMeeting = await LiveMeeting.findOne({ meetingId });
        if (!liveMeeting) {
          io.to(meetingId).emit("getObserverListResponse", {
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

        io.to(meetingId).emit("getObserverListResponse", {
          success: true,
          message: "Observer list retrieved successfully",
          observersList: fullObserverList,
        });
      } catch (error) {
        console.error("Error in getObserverList:", error);
        io.to(meetingId).emit("getObserverListResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });


    //get observer chat
    socket.on("getObserverChat", async (data) => {
      const { meetingId } = data;


      try {
        const liveMeeting = await LiveMeeting.findOne({ meetingId }).populate('observerChat');
        if (!liveMeeting) {
          io.to(meetingId).emit("observerChatResponse", {
            success: false,
            message: "Live meeting not found",
            meetingId: meetingId,
          });
          return;
        }


        if (!liveMeeting.observerChat || liveMeeting.observerChat.length === 0) {
          io.to(meetingId).emit("observerChatResponse", {
            success: false,
            message: "No chat messages found for this meeting",
            meetingId: meetingId,
          });
          return;
        }




        io.to(meetingId).emit("observerChatResponse", {
          success: true,
          message: "Observer chat retrieved successfully",
          observerMessages: liveMeeting.observerChat,
        });
      } catch (error) {

        console.error("Error in getObserverChat:", error);
        socket.to(meetingId).emit("observerChatResponse", {
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
          io.to(meetingId).emit("sendMessageObserverResponse", {
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
          senderEmail: message.senderEmail,
          receiverEmail: message.receiverEmail
        });


        // Save the new chat message
        const savedChatMessage = await newChatMessage.save();

        // Add the saved chat message's ID to the liveMeeting's observerChat array
        liveMeeting.observerChat.push(savedChatMessage._id);
        await liveMeeting.save();

        const updatedLiveMeeting = await LiveMeeting.findOne({ meetingId }).populate('observerChat');


        io.to(meetingId).emit("observerChatResponse", {
          success: true,
          message: "Message sent to observer",
          observerMessages: updatedLiveMeeting.observerChat,
        });
      } catch (error) {
        console.error("Error in sendMessageObserver:", error);
        io.to(meetingId).emit("observerChatResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });
      }
    });




    //end meeting
    socket.on("endMeeting", async (data) => {
      const { meetingId } = data;
      console.log('endMeeting', data);
      try {
        const liveMeeting = checkLiveMeetingExists(meetingId, socket, "meeting-not-found");
        if (!liveMeeting) return;
        liveMeeting.isMeetindEnded = true;
        liveMeeting.endTime = Date.now();
        liveMeeting.duration = (((new Date(liveMeeting.endTime)) - (new Date(liveMeeting.startTime))) / 1000) / 60;
        io.to(meetingId).emit("endMeeting", {
          success: true,
          message: "Meeting ended successfully",
          meetingId: meetingId,
        });
      } catch (error) {
        console.error("Error in endMeeting:", error);
        socket.emit("endMeetingResponse", {
          success: false,
          message: "Server error occurred",
          meetingId: meetingId,
        });

      }

    });



    //polling feature needs to be handled, here we are just sending the data to all the clients
    //starting

    
    //ending

    // * disconnect
    socket.on("disconnect", async () => {
      console.log("User disconnected", usernames[socket.id]);
      const userDetails = usernames[socket.id] || {};
      const newname = userDetails?.email + userDetails?.roomid;
      const isMoveByModerator = userchangeroom[newname];
      console.log(isMoveByModerator)
      if (isMoveByModerator) {
        return
      }
      const liveMeeting = await LiveMeeting.findOne({ meetingId: userDetails?.roomid });
      if (!liveMeeting) {
        return
      }


      if (userDetails?.role == "Participant") {
        const participantIndex = liveMeeting.participantsList.findIndex(p => p.email == userDetails?.email);
        if (liveMeeting.participantsList[participantIndex]) {
          liveMeeting.participantsList[participantIndex].status = "offline";
          liveMeeting.participantsList[participantIndex].leavingTime = Date.now();
        }
      }



      if (userDetails?.role == "Observer") {
        const observerIndex = liveMeeting.observerList.findIndex(b => b.email == userDetails?.email);
        console.log('diconnet',userDetails.name)
        if (liveMeeting.observerList[observerIndex]) {
          liveMeeting.observerList[observerIndex].leavingTime = Date.now();
          liveMeeting.observerList[observerIndex].status = "offline";
        }

      }

      if (userDetails?.role == "Moderator") {
        liveMeeting.isMeetindEnded = true;
        liveMeeting.endTime = Date.now();
        liveMeeting.duration = (((new Date(liveMeeting.endTime)) - (new Date(liveMeeting.startTime))) / 1000) / 60;
        liveMeeting.moderator.endTime = Date.now();
        liveMeeting.moderator.status = "offline";
      }


      await liveMeeting.save();

      const fullParticipantList = [
        liveMeeting.moderator,
        ...liveMeeting.participantsList,
      ];



      const fullObserverList = [
        liveMeeting.moderator,
        ...liveMeeting.observerList,
      ];

      io.to(liveMeeting.meetingId.toString()).emit("getObserverListResponse", {
        success: true,
        message: "Observer list retrieved successfully",
        observersList: fullObserverList,
      });


      io.to(liveMeeting.meetingId.toString()).emit("participantList", {
        success: true,
        message: "Participant added to participants list",
        waitingRoom: liveMeeting.waitingRoom,
        participantList: fullParticipantList,
      });

    });
  });

  return io;
};

module.exports = setupSocket;
