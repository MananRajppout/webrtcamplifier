import TableData from "@/components/shared/TableData";
import TableHead from "@/components/shared/TableHead";
import { useGlobalContext } from "@/context/GlobalContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { BsFillEnvelopeAtFill, BsThreeDotsVertical } from "react-icons/bs";
import { FaShareAlt, FaUser } from "react-icons/fa";
import { RiPencilFill } from "react-icons/ri";
import ShareMeetingModal from "./ShareMeetingModal";
import toast from "react-hot-toast";
import io from "socket.io-client";

const MeetingTab = ({ meetings }) => {
  const [localMeetingState, setLocalMeetingState] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const modalRef = useRef();
  const { user, socket } = useGlobalContext();
  const [isShareMeetingModalOpen, setIsShareMeetingModalOpen] = useState(false);
  const [activeMeetingId, setActiveMeetingId] = useState(null);
  const toggleModal = (event, meeting) => {
    const { top, left } = event.currentTarget.getBoundingClientRect();
    setModalPosition({ top, left });
    setSelectedMeeting(meeting);
    setIsModalOpen(!isModalOpen);
  };
  const router = useRouter();

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    
    setLocalMeetingState(meetings);
  }, [meetings]);

  const handleShareMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setIsShareMeetingModalOpen(true);
    closeModal();
  };

  const handleView = (meeting) => {
    closeModal();
  };

  const handleJoinMeeting = async (meeting) => {
    
    if (activeMeetingId === meeting._id) return;
   
    setActiveMeetingId(meeting._id);
    if (meeting.moderator.email === user.email) {
      const fullName = `${user.firstName} ${user.lastName}`;
      try {
        if (socket) {
          socket.emit("startMeeting", {
            meetingId: meeting._id,
            user: {
              fullName,
              email: user.email,
              role: "Moderator",
            },
          });

          // Listen for a response from the server
          socket.on("startMeetingResponse", (response) => {
         

            if (!response.success) {
              toast.error(response.message);
            } else {
              const liveMeetingData = response.liveMeeting;
         

              router.push(
                `/meeting/${meeting._id}?fullName=${encodeURIComponent(
                  fullName
                )}&role=Moderator`
              );
            }
          });
        } else {
          console.error("Socket not initialized");
          setActiveMeetingId(null);
        }
      } catch (error) {
        console.error("Error joining meeting:", error);
        setActiveMeetingId(null);
      }
    } else {
      toast.error("You are not the moderator of this meeting.");

      setActiveMeetingId(null);
    }
  };

 
  useEffect(() => {
    return () => {
      if (socket) {
        socket.off("startMeetingResponse");
      }
    };
  }, [socket]);


  const handleDeleteMeeting = async (meeting) => {

    const isConfirmed = confirm(
      "Are you sure you want to delete this meeting?"
    );

    if (!isConfirmed) {
      return; // If the user cancels, exit the function
    }

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/delete-meeting/${meeting._id}`
      );

      if (response.status === 200) {
      
        toast.success(`${response.data.message}`);
        // Update the meetings state by filtering out the deleted meeting
        const updatedMeetings = localMeetingState.filter(
          (m) => m._id !== meeting._id
        );
        setIsModalOpen(false);
        setLocalMeetingState(updatedMeetings);
      } else {
        console.error("Failed to delete meeting");
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg ">
        <thead className="border-b-[0.5px] border-solid border-custom-dark-blue-1">
          <tr>
            <TableHead>Meeting Title</TableHead>

            <TableHead>Start Date & Time</TableHead>
            <TableHead>Time Zone</TableHead>
            <TableHead>Moderator</TableHead>
            <TableHead>Action</TableHead>
          </tr>
        </thead>
        <tbody>
          {localMeetingState?.map((meeting, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <TableData>{meeting?.title}</TableData>
              {/*  {new Date(meeting.startDate).toLocaleDateString()}{" "}
                    {meeting.startTime} */}
              <TableData>
                {new Date(meeting?.startDate).toLocaleDateString()}{" "}
                {meeting?.startTime}
              </TableData>
              <TableData>{meeting?.timeZone}</TableData>
              <TableData>{meeting?.moderator?.firstName}</TableData>
              <TableData>
                <div className="flex justify-start items-center gap-2">
                  <button
                    className={`${activeMeetingId === meeting._id ? "bg-gray-300 cursor-not-allowed" : "text-blue-500 hover:text-blue-700"} `}
                    onClick={() => handleJoinMeeting(meeting)}
                    disabled={activeMeetingId === meeting._id}
                  >
                  {activeMeetingId === meeting._id ? "Joining..." : "Join"}
                  </button>

                  <BsThreeDotsVertical
                    onClick={(e) => toggleModal(e, meeting)}
                    className="cursor-pointer"
                  />
                </div>
              </TableData>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <div
          ref={modalRef}
          className="absolute bg-white shadow-[0px_3px_6px_#0000004A] rounded-lg "
          style={{
            top: modalPosition.top + 335,
            left: modalPosition.left - 87,
          }}
        >
          <ul className="text-[12px]">
            <li
              className="py-2 px-4 hover:bg-gray-200 cursor-pointer text-[#697e89] flex justify-start items-center gap-2"
              onClick={() => handleView(selectedMeeting)}
            >
              <FaUser />
              <span>View</span>
            </li>
            <li
              className="py-2 px-4 hover:bg-gray-200 cursor-pointer text-[#697e89] flex justify-start items-center gap-2"
              onClick={closeModal}
            >
              <RiPencilFill />
              <span>Edit</span>
            </li>
            <li
              className="py-2 px-4 hover:bg-gray-200 cursor-pointer text-[#697e89] flex justify-start items-center gap-2"
              onClick={() => handleShareMeeting(selectedMeeting)}
            >
              <FaShareAlt />
              <span>Share</span>
            </li>
            <li
              className="py-2 px-4 hover:bg-gray-200 cursor-pointer text-[#697e89] flex justify-start items-center gap-2"
              onClick={() => handleDeleteMeeting(selectedMeeting)}
            >
              <BsFillEnvelopeAtFill />
              <span>Delete</span>
            </li>
          </ul>
        </div>
      )}

      {isShareMeetingModalOpen && (
        <ShareMeetingModal
          meeting={selectedMeeting}
          onClose={() => setIsShareMeetingModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MeetingTab;
