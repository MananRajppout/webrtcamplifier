import TableData from "@/components/shared/TableData";
import TableHead from "@/components/shared/TableHead";
import { useGlobalContext } from "@/context/GlobalContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { BsFillEnvelopeAtFill, BsThreeDotsVertical } from "react-icons/bs";
import { FaCopy, FaShareAlt, FaUser } from "react-icons/fa";
import { RiPencilFill } from "react-icons/ri";
import ShareMeetingModal from "./ShareMeetingModal";
import toast from "react-hot-toast";
import io from "socket.io-client";
import AddMeetingModal from "./AddMeetingModal";
import Pagination from "@/components/shared/Pagination";
import Button from "@/components/shared/button";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import useSocketListen from "@/hooks/useSocketListen";

const MeetingTab = ({
  meetings,
  fetchMeetings,
  project,
  meetingPage,
  totalMeetingPages,
  onPageChange,
}) => {
  const [localMeetingState, setLocalMeetingState] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const modalRef = useRef();
  const { user, socket } = useGlobalContext();
  const [isShareMeetingModalOpen, setIsShareMeetingModalOpen] = useState(false);
  const [activeMeetingId, setActiveMeetingId] = useState(null);
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const router = useRouter();

  const toggleModal = (event, meeting) => {
    const { top, left } = event.currentTarget.getBoundingClientRect();
    setModalPosition({ top, left });
    setSelectedMeeting(meeting);
    setIsModalOpen(!isModalOpen);
  };


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

  useSocketListen("meeting-not-found", () => {
    toast.error("Meeting not found");
  });

  const handleJoinMeeting = async (meeting) => {
    if (project.status === "Draft" || project.status === "Paused" || project.status === "Closed") {
      toast.error(
        `Meeting cannot be started while project in the ${project.status} status.`
      );
      return;
    }
    
    if (activeMeetingId === meeting._id) return;

    setActiveMeetingId(meeting._id);
    const isModerator = meeting.moderator.some(
      (mod) => mod.email === user.email
    );
    if (isModerator) {
      const confirmStart = window.confirm(
        "Are you sure you want to start this session?"
      );
      if (!confirmStart) return;
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
              window.open(
                `/meeting/${meeting._id}?fullName=${encodeURIComponent(
                  fullName
                )}&role=Moderator`,
                "_blank"
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

  const handleDeleteMeeting = (meeting) => {
    setMeetingToDelete(meeting);
    setIsConfirmationModalOpen(true);
  };

  const confirmDeleteMeeting = async (meeting) => {
    if (!meetingToDelete) return;

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/delete-meeting/${meetingToDelete._id}`
      );

      if (response.status === 200) {
        toast.success(`${response.data.message}`);
        // Update the meetings state by filtering out the deleted meeting
        const updatedMeetings = localMeetingState.filter(
          (m) => m._id !== meetingToDelete._id
        );
        // setIsModalOpen(false);
        setLocalMeetingState(updatedMeetings);
      } else {
        console.error("Failed to delete meeting");
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
    } finally {
      setIsConfirmationModalOpen(false);
      setMeetingToDelete(null);
    }
  };

  const handleView = (meeting) => {
    setShowMeetingDetails(true);
    setSelectedMeeting(meeting);
  };

  // Add this function to handle going back to table view
  const handleBackToTable = () => {
    setShowMeetingDetails(false);
    setSelectedMeeting(null);
  };

  // Add handler for edit button click
  const handleEditMeeting = (meeting) => {
    setMeetingToEdit(meeting);
    setIsEditModalOpen(true);
    closeModal();
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/change-meeting-status`,
        {
          meetingId: selectedMeeting._id,
          status: newStatus,
        }
      );

      if (response.status === 200) {
        toast.success("Meeting status updated successfully");
        // Update local state
        const updatedMeetings = localMeetingState.map((meeting) => {
          if (meeting._id === selectedMeeting._id) {
            return { ...meeting, status: newStatus };
          }
          return meeting;
        });
        setLocalMeetingState(updatedMeetings);
        setSelectedMeeting({ ...selectedMeeting, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating meeting status:", error);
      toast.error("Failed to update meeting status");
    }
  };

  const handleDuplicateMeeting = async (meeting) => {
    try {
      const newMeetingData = {
        ...meeting,
        _id: undefined, // Clear the ID to create a new meeting
        status: "Draft", // Optionally reset the status
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/create/meeting`,
        newMeetingData
      );

      if (response.status === 201) {
        toast.success("Meeting duplicated successfully");
        fetchMeetings(); // Refresh the meetings list
      }
    } catch (error) {
      console.error("Error duplicating meeting:", error);
      toast.error("Failed to duplicate meeting");
    }
  };

  const convertTo12HourFormat = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
    return `${adjustedHours}:${minutes?.toString().padStart(2, "0")} ${period}`;
  };

  const handleJoinBackroom = async (meeting) => {
    if (project.status === "Draft" || project.status === "Closed") {
      toast.error(`You cannot join backroom while meeting is in ${project.status} state.`);
      return;
    }
    const fullName = `${user?.firstName} ${user?.lastName}`;
    const meetingId = meeting?._id;
    try {
      if (socket) {
        socket.emit("observerJoinMeeting", {
          meetingId,
          name: fullName,
          role: "Observer",
          passcode: meeting?.meetingPasscode,
          email: user.email,
        });

        socket.on("observerJoinMeetingResponse", (response) => {
          if (response.message === "Meeting not found") {
            toast.error("Meeting not found");
          } else if (response.message === "Invalid passcode") {
            toast.error("Invalid passcode");
          } else if (response.message === "Live meeting not found") {
            toast.error("Live meeting not found");
          } else if (
            response.message === "Observer already added to the meeting"
          ) {
            router.push(
              `/meeting/${meetingId}?fullName=${encodeURIComponent(
                fullName
              )}&role=Observer`
            );
          } else if (response.message === "Observer added to the meeting") {
            if (response.isStreaming) {
              router.push(
                `/meeting/${meetingId}?fullName=${encodeURIComponent(
                  fullName
                )}&role=Observer`
              );
            } else {
              router.push(
                `/observer-waiting-room/${meetingId}?fullName=${encodeURIComponent(
                  fullName
                )}&role=Observer`
              );
            }
          }
        });
      } else {
        console.error("Socket not initialized");
      }
    } catch (error) {
      console.error("Error joining backroom:", error);
    }
  };

  return (
    <div className="overflow-x-auto">
      {!showMeetingDetails ? (
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
                <td className="px-3 py-1 text-left text-[12px] whitespace-nowrap font-medium text-custom-dark-blue-1">{`${new Date(
                  meeting?.startDate
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })} ${convertTo12HourFormat(meeting?.startTime)}`}</td>
                <TableData>{meeting?.timeZone}</TableData>
                <td className="px-3 py-1 text-left text-[12px]  font-medium text-custom-dark-blue-1">
                  {meeting?.moderator.map((mod) => mod.firstName).join(", ")}
                </td>
                <TableData>
                  <div className="flex flex-col justify-center items-center gap-2">
                    <button
                      className={`${
                        activeMeetingId === meeting._id
                          ? "bg-gray-300 cursor-not-allowed"
                          : "text-blue-500 hover:text-blue-700"
                      } `}
                      onClick={() => handleJoinMeeting(meeting)}
                      disabled={activeMeetingId === meeting._id}
                    >
                      {activeMeetingId === meeting._id
                        ? "Starting Meeting"
                        : "Start Meeting"}
                    </button>
                    <button
                      onClick={() => handleJoinBackroom(meeting)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Join Backroom
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
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              Meeting Details - {selectedMeeting.title}
            </h2>
            <button
              onClick={handleBackToTable}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">General Information</h3>
              <select
                className="border rounded-lg text-white font-semibold px-4  py-2 bg-custom-teal outline-none"
                onChange={handleStatusChange}
                value={selectedMeeting.status}
              >
                <option value="Join">Join</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Draft">Draft</option>
                <option value="Complete">Complete</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-medium">Meeting Title</h3>
                <p>{selectedMeeting?.title}</p>
              </div>
              <button
                className="font-bold text-custom-teal"
                onClick={() => handleEditMeeting(selectedMeeting)}
              >
                Edit
              </button>
            </div>
            <div>
              <h3 className="font-medium">Description</h3>
              <p>{selectedMeeting?.description}</p>
            </div>
            <div>
              <h3 className="font-medium">Start Time</h3>
              <p>
                {new Date(selectedMeeting?.startDate).toLocaleDateString()}{" "}
                {selectedMeeting?.startTime}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Duration</h3>
              <p>{selectedMeeting?.duration}</p>
            </div>
            <div>
              <h3 className="font-medium">Status</h3>
              <p>{selectedMeeting?.status}</p>
            </div>
            {/* Share meeting button */}
            <div className="flex flex-col lg:flex-row gap-3 justify-between items-center">
              <Button
                children="Share Meeting"
                variant="secondary"
                type="button"
                onClick={() => setIsShareMeetingModalOpen(true)}
                className="px-5 py-2 rounded-lg text-white"
              />
            </div>
          </div>
        </div>
      )}

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
              onClick={(e) => {
                e.stopPropagation();
                handleView(selectedMeeting);
                closeModal();
              }}
            >
              <FaUser />
              <span>View</span>
            </li>
            <li
              className="py-2 px-4 hover:bg-gray-200 cursor-pointer text-[#697e89] flex justify-start items-center gap-2"
              onClick={() => handleEditMeeting(selectedMeeting)}
            >
              <RiPencilFill />
              <span>Edit</span>
            </li>
            <li
              className="py-2 px-4 hover:bg-gray-200 cursor-pointer text-[#697e89] flex justify-start items-center gap-2"
              onClick={() => handleDuplicateMeeting(selectedMeeting)}
            >
              <FaCopy />
              <span>Duplicate</span>
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

      {isEditModalOpen && (
        <AddMeetingModal
          onClose={() => {
            setIsEditModalOpen(false);
            setShowMeetingDetails(false);
          }}
          project={project}
          user={user}
          refetchMeetings={fetchMeetings}
          meetingToEdit={meetingToEdit}
          isEditing={true}
        />
      )}

      {isConfirmationModalOpen && (
        <ConfirmationModal
          onCancel={() => setIsConfirmationModalOpen(false)}
          onYes={confirmDeleteMeeting}
          heading="Delete Meeting"
          text="Are you sure you want to delete this meeting? This action cannot be undone."
        />
      )}

      {/* Pagination */}
      {meetings.length >= 10 && (
        <div className="flex justify-end py-3">
          <Pagination
            currentPage={meetingPage}
            totalPages={totalMeetingPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default MeetingTab;
