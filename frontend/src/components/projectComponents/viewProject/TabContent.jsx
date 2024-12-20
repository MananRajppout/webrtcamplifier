import Search from "@/components/singleComponent/Search";
import React from "react";
import { FaCheckSquare, FaStarHalfAlt } from "react-icons/fa";
import { HiMiniBars2, HiMiniBars4 } from "react-icons/hi2";
import { IoRemoveOutline } from "react-icons/io5";
import { MdBarChart, MdOutlineRadioButtonChecked } from "react-icons/md";
import { TbArrowsShuffle } from "react-icons/tb";
import PollsTab from "../polls/PollsTab";
import HeadingLg from "@/components/shared/HeadingLg";
import RepositoryTab from "../repository/RepositoryTab";
import Button from "@/components/shared/button";
import MeetingTab from "../meetings/MeetingTab";
import MembersTab from "../members/MembersTab";

const TabContent = ({
  activeTab,
  searchHandlers,
  meetingHandlers,
  modalStates,
  projectTeam,
  pollsData,
  repositoryData,
  additionalHandlers,
  localProjectStateHandlers,
}) => {
  const {
    handleMeetingSearch,
    handleBulkAddDropdownToggle,
    isBulkAddDropdownOpen,
    handleDownloadFormat,
    handleFileUpload,
  } = searchHandlers;
  const {
    handleAddMeetingModal,
    meetings,
    fetchMeetings,
    project,
    meetingPage,
    totalMeetingPages,
    handleMeetingPageChange,
    handleBulkUpdateModal,
  } = meetingHandlers;

  const {
    setIsSingleChoiceModalOpen,
    setIsMultipleChoiceModalOpen,
    setIsMatchingModalOpen,
    setIsRankOrderModalOpen,
    setIsShortAnswerModalOpen,
    setIsLongAnswerModalOpen,
    setIsBlankModalOpen,
    setIsRatingModalOpen,
  } = modalStates;

  const { handleOpenAddContactModal } = projectTeam;

  const {
    polls,
    setPolls,
    pollPage,
    totalPollPages,
    handlePollPageChange,
    handleOpenPollDropdown,
    isPollDropdownOpen,
  } = pollsData;

  const {
    repositories,
    fetchRepositories,
    allRepoPage,
    totalAllRepoPages,
    meetingRepoPage,
    totalMeetingRepoPages,
    handleAllRepoPageChange,
    handleMeetingRepoPageChange,
    fetchRepositoriesByMeetingId,
  } = repositoryData;

  const {
    handleOpenAddRepositoryModal,
    selectedRepositoryMeetingTab,
    setSelectedRepositoryMeetingTab,
    setSelectedDocAndMediaTab,
    setShowDocAndMediaTab,
    handleRepositoryMeetingTabChange,
    showDocAndMediaTab,
    handleDocAndMediaTabChange,
    selectedDocAndMediaTab,
  } = additionalHandlers;

  const { localProjectState, setLocalProjectState } = localProjectStateHandlers;

  return (
    <div>
      {activeTab === "Meetings" && (
        <div className="pt-5">
          <div className="flex justify-between items-center">
            <HeadingLg children="Meetings" />
            {/* !Search button */}
            <Search
              onSearch={handleMeetingSearch}
              placeholder="Search Meeting Name"
            />
            <div className="relative">
              <Button
                children="Bulk Add"
                className="px-4 py-2 rounded-xl"
                onClick={handleBulkAddDropdownToggle}
              />
              {isBulkAddDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg">
                  <button
                    className="block px-4 py-2 text-left"
                    onClick={handleDownloadFormat}
                  >
                    Download Format
                  </button>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="block px-4 py-2 text-left"
                  />
                </div>
              )}
            </div>

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
                  <div
                    className="flex items-center p-2 cursor-pointer"
                    onClick={() => setIsLongAnswerModalOpen(true)}
                  >
                    <HiMiniBars4 />
                    <span className="ml-2">Long answer</span>
                  </div>
                  <div
                    className="flex items-center p-2 cursor-pointer"
                    onClick={() => setIsBlankModalOpen(true)}
                  >
                    <IoRemoveOutline />
                    <span className="ml-2">Fill in the blank</span>
                  </div>
                  <div
                    className="flex items-center p-2 cursor-pointer"
                    onClick={() => setIsRatingModalOpen(true)}
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
              allRepoPage={allRepoPage}
              totalAllRepoPages={totalAllRepoPages}
              meetingRepoPage={meetingRepoPage}
              totalMeetingRepoPages={totalMeetingRepoPages}
              handleAllRepoPageChange={handleAllRepoPageChange}
              handleMeetingRepoPageChange={handleMeetingRepoPageChange}
              fetchRepositoriesByMeetingId={fetchRepositoriesByMeetingId}
              projectStaus={project?.status}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TabContent;
