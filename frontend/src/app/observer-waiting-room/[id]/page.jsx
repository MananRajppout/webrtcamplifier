"use client";

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
  const { socket} = useGlobalContext()

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
 

  // const getStreamingStatus = async (meetingId) => {
  //   try {
  //     const response = await axios.get(
  //       `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/live-meeting/get-streaming-status/${meetingId}`
  //     );

  //     if (response.data.isStreaming) {
  //       router.push(
  //         `/meeting/${params.id}?fullName=${encodeURIComponent(
  //           fullName
  //         )}&role=${encodeURIComponent(userRole)}`
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error in getting participant list", error);
  //   }
  // };

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

  // useEffect(() => {
  //   let intervalId;
  //   socket.on("getStreamingStatusResponse", handleGetStreamingStatusResponse);

  //   getStreamingStatus(params.id);

  //   return () => {
  //     socket.off("getStreamingStatusResponse", handleGetStreamingStatusResponse);
  //     clearInterval(intervalId);
  //   };
  // }, [params.id]);

   
   useEffect(() => {
    getMeetingDetails(params.id);
  }, [params.id]);

  // useEffect(() => {
  //   const meetingId = params?.id; // Ensure params id is used correctly
  //   if (meetingId) {
  //     // Set an interval to fetch participant list every 3 seconds
  //     const intervalId = setInterval(() => {
  //       getStreamingStatus(meetingId);
  //     }, 3000);

  //     // Cleanup interval when the component is unmounted
  //     return () => clearInterval(intervalId);
  //   }
  // }, [params?.id]);

  return (
    <div className="flex justify-between min-h-screen max-h-screen meeting_bg">
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
