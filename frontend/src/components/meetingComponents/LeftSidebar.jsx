"use client";
import React, { useEffect, useRef, useState } from "react";
import { LuArrowLeftToLine, LuArrowRightToLine } from "react-icons/lu";
import userImage from "../../../public/user.jpg";
import groupChatImage from "../../../public/group-chat.png";
import LeftSidebarOpenUi from "./LeftSidebarOpenUi";
import LeftSidebarCloseUi from "./LeftSidebarCloseUi";
import axios from "axios";

const LeftSidebar = ({
  users,
  setUsers,
  role,
  isWhiteBoardOpen,
  setIsWhiteBoardOpen,
  isRecordingOpen,
  setIsRecordingOpen,
  isBreakoutRoom,
  setIsBreakoutRoom,
  breakoutRooms,
  setBreakoutRooms,
  handleBreakoutRoomChange,
  selectedRoom,
  setSelectedRoom,
  waitingRoom,
  acceptParticipant,
  messages,
  sendMessageParticipant,
  userName,
  meetingId,
  removeParticipant,
  isStreaming,
  setStartStreaming,
  removeFromWaitingRoom,
  admitAllFromWaitingRoom,
  handleBreakoutRoom,
  handleMoveParticipant,
  handleUserRename,
  sendGroupMessage,
  groupMessage,
  handleMediaUpload,
  mediaBox,
  moveParticipantToWaitingRoom,
  enabledBreakoutRoom,
  setting,
  setSetting,
  fetchPolls,
  polls,
  totalPages,
  currentPollPage,
  setCurrentPollPage,
  startRecording, setStartRecording, handleRecording,
  breakoutRoomPopUpOpen,
  setBreakoutRoomPopUpOpen,
  breakoutRoomDetails,
  setBreakoutRoomDetails,
  handleModeratorToggleWhiteboard,
  handleGetPollResults,
  pollData,
  handleMuteAndUnmuteParticipant
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chats");
  const [currentUser, setCurrentUser] = useState(null);
  const [isModerator, setIsModerator] = useState(false);
  const [brealRoomModelOpen, setBreakoutRoomModelOpen] = useState(false);

  const [selectedChat, setSelectedChat] = useState(null);


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSelectedChat(null);
    // setIsSidebarOpen(!isSidebarOpen)
  };

  const chatParticipants = [
    {
      id: 1,
      name: "Group Chat",
      image: groupChatImage,
      messagePreview: "Johnny Silver: Good morning!",
      time: "9:31",
      unreadCount: 4,
      type: "group",
      messages: [
        { sender: "Johnny Silver", content: "Good morning!", time: "9:30 PM" },
        {
          sender: "Rebecca Nitin",
          content: "Always fun to follow up",
          time: "9:31 PM",
        },
        {
          sender: "Raina Smith",
          content: "Always fun to follow up on the question by watching",
          time: "9:31 PM",
        },
      ],
    },
    {
      id: 2,
      name: "Victoria Armstrong",
      image: userImage,
      messagePreview: "Always fun to follow up",
      time: "9:31",
      unreadCount: 1,
      type: "individual",
      messages: [
        {
          sender: "Victoria Armstrong",
          content: "Always fun to follow up",
          time: "9:31 PM",
        },
      ],
    },
    {
      id: 3,
      name: "Raina Smith",
      image: userImage,
      messagePreview: "Always fun to follow up",
      time: "9:31",
      unreadCount: 1,
      type: "individual",
      messages: [
        {
          sender: "Raina Smith",
          content: "Always fun to follow up",
          time: "9:31 PM",
        },
      ],
    },
    {
      id: 4,
      name: "Rebecca Nitin",
      image: userImage,
      messagePreview: "Always fun to follow up",
      time: "9:30",
      unreadCount: 0,
      type: "individual",
      messages: [
        {
          sender: "Rebecca Nitin",
          content: "Always fun to follow up",
          time: "9:31 PM",
        },
        { sender: "Johnny Silver", content: "Good morning!", time: "9:30 PM" },
      ],
    },
  ];

  const toggleModal = (event, user) => {
    const { top, left } = event.currentTarget.getBoundingClientRect();
    setModalPosition({ top, left });
    setCurrentUser(user);
    setIsModalOpen(!isModalOpen);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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

  const toggleWhiteBoard = () => {
    setIsWhiteBoardOpen(!isWhiteBoardOpen);
  };

  const toggleRecordingButton = () => {
    setIsRecordingOpen(!isRecordingOpen);
  };

  return (
    <div>
      <div
        className={`flex ${isSidebarOpen ? "w-80" : "w-8 bg-custom-meet-bg md:bg-white md:w-24"
          } transition-width duration-300 md:bg-white h-screen md:rounded-r-xl overflow-auto`}
      >
        {isSidebarOpen ? (
          <>
            <LuArrowLeftToLine
              className="absolute top-4 left-2 text-black text-sm cursor-pointer bg-white h-6 w-6 p-1 mr-6 rounded-full md:hidden"
              onClick={toggleSidebar}
            />
            <LuArrowLeftToLine
              className="absolute top-4 left-2 text-black text-sm cursor-pointer h-6 w-6 p-1 "
              onClick={toggleSidebar}
            />
          </>
        ) : (
          <>
            <LuArrowRightToLine
              className="absolute top-4 left-2 text-black text-sm cursor-pointer bg-white h-6 w-6 p-1 mr-6 rounded-full md:hidden "
              onClick={toggleSidebar}
            />
            <LuArrowRightToLine
              className="absolute top-4 left-2 text-black text-sm cursor-pointer h-6 w-6 p-1"
              onClick={toggleSidebar}
            />
          </>
        )}

        <div className="flex flex-col w-full ">
          {/*  */}
          {isSidebarOpen ? (
            // If side bar open
            <LeftSidebarOpenUi
              users={users}
              setUsers={setUsers}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              handleTabClick={handleTabClick}
              role={role}
              toggleWhiteBoard={toggleWhiteBoard}
              toggleRecordingButton={toggleRecordingButton}
              isBreakoutRoom={isBreakoutRoom}
              setIsBreakoutRoom={setIsBreakoutRoom}
              breakoutRooms={breakoutRooms}
              setBreakoutRooms={setBreakoutRooms}
              handleBreakoutRoomChange={handleBreakoutRoomChange}
              selectedRoom={selectedRoom}
              setSelectedRoom={setSelectedRoom}
              waitingRoom={waitingRoom}
              acceptParticipant={acceptParticipant}
              messages={messages}
              sendMessageParticipant={sendMessageParticipant}
              userName={userName}
              meetingId={meetingId}
              removeParticipant={removeParticipant}
              isStreaming={isStreaming}
              setStartStreaming={setStartStreaming}
              setIsWhiteBoardOpen={setIsWhiteBoardOpen}
              removeFromWaitingRoom={removeFromWaitingRoom}
              admitAllFromWaitingRoom={admitAllFromWaitingRoom}
              handleBreakoutRoom={handleBreakoutRoom}
              brealRoomModelOpen={brealRoomModelOpen}
              setBreakoutRoomModelOpen={setBreakoutRoomModelOpen}
              handleMoveParticipant={handleMoveParticipant}
              handleUserRename={handleUserRename}
              sendGroupMessage={sendGroupMessage}
              groupMessage={groupMessage}
              handleMediaUpload={handleMediaUpload}
              mediaBox={mediaBox}
              moveParticipantToWaitingRoom={moveParticipantToWaitingRoom}
              enabledBreakoutRoom={enabledBreakoutRoom}
              isWhiteBoardOpen={isWhiteBoardOpen}
              setting={setting} setSetting={setSetting}
              fetchPolls={fetchPolls}
              polls={polls}
              totalPages={totalPages}
              currentPollPage={currentPollPage} setCurrentPollPage={setCurrentPollPage}
              startRecording={startRecording} setStartRecording={setStartRecording}
              handleRecording={handleRecording}
              breakoutRoomPopUpOpen={breakoutRoomPopUpOpen}
              setBreakoutRoomPopUpOpen={setBreakoutRoomPopUpOpen}
              breakoutRoomDetails={breakoutRoomDetails}
              setBreakoutRoomDetails={setBreakoutRoomDetails}
              handleModeratorToggleWhiteboard={handleModeratorToggleWhiteboard}
              handleGetPollResults={handleGetPollResults}
              pollData={pollData}
              handleMuteAndUnmuteParticipant={handleMuteAndUnmuteParticipant}
            />
          ) : (
            <LeftSidebarCloseUi
              users={users}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              handleTabClick={handleTabClick}
              chatParticipants={chatParticipants}
              role={role}
              toggleWhiteBoard={toggleWhiteBoard}
              toggleRecordingButton={toggleRecordingButton}
              isBreakoutRoom={isBreakoutRoom}
              setIsBreakoutRoom={setIsBreakoutRoom}
              breakoutRooms={breakoutRooms}
              setBreakoutRooms={setBreakoutRooms}
              handleBreakoutRoomChange={handleBreakoutRoomChange}
              selectedRoom={selectedRoom}
              setSelectedRoom={setSelectedRoom}
              setIsSidebarOpen={setIsSidebarOpen}
              sendGroupMessage={sendGroupMessage}
              groupMessage={groupMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
