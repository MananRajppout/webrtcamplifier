"use client";
import LeftSidebar from "@/components/meetingComponents/LeftSidebar";
import MeetingView from "@/components/meetingComponents/MeetingView";
import RightSidebar from "@/components/meetingComponents/RightSidebar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import userImage from "../../../../public/user.jpg";
import axios, { all } from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import io from "socket.io-client";
import { useGlobalContext } from "@/context/GlobalContext";
import toast from "react-hot-toast";
import useSocketListen from "@/hooks/useSocketListen";
import { addAudioTrackToStream } from "@/utils/mixAudio";
import { RecordingServerConnector } from "@/utils/connectToRecordingServer";
import fixWebmDuration from 'webm-duration-fix';

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
console.log('user', user)

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
  const [projectId, setProjectId] = useState(null);
  const [isMeetingEnd, setIsMeetingEnd] = useState(false);
  const [polls, setPolls] = useState();
  const [pollData, setPollData] = useState(null);
  const [pollResult, setPollResult] = useState([])
  const [isPollResultModalOpen, setIsPollResultModalOpen] = useState(false)
  const [totalPages, setTotalPollPages] = useState();
  const [currentPollPage, setCurrentPollPage] = useState(1);
  const [setting, setSetting] = useState({
    allowScreenShare: false,
    allowWhiteBoard: false,
    allowEditWhiteBaord: false
  });

  //recording feauture
  const mixAudioDestinationRef = useRef(null);
  const audioContextRef = useRef(null);
  const allPaericipantsAudioTracksRef = useRef([]);
  const gdmStreamRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const startRecordingRef = useRef(false);
  const recordingServerConnectorRef = useRef(null);
  const [allParticipantsAudioTracks, setAllParticipantsAudioTracks] = useState([]);
  const [startRecording, setStartRecording] = useState(false);
  const recordingChunksRef = useRef([]);




  const handleStopRecording = useCallback(async () => {
    const chunks = recordingChunksRef.current;
    recordingChunksRef.current = [];
    const blob = await fixWebmDuration(new Blob(chunks, { type: 'video/webm' }));
    const url = URL.createObjectURL(blob);

    // Trigger a direct download
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'recording.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up
    URL.revokeObjectURL(url);
  }, [recordingChunksRef.current]);


  const handleMediaRecorer = useCallback((stream) => {

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8',
      videoBitsPerSecond: 2500000,
    });

    mediaRecorderRef.current.addEventListener('dataavailable', (e) => {
      recordingChunksRef.current.push(e.data);
      // if (e.data.size > 0) {
      //   const reader = new FileReader();
      //   reader.onloadend = () => {
      //     const base64Data = reader.result.split('base64,')[1];
      //     const data = {
      //       type: "media",
      //       payload: base64Data,
      //     }

      //     recordingServerConnectorRef.current.send(JSON.stringify(data));
      //   };
      //   reader.readAsDataURL(e.data);
      // }
    });

    mediaRecorderRef.current.addEventListener('stop', () => {
      if (startRecordingRef.current) {
        return;
      }

      // const data = {
      //   type: "stop"
      // }

      // recordingServerConnectorRef.current.send(JSON.stringify(data));

      handleStopRecording();
    });

    mediaRecorderRef.current.start(1000);
  }, [startRecording]);


  const handleCombineStreams = useCallback((stream) => {
    audioContextRef.current = new AudioContext();
    mixAudioDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
    allPaericipantsAudioTracksRef.current.forEach((audio) => {
      addAudioTrackToStream(audioContextRef.current, mixAudioDestinationRef.current, audio.track);
    });
    recordingStreamRef.current = new MediaStream([stream.getVideoTracks()[0], ...mixAudioDestinationRef.current.stream.getAudioTracks() || []]);
    handleMediaRecorer(recordingStreamRef.current);
  }, [allPaericipantsAudioTracksRef.current, allParticipantsAudioTracks]);


  //const handleRecording
  const handleRecording = useCallback(() => {
    if (!startRecording) {
      if (typeof window !== "undefined") {
        const options = {
          video: {
            displaySurface: 'browser',
            frameRate: 30
          },
          audio: false,
          preferCurrentTab: true
        }

        const gdmStream = navigator.mediaDevices.getDisplayMedia(options);
        gdmStream.then((stream) => {
          // recordingServerConnectorRef.current = new RecordingServerConnector(params.id,projectId);
          setStartRecording(true);
          startRecordingRef.current = true;
          gdmStreamRef.current = stream;
          gdmStreamRef.current.onended = handleRecording;
          handleCombineStreams(gdmStreamRef.current);
        });
      }

    } else {
      audioContextRef.current.close();
      gdmStreamRef.current.getTracks().forEach((track) => track.stop());
      gdmStreamRef.current = null;
      mixAudioDestinationRef.current = null;
      recordingStreamRef.current = null;
      mediaRecorderRef.current?.stop();
      setStartRecording(false);
      startRecordingRef.current = false;
    }

  }, [allParticipantsAudioTracks, allPaericipantsAudioTracksRef.current, startRecording,projectId,params.id]);


  //when new user add duration recording this use effect called
  useEffect(() => {
    if (!startRecording) {
      return;
    }
    mediaRecorderRef.current?.stop();
    handleCombineStreams(gdmStreamRef.current);
  }, [allParticipantsAudioTracks]);



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
      { roomid: params.id, name: fullName, email, roomname, role: userRole },
      (socketId, meeting) => {
        socketIdRef.current = socketId;
        if (meeting) {
          setEnabledBreakoutRoom(meeting.enableBreakoutRoom);
          setProjectId(meeting.projectId);
        }

        socket.emit("mediabox:on-get-media", { meetingId: params.id, projectId: meeting.projectId }, (media) => {
          setMediaBox([...media]);
        });

      }
    );
    socket.emit("grounp:get-message", { meetingId: params.id, roomname }, (messages) => {
      setGroupMessage([...messages]);
    });

    // polling feature needs to be handled, here we are just reciving the data
    //starting
    socket.on("poll-started", (data) => {
      if (data.success) {
        setPollData({
          pollId: data.activePollId,
          pollQuestions: data.pollQuestions,
        });
      }
    });

    socket.on("poll-ended", ({ activePollId }) => {
      console.log("Active poll ended with ID:", activePollId);
      fetchPollResults(activePollId); // Use `activePollId` instead of `pollId`
    });

    //ending


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
    socket.on("mediabox:on-delete", handleMediaNewDelete);
    socket.on("endMeeting", onEndMeeting);

    getMeetingStatus(params.id);
    getObserverList(params.id);
    getObserverChat(params.id);


    // Clean up function to clear the interval when component unmounts or userRole changes
    return () => {
      socket.off("getParticipantListResponse", handleParticipantList);
      // socket.off("participantChatResponse", handleParticipantChatResponse);
      socket.off("getObserverListResponse", handleObserverListResponse);
      socket.off("getObserverChatResponse", handleObserverChatResponse);
      socket.off("participantRemoved", handleParticipantRemoved);
      socket.off("group:receive-message", handleNewMessageReceive);
      socket.off("mediabox:on-upload", handleMediaNewUpload);
      socket.off("mediabox:on-delete", handleMediaNewDelete);
      socket.off("endMeeting", onEndMeeting);
      socket.off("poll-started");
      socket.off("poll-ended");
    };
  }, [userRole, params.id, socket, pollData]);


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
        ({ fullParticipantList, breakroomname, breakoutsRooms }, err) => {
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
    [myEmail, params.id, participants, roomname]
  );

  const handleNewMessageReceive = useCallback((newMessage) => {
    setGroupMessage((prev) => [...prev, newMessage]);
  }, []);

  const handleMediaNewUpload = useCallback((media) => {
    setMediaBox((prev) => [...prev, media]);
  }, []);

  const handleMediaNewDelete = useCallback((media) => {

    setMediaBox((prev) => {
      const newMedia = prev.filter((m) => m._id !== media._id);
      return newMedia;
    });
  }, []);

  const handleMediaUpload = useCallback(
    async (file, setUploadProgress, filename, filebase64) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/upload`,
        { file, meetingId: params.id, email: myEmail, role: userRole, projectId, addedBy: fullName, filename, filebase64 },
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
    [myEmail, params.id, fullName, userRole, projectId]
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
      if (data.allBreakRoomsNameList) {
        setBreakoutRooms(data.allBreakRoomsNameList);
      }

      if (selectedRoom == "main") {
        if (roomname && type == "breackout") {
          setSelectedRoom(roomname);
        }
      }
    }
  });

  // * participant send message function
  const sendMessageParticipant = async (message) => {
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
      if (typeof window !== "undefined") {
        window.location.href = "/remove-participant";
      }
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
    setWaitingRoom(data.waitingRoom);
    setParticipants(data.participantList);
  });

  useSocketListen("acceptFromWaitingRoomResponse", () => {
    toast.error("Participant not found in waiting room");
  });
  // ? removing participant from the meeting
  useSocketListen("participantRemoved", (data) => {
    if (data.email === userEmail) {
      if (typeof window !== "undefined") {
        window.location.href = "/remove-participant";
      }
    }
  });
  // ? moving participant from the meeting to the waiting room
  useSocketListen("participantMovedToWaitingRoom", (data) => {
    if (data.email === userEmail && typeof window != 'undefined') {
      window.location.href =
        `/participant-waiting-room/${meetingId}?fullName=${encodeURIComponent(
          fullName
        )}&email=${encodeURIComponent(
          userEmail
        )}&role=Participant`;
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

  }, []);

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




  const onEndMeeting = useCallback(() => {
    socket.disconnect();
    setIsMeetingEnd(true);
  }, [])



  const endMeeting = useCallback(() => {
    socket.emit("endMeeting", { meetingId: params.id });
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/project";
    }
  }, [params.id]);


  const fetchPolls = useCallback(async (page = 1) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-all/poll/${projectId}`,
        {
          params: { page, limit: 10, status: "active" },
        }
      );
      setPolls(response.data.polls);
      setTotalPollPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, [projectId]);


  //fetch polls
  useEffect(() => {
    if (projectId) {
      fetchPolls();
    }
  }, [projectId]);


  // polling feature needs to be handled, 
  //starting
  const fetchPollResults = (activePollId) => {
    socket.emit("get-poll-results", { activePollId }, (response) => {
      if (response.success) {
        setPollResult(response.results);
        setIsPollResultModalOpen(true);
      } else {
        toast.error(`${response.message}`);
      }
    });
  };

  //ending



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
                setting={setting} setSetting={setSetting}
                fetchPolls={fetchPolls}
                polls={polls}
                totalPages={totalPages}
                currentPollPage={currentPollPage} setCurrentPollPage={setCurrentPollPage}
                startRecording={startRecording} setStartRecording={setStartRecording}
                handleRecording={handleRecording}
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
                endMeeting={endMeeting}
                isMeetingEnd={isMeetingEnd}
                setting={setting} setSetting={setSetting}
                handleMediaUpload={handleMediaUpload}
                allPaericipantsAudioTracksRef={allPaericipantsAudioTracksRef}
                setAllParticipantsAudioTracks={setAllParticipantsAudioTracks}
                pollData={pollData}
                setPollData={setPollData}
                meetingId={meetingId}
                pollResult={pollResult}
                isPollResultModalOpen={isPollResultModalOpen}
                setIsPollResultModalOpen={setIsPollResultModalOpen}
                projectId={projectId}
                user={user}
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
                setting={setting} setSetting={setSetting}
                fetchPolls={fetchPolls}
                polls={polls}
                totalPages={totalPages}
                currentPollPage={currentPollPage} setCurrentPollPage={setCurrentPollPage}
                startRecording={startRecording} setStartRecording={setStartRecording}
                handleRecording={handleRecording}
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
                endMeeting={endMeeting}
                isMeetingEnd={isMeetingEnd}
                setting={setting} setSetting={setSetting}
                handleMediaUpload={handleMediaUpload}
                allPaericipantsAudioTracksRef={allPaericipantsAudioTracksRef}
                setAllParticipantsAudioTracks={setAllParticipantsAudioTracks}
                pollData={pollData}
                setPollData={setPollData}
                meetingId={meetingId}
                pollResult={pollResult}
                isPollResultModalOpen={isPollResultModalOpen}
                setIsPollResultModalOpen={setIsPollResultModalOpen}
                projectId={projectId}
                user={user}
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
                setting={setting} setSetting={setSetting}
                fetchPolls={fetchPolls}
                polls={polls}
                totalPages={totalPages}
                currentPollPage={currentPollPage} setCurrentPollPage={setCurrentPollPage}
                startRecording={startRecording} setStartRecording={setStartRecording}
                handleRecording={handleRecording}
              />

            </div>
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
                endMeeting={endMeeting}
                isMeetingEnd={isMeetingEnd}
                setting={setting} setSetting={setSetting}
                handleMediaUpload={handleMediaUpload}
                allPaericipantsAudioTracksRef={allPaericipantsAudioTracksRef}
                setAllParticipantsAudioTracks={setAllParticipantsAudioTracks}
                pollData={pollData}
                setPollData={setPollData}
                meetingId={meetingId}
                pollResult={pollResult}
                isPollResultModalOpen={isPollResultModalOpen}
                setIsPollResultModalOpen={setIsPollResultModalOpen}
                projectId={projectId}
                user={user}
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
