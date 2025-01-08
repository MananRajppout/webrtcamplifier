const { Server } = require("socket.io");
const Meeting = require("../models/meetingModel");
const LiveMeeting = require("../models/liveMeetingModel");
const { v4: uuidv4 } = require("uuid");
const ChatMessage = require("../models/chatModel");
const GroupMessage = require('../models/groupMessage');
const MediaBoxModel = require('../models/mediaBox.js');
const ActivePoll = require("../models/activePollModel.js");
const Poll = require("../models/pollModel.js");
const PollResponse = require("../models/pollResponseModel.js");
const { Parser } = require('json2csv');
const AWS = require('aws-sdk');
const dotenv = require("dotenv");
dotenv.config();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

// Helper: Upload to S3
async function uploadToS3(buffer, mimetype, fileName) {
  const uniqueFileName = `${Date.now()}-${fileName}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `mediabox/${uniqueFileName}`,
    Body: buffer,
    ContentType: mimetype,
  };

  const data = await s3.upload(params).promise();
  return { url: data.Location, key: params.Key };
}

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


function callAfterMin(min, callback) {
  if (typeof min !== 'number' || min <= 0) {
    throw new Error('The "min" parameter should be a positive number.');
  }
  if (typeof callback !== 'function') {
    throw new Error('The "callback" parameter should be a function.');
  }

  setTimeout(callback, min * 60 * 1000);
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

    socket.on("join-room", async ({ roomid, name, email, roomname, role,isTechHost }, callback) => {

      socket.join(roomid);
      // for group chat
      socket.join(`${roomid}-${roomname}`);
      usernames[socket.id] = {
        name,
        roomid,
        email,
        role,
        isTechHost
      };
      console.log(`User with name ${name} joined meeting ${roomid} role ${role}`)
      const newname = email + roomid;
      delete userchangeroom[newname];

      if (role == "Participant" || isTechHost) {
        const liveMeeting = await LiveMeeting.findOne({ meetingId: roomid });
        const participantIndex = liveMeeting.participantsList.findIndex(p => p.email == email);
        if (participantIndex != -1 && liveMeeting.participantsList[participantIndex]) {
          liveMeeting.participantsList[participantIndex].status = "online";
          liveMeeting.participantsList[participantIndex].joiningTime = Date.now();
          liveMeeting.participantsList[participantIndex].roomName = roomname;

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

      if (role == "Moderator" && !isTechHost) {
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
      const { meetingId, user, moderator } = data;
      console.log(moderator)

      const existingMeeting = await checkMeetingExists(meetingId, socket, "meeting-not-found");
      if (!existingMeeting) return;


      const liveMeeting = await LiveMeeting.findOne({ meetingId });

      if (liveMeeting) {
        if (user.isTechHost) {
          const isExistAlready = liveMeeting.participantsList.findIndex(p => p.email == user.email);
          if(isExistAlready !== -1){
            liveMeeting.participantsList[isExistAlready].status = "online";
          }else{
            liveMeeting.participantsList.push({
              name: user.fullName,
              email: user.email,
              role: "Moderator",
              id: uuidv4(),
              status: "online",
            })
          }
          await liveMeeting.save();
        }

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
      let newLiveMeeting = undefined;
      if (user.isTechHost) {
        newLiveMeeting = new LiveMeeting({
          meetingId: meetingId,
          ongoing: true,
          webRtcRoomId: meetingId,
          participantsList: [
            {
              name: user.fullName,
              email: user.email,
              role: "Moderator",
              id: uuidv4(),
              status: "online",
            }
          ],
          moderator: {
            name: `${moderator.firstName} ${moderator.lastName}`,
            id: moderatorId,
            role: "Moderator",
            email: moderator.email,
            status: "offline",
          },
        });
      } else {
        newLiveMeeting = new LiveMeeting({
          meetingId: meetingId,
          ongoing: true,
          webRtcRoomId: meetingId,
          moderator: {
            name: user.fullName,
            id: moderatorId,
            role: "Moderator",
            email: user.email,
            status: "online",
          },
        });
      }


      await newLiveMeeting?.save();

      socket.emit("startMeetingResponse", {
        success: true,
        message: "Live meeting started successfully",
        liveMeeting: newLiveMeeting,
      });

    });

    socket.on("participantWantToJoin", async (data) => {
      const { meetingId, name, role, email, image } = data;

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

      let imageUrl = null;

      // If the participant sent an image, upload it to S3
      if (image) {
        try {
          const { fileName, fileBase64 } = image; // Assuming `image` has these fields
          const base64Data = fileBase64.split(";base64,").pop();
          const buffer = Buffer.from(base64Data, "base64");
          const mimetype = "image/png"; // Default MIME type, adjust based on input
          const s3Response = await uploadToS3(buffer, mimetype, fileName);
          imageUrl = s3Response.url; // URL of the uploaded image
        } catch (error) {
          console.error("Error uploading image to S3:", error);
          socket.emit("participantJoinMeetingResponse", {
            success: false,
            message: "Error uploading image",
            meetingId: meetingId,
          });
          return;
        }
      }

      liveMeeting.waitingRoom.push({ name, role, email, image: imageUrl });
      await liveMeeting.save();

      socket.emit("participantJoinMeetingResponse", {
        success: true,
        message: "Participant added to waiting room",
        participant: { name, role, email, image: imageUrl },
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

    socket.on("create-breakout-room", async ({ meetingId, breakroomname, participants, duration }, callback) => {
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

      //set timer
      console.log('duration', duration)
      if (duration) {
        // remember room ending in 5min 
        const roomEnding = (Number(duration) || 0) - 5;
        if(roomEnding > 0){
          callAfterMin(1, () => {
            socket.to(meetingId).emit('room-ending-remember', { roomName: breakroomname })
          })
        }
        //on room end
        callAfterMin(Number(duration), async () => {
          const liveMeeting = await LiveMeeting.findOne({ meetingId });
          liveMeeting.breakRooms = liveMeeting.breakRooms.filter(room => room.roomName !== breakroomname);
          const allBreakRoomsNameList = liveMeeting.breakRooms.map((room) => room.roomName).filter(name => !!name);
          await liveMeeting.save()
          io.to(meetingId).emit('break-out-room-closed', { breakoutsRooms: allBreakRoomsNameList, roomName: breakroomname });
        })
      }
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

    socket.on('mediabox:on-get-media', async ({ meetingId, projectId }, callback) => {
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
    socket.on(
      "start-poll",
      async ({ meetingId, pollId, endTime }, callback) => {
        try {
          // Fetch the poll details
          // console.log("poll id in start poll", pollId);
          const poll = await Poll.findById(pollId).lean();
          if (!poll) {
            return callback({
              success: false,
              message: "Poll not found",
            });
          }

          // Check if the meeting exists
          const liveMeeting = await LiveMeeting.findOne({ meetingId });
          if (!liveMeeting) {
            return callback({
              success: false,
              message: "Live meeting not found",
            });
          }

          // Create an active poll
          const activePoll = new ActivePoll({
            meetingId,
            pollId,
            status: "Active",
            startTime: new Date(),
            endTime: new Date(endTime),
          });

          await activePoll.save();
          console.log("Active Poll during poll start:", activePoll);

          // Update the live meeting with the current poll
          liveMeeting.currentPoll = activePoll._id;
          await liveMeeting.save();
          // Notify all participants about the active poll
          io.to(meetingId).emit("poll-started", {
            success: true,
            message: "Poll started successfully",
            activePollId: activePoll._id,
            pollQuestions: poll.questions,
          });

          callback({
            success: true,
            message: "Poll started and broadcasted to participants",
            activePoll,
          });
          const activePollId = activePoll._id;
          // Schedule the poll to automatically end at the specified time
          setTimeout(async () => {
            const now = new Date();
            if (now >= new Date(endTime)) {
              await endPoll(meetingId, activePollId);
              // Emit event to notify moderator about poll end
              io.to(meetingId).emit("poll-ended", { activePollId });
            }
          }, new Date(endTime) - new Date());
        } catch (error) {
          console.error("Error starting poll:", error);
          callback({
            success: false,
            message: "Failed to start poll",
            error,
          });
        }
      }
    );

    socket.on(
      "submit-poll-response",
      async ({ meetingId, activePollId, responses, participantEmail }) => {
        console.log("poll id in submit-poll-response", activePollId, 'response', responses);
        try {
          // Validate required fields
          if (!meetingId || !activePollId || !responses || !participantEmail) {
            return socket.emit("poll-response-error", {
              message: "Invalid poll response data",
            });
          }

          // Check if the poll is active
          const activePoll = await ActivePoll.findOne({
            _id: activePollId,
            meetingId,
            status: "Active",
          });
          if (!activePoll) {
            return socket.emit("poll-response-error", {
              message: "Poll is no longer active",
            });
          }

          console.log("Active Poll during response save:", activePoll);

          // Find the participant ID based on participantEmail in LiveMeeting
          const liveMeeting = await LiveMeeting.findOne({ meetingId });
          if (!liveMeeting) {
            return socket.emit("poll-response-error", {
              message: "Live meeting not found",
            });
          }

          const participant = liveMeeting.participantsList.find(
            (p) => p.email === participantEmail && p.status === "online"
          );

          if (!participant) {
            return socket.emit("poll-response-error", {
              message: "Participant not found or not online",
            });
          }

          // Save the response in PollResponse
          const pollResponse = new PollResponse({
            activePollId,
            meetingId,
            participantId: participant.id,
            participantEmail,
            responses: Object.entries(responses).map(
              ([questionId, answer]) => ({
                questionId,
                answer,
              })
            ),
          });

          await pollResponse.save();
          console.log('poll response saved', pollResponse)
          // Notify the participant about the successful submission
          socket.emit("poll-response-success", {
            message: "Response submitted successfully",
          });

          // Optionally notify the moderator or others in the meeting
          io.to(meetingId).emit("poll-update", {
            activePollId,
            participantId: participant.id,
          });
        } catch (error) {
          console.error("Error handling poll response:", error);
          socket.emit("poll-response-error", {
            message: "Failed to handle poll response",
          });
        }
      }
    );

    // Function to end a poll
    const endPoll = async (meetingId, activePollId) => {
      console.log("activePollId id in end poll", activePollId);
      try {
        const activePoll = await ActivePoll.findOneAndUpdate(
          { meetingId, _id: activePollId, status: "Active" },
          { status: "Ended" },
          { new: true }
        );
        console.log("poll ended poll id", activePoll);

        if (!activePoll) {
          console.log("Poll not found or already ended");
          return;
        }
        // Notify participants that the poll has ended
        io.to(meetingId).emit("poll-ended", {
          success: true,
          message: "Poll has ended",
          activePollId,
        });

        console.log(`Poll ${activePollId} has ended for meeting ${meetingId}`);
      } catch (error) {
        console.error("Error ending poll:", error);
      }
    };

    socket.on("get-poll-results", async ({ activePollId }, callback) => {
      try {
        console.log("get-poll-results activePollId", activePollId)
        // Fetch the ActivePoll document using pollId
        const activePoll = await ActivePoll.findOne({ _id: activePollId });
        if (!activePoll) {
          return callback({
            success: false,
            message: "Active poll not found",
          });
        }

        console.log("active poll duirng get-poll result", activePoll);

        // Fetch the poll details
        const poll = await Poll.findById(activePoll.pollId).lean();
        if (!poll) {
          return callback({
            success: false,
            message: "Poll not found",
          });
        }
        // console.log('poll', poll)

        const pollResponses = await PollResponse.find({
          activePollId,
        });
        console.log("pollResponses", pollResponses);

        if (!pollResponses || pollResponses.length === 0) {
          return callback({
            success: false,
            message: "No responses found for this poll",
          });
        }

        // Group responses by participant
        const results = pollResponses.map((response) => ({
          participantId: response.participantId,
          participantEmail: response.participantEmail,
          responses: response.responses.map((res) => {
            const question = poll.questions.find(
              (q) => q._id.toString() === res.questionId.toString()
            );
            return {
              question: question ? question.question : "Question not found",
              answer: res.answer,
            };
          }),
        }));

        console.log("result", results);
        console.log(JSON.stringify(results, null, 2));

        callback({
          success: true,
          results,
        });
      } catch (error) {
        console.error("Error fetching poll results:", error);
        callback({
          success: false,
          message: "Failed to fetch poll results",
          error,
        });
      }
    });

    socket.on('save-poll-results-csv', async ({ pollResult, uploaderEmail, meetingId, projectId, role, addedBy }, callback) => {
      try {
        console.log('data received in the save poll', pollResult, uploaderEmail, meetingId, projectId, role, addedBy);

        // Flatten the poll results
        const flattenedResults = pollResult.flatMap(participant =>
          participant.responses.map(response => ({
            participantEmail: participant.participantEmail,
            question: response.question,
            answer: response.answer.join(', '), // Join multiple answers with a comma
          }))
        );

        console.log('Flattened Results:', flattenedResults);

        // Convert to CSV
        const fields = ['participantEmail', 'question', 'answer'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(flattenedResults);

        // Convert CSV to Buffer
        const buffer = Buffer.from(csv, 'utf-8');

        // Upload CSV to S3
        const filename = `poll_results_${Date.now()}.csv`;
        console.log('csv file name', filename);
        const s3Response = await uploadToS3(buffer, 'text/csv', filename);
        console.log('s3 response', s3Response);

        // Save metadata in MediaBoxModel
        const newMedia = await MediaBoxModel.create({
          meetingId,
          uploaderEmail,
          role,
          projectId,
          addedBy,
          file: {
            url: s3Response.url,
            public_id: s3Response.Key,
            name: filename,
            mimetype: 'text/csv',
            size: buffer.length,
          },
        });

        console.log('new media', newMedia);

        // Emit upload event
        io.to(meetingId).emit('poll-results-saved', {
          success: true,
          message: 'Poll results saved and uploaded successfully.',
          file: newMedia,
        });

        callback({ success: true, message: 'Poll results uploaded successfully.' });
      } catch (error) {
        console.error('Error saving poll results as CSV:', error);
        callback({ success: false, message: 'Failed to save poll results.' });
      }
    });

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

      if (userDetails?.role == "Participant" || userDetails.isTechHost) {
        const participantIndex = liveMeeting.participantsList.findIndex(p => p.email == userDetails?.email);
        if (liveMeeting.participantsList[participantIndex]) {
          liveMeeting.participantsList[participantIndex].status = "offline";
          liveMeeting.participantsList[participantIndex].leavingTime = Date.now();
        }
      }

      if (userDetails?.role == "Observer") {
        const observerIndex = liveMeeting.observerList.findIndex(b => b.email == userDetails?.email);
        console.log('diconnet', userDetails.name)
        if (liveMeeting.observerList[observerIndex]) {
          liveMeeting.observerList[observerIndex].leavingTime = Date.now();
          liveMeeting.observerList[observerIndex].status = "offline";
        }

      }

      if (userDetails?.role == "Moderator" && !userDetails.isTechHost) {
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
