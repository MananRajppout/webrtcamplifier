"use client";

import ObserverWaintingRoomChat from "@/components/participantWaitingRoom/observerWaitingRoomchat";
import Button from "@/components/shared/button";
import HeadingBlue25px from "@/components/shared/HeadingBlue25px";
import Logo from "@/components/shared/Logo";
import { useGlobalContext } from "@/context/GlobalContext";
import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { FaVideo } from "react-icons/fa";
import { IoLogOutSharp } from "react-icons/io5";

const page = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const fullName = searchParams.get("fullName");
  const userRole = searchParams.get("role");
  const [meetingDetails, setMeetingDetails] = useState([]);
  const [observersMessages, setObserversMessages] = useState([]);
  const [observers, setObservers] = useState([]);
  const { socket } = useGlobalContext()

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



  // Use effect for getting meeting details

  // * get streaming status
  const getStreamingStatus = async (meetingId) => {
    socket.emit("getStreamingStatus", { meetingId });
  };

  // Automatically navigate observer to the meeting route if streaming starts
  useEffect(() => {
    if (userRole === "Observer") {
      socket.on("navigateToMeeting", ({ meetingId }) => {

        if (params.id === meetingId) {
          router.push(`/meeting/${meetingId}?fullName=${encodeURIComponent(fullName)}&role=${encodeURIComponent(userRole)}`);
        }
      });
    }

    return () => {
      socket.off("navigateToMeeting");
    };
  }, [params.id, userRole, socket]);


  // * get streaming status response function
  const handleGetStreamingStatusResponse = (response) => {
    if (response.success) {
      setIsStreaming(response.isStreaming);
      if (response.isStreaming) {
        router.push(
          `/meeting/${params.id}?fullName=${encodeURIComponent(
            fullName
          )}&role=${encodeURIComponent(userRole)}`
        );
      }
    } else {
      console.error("Failed to get streaming status:", response.message);
    }
  };



  useEffect(() => {
    getMeetingDetails(params.id);
  }, [params.id]);


  useEffect(() => {
    let email;
    if (typeof window !== "undefined") {
      email = window.localStorage.getItem("email");
    }

    socket.emit("join-room",
      { roomid: params.id, name: fullName, email, roomname: "main", role: userRole, isTechHost: false },
      (socketId, meeting, micmute) => {

      }
    );

    socket.on("getObserverListResponse", handleObserverListResponse);


    socket.on("observerChatResponse", handleObserverChatResponse);
    socket.emit("getObserverChat", { meetingId: params.id });
    socket.emit("getObserverList", { meetingId: params.id });

    return () => {
      socket.off("observerChatResponse", handleObserverChatResponse);
      socket.off("getObserverListResponse", handleObserverListResponse);
    }
  }, [params.id, socket]);




  const handleObserverChatResponse = (response) => {
    console.log("hello world", response)
    if (response.success) {
      setObserversMessages(response.observerMessages);
    } else {
      console.error("Failed to get observer chat:", response.message);
    }
  };


  // * get observer list response function
  const handleObserverListResponse = (response) => {
    if (response.success) {
      setObservers(response.observersList);
    } else {
      console.error("Failed to get observer list:", response.message);
    }
  };


  const sendMessageObserver = async (message) => {
    socket.emit("sendMessageObserver", { message, meetingId: params.id });
  };


  return (
    <div className="flex justify-between min-h-screen max-h-screen meeting_bg">
      <div className="h-full bg-white">
        <div >
          <div
            className={`flex w-80 transition-width duration-300 bg-white h-screen rounded-r-xl relative`}
          >

            <div className="flex flex-col w-full ">
              <ObserverWaintingRoomChat observersMessages={observersMessages} observers={observers} sendMessageObserver={sendMessageObserver} />
            </div>
          </div>
        </div>


      </div>
      {/* Main content */}
      <div className="flex-1 w-full max-h-[100vh] overflow-hidden mb-5 flex flex-col">
        <div className="px-5 py-5 flex flex-col justify-between items-between h-full">
          <div className="h-1/5">
            {/* First ------ nav bar */}
            <div className="flex justify-between items-center pb-2">
              {/* observer name */}
              <div className="flex justify-start items-center space-x-2 pb-2">
                <FaVideo />
                <p className=" text-custom-gray-3 font-semibold">
                  Waiting Room
                </p>

                <Button
                  children={`Observer View`}
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
              {/* <Button
                children="Leave"
                type="submit"
                variant="meeting"
                icon={<IoLogOutSharp />}
                className=" rounded-lg text-custom-black px-3 py-1"
              /> */}
            </div>
          </div>

          {/*Third ---------- meeting stream */}
          <div className="flex-grow flex  items-center justify-center w-full 
           bg-white rounded-lg">
            <h1 className="text-2xl font-bold">
              Please wait, until the host start the streaming.
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
