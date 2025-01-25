"use client";
import React, { useEffect, useState } from "react";
import ParagraphBlue2 from "../shared/ParagraphBlue2";
import axios from "axios";
import AddMeetingModal from "../projectComponents/meetings/AddMeetingModal";
import EditProjectModal from "../projectComponents/EditProjectModal";
import toast from "react-hot-toast";
import MemberTabAddMember from "../projectComponents/members/MemberTabAddMember";
import MemberBulkUpdate from "../projectComponents/members/MemberBulkUpdate";
import AddPollModal from "../projectComponents/polls/AddPollModal";
import AddRepositoryModal from "../projectComponents/repository/AddRepositoryModal";
import AddSingleChoicePollModal from "../projectComponents/polls/PollModal/AddSingleChoicePollModal";
import MultipleChoicePollModal from "../projectComponents/polls/PollModal/MultipleChoicePollModal";
import MatchingPollModal from "../projectComponents/polls/PollModal/MatchingPollModal";
import RankOrderPollModal from "../projectComponents/polls/PollModal/RankOrderPollModal";
import ShortAnswerPollModal from "../projectComponents/polls/PollModal/ShortAnswerPollModal";
import LongAnswerPollModal from "../projectComponents/polls/PollModal/LongAnswerPollModal";
import FillBlankModal from "../projectComponents/polls/PollModal/FillBlankModal";
import RatingScaleModal from "../projectComponents/polls/PollModal/RatingScaleModal";
import UploadResultsModal from "./UploadResultsModal";
import ViewProjectNavbar from "../projectComponents/viewProject/ViewProjectNavbar";
import ProjectStatusChange from "../projectComponents/viewProject/ProjectStatusChange";
import TabNavigation from "../projectComponents/viewProject/TabNavigation";
import TabContent from "../projectComponents/viewProject/TabContent";
import { useGlobalContext } from "@/context/GlobalContext";
const ViewProject = ({ project, onClose, user, fetchProjects }) => {
  // *Shared State
  const [localProjectState, setLocalProjectState] = useState(project);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Meetings");
  const [secondaryTab, setSecondaryTab] = useState("Documents");

  // *Project details related states
  const [selectedStatus, setSelectedStatus] = useState(
    localProjectState?.status || ""
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // *Meeting realted state
  const [sortField, setSortField] = useState("");
const [sortOrder, setSortOrder] = useState("asc");
  const [meetings, setMeetings] = useState([]);
  const [isAddMeetingModalOpen, setIsAddMeetingModalOpen] = useState(false);
  const [meetingPage, setMeetingPage] = useState(1);
  const [totalMeetingPages, setTotalMeetingPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isBulkAddDropdownOpen, setIsBulkAddDropdownOpen] = useState(false);

  // *Project team related state
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);

  // *Polls related states
  const [polls, setPolls] = useState([]);
  const [isAddPollModalOpen, setIsAddPollModalOpen] = useState(false);
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

  // *Files related state
  const [isAddRepositoryModalOpen, setIsAddRepositoryModalOpen] =
    useState(false);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepositoryMeetingTab, setSelectedRepositoryMeetingTab] =
    useState("All");
  const [showDocAndMediaTab, setShowDocAndMediaTab] = useState("Documents");
  const [selectedDocAndMediaTab, setSelectedDocAndMediaTab] = useState("");
  const [pollPage, setPollPage] = useState(1);
  const [totalPollPages, setTotalPollPages] = useState(1);
  const [allRepoPage, setAllRepoPage] = useState(1);
  const [totalAllRepoPages, setTotalAllRepoPages] = useState(1);
  const [meetingRepoPage, setMeetingRepoPage] = useState(1);
  const [totalMeetingRepoPages, setTotalMeetingRepoPages] = useState(1);
  const [isUploadResultsModalOpen, setIsUploadResultsModalOpen] =
    useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [rejectedData, setRejectedData] = useState([]);
