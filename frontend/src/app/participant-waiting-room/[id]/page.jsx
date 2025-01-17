"use client";

import ParticipantLeftSideBar from "@/components/participantWaitingRoom/ParticipantLeftSideBar";
import Button from "@/components/shared/button";
import HeadingBlue25px from "@/components/shared/HeadingBlue25px";
import Logo from "@/components/shared/Logo";
import { useGlobalContext } from "@/context/GlobalContext";
import useSocketListen from "@/hooks/useSocketListen";
import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaVideo } from "react-icons/fa";
import { IoLogOutSharp } from "react-icons/io5";

const page = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const meetingId = params?.id
  const { socket } = useGlobalContext()
  const fullName = searchParams.get("fullName");
  const userRole = searchParams.get("role");
  const userEmail = searchParams.get("email");
  const [participants, setParticipants] = useState([]);
  const [meetingDetails, setMeetingDetails] = useState([])
  const [participantMessages, setParticipantMessages] = useState([]);

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




  // * transferring participant from waiting room to meeting room

  useSocketListen("participantList", (data) => {
    setParticipants(data.participantList);
    const participantAccepted = data?.participantList?.find(p => p.email === userEmail)
    if (participantAccepted) {
      router.push(
        `/meeting/${params.id}?fullName=${encodeURIComponent(
          fullName
        )}&role=${encodeURIComponent(userRole)}&email=${encodeURIComponent(userEmail)}`
      );
    }
  });

  // * Participant removed from the waiting room
  useSocketListen("participantRemovedFromWaiting", (data) => {
    const isParticipantRemoved = data?.email === userEmail
    if (isParticipantRemoved) {
      router.push(
        `/remove-participant`
      );
    }
  });




  useEffect(() => {
    if (socket) {
      socket.emit("join-room", { roomid: meetingId, name: fullName, email: userEmail }, (socketId) => {

      });
    }
  }, [socket, meetingId, fullName, userEmail]);

  const requestParticipantList = () => {
    socket.emit("getParticipantList", { meetingId: params.id });
  };

  const requestToGetParticipantsChats = () => {
    socket.emit("getParticipantsChat", { meetingId: params.id });
  }


  useEffect(() => {
    getMeetingDetails(params.id);

    // Add listener for participant removal
    socket.on("participantRemovedFromWaiting", (data) => {

      if (data.name === fullName && data.role === userRole) {
        router.push("/remove-participant");
      }
    });

    socket.on("participantChatResponse", handleParticipantChatResponse);

    requestParticipantList();
    requestToGetParticipantsChats();



    // Clean up function
    return () => {
      socket.off("participantRemovedFromWaiting");
      socket.off("participantChatResponse", handleParticipantChatResponse);
    };
  }, [params.id, socket, fullName, userRole, router]);


  const handleParticipantChatResponse = (response) => {
    if (response.success) {
      setParticipantMessages(response.participantMessages);
    }
  };



  const sendMessageParticipant = async (message) => {
    socket.emit("participantSendMessage", { message, meetingId: params.id });
  };

  return (
    <div className="flex justify-between min-h-screen max-h-screen meeting_bg">
      {/* Left Sidebar */}
      <div className="h-full">
        <ParticipantLeftSideBar participants={participants} sendMessageParticipant={sendMessageParticipant} messages={participantMessages} />
      </div>
      {/* Main content */}
      <div className="flex-1 w-full max-h-[100vh] overflow-hidden mb-5 flex flex-col">
        <div className="px-5 py-5 flex flex-col justify-between items-between h-full">
          <div className="h-1/5">
            {/* First ------ nav bar */}
            <div className="flex justify-between items-center pb-2">
              {/* participant name */}
              <div className="flex justify-start items-center space-x-2 pb-2">
                <FaVideo />
                <p className="text-custom-gray-3 font-semibold">
                  Waiting Room
                </p>

                <Button
                  children={`Participant View`}
                  type="button"
                  variant={"primary"}
                  className={`text-white py-1 px-3 rounded-xl text-sm`}
                />
              </div>
              {/* logo */}
              <Logo />
            </div>

            {/* Second ---------- name bar */}
            <div className="flex justify-between items-center pb-4">
              <HeadingBlue25px children={meetingDetails?.title} />
            </div>
          </div>

          {/*Third ---------- meeting stream */}
          <div className="flex-grow flex items-center justify-center w-full bg-white rounded-lg">
            <h1 className="text-2xl font-bold">
              Please wait, the meeting host will let you in soon.
            </h1>
          </div>
        </div>
      </div>

    </div>
  );
};

export default page;