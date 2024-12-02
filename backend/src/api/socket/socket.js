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

async  function getGroupMessage(meetingId){
  const noAddedMessage = messageBatch.filter(m => m.meetingId == meetingId);
  const addedMessage = await GroupMessage.find({meetingId});
  return [...addedMessage,...noAddedMessage]
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

    socket.on("join-room",({roomid,name,email},callback) => {
      socket.join(roomid);
      // console.log(email,'email')
      usernames[socket.id] = {
        name,
        roomid,
        email
      };
      console.log(`User with name ${name} joined meeting ${roomid}`)
      const newname = email + roomid;
      delete userchangeroom[newname];
      callback(socket.id);
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
        };

        liveMeeting.participantsList.push(participantWithId);
        await liveMeeting.save();

        const fullParticipantList = [
          liveMeeting.moderator,
          ...liveMeeting.participantsList,
        ];
        io.emit("participantList", {
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
        breakoutRooms = ["Main",...breakoutRooms];

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
      const { meetingId, name, role, passcode } = data;

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

          io.emit("participantMovedToWaitingRoom", { name, role, email });

                   
          io.emit("participantList", {
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

    socket.on("participantSendMessage", async (data) => {
      const { meetingId, message } = data;

      console.log('participantSendMessage', data)
      try {

        const liveMeeting = await checkLiveMeetingExists(meetingId, socket, "meeting-not-found");
      if (!liveMeeting) return;


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

    socket.on("create-breakout-room", async ({ meetingId,breakroomname,participants},callback) => {
      const existingMeeting = await Meeting.findById(meetingId);
      if(!existingMeeting){
        callback(null,"Meeting Not Exist.");
        return
      }

      const liveMeeting = await LiveMeeting.findOne({ meetingId });
      if(!liveMeeting){
        callback(null,"Live Meeting Not Exist.");
        return
      }


      for (let index = 0; index < participants.length; index++) {
        const element = participants[index];
        const name = element.email + meetingId;
        userchangeroom[name] = true;
      }

      const newRoom = {roomName: breakroomname}
      liveMeeting.breakRooms = [...liveMeeting.breakRooms,newRoom];
      liveMeeting.participantsList = liveMeeting.participantsList.map(p => {

        const participant = participants.find(part => part.email == p.email);
        if(participant){  
          p.roomName = breakroomname;
        }
        return p;
      });


      await liveMeeting.save();
      const fullParticipantList = [
        liveMeeting.moderator,
        ...liveMeeting.participantsList,
      ];

      callback({fullParticipantList,breakroomname},null);
      socket.to(meetingId).emit('change-room',{participantList:participants,roomName: breakroomname});
    });


    socket.on("user-move", async ({ meetingId,breakroomname,participants},callback) => {
      const existingMeeting = await Meeting.findById(meetingId);
      if(!existingMeeting){
        callback(null,"Meeting Not Exist.");
        return
      }

      const liveMeeting = await LiveMeeting.findOne({ meetingId });
      if(!liveMeeting){
        callback(null,"Live Meeting Not Exist.");
        return
      }

      for (let index = 0; index < participants.length; index++) {
        const element = participants[index];
        const name = element.email + meetingId;
        userchangeroom[name] = true;
      }

     
      liveMeeting.participantsList = liveMeeting.participantsList.map(p => {
        const participant = participants.find(part => part.email == p.email);
        if(participant){  
          p.roomName = breakroomname;
        }
        return p;
      });


      await liveMeeting.save();
      const fullParticipantList = [
        liveMeeting.moderator,
        ...liveMeeting.participantsList,
      ];

      callback({fullParticipantList,breakroomname},null);
      socket.to(meetingId).emit('change-room',{participantList:participants,roomName: breakroomname});
    });



    //rename user name
    socket.on("change-participant-name", async ({ meetingId,newname,userid},callback) => {
      const existingMeeting = await Meeting.findById(meetingId);
      if(!existingMeeting){
        callback(null,"Meeting Not Exist.");
        return
      }

      const liveMeeting = await LiveMeeting.findOne({ meetingId });
      if(!liveMeeting){
        callback(null,"Live Meeting Not Exist.");
        return
      }



     
      liveMeeting.participantsList = liveMeeting.participantsList.map(p => {
        if(p?.id?.toString() == userid?.toString()){  
          p.name = newname;
        }
        return p;
      });


      await liveMeeting.save();
      const fullParticipantList = [
        liveMeeting.moderator,
        ...liveMeeting.participantsList,
      ];

      callback({fullParticipantList},null);
    });

    socket.on('grounp:send-message',({meetingId,email,content,name}) => {
      console.log('new message',name,email,content,meetingId);
      const newMessage = {
        meetingId,
        senderEmail: email,
        content,
        name,
        timestamp: Date.now()
      }
      addMessageToBatch(newMessage);
      socket.to(meetingId).emit('group:receive-message',newMessage);
    });

    socket.on('grounp:get-message', async ({meetingId},callback) => {
      const messages = await getGroupMessage(meetingId);
      callback(messages);
    })

    socket.on('mediabox:on-get-media', async ({meetingId},callback) => {
      const media = await MediaBoxModel.find({meetingId});
      callback(media);
    });
    

// * disconnect
    socket.on("disconnect", async () => {
      console.log("User disconnected", usernames[socket.id]);
      const userDetails = usernames[socket.id] || {};
      const newname = userDetails?.email + userDetails?.roomid;
      const isMoveByModerator = userchangeroom[newname];
      if(isMoveByModerator){
        return
      }
      const liveMeeting = await LiveMeeting.findOne({ meetingId:userDetails?.roomid });
      if(!liveMeeting){
        return
      }

      liveMeeting.participantsList = liveMeeting.participantsList.filter(p => p.email != userDetails?.email);
      await liveMeeting.save();
    });
  });

  return io;
};

module.exports = setupSocket;