console.log('localProject state', localProjectState)
  // *Shared functions
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  //* Function related to edit project

  const handleEditModal = () => {
    if (user._id !== project.createdBy) {
      toast.error("Your are not allowed to edit this project.");
      return;
    }
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
        toast.error("Failed to update project. Please try again.");
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
        toast.error("Failed to update status. Please try again.");
      }
    } catch (error) {
      // Handle error based on the response or error message
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const { status, data } = error.response;

        if (status === 400) {
          // Handle bad request, possibly due to validation error
          toast.error(`Validation Error: ${data.message}`);
        } else if (status === 404) {
          // Handle project not found error
          toast.error(`Error: Project not found`);
        } else if (status === 500) {
          // Handle internal server error
          toast.error(`Server Error: ${data.message}`);
        } else {
          // Handle any other errors
          toast.error(
            `Error: ${data.message || "An unexpected error occurred"}`
          );
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        toast.error("No response from the server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up the request:", error.message);
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  // * Function related to meetings

  const handleMeetingPageChange = (page) => {
    setMeetingPage(page);
    fetchMeetings(page, searchTerm);
  };

  const fetchMeetings = async (page = 1, searchQuery = "", filters = {}, sortField = "", sortOrder = "") => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-all/meeting/${localProjectState._id}`,
        {
          params: {
            page,
            limit: 10,
            search: searchQuery,
            sortField,
          sortOrder,
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

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
    fetchMeetings(meetingPage, searchTerm, {}, field, order);
  };

  const handleAddMeetingModal = () => {
    if (project.status === "Closed") {
      toast.error(`You cannot add a meeting in closed project`);
      return;
    }
    setIsAddMeetingModalOpen(true);
  };

  const handleMeetingSearch = (term) => {
    setSearchTerm(term);
    setMeetingPage(1);
    fetchMeetings(1, term);
  };

  const handleBulkAddDropdownToggle = () => {
    if (project.status === "Closed") {
      toast.error(`You cannot add a meeting in closed project`);
      return;
    }
    setIsBulkAddDropdownOpen((prev) => !prev);
  };

  const handleDownloadFormat = () => {
    const link = document.createElement("a");
    link.href = "/sample_data.xlsx";
    link.setAttribute("download", "excel-format.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsBulkAddDropdownOpen(false);
  };

  // *Function to handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/bulk-meeting-upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const {
          file: base64File,
          successResults,
          rejectedData,
        } = response.data;

        // Decode Base64 and create a Blob
        const binaryString = atob(base64File); // Decode Base64
        const byteArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          byteArray[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Trigger file download
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute("download", "updated_meeting_data.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setUploadResults(response.data.successResults);
        setRejectedData(response.data.rejectedData);
        setIsUploadResultsModalOpen(true);
        fetchMeetings();
        setIsBulkAddDropdownOpen(false);
        toast.success(response.data.message);
      } catch (error) {
        toast.error("Failed to upload file: " + error.message);
      }
    }
  };

  // *Function to close the upload results modal
  const closeUploadResultsModal = () => {
    setIsUploadResultsModalOpen(false);
  };

  // * Function related to project teams

  const handleModalClose = () => {
    setShowAddContactModal(false);
  };

  const handleBulkUpdateModal = () => {
    setShowBulkUpdateModal(true);
  };

  const closeBulkUpdateModal = () => {
    setShowBulkUpdateModal(false);
  };

  const handleOpenAddContactModal = () => {
    setShowAddContactModal(true);
  };

  // * Function related to polls

  const handleSingleChoiceSave = async (singleChoiceData) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/create/poll`,
        singleChoiceData
      );

      toast.success("Poll created successfully!");
      setIsSingleChoiceModalOpen(false);
      setIsMultipleChoiceModalOpen(false);
      setIsPollDropdownOpen(false);
      fetchPolls();
    } catch (error) {
      toast.error("Failed to create poll: " + error.message);
    }
  };

  const handleOpenPollDropdown = () => {
    setIsPollDropdownOpen((prev) => !prev);
  };

  const handlePollPageChange = (page) => {
    setPollPage(page);
    fetchPolls(page);
  };

  const fetchPolls = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-all/poll/${localProjectState._id}`,
        {
          params: { page, limit: 10 },
        }
      );
      setPolls(response.data.polls);
      setTotalPollPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // * Function related to files

  const fetchRepositoriesByMeetingId = async (meetingId, page = 1) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/upload/get/${meetingId}`,
        {
          params: { page, limit: 10 },
        }
      );

      setRepositories(response.data.media);
      setTotalMeetingRepoPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching repositories by meeting ID:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepositoryMeetingTabChange = (meeting) => {
    setSelectedRepositoryMeetingTab(meeting);
    setSelectedDocAndMediaTab("");
    setShowDocAndMediaTab(true);
    fetchRepositoriesByMeetingId(meeting._id);
  };

  const handleDocAndMediaTabChange = (tab) => {
    setSelectedDocAndMediaTab(tab);
  };

  const handleAllRepoPageChange = (projectId, page) => {
    setAllRepoPage(page);
    fetchRepositories(projectId, page);
  };

  const handleMeetingRepoPageChange = (meetingId, page) => {
    setMeetingPage(page);
    fetchRepositoriesByMeetingId(meetingId, page);
  };

  const fetchRepositories = async (projectId, page = 1) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/upload/get-project/${projectId}`,
        {
          params: { page, limit: 10 },
        }
      );

      setRepositories(response.data.media);
      setTotalAllRepoPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddRepositoryModal = () => {
    setIsAddRepositoryModalOpen(true);
  };

  const closeAddMeetingModal = () => {
    setIsAddMeetingModalOpen(false);
  };

  console.log("meetings", meetings)
  // * use effects
  useEffect(() => {
    fetchMeetings(meetingPage);
    fetchPolls(1);
    fetchRepositories(localProjectState?._id, 1);
  }, [localProjectState, meetingPage]);

  return (
    <div className="my_profile_main_section_shadow bg-[#fafafb] bg-opacity-90 h-full min-h-screen flex flex-col justify-center items-center w-full">
      {/* navbar */}
      <ViewProjectNavbar />
      {/* body */}
      <div className="flex-grow px-6 w-full">
        {/* project status change button */}
        <ProjectStatusChange
          user={user}
          selectedStatus={selectedStatus}
          handleStatusChange={handleStatusChange}
        />
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
            <ParagraphBlue2
              children={new Date(localProjectState?.startDate).toLocaleString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                }
              )}
            />
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
            
            <ParagraphBlue2 children={localProjectState?.status} />
          </div>
          <div className="flex justify-start items-center gap-3 sm:gap-5">
            <p className=" md:text-custom-dark-blue-1 text-base font-semibold sm:text-lg">
            Cumulative Minutes:
            </p>
            
            <ParagraphBlue2 children={localProjectState?.cumulativeMinutes} />
          </div>
          <div className="flex justify-start items-center gap-3 sm:gap-5">
            <p className=" md:text-custom-dark-blue-1 text-base font-semibold sm:text-lg">
              Meeting Link:
            </p>
            <ParagraphBlue2 children={localProjectState?.meetingLink} />
          </div>
        </div>

        {/* participants, observers, breakout rooms and polls div container */}
        <div className="bg-white shadow-[0px_0px_12px_#00000029] rounded-xl p-5 mt-3 mb-10">
          {/* tab navigation */}
          <TabNavigation
            activeTab={activeTab}
            handleTabChange={handleTabChange}
          />

          {/* tab content */}

          <TabContent
            activeTab={activeTab}
            searchHandlers={{
              handleMeetingSearch,
              handleBulkAddDropdownToggle,
              isBulkAddDropdownOpen,
              handleDownloadFormat,
              handleFileUpload,
            }}
            meetingHandlers={{
              handleAddMeetingModal,
              meetings,
              fetchMeetings,
              project,
              meetingPage,
              totalMeetingPages,
              handleMeetingPageChange,
              handleBulkUpdateModal,
              handleSort,
              sortField,
              sortOrder
            }}
            modalStates={{
              setIsSingleChoiceModalOpen,
              setIsMultipleChoiceModalOpen,
              setIsMatchingModalOpen,
              setIsRankOrderModalOpen,
              setIsShortAnswerModalOpen,
              setIsLongAnswerModalOpen,
              setIsBlankModalOpen,
              setIsRatingModalOpen,
              setIsAddPollModalOpen,
            }}
            projectTeam={{
              handleOpenAddContactModal,
            }}
            pollsData={{
              polls,
              setPolls,
              pollPage,
              totalPollPages,
              handlePollPageChange,
              handleOpenPollDropdown,
              isPollDropdownOpen,
              fetchPolls,
            }}
            repositoryData={{
              repositories,
              fetchRepositories,
              allRepoPage,
              totalAllRepoPages,
              meetingRepoPage,
              totalMeetingRepoPages,
              handleAllRepoPageChange,
              handleMeetingRepoPageChange,
              fetchRepositoriesByMeetingId,
            }}
            additionalHandlers={{
              handleOpenAddRepositoryModal,
              selectedRepositoryMeetingTab,
              setSelectedRepositoryMeetingTab,
              setSelectedDocAndMediaTab,
              setShowDocAndMediaTab,
              handleRepositoryMeetingTabChange,
              showDocAndMediaTab,
              handleDocAndMediaTabChange,
              selectedDocAndMediaTab,
            }}
            localProjectStateHandlers={{
              localProjectState,
              setLocalProjectState,
            }}
          />

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
              fetchPolls={fetchPolls}
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

          {isUploadResultsModalOpen && (
            <UploadResultsModal
              onClose={closeUploadResultsModal}
              successResults={uploadResults}
              rejectedData={rejectedData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProject;
