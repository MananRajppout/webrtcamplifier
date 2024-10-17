"use client";

import ParticipantLeftSideBar from "@/components/participantWaitingRoom/ParticipantLeftSideBar";
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
  const {socket} = useGlobalContext()
  const fullName = searchParams.get("fullName");
  const userRole = searchParams.get("role");
  const [participants, setParticipants] = useState([]);
  const [meetingDetails, setMeetingDetails] = useState([])

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
  useEffect(() => {
    getMeetingDetails(params.id);

    // Add listener for participant removal
    socket.on("participantRemovedFromWaiting", (data) => {
      console.log('participant removed from waiting', data)
      if (data.name === fullName && data.role === userRole) {
        router.push("/remove-participant");
      }
    });

  
      
    // Set up socket listener for participant list
    socket.on("getParticipantListResponse", (response) => {
      if (response.success) {
        setParticipants(response.participantList);
        console.log('participant list', response.participantList)
        
        // Check if the current user is in the participant list
        const isUserInMeeting = response.participantList.some(
          (participant) => participant.name === fullName && participant.role === userRole
        );

        if (isUserInMeeting) {
          router.push(
            `/meeting/${params.id}?fullName=${encodeURIComponent(
              fullName
            )}&role=${encodeURIComponent(userRole)}`
          );
        }
      } else {
        console.error("Failed to get participant list:", response.message);
      }
    });


    // Function to request participant list
  const requestParticipantList = () => {
    socket.emit("getParticipantList", { meetingId: params.id });
  };

  // Initial request
  requestParticipantList();

   // Set up interval to request participant list every 5 seconds
   const intervalId = setInterval(requestParticipantList, 1000);




    // Clean up function
    return () => {
      socket.off("getParticipantListResponse");
      socket.off("participantRemovedFromWaiting");
      clearInterval(intervalId);
    };
  }, [params.id, socket, fullName, userRole, router]);



  // const getParticipantList = async (meetingId) => {
  //   try {
  //     const response = await axios.get(
  //       `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/live-meeting/participant-list/${meetingId}`
  //     );
  //     setParticipants(response?.data?.participantsList);

  //     // Check if any participant matches the fullName and userRole
  //     const matchedParticipant = response?.data?.participantsList.some(
  //       (participant) =>
  //         participant.name === fullName && participant.role === userRole
  //     );

  //     if (matchedParticipant) {
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
  // useEffect(() => {
  //   getMeetingDetails(params.id);
  // }, [params.id]);

 

  return (
    <div className="flex justify-between min-h-screen max-h-screen meeting_bg">
      {/* Left Sidebar */}
      <div className="h-full">
        <ParticipantLeftSideBar />
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
        {/* <Button
          children="Leave"
          type="submit"
          variant="meeting"
          icon={<IoLogOutSharp />}
          className="rounded-lg text-custom-black px-3 py-1"
        /> */}
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
