"use client";
import LeftSidebar from "@/components/meetingComponents/LeftSidebar";
import MeetingView from "@/components/meetingComponents/MeetingView";
import RightSidebar from "@/components/meetingComponents/RightSidebar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import userImage from "../../../../public/user.jpg";
import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import io from "socket.io-client";
import { useGlobalContext } from "@/context/GlobalContext";
import toast from "react-hot-toast";
import useSocketListen from "@/hooks/useSocketListen";

const page = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const meetingId = params?.id;
  const roomname = searchParams.get("roomname") || 'main';
  const type = searchParams.get("type");
  const router = useRouter();
  const { user, socket } = useGlobalContext();
  const fullName = searchParams.get("fullName");
  const userRole = searchParams.get("role");
  const userEmail = searchParams.get("email");
  const [meetingDetails, setMeetingDetails] = useState([]);
  const [users, setUsers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [observers, setObservers] = useState([]);
  const [participantMessages, setParticipantMessages] = useState([]);
  const [removedParticipants, setRemovedParticipants] = useState([]);
  const [observersMessages, setObserversMessages] = useState([]);
  const [iframeLink, setIframeLink] = useState("");
  const [role, setRole] = useState("");
  const [isMeetingOngoing, setIsMeetingOngoing] = useState(false);
  const [waitingRoom, setWaitingRoom] = useState([]);
  const [isAdmitted, setIsAdmitted] = useState(false);
  const socketIdRef = useRef(null);
  // const [socket, setSocket] = useState(null);

  const meetingStatus = "Ongoing";
  const projectStatus = "Open";

  const [isWhiteBoardOpen, setIsWhiteBoardOpen] = useState(false);
  const [isRecordingOpen, setIsRecordingOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isBreakoutRoom, setIsBreakoutRoom] = useState(false);
  const [breakoutRooms, setBreakoutRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("main");
  const [myEmail, setMyEmail] = useState(null);

  const [peers, setPeers] = useState([]);
  const [streams, setStreams] = useState([]);
  const [messages, setMessages] = useState([]);
  const [groupMessage, setGroupMessage] = useState([]);
  const [mediaBox, setMediaBox] = useState([]);
  const [enabledBreakoutRoom, setEnabledBreakoutRoom] = useState(true);


  //get user email
  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = window.localStorage.getItem("email");
      setMyEmail(userRole == "Moderator" ? "admin@gmail.com" : email);
    }
  }, []);

  const handleBreakoutRoomChange = (roomName) => {
    const room = breakoutRooms?.find((room) => room.roomName === roomName);
    setSelectedRoom(room);
  };

  //! Use effect for getting waiting list
  useEffect(() => {
    let email;
    if (typeof window !== "undefined") {
      email =
        userRole == "Moderator"
          ? "admin@gmail.com"
          : window.localStorage.getItem("email");
    }
    socket.emit(
      "join-room",
      { roomid: params.id, name: fullName, email,roomname },
      (socketId,meeting) => {
        socketIdRef.current = socketId;
        if(meeting){
          setEnabledBreakoutRoom(meeting.enableBreakoutRoom);
        }
       
      }
    );
    socket.emit("grounp:get-message", { meetingId: params.id,roomname }, (messages) => {
      setGroupMessage([...messages]);
    });

    socket.emit("mediabox:on-get-media", { meetingId: params.id }, (media) => {
      setMediaBox([...media]);
    });

    socket.on("change-room", handleChangeRoom);
    socket.on("getParticipantListResponse", handleParticipantList);
    // socket.on("participantChatResponse", handleParticipantChatResponse);
    socket.on("getObserverListResponse", handleObserverListResponse);
    socket.on("observerChatResponse", handleObserverChatResponse);
    socket.on("getStreamingStatusResponse", handleGetStreamingStatusResponse);
    socket.on("participantRemoved", handleParticipantRemoved);
    socket.on("getMeetingStatusResponse", handleGetMeetingStatusResponse);
    socket.on("group:receive-message", handleNewMessageReceive);
    socket.on("mediabox:on-upload", handleMediaNewUpload);

    getMeetingStatus(params.id);

    const requestParticipantListIntervalId = setInterval(() => {
      // getParticipantChat(params.id);
      getObserverList(params.id);
      getObserverChat(params.id);
    }, 1000);

    // Clean up function to clear the interval when component unmounts or userRole changes
    return () => {
      clearInterval(requestParticipantListIntervalId);
      socket.off("getParticipantListResponse", handleParticipantList);
      // socket.off("participantChatResponse", handleParticipantChatResponse);
      socket.off("getObserverListResponse", handleObserverListResponse);
      socket.off("getObserverChatResponse", handleObserverChatResponse);
      socket.off("participantRemoved", handleParticipantRemoved);
      socket.off("group:receive-message", handleNewMessageReceive);
      socket.off("mediabox:on-upload", handleMediaNewUpload);
    };
  }, [userRole, params.id, socket]);

  // * function to request streaming status
  const getMeetingStatus = async (meetingId) => {
    socket.emit("getMeetingStatus", { meetingId });
  };

  // !Automatically navigate observer to waiting room if streaming stops
  useEffect(() => {
    if (userRole === "Observer") {
      socket.on("navigateToObserverWaitingRoom", ({ meetingId }) => {
        if (params.id === meetingId) {
          router.push(
            `/observer-waiting-room/${meetingId}?fullName=${encodeURIComponent(
              fullName
            )}&role=${encodeURIComponent(userRole)}`
          );
        }
      });
    }

    return () => {
      socket.off("navigateToObserverWaitingRoom");
    };
  }, [params.id, userRole, socket]);

  const handleToggleStreaming = (meetingId) => {
    socket.emit("toggleStreaming", { meetingId });
  };

  const handleBreakoutRoom = useCallback(
    (breakroomname, participants) => {
      if (breakoutRooms.includes(breakroomname))
        return toast.error("This room name is already exist.");
      socket.emit(
        "create-breakout-room",
        { meetingId: params.id, breakroomname, participants },
        ({ fullParticipantList, breakroomname,breakoutsRooms }, err) => {
          if (err) return console.log(err);
          setBreakoutRooms(breakoutsRooms);
          setParticipants(fullParticipantList);
          if (!selectedRoom) {
            setSelectedRoom(breakroomname);
          }
        }
      );
    },
    [params.id, selectedRoom]
  );


  const handleUserRename = useCallback(
    (newname, user) => {
      socket.emit(
        "change-participant-name",
        { meetingId: params.id, newname, userid: user.id },
        ({ fullParticipantList }, err) => {
          if (err) return console.log(err.message);
          setParticipants(fullParticipantList);
        }
      );
    },
    [params.id]
  );

  const handleMoveParticipant = useCallback(
    (breakroomname, participant) => {
      socket.emit(
        "user-move",
        { meetingId: params.id, breakroomname, participants: [participant] },
        ({ fullParticipantList, breakroomname }, err) => {
          if (err) return console.log(err);
          setParticipants(fullParticipantList);
        }
      );
    },
    [params.id, selectedRoom]
  );

  const handleChangeRoom = useCallback(({ participantList, roomName }) => {
    let email;
    if (typeof window !== "undefined") {
      email = window.localStorage.getItem("email");
    }

    console.log("participantList", participantList);
    const find = participantList.some((p) => p.email == email);

    if (find) {
      let url = "";
      if (roomName?.toLowerCase() == "main") {
        url = `/meeting/${params.id}?fullName=${fullName}&role=${userRole}`;
      } else {
        url = `/meeting/${params.id}?fullName=${fullName}&role=${userRole}&type=breackout&roomname=${roomName}`;
      }
      window.open(url, "_self");
    }
  }, []);

  const sendGroupMessage = useCallback(
    (content) => {
      let name;
      if (userRole == "Moderator") {
        name = fullName;
      } else {
        name = participants.find((p) => p.email == myEmail)?.name || "Unkown";
      }
      const newMessage = {
        meetingId: params.id,
        senderEmail: myEmail,
        content,
        name,
        timestamp: Date.now(),
      };
      setGroupMessage((prev) => [...prev, newMessage]);
      socket.emit("grounp:send-message", {
        meetingId: params.id,
        email: myEmail,
        content,
        name,
        roomname
      });
    },
    [myEmail, params.id, participants,roomname]
  );

  const handleNewMessageReceive = useCallback((newMessage) => {
    setGroupMessage((prev) => [...prev, newMessage]);
  }, []);

  const handleMediaNewUpload = useCallback((media) => {
    console.log("new media");
    setMediaBox((prev) => [...prev, media]);
  }, []);

  const handleMediaUpload = useCallback(
    async (file, setUploadProgress) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/upload`,
        { file, meetingId: params, email: myEmail },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadProgress(progress);
          },
        }
      );
      setUploadProgress(0);
      return res;
    },
    [myEmail, params.id]
  );

  // * get observer list response function
  const handleObserverListResponse = (response) => {
    if (response.success) {
      setObservers(response.observersList);
    } else {
      console.error("Failed to get observer list:", response.message);
    }
  };


// ? Listing participant chat response
  useSocketListen("participantChatResponse", (data) => {
   
    if (data.success) {
      setParticipantMessages(data.participantMessages);
      if(data.allBreakRoomsNameList){
        setBreakoutRooms(data.allBreakRoomsNameList);
      }

      if(selectedRoom == "main"){
        if (roomname && type == "breackout") {
          setSelectedRoom(roomname);
        }
      }
    }
  });

  // * participant send message function
  const sendMessageParticipant = async (message) => {
    console.log('send message', message)
    socket.emit("participantSendMessage", { message, meetingId: params.id });
  };

  // * get participant chat request function
  const getParticipantChat = async (meetingId) => {
    socket.emit("getParticipantChat", { meetingId });
  };

  // * get observer chat response function
  const handleObserverChatResponse = (response) => {
    if (response.success) {
      setObserversMessages(response.observerMessages);
    } else {
      console.error("Failed to get observer chat:", response.message);
    }
  };

  // * handle participant removed
  const handleParticipantRemoved = (data) => {
    if (data.name === fullName && data.role === userRole) {
      router.push("/remove-participant");
    }
  };

  // * get participant list
  const handleParticipantList = (response) => {
    if (response.success) {
      setParticipants(response.participantList);
    } else {
      console.error("Failed to update participant list:", response.message);
    }
  };

  // * get streaming status response function
  const handleGetMeetingStatusResponse = (response) => {
    if (response.success) {
      setIsMeetingOngoing(true);
    }
  };

  // ? Using took to get waiting room data
  useSocketListen("participantWaiting", (data) => {
    setWaitingRoom(data.waitingRoom);
  });
  useSocketListen("participantList", (data) => {
    console.log("at the meeting room participant list", data);
    setWaitingRoom(data.waitingRoom);
    setParticipants(data.participantList);
  });

  useSocketListen("acceptFromWaitingRoomResponse", () => {
    toast.error("Participant not found in waiting room");
  });
  // ? removing participant from the meeting
  useSocketListen("participantRemoved", (data) => {
    if(data.email === userEmail){
      router.push(
        `/remove-participant`
      );
    }
    console.log('removed participant data', data)
  });
  // ? moving participant from the meeting to the waiting room
  useSocketListen("participantMovedToWaitingRoom", (data) => {
    if(data.email === userEmail){
      router.push(
        `/participant-waiting-room/${meetingId}?fullName=${encodeURIComponent(
        fullName
        )}&email=${encodeURIComponent(
          userEmail
        )}&role=Participant`
      );
    }
  });

  // *Function to request participant list
  const requestParticipantList = () => {
    socket.emit("getParticipantList", { meetingId: params.id });
  };

  // get participants chats
  const requestToGetParticipantsChats = () => {
    socket.emit("getParticipantsChat", { meetingId: params.id });
  }

  // *accept participant from waiting list
  const acceptParticipant = async (participant) => {
    socket.emit("acceptFromWaitingRoom", { participant, meetingId: params.id });
  };

  // * request function for removing participant  from meeting
  const removeParticipant = async (name, role, email, meetingId) => {
    socket.emit("removeParticipantFromMeeting", { name, role, email, meetingId });
  };
  // * request function for moving participant  from meeting to waiting room
  const moveParticipantToWaitingRoom = async (name, role, email, meetingId) => {
    socket.emit("moveParticipantToWaitingRoom", { name, role, email, meetingId });
  };

  // *get observer list request function
  const getObserverList = async (meetingId) => {
    socket.emit("getObserverList", { meetingId });
  };

  // *send message to observer
  const sendMessageObserver = async (message) => {
    socket.emit("sendMessageObserver", { message, meetingId: params.id });
  };

  // *get observer chat request function
  const getObserverChat = async (meetingId) => {
    socket.emit("getObserverChat", { meetingId });
  };

  // ? remove from waiting room
  const removeFromWaitingRoom = (participant, meetingId) => {
    socket.emit("removeFromWaitingRoom", { meetingId, participant });
  };

  // * admit all from waiting room
  const admitAllFromWaitingRoom = (meetingId) => {
    socket.emit("admitAllFromWaitingRoom", { meetingId });
  };

  // * get streaming status response function
  const handleGetStreamingStatusResponse = (response) => {
    if (response.success) {
      setIsStreaming(response.isStreaming);
    } else {
      console.error("Failed to get streaming status:", response.message);
    }
  };

  //? Use effect for admitting participant into meeting after acceptance
  useEffect(() => {
    if (userRole === "Participant" && !isAdmitted) {
      requestParticipantList();
    }
  }, [userRole, params.id, isAdmitted]);


  //get participants list when modirator joined
  useEffect(() => {
    requestParticipantList();
    requestToGetParticipantsChats();
  },[]);

  // ?Use effect to check if the participant is in the list and admit them
  useEffect(() => {
    // Check if any participant matches the fullName
    let email;
    if (typeof window !== "undefined") {
      email = window.localStorage.getItem("email");
    }
    const participantFound = participants?.find(
      (participant) => participant?.email === email
    );

    if (participantFound && !isAdmitted) {
      setIsAdmitted(true);
    }
  }, [participants, fullName, isAdmitted]);

  // *Use effect for getting meeting details
  useEffect(() => {
    getMeetingDetails(params.id);
  }, [params.id]);

  const getMeetingDetails = async (meetingId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-single-meeting/${meetingId}`
      );
      setMeetingDetails(response?.data?.meetingDetails);
    } catch (error) {
      console.error("Error in getting meeting details", error);
    }
  };

  const startMeeting = () => {};

  const participantLeft = async (name, role, meetingId) => {
    try {
      response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/live-meeting/remove-participant-from-meeting`,
        {
          name: name,
          role: role,
          meetingId: meetingId,
        }
      );
    } catch (error) {
      if (error?.response?.data?.message === "Participant not found") {
        console.error("Participant not found");
      } else {
        console.error("Error:", error);
      }
    }
  };

  return (
    <>
      <div className="flex justify-between min-h-screen max-h-screen meeting_bg ">
        {userRole === "Participant" && !isAdmitted ? (
          <div className="flex items-center justify-center w-full min-h-screen bg-white ">
            <h1 className="text-2xl font-bold">
              Please wait, the meeting host will let you in soon.
            </h1>
          </div>
        ) : userRole === "Participant" && isAdmitted ? (
          // Main participant UI goes here
          <>
            <div className="h-full">
              <LeftSidebar
                users={participants}
                setUsers={setUsers}
                role={userRole}
                isWhiteBoardOpen={isWhiteBoardOpen}
                setIsWhiteBoardOpen={setIsWhiteBoardOpen}
                isRecordingOpen={isRecordingOpen}
                setIsRecordingOpen={setIsRecordingOpen}
                isBreakoutRoom={isBreakoutRoom}
                setIsBreakoutRoom={setIsBreakoutRoom}
                breakoutRooms={breakoutRooms}
                setBreakoutRooms={setBreakoutRooms}
                handleBreakoutRoomChange={handleBreakoutRoomChange}
                selectedRoom={selectedRoom}
                setSelectedRoom={setSelectedRoom}
                waitingRoom={waitingRoom}
                acceptParticipant={acceptParticipant}
                messages={participantMessages}
                sendMessageParticipant={sendMessageParticipant}
                userName={fullName}
                meetingId={params.id}
                removeParticipant={removeParticipant}
                isStreaming={isStreaming}
                setStartStreaming={handleToggleStreaming}
                removeFromWaitingRoom={removeFromWaitingRoom}
                admitAllFromWaitingRoom={admitAllFromWaitingRoom}
                handleBreakoutRoom={handleBreakoutRoom}
                handleMoveParticipant={handleMoveParticipant}
                handleUserRename={handleUserRename}
                sendGroupMessage={sendGroupMessage}
                groupMessage={groupMessage}
                handleMediaUpload={handleMediaUpload}
                mediaBox={mediaBox}
                enabledBreakoutRoom={enabledBreakoutRoom}
              />
            </div>
            <div className="flex-1 w-full max-h-[100vh] overflow-hidden bg-orange-600">
              <MeetingView
                role={userRole}
                users={participants}
                isWhiteBoardOpen={isWhiteBoardOpen}
                setIsWhiteBoardOpen={setIsWhiteBoardOpen}
                meetingStatus={meetingStatus}
                isRecordingOpen={isRecordingOpen}
                setIsRecordingOpen={setIsRecordingOpen}
                isBreakoutRoom={isBreakoutRoom}
                setIsBreakoutRoom={setIsBreakoutRoom}
                breakoutRooms={breakoutRooms}
                setBreakoutRooms={setBreakoutRooms}
                projectStatus={projectStatus}
                iframeLink={iframeLink}
                meetingDetails={meetingDetails}
              />
            </div>
          </>
        ) : userRole === "Moderator" ? (
          <>
            <div className="h-full">
              <LeftSidebar
                users={participants}
                setUsers={setUsers}
                role={userRole}
                isWhiteBoardOpen={isWhiteBoardOpen}
                setIsWhiteBoardOpen={setIsWhiteBoardOpen}
                isRecordingOpen={isRecordingOpen}
                setIsRecordingOpen={setIsRecordingOpen}
                isBreakoutRoom={isBreakoutRoom}
                setIsBreakoutRoom={setIsBreakoutRoom}
                breakoutRooms={breakoutRooms}
                setBreakoutRooms={setBreakoutRooms}
                handleBreakoutRoomChange={handleBreakoutRoomChange}
                selectedRoom={selectedRoom}
                setSelectedRoom={setSelectedRoom}
                waitingRoom={waitingRoom}
                acceptParticipant={acceptParticipant}
                messages={participantMessages}
                sendMessageParticipant={sendMessageParticipant}
                userName={fullName}
                meetingId={params.id}
                removeParticipant={removeParticipant}
                isStreaming={isStreaming}
                setStartStreaming={handleToggleStreaming}
                removeFromWaitingRoom={removeFromWaitingRoom}
                admitAllFromWaitingRoom={admitAllFromWaitingRoom}
                handleBreakoutRoom={handleBreakoutRoom}
                handleMoveParticipant={handleMoveParticipant}
                handleUserRename={handleUserRename}
                sendGroupMessage={sendGroupMessage}
                groupMessage={groupMessage}
                handleMediaUpload={handleMediaUpload}
                mediaBox={mediaBox}
                moveParticipantToWaitingRoom={moveParticipantToWaitingRoom}
                enabledBreakoutRoom={enabledBreakoutRoom}
              />
            </div>
            <div className="flex-1 w-full max-h-[100vh] overflow-hidden">
              <MeetingView
                role={userRole}
                users={peers}
                isWhiteBoardOpen={isWhiteBoardOpen}
                setIsWhiteBoardOpen={setIsWhiteBoardOpen}
                meetingStatus={meetingStatus}
                isRecordingOpen={isRecordingOpen}
                setIsRecordingOpen={setIsRecordingOpen}
                isBreakoutRoom={isBreakoutRoom}
                setIsBreakoutRoom={setIsBreakoutRoom}
                breakoutRooms={breakoutRooms}
                setBreakoutRooms={setBreakoutRooms}
                projectStatus={projectStatus}
                iframeLink={iframeLink}
                meetingDetails={meetingDetails}
              />
            </div>
            <div className="h-full">
              <RightSidebar
                role={userRole}
                observers={observers}
                setObservers={setObservers}
                isBreakoutRoom={isBreakoutRoom}
                setIsBreakoutRoom={setIsBreakoutRoom}
                breakoutRooms={breakoutRooms}
                setBreakoutRooms={setBreakoutRooms}
                observersMessages={observersMessages}
                userName={fullName}
                meetingId={params.id}
                sendMessageObserver={sendMessageObserver}
                messages={participantMessages}
                users={participants}
                setUsers={setUsers}
                selectedRoom={selectedRoom}
                setSelectedRoom={setSelectedRoom}
                groupMessage={groupMessage}
                handleMediaUpload={handleMediaUpload}
                mediaBox={mediaBox}
              />
            </div>
          </>
        ) : userRole === "Observer" && isMeetingOngoing ? (
          <>
            <div className="flex-1 w-full max-h-[100vh] overflow-hidden">
              <MeetingView
                role={userRole}
                users={participants}
                isWhiteBoardOpen={isWhiteBoardOpen}
                setIsWhiteBoardOpen={setIsWhiteBoardOpen}
                meetingStatus={isMeetingOngoing}
                isRecordingOpen={isRecordingOpen}
                setIsRecordingOpen={setIsRecordingOpen}
                isBreakoutRoom={isBreakoutRoom}
                setIsBreakoutRoom={setIsBreakoutRoom}
                breakoutRooms={breakoutRooms}
                setBreakoutRooms={setBreakoutRooms}
                projectStatus={projectStatus}
                iframeLink={iframeLink}
                meetingDetails={meetingDetails}
              />
            </div>
            <div className="h-full">
              <RightSidebar
                role={userRole}
                observers={observers}
                setObservers={setObservers}
                isBreakoutRoom={isBreakoutRoom}
                setIsBreakoutRoom={setIsBreakoutRoom}
                breakoutRooms={breakoutRooms}
                setBreakoutRooms={setBreakoutRooms}
                observersMessages={observersMessages}
                userName={fullName}
                meetingId={params.id}
                sendMessageObserver={sendMessageObserver}
                messages={participantMessages}
                users={participants}
                setUsers={setUsers}
                selectedRoom={selectedRoom}
                setSelectedRoom={setSelectedRoom}
                groupMessage={groupMessage}
                handleMediaUpload={handleMediaUpload}
                mediaBox={mediaBox}
                enabledBreakoutRoom={enabledBreakoutRoom}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full min-h-screen bg-white ">
            <h1 className="text-2xl font-bold">
              Please wait, the meeting host will let you in soon.
            </h1>
          </div>
        )}
      </div>
    </>
  );
};

export default page;
