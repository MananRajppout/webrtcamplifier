"use client";
import HeadingBlue25px from "@/components/shared/HeadingBlue25px";
import HeadingLg from "@/components/shared/HeadingLg";
import { TbArrowsShuffle } from "react-icons/tb";
import React, { useEffect, useState } from "react";
import ParagraphBlue2 from "../shared/ParagraphBlue2";
import axios from "axios";
import MeetingTab from "../projectComponents/meetings/MeetingTab";
import AddMeetingModal from "../projectComponents/meetings/AddMeetingModal";
import EditProjectModal from "../projectComponents/EditProjectModal";
import toast from "react-hot-toast";
import MemberTabAddMember from "../projectComponents/members/MemberTabAddMember";
import MembersTab from "../projectComponents/members/MembersTab";
import MemberBulkUpdate from "../projectComponents/members/MemberBulkUpdate";
import PollsTab from "../projectComponents/polls/PollsTab";
import AddPollModal from "../projectComponents/polls/AddPollModal";
import Button from "../shared/button";
import AddRepositoryModal from "../projectComponents/repository/AddRepositoryModal";
import RepositoryTab from "../projectComponents/repository/RepositoryTab";
import Search from "./Search";
import { MdBarChart, MdOutlineRadioButtonChecked } from "react-icons/md";
import { FaCheckSquare, FaStarHalfAlt } from "react-icons/fa";
import { HiMiniBars2, HiMiniBars4 } from "react-icons/hi2";
import { IoRemoveOutline } from "react-icons/io5";
import AddSingleChoicePollModal from "../projectComponents/polls/PollModal/AddSingleChoicePollModal";
import MultipleChoicePollModal from "../projectComponents/polls/PollModal/MultipleChoicePollModal";
import MatchingPollModal from "../projectComponents/polls/PollModal/MatchingPollModal";
import RankOrderPollModal from "../projectComponents/polls/PollModal/RankOrderPollModal";
import ShortAnswerPollModal from "../projectComponents/polls/PollModal/ShortAnswerPollModal";
import LongAnswerPollModal from "../projectComponents/polls/PollModal/LongAnswerPollModal";
import FillBlankModal from "../projectComponents/polls/PollModal/FillBlankModal";
import RatingScaleModal from "../projectComponents/polls/PollModal/RatingScaleModal";
const ViewProject = ({ project, onClose, user, fetchProjects }) => {
  const [localProjectState, setLocalProjectState] = useState(project);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Meetings");
  const [secondaryTab, setSecondaryTab] = useState("Documents");
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [polls, setPolls] = useState([]);
  const [isAddMeetingModalOpen, setIsAddMeetingModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    localProjectState?.status || ""
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [isAddPollModalOpen, setIsAddPollModalOpen] = useState(false);
  const [isAddRepositoryModalOpen, setIsAddRepositoryModalOpen] =
    useState(false);
  const [repositories, setRepositories] = useState([]);
  const [repositoryData, setRepositoryData] = useState({
    documents: [],
    media: [],
  });
  const [selectedRepositoryMeetingTab, setSelectedRepositoryMeetingTab] =
    useState(null);
  const [showDocAndMediaTab, setShowDocAndMediaTab] = useState(false);
  const [selectedDocAndMediaTab, setSelectedDocAndMediaTab] = useState("");
  const [meetingPage, setMeetingPage] = useState(1);
  const [totalMeetingPages, setTotalMeetingPages] = useState(1);
  const [pollPage, setPollPage] = useState(1);
  const [totalPollPages, setTotalPollPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPollDropdownOpen, setIsPollDropdownOpen] = useState(false);
  const [isSingleChoiceModalOpen, setIsSingleChoiceModalOpen] = useState(false);
  const [isMultipleChoiceModalOpen, setIsMultipleChoiceModalOpen] =
    useState(false);
  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState(false);
  const [isRankOrderModalOpen, setIsRankOrderModalOpen] = useState(false);
  const [isShortAnswerModalOpen, setIsShortAnswerModalOpen] = useState(false);
  const [isLongAnswerModalOpen, setIsLongAnswerModalOpen] = useState(false);
  const [isBlankModalOpen, setIsBlankModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const handleSingleChoiceSave = async (singleChoiceData) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/create/poll`,
        singleChoiceData
      );

      toast.success("Poll created successfully!");
      setIsSingleChoiceModalOpen(false);
      setIsMultipleChoiceModalOpen(false);
      setIsPollDropdownOpen(false)
      fetchPolls();
    } catch (error) {
      toast.error("Failed to create poll: " + error.message);
    }
  };

  const handleOpenPollDropdown = () => {
    setIsPollDropdownOpen((prev) => !prev);
  };

  const handleRepositoryMeetingTabChange = (meeting) => {
    setSelectedRepositoryMeetingTab(meeting);
    setSelectedDocAndMediaTab("");
    setShowDocAndMediaTab(true);
  };

  const handleDocAndMediaTabChange = (tab) => {
    setSelectedDocAndMediaTab(tab);
  };

  const handleModalClose = () => {
    setShowAddContactModal(false);
  };

  // Handle edit modal open/close
  const handleEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEditProject = async (updatedProjectData) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/update-general-project-info/${localProjectState._id}`,
        updatedProjectData
      );
      if (response.status === 200) {
        setLocalProjectState(response.data.project);
        closeEditModal();
        toast.success(`${response.data.message}`);
      } else {
        console.error("Failed to update project");
        alert("Failed to update project. Please try again.");
      }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          // Validation error
          console.error("Validation Error:", data.message);
          toast.error(`Validation Error: ${data.message}`);
        } else if (status === 404) {
          // Project not found
          console.error("Project not found:", data.message);
          toast.error(`Error: Project not found.`);
        } else if (status === 500) {
          // Server error
          console.error("Server Error:", data.message);
          toast.error(`Server Error: ${data.message}`);
        } else {
          // Handle other unexpected errors
          console.error("Unexpected Error:", data.message);
          toast.error(
            `Error: ${data.message || "An unexpected error occurred."}`
          );
        }
      } else if (error.request) {
        // The request was made, but no response was received
        console.error("No response received from the server:", error.request);
        toast.error("No response from the server. Please try again later.");
      } else {
        // Something went wrong in setting up the request
        console.error("Error setting up the request:", error.message);
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleMeetingPageChange = (page) => {
    setMeetingPage(page);
    fetchMeetings(page, searchTerm);
  };

  const handlePollPageChange =(page)=>{
    setPollPage(page);
    fetchPolls(page)
  }

  // Fetching project meetings
  const fetchMeetings = async (page = 1, searchQuery = "", filters = {}) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-all/meeting/${localProjectState._id}`,
        {
          params: {
            page,
            limit: 10,
            search: searchQuery,
            ...filters,
          },
        }
      );
      setMeetings(response.data.meetings);
      setTotalMeetingPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // Fetching project meetings
  const fetchPolls = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-all/poll/${localProjectState._id}`,
        {
          params: { page, limit: 10 },
        }
      );
      console.log('view project polls', response.data)
      setPolls(response.data.polls);
      setTotalPollPages(response.data.totalPages)
      // setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // Fetching project meetings
  const fetchRepositories = async (projectId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-repository/${projectId}`
      );
      setRepositories(response.data.repositories);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings(meetingPage);
    fetchPolls();
    fetchRepositories(localProjectState?._id);
  }, [localProjectState, meetingPage]);

  const handleAddMeetingModal = () => {
    setIsAddMeetingModalOpen(true);
  };

  const handleOpenAddPollModal = () => {
    setIsAddPollModalOpen(true);
  };
  const handleOpenAddRepositoryModal = () => {
    setIsAddRepositoryModalOpen(true);
  };

  const closeAddMeetingModal = () => {
    setIsAddMeetingModalOpen(false);
  };
  const handleBulkUpdateModal = () => {
    setShowBulkUpdateModal(true);
  };

  const closeBulkUpdateModal = () => {
    setShowBulkUpdateModal(false);
  };

  // Function to handle status change
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);

    try {
      // Sending request to change project status
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/change-project-status/${localProjectState._id}`,
        { status: newStatus }
      );

      if (response.status === 200) {
        setLocalProjectState((prev) => ({ ...prev, status: newStatus }));
        // fetchProjects(user?._id);
        // You can also add logic here to display success message to the user
      } else {
        console.error("Failed to update status");
        // Show a generic error message to the user
        alert("Failed to update status. Please try again.");
      }
    } catch (error) {
      // Handle error based on the response or error message
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const { status, data } = error.response;

        if (status === 400) {
          // Handle bad request, possibly due to validation error
          alert(`Validation Error: ${data.message}`);
        } else if (status === 404) {
          // Handle project not found error
          alert(`Error: Project not found`);
        } else if (status === 500) {
          // Handle internal server error
          alert(`Server Error: ${data.message}`);
        } else {
          // Handle any other errors
          alert(`Error: ${data.message || "An unexpected error occurred"}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        alert("No response from the server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up the request:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleOpenAddContactModal = () => {
    setShowAddContactModal(true);
  };

  const handleMeetingSearch = (term) => {
    setSearchTerm(term);
    setMeetingPage(1);
    fetchMeetings(1, term);
  };

  return (
    <div className="my_profile_main_section_shadow bg-[#fafafb] bg-opacity-90 h-full min-h-screen flex flex-col justify-center items-center w-full">
      {/* navbar */}
      <div className="pt-5 w-full px-6 flex justify-between items-center ">
        <div>
          <HeadingBlue25px children="View Project Details" />
        </div>
      </div>
      {/* body */}
      <div className="flex-grow px-6 w-full">
        {/* project status change button */}
        <div className="flex justify-end py-5">
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="border rounded-lg text-white font-semibold px-4  py-2 bg-custom-teal outline-none"
          >
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Complete">Complete</option>
            <option value="Inactive">Inactive</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        {/*  general information  div*/}
        <div className="bg-white shadow-[0px_0px_12px_#00000029] rounded-xl p-5 w-full relative">
          <div className="flex justify-between items-center">
            <div className="flex justify-between items-center gap-3">
              <p className=" md:text-custom-dark-blue-1 text-base font-semibold sm:text-lg">
                Project Name:
              </p>
              <ParagraphBlue2 children={localProjectState?.name} />
            </div>
            <div>
              <button
                className="cursor-pointer absolute top-2 right-3"
                onClick={handleEditModal}
              >
                Edit
              </button>
            </div>
          </div>
          <div className="flex justify-start items-center gap-3 sm:gap-5">
            <p className=" md:text-custom-dark-blue-1 text-base font-semibold sm:text-lg">
              Description:
            </p>
            <ParagraphBlue2 children={localProjectState?.description} />
          </div>
          <div className="flex justify-start items-center gap-1 sm:gap-5">
            <p className=" md:text-custom-dark-blue-1 text-base font-semibold sm:text-lg">
              Fieldwork Start Date:
            </p>
            {/* Format the start date to include both date and 12-hour time */}
            <ParagraphBlue2 children={new Date(localProjectState?.startDate).toLocaleString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              hour: 'numeric', 
              minute: 'numeric', 
              hour12: true 
            })} />
          </div>
          <div className="flex justify-start items-center gap-3 sm:gap-5">
            <p className=" md:text-custom-dark-blue-1 text-base font-semibold sm:text-lg">
              Fieldwork End Date:
            </p>
            {/* Format the end date to include both date and 12-hour time */}
            <ParagraphBlue2 children={new Date(localProjectState?.endDate).toLocaleString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              hour: 'numeric', 
              minute: 'numeric', 
              hour12: true 
            })} />
          </div>
          <div className="flex justify-start items-center gap-3 sm:gap-5">
            <p className=" md:text-custom-dark-blue-1 text-base font-semibold sm:text-lg">
              Passcode:
            </p>
            {/* <HeadingLg children="Passcode" /> */}
            <ParagraphBlue2 children={localProjectState?.projectPasscode} />
          </div>
          <div className="flex justify-start items-center gap-3 sm:gap-5">
            <p className=" md:text-custom-dark-blue-1 text-base font-semibold sm:text-lg">
              Project Status:
            </p>
            {/* <HeadingLg children="Project Status" /> */}
            <ParagraphBlue2 children={localProjectState?.status} />
          </div>
        </div>

        {/* participants, observers, breakout rooms and polls div container */}
        <div className="bg-white shadow-[0px_0px_12px_#00000029] rounded-xl p-5 mt-3 mb-10">
          {/* tab navigation */}
          <div className="flex justify-around space-x-10 overflow-x-auto border-b">
            <button
              className={`py-2 border-custom-dark-blue-1 ${
                activeTab === "Meetings" ? "border-b-2 " : "opacity-25"
              }`}
              onClick={() => handleTabChange("Meetings")}
            >
              Meetings
            </button>
            <button
              className={`py-2 border-custom-dark-blue-1 ${
                activeTab === "Project Team" ? "border-b-2 " : "opacity-25"
              }`}
              onClick={() => handleTabChange("Project Team")}
            >
              Project Team
            </button>
            <button
              className={`py-2 border-custom-dark-blue-1 ${
                activeTab === "Polls" ? "border-b-2 " : "opacity-25"
              }`}
              onClick={() => handleTabChange("Polls")}
            >
              Polls
            </button>
            <button
              className={`py-2 border-custom-dark-blue-1 ${
                activeTab === "Files" ? "border-b-2 " : "opacity-25"
              }`}
              onClick={() => handleTabChange("Files")}
            >
              Files
            </button>
          </div>

          {/* tab content */}
          {activeTab === "Meetings" && (
            <div className="pt-5">
              <div className="flex justify-between items-center">
                <HeadingLg children="Meetings" />
                {/* !Search button */}
                <Search
                  onSearch={handleMeetingSearch}
                  placeholder="Search Meeting Name"
                />
                <Button
                  children="Add Meeting"
                  className="px-4 py-2 rounded-xl"
                  type="submit"
                  onClick={handleAddMeetingModal}
                />
              </div>
              <div className="border-[0.5px] border-solid border-custom-dark-blue-1 rounded-xl h-[300px] overflow-y-scroll mt-2">
                <MeetingTab
                  meetings={meetings}
                  fetchMeetings={fetchMeetings}
                  project={project}
                  meetingPage={meetingPage}
                  totalMeetingPages={totalMeetingPages}
                  onPageChange={handleMeetingPageChange}
                />
              </div>
            </div>
          )}

          {activeTab === "Project Team" && (
            <div className="pt-5">
              <div className="flex justify-between items-center">
                <HeadingLg children="Project Members" />
                <div
                  className="flex justify-end items-center
               gap-5"
                >
                  <Button
                    className="font-bold"
                    variant="plain"
                    type="submit"
                    onClick={handleBulkUpdateModal}
                  >
                    Bulk Update
                  </Button>
                  <Button
                    children={"Add"}
                    className="px-5 py-1.5 rounded-xl"
                    variant="secondary"
                    onClick={handleOpenAddContactModal}
                  />
                </div>
              </div>
              <div className="border-[0.5px] border-solid border-custom-dark-blue-1 rounded-xl h-[300px] overflow-y-scroll mt-2">
                <MembersTab
                  project={localProjectState}
                  setLocalProjectState={setLocalProjectState}
                />
              </div>
            </div>
          )}

          {activeTab === "Polls" && (
            <div className="pt-5">
              <div className="flex justify-between items-center">
                <HeadingLg children="Polls List" />
                <div
                  className="flex justify-end items-center
             gap-5 relative"
                >
                  <Button
                    children={"Add Poll"}
                    className="px-5 py-1.5 rounded-xl"
                    variant="secondary"
                    onClick={handleOpenPollDropdown}
                  />
                  {isPollDropdownOpen && (
                    <div className="absolute top-9 -left-20 bg-white border rounded shadow-lg p-2">
                      <div
                        className="flex items-center p-2 cursor-pointer"
                        onClick={() => setIsSingleChoiceModalOpen(true)}
                      >
                        <MdOutlineRadioButtonChecked />
                        <span className="ml-2">Single choice</span>
                      </div>
                      <div
                        className="flex items-center p-2 cursor-pointer"
                        onClick={() => setIsMultipleChoiceModalOpen(true)}
                      >
                        <FaCheckSquare />
                        <span className="ml-2">Multiple choice</span>
                      </div>
                      <div
                        className="flex items-center p-2 cursor-pointer"
                        onClick={() => setIsMatchingModalOpen(true)}
                      >
                        <TbArrowsShuffle />
                        <span className="ml-2">Matching</span>
                      </div>
                      <div
                        className="flex items-center p-2 cursor-pointer"
                        onClick={() => setIsRankOrderModalOpen(true)}
                      >
                        <MdBarChart />
                        <span className="ml-2">Rank order</span>
                      </div>
                      <div
                        className="flex items-center p-2 cursor-pointer"
                        onClick={() => setIsShortAnswerModalOpen(true)}
                      >
                        <HiMiniBars2 />
                        <span className="ml-2">Short answer</span>
                      </div>
                      <div className="flex items-center p-2 cursor-pointer"
                      onClick={()=>setIsLongAnswerModalOpen(true)}
                      >
                        <HiMiniBars4 />
                        <span className="ml-2">Long answer</span>
                      </div>
                      <div className="flex items-center p-2 cursor-pointer"
                      onClick={()=>setIsBlankModalOpen(true)}
                      >
                        <IoRemoveOutline />
                        <span className="ml-2">Fill in the blank</span>
                      </div>
                      <div className="flex items-center p-2 cursor-pointer"
                      onClick={()=>setIsRatingModalOpen(true)}
                      >
                        <FaStarHalfAlt />
                        <span className="ml-2">Rating scale</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-[0.5px] border-solid border-custom-dark-blue-1 rounded-xl h-[300px] overflow-y-scroll mt-2">
                <PollsTab
                  project={localProjectState}
                  polls={polls}
                  setPolls={setPolls}
                  setLocalProjectState={setLocalProjectState}
                  pollPage={pollPage}
                  totalPollPages={totalPollPages}
                  onPageChange={handlePollPageChange}
                />
              </div>
            </div>
          )}

          {activeTab === "Files" && (
            <div className="pt-2">
              <div className="flex justify-between items-center">
                <HeadingLg children="Files List" />
                <div
                  className="flex justify-end items-center
             gap-5"
                >
                  <Button
                    children={"Upload"}
                    className="px-5 py-1.5 rounded-xl"
                    variant="secondary"
                    onClick={handleOpenAddRepositoryModal}
                  />
                </div>
              </div>
              <div className="overflow-x-auto border-b">
                <div className="flex space-x-5 whitespace-nowrap">
                <button
                    className={`py-2 border-custom-dark-blue-1 text-sm ${
                      selectedRepositoryMeetingTab === "All"
                        ? "border-b-2"
                        : "opacity-25"
                    }`}
                    onClick={() => {
                      setSelectedRepositoryMeetingTab("All");
                      setSelectedDocAndMediaTab(""); // Reset selected tab
                      setShowDocAndMediaTab(true); // Show documents and media
                    }}
                  >
                    All
                  </button>
                  {meetings?.map((meeting) => (
                    <button
                      key={meeting?._id}
                      className={`py-2 border-custom-dark-blue-1 text-sm ${
                        selectedRepositoryMeetingTab === meeting
                          ? "border-b-2"
                          : "opacity-25"
                      }`}
                      onClick={() => handleRepositoryMeetingTabChange(meeting)}
                    >
                      {meeting?.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show "Documents" and "Media" tabs immediately below the selected meeting tab */}
              {showDocAndMediaTab && selectedRepositoryMeetingTab && (
                <div className="flex justify-center space-x-5 border-b">
                  <button
                    className={`py-2 border-custom-dark-blue-1 text-sm ${
                      selectedDocAndMediaTab === "Documents"
                        ? "border-b-2"
                        : "opacity-25"
                    }`}
                    onClick={() => handleDocAndMediaTabChange("Documents")}
                  >
                    Documents
                  </button>
                  <button
                    className={`py-2 px-4 rounded ${
                      selectedDocAndMediaTab === "Media"
                        ? "border-b-2"
                        : "opacity-25"
                    }`}
                    onClick={() => handleDocAndMediaTabChange("Media")}
                  >
                    Media
                  </button>
                </div>
              )}

              <div className="border-[0.5px] border-solid border-custom-dark-blue-1 rounded-xl h-[300px] overflow-y-scroll mt-2">
                <RepositoryTab
                  repositories={repositories}
                  selectedRepositoryMeetingTab={selectedRepositoryMeetingTab}
                  selectedDocAndMediaTab={selectedDocAndMediaTab}
                  fetchRepositories={fetchRepositories}
                  projectId={localProjectState?._id}
                />
              </div>
            </div>
          )}

          {isAddMeetingModalOpen && (
            <AddMeetingModal
              onClose={closeAddMeetingModal}
              project={localProjectState}
              user={user}
              refetchMeetings={fetchMeetings}
            />
          )}

          {/* Render edit modal if open */}
          {isEditModalOpen && (
            <EditProjectModal
              onClose={closeEditModal}
              project={localProjectState}
              onSave={handleEditProject}
            />
          )}

          {/* Render add member modal if open */}
          {showAddContactModal && (
            <MemberTabAddMember
              onClose={handleModalClose}
              project={localProjectState}
              userId={user._id}
              setLocalProjectState={setLocalProjectState}
            />
          )}
          {/* Render bulk update modal if open */}
          {showBulkUpdateModal && (
            <MemberBulkUpdate
              onClose={closeBulkUpdateModal}
              project={localProjectState}
              setLocalProjectState={setLocalProjectState}
            />
          )}
          {/* Render add poll modal if open */}
          {isAddPollModalOpen && (
            <AddPollModal
              onClose={() => setIsAddPollModalOpen(false)}
              pollToEdit={null}
              project={localProjectState}
              setLocalProjectState={setLocalProjectState}
              setPolls={setPolls}
            />
          )}
          {/* Render add repository modal if open */}
          {isAddRepositoryModalOpen && (
            <AddRepositoryModal
              onClose={() => setIsAddRepositoryModalOpen(false)}
              project={localProjectState}
              meetings={meetings}
              setLocalProjectState={setLocalProjectState}
              fetchRepositories={fetchRepositories}
            />
          )}

          {isSingleChoiceModalOpen && (
            <AddSingleChoicePollModal
              onClose={() => setIsSingleChoiceModalOpen(false)}
              onSave={handleSingleChoiceSave}
              project={project}
              user={user}
            />
          )}

          {isMultipleChoiceModalOpen && (
            <MultipleChoicePollModal
              onClose={() => setIsMultipleChoiceModalOpen(false)}
              onSave={handleSingleChoiceSave}
              project={project}
              user={user}
            />
          )}

          {isMatchingModalOpen && (
            <MatchingPollModal
              onClose={() => setIsMatchingModalOpen(false)}
              onSave={handleSingleChoiceSave}
              project={project}
              user={user}
            />
          )}

          {isRankOrderModalOpen && (
            <RankOrderPollModal
              onClose={() => setIsRankOrderModalOpen(false)}
              onSave={handleSingleChoiceSave}
              project={project}
              user={user}
            />
          )}
          {isShortAnswerModalOpen && (
            <ShortAnswerPollModal
              onClose={() => setIsShortAnswerModalOpen(false)}
              onSave={handleSingleChoiceSave}
              project={project}
              user={user}
            />
          )}

          {isLongAnswerModalOpen && (
            <LongAnswerPollModal
              onClose={() => setIsLongAnswerModalOpen(false)}
              onSave={handleSingleChoiceSave}
              project={project}
              user={user}
            />
          )}

          {isBlankModalOpen && (
            <FillBlankModal
              onClose={() => setIsBlankModalOpen(false)}
              onSave={handleSingleChoiceSave}
              project={project}
              user={user}
            />
          )}

          {isRatingModalOpen && (
            <RatingScaleModal
              onClose={() => setIsRatingModalOpen(false)}
              onSave={handleSingleChoiceSave}
              project={project}
              user={user}
            />
          )}

          {/* <div className="flex justify-end py-3">
            <Pagination
              currentPage={2}
              totalPages={5}
              onPageChange={handlePageChange}
            />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ViewProject;
