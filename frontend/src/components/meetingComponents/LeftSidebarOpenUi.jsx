import React, { useCallback, useEffect, useRef, useState } from "react";
import { LuClipboardSignature } from "react-icons/lu";
import { FaAngleDown, FaFolder, FaTrash, FaVideo } from "react-icons/fa";
import {
  BsChatSquareDotsFill,
  BsChatSquareFill,
  BsThreeDotsVertical,
} from "react-icons/bs";
import HeadingLg from "../shared/HeadingLg";
import Search from "../singleComponent/Search";
import { IoIosDocument, IoMdMic, IoMdMicOff } from "react-icons/io";
import { IoClose, IoRemoveCircle, IoSend } from "react-icons/io5";
import { MdInsertEmoticon, MdMoveDown } from "react-icons/md";
import RemoveUserModal from "../singleComponent/RemoveUserModal";
import MoveToWaitingRoomModal from "../singleComponent/MoveToWaitingRoomModal";
import notify from "@/utils/notify";
import { PiCirclesFourFill, PiPlusCircle } from "react-icons/pi";
import Button from "../shared/button";
import BreakoutRoomModal from "../singleComponent/BreakoutRoomModal";
import { useParams, useSearchParams } from "next/navigation";
import { GoMoveToEnd } from "react-icons/go";
import MoveToBreakModal from "../singleComponent/MoveToBreakModal";
import { BiEditAlt, BiMicrophone, BiMicrophoneOff } from "react-icons/bi";
import UserRename from "../singleComponent/UserRenameModal";
import ScrollToBottom from "react-scroll-to-bottom";
import { bytesToMbs } from "./RightSidebarOpenUi";
import ViewPollModel from "../singleComponent/ViewPollModel";
import BreakoutRoomMoveModel from "../singleComponent/BreakoutRoomMoveModel";

const LeftSidebarOpenUi = ({
  users,
  setUsers,
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  selectedChat,
  setSelectedChat,
  handleTabClick,
  role,
  toggleWhiteBoard,
  toggleRecordingButton,
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
  setIsWhiteBoardOpen,
  removeFromWaitingRoom,
  admitAllFromWaitingRoom,
  handleBreakoutRoom,
  brealRoomModelOpen,
  setBreakoutRoomModelOpen,
  handleMoveParticipant,
  handleUserRename,
  sendGroupMessage,
  groupMessage,
  handleMediaUpload,
  mediaBox,
  moveParticipantToWaitingRoom,
  enabledBreakoutRoom,
  isWhiteBoardOpen,
  setting,
  setSetting,
  fetchPolls,
  polls,
  totalPages,
  currentPollPage,
  setCurrentPollPage,
  startRecording,
  setStartRecording,
  handleRecording,
  breakoutRoomPopUpOpen,
  setBreakoutRoomPopUpOpen,
  breakoutRoomDetails,
  setBreakoutRoomDetails,
  handleModeratorToggleWhiteboard,
  handleGetPollResults,
  pollData,
  handleMuteAndUnmuteParticipant
}) => {
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isModeratorPopupModalOpen, setIsModeratorPopupModalOpen] =
    useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [userToMove, setUserToMove] = useState(null);
  const [userToMoveBreak, setUserToMoveBreak] = useState(null);
  const [userToRename, setUserToRename] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [inputMessage, setInputMessage] = useState("");
  const [openMoveToBreakModelOpen, setMoveToOpenBreakModelOpen] =
    useState(false);
  const [openMoveToRenameOpen, setMoveToOpenRenameOpen] = useState(false);
  const [groupMessageContent, setGroupMessageContent] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUDot, setUShowDot] = useState(false);
  const [showCDot, setCShowDot] = useState(false);
  const [suggestion, setSuggestion] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [unreadMessage, setUnreadMessage] = useState(0);
  const [unreadMessageParticipant, setUnreadMessageParticipant] = useState(0);
  const previosMCountRef = useRef(messages.length);
  const previosCCountRef = useRef(groupMessage.length);
  const previosGroupCountRef = useRef(groupMessage.length);
  const [participantsMicMuted, setParticipantsMicMuted] = useState({});
  const [isAllParticipantMuted, setIsAllParticipantMuted] = useState({});
  const [isPollModelOpen, setIsPollModelOpen] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState(null);


  console.log(participantsMicMuted,"participantsMicMuted")


  const handlePollResultClick = (pollId, meetingId) => {
    setSelectedPollId(pollId);
    handleGetPollResults(pollId, meetingId); 
  };

  

  const handlePollPageChange = useCallback((page) => {
    setCurrentPollPage(page);
    fetchPolls(page);
  }, []);

  //group chats
  useEffect(() => {
    if (activeTab != "chats") {
      setUnreadMessage((prev) => prev + 1);
    }
    if (previosCCountRef.current < groupMessage?.length) {
      previosCCountRef.current = groupMessage?.length;
      if (activeTab != "chats") {
        setCShowDot(true);
      }
    }
  }, [groupMessage, activeTab]);

  //user messages
  useEffect(() => {
    if (activeTab != "participants") {
      setUnreadMessageParticipant((prev) => prev + 1);
    }
    if (previosMCountRef.current < messages?.length) {
      previosMCountRef.current = messages?.length;
      if (activeTab != "participants") {
        setUShowDot(true);
      }
    }
  }, [messages, activeTab]);

  const myEmailRef = useRef(null);
  const params = useParams();
  const searchParams = useSearchParams();
  const userrole = searchParams.get("role");
  const fullName = searchParams.get("fullName");
  const roomname = searchParams.get("roomname") || "main";
  const ModeratorType = searchParams.get("ModeratorType");
  const id = params.id;
  // this for handling the message input
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        meetingId: meetingId,
        senderName: userName,
        receiverName: selectedChat.name,
        senderEmail: myEmailRef.current,
        receiverEmail: selectedChat.email || "unkown@gmail.com",
        message: inputMessage.trim(),
      };

      sendMessageParticipant(newMessage);
      setInputMessage("");
    }
  };

  useEffect(() => {
    if (typeof window != "undefined") {
      const email = window.localStorage.getItem("email");
      myEmailRef.current = email;
    }
  }, []);

  const modalRef = useRef();

  const handleSearch = () => {
    // Write search functionality here
  };
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);

  const toggleRemoveAndWaitingOptionModal = (event, user) => {
    const { top, left } = event.currentTarget.getBoundingClientRect();
    setModalPosition({ top, left });
    setCurrentUser(user);
    setUserToRemove(user);
    setIsModeratorPopupModalOpen(!isModeratorPopupModalOpen);
  };

  const openRemoveUserModal = (event, user) => {
    setUserToRemove(user);
    setIsRemoveModalOpen(true);
  };
  const closeRemoveUserModal = () => {
    setIsRemoveModalOpen(false);
  };

  const openMoveUserModal = (event, user) => {
    setUserToMove(user);
    setIsMoveModalOpen(true);
  };

  const openUserMoveToBreakModal = (event, user) => {
    setUserToMoveBreak(user);
    setMoveToOpenBreakModelOpen(true);
  };

  const openUserRenameModal = (event, user) => {
    setUserToRename(user);
    setMoveToOpenRenameOpen(true);
  };

  const closeMoveUserModal = () => {
    setIsMoveModalOpen(false);
  };

  const closeModal = () => {
    setIsModeratorPopupModalOpen(false);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    if (isModeratorPopupModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModeratorPopupModalOpen]);

  const handleRemoveUser = (userId) => {
    const userName = users?.find((user) => user._id === userId);
    removeParticipant(userName.name, userName.role, userName.email, meetingId);
    notify("success", "Success", `${userName.name} has been removed`);

    // setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    setIsRemoveModalOpen(false);
  };

  const handleMoveUser = (userId) => {
    const userName = users?.find((user) => user.id === userId);
    moveParticipantToWaitingRoom(
      userName.name,
      userName.role,
      userName.email,
      meetingId
    );
    notify(
      "success",
      "Success",
      `${userName.name} has been moved to the waiting room`
    );
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    setIsMoveModalOpen(false);
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelect = (option) => {
    handleBreakoutRoomChange(option.roomName);
    setSelectedRoom(option);
    setIsDropdownOpen(false);
  };

  const filteredMessages = messages.filter(
    (message) =>
      (message.senderName === selectedChat?.name &&
        message.receiverName === userName) ||
      (message.senderName === userName &&
        message.receiverName === selectedChat?.name)
  );

  const handleRoomSwitch = useCallback(
    (roomName) => {
      let url;
      if (roomName.toLowerCase() == "main") {
        url = `/meeting/${id}?fullName=${fullName}&role=${userrole}`;
      } else {
        url = `/meeting/${id}?fullName=${fullName}&role=${userrole}&type=breackout&roomname=${roomName}`;
      }
      window.open(url, "_self");
    },
    [fullName, userrole, id]
  );

  const handleGroupMessage = useCallback(() => {
    if (!groupMessageContent) return;
    sendGroupMessage(groupMessageContent);
    setGroupMessageContent("");
  }, [groupMessageContent]);

  const handleGroupChatMessageChange = useCallback(
    (e) => {
      const value = e.target.value;
      setGroupMessageContent(value);

      const atIndex = value.lastIndexOf("@");
      if (atIndex !== -1) {
        const query = value.substring(atIndex + 1).toLowerCase();
        const filterUser = users.map((p) => {
          if (p.role == "Moderator") {
            p.name = "Moderator";
          }

          return p;
        });
        let filteredSuggestions = filterUser.filter((p) =>
          p.name.toLowerCase().startsWith(query)
        );

        setSuggestions(filteredSuggestions);
      } else {
        setSuggestions([]);
      }
    },
    [users]
  );

  const handleSuggestionClick = useCallback((name) => {
    const atIndex = groupMessageContent.lastIndexOf("@");
    const newInput =
      groupMessageContent.substring(0, atIndex + 1) +
      name +
      " " +
      groupMessageContent.substring(atIndex);
    setGroupMessageContent(`@${newInput}`);
    setSuggestions([]);
  }, []);

  const handleMicMuteUnmute = useCallback((type, email) => {
    const audioElement = document.getElementById(email);
    console.log(audioElement,type)
    if (type == "mute") {
      setParticipantsMicMuted((prev) => ({ ...prev, [email]: 0 }));
      if (audioElement) {
        audioElement.volume = 0;
      }
    } else {
      setParticipantsMicMuted((prev) => ({ ...prev, [email]: 1 }));
      if (audioElement) {
        audioElement.volume = 1;
      }
    }
  }, []);

  const handleChangeVoulme = useCallback((email,volume) => {
    const audioElement = document.getElementById(email);
    audioElement.volume = volume;
    setParticipantsMicMuted((prev) => ({ ...prev, [email]: volume }));
  },[]);



  useEffect(() => {
    const mutedParticipantLength = Object.values(participantsMicMuted).filter(
      (value) => value === 0
    ).length;

    const userLength = users
      ?.filter((user) => {
        if (role === "Moderator") {
          // Show all users except the current moderator
          return user.name !== userName;
        } else if (role === "Participant") {
          // Show only moderators to participants
          return user.role === "Moderator";
        } else if (role === "Observer") {
          // Exclude observers
          return user.role !== "Observer";
        }
        return false;
      })
      .filter((user) =>
        role === "Moderator"
          ? true
          : user.roomName?.toLowerCase() === roomname.toLowerCase() ||
            user.role === "Moderator"
      )
      .filter(
        (user) => user.status !== "removed" && user.status !== "offline"
      ).length;

    // Check if all participants are muted
    if (mutedParticipantLength === userLength) {
      setIsAllParticipantMuted(true);
    } else {
      setIsAllParticipantMuted(false);
    }
  }, [
    participantsMicMuted,
    users,
    role,
    userName,
    roomname,
    setIsAllParticipantMuted,
  ]);

  const handleMuteAll = useCallback(
    (type) => {
      users
        ?.filter((user) => {
          if (role === "Moderator") {
            // Show all users for the moderator
            return user.name !== userName;
          } else if (role === "Participant") {
            // Show only moderators to participants
            return user.role === "Moderator";
          } else if (role === "Observer") {
            return user.role !== "Observer";
          }
        })
        .filter((user) =>
          role === "Moderator"
            ? true
            : user.roomName?.toLowerCase() == roomname.toLowerCase() ||
              user.role == "Moderator"
        )
        .filter(
          (user) => user.status !== "removed" && user.status !== "offline"
        )
        .map((user) => handleMicMuteUnmute(type, user.email));
    },
    [users, role, userName]
  );

  const handleJoinParticipantsJoinBreakoutRoom = useCallback(
    (roomName) => {
      let url = "";
      if (roomName?.toLowerCase() == "main") {
        url = `/meeting/${id}?fullName=${fullName}&role=${userrole}`;
      } else {
        url = `/meeting/${id}?fullName=${fullName}&role=${userrole}&type=breackout&roomname=${roomName}`;
      }

    if(typeof window !== 'undefined'){
      window.open(url, "_self");
    }
  }, [id,userrole,fullName]);



  const handleWhiteBoardOpen = useCallback(() => {
    setIsWhiteBoardOpen((prev) => !prev);

    if(role == "Moderator"){
      handleModeratorToggleWhiteboard(!isWhiteBoardOpen);
    }
  },[role,isWhiteBoardOpen]);




  const handleMuteCurrentUser = useCallback((currentUser,value) => {
    setUsers(prev => {
      const users = JSON.parse(JSON.stringify(prev));
      const indexOf = users.findIndex(user => user.email == currentUser.email);
      
      if(indexOf != -1){
        users[indexOf].mute=value;
        return users;
      }

      return prev;
    });

    setCurrentUser(prev => ({...prev,mute: value}));
    handleMuteAndUnmuteParticipant(value,currentUser.email);
  },[users]);

  return (
    <>
      <div className=" md:pt-0 pt-16">
        {/* break rooms  */}
        {role === "Moderator" && breakoutRooms?.length > 1 && (
          <div className=" flex-col flex-grow px-4 pb-2 pt-4 bg-custom-gray-8 mb-4 rounded-xl overflow-y-auto mx-4 mt-16 hidden md:flex">
            {/* top heading */}

            <div className="flex items-center justify-between">
              <div className="flex justify-start items-center gap-1">
                <PiCirclesFourFill className="text-custom-orange-1 text-xs" />
                <h1 className="text-xs font-bold">{selectedRoom}</h1>
              </div>
              <div className="flex justify-end items-center gap-1">
                <PiCirclesFourFill className="text-custom-orange-1 text-xs" />
                <h1 className="text-xs font-bold">
                  {users.filter(
                    (u) =>
                      u.roomName?.toLowerCase() == selectedRoom.toLowerCase() &&
                      u.status == "online"
                  )?.length || 0}
                </h1>
                <Button
                  variant="plain"
                  onClick={() => setBreakoutRoomModelOpen(true)}
                >
                  <PiPlusCircle />
                </Button>
              </div>
            </div>

            {/* Dropdown */}
            <div className={`relative w-full py-5`}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`px-4 py-1 sm:py-2 rounded-xl flex items-center justify-between  text-white bg-[#2976a5] font-semibold w-full`}
              >
                {selectedRoom}
                <FaAngleDown
                  className={`ml-2 transform transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {isDropdownOpen && (
                <ul
                  className={`absolute left-0 text-xs bg-white rounded-lg shadow-[0px_3px_6px_#00000029] text-custom-dark-blue-1 font-semibold w-full`}
                >
                  {breakoutRooms.map((name) => (
                    <li
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      index={name}
                      onClick={() => handleRoomSwitch(name)}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Whiteboard and local recording */}
        <div className=" lg:pt-10 px-4">
          {role === "Moderator" && enabledBreakoutRoom && (
            <Button
              children={"Create Breakout Room"}
              variant="meeting"
              type="submit"
              className="w-full py-2 rounded-xl !justify-start pl-2 mb-2"
              onClick={() => setBreakoutRoomModelOpen(true)}
            />
          )}

          {role === "Moderator" && (
            <Button
              children={startRecording ? "Stop Recording" : "Start Recording"}
              variant="meeting"
              type="submit"
              className="w-full py-2 rounded-xl !justify-start pl-2 mb-2"
              onClick={handleRecording}
            />
          )}

          {(role == "Moderator" ||
            role == "Observer" ||
            setting.allowWhiteBoard) && (
            <Button
              children={isWhiteBoardOpen ? "Meeting" : "Whiteboard"}
              variant="meeting"
              type="submit"
              className="w-full py-2 rounded-xl !justify-start pl-2 mb-2"
              onClick={handleWhiteBoardOpen}
            />
          )}

          {role === "Moderator" && (
            <Button
              children={isStreaming ? "Stop Streaming" : "Start Streaming"}
              variant="meeting"
              type="submit"
              className="w-full py-2 rounded-xl !justify-start pl-2 mb-2"
              onClick={() => setStartStreaming(meetingId)}
            />
          )}

          {role == "Moderator" && (
            <Button
              children={"View Polls"}
              variant="meeting"
              type="submit"
              className="w-full py-2 rounded-xl !justify-start pl-2 mb-2"
              onClick={() => setIsPollModelOpen(true)}
            />
          )}

          {pollData && role === "Moderator" && (
            <Button
              children={`View Result`}
              variant="meeting"
              type="submit"
              className="w-full py-2 rounded-xl !justify-start pl-2 mb-2"
              onClick={() => handlePollResultClick(pollData.pollId, meetingId)}
            />
          )}

          {role == "Participant" && breakoutRoomDetails && (
            <Button
              children={`Join Breakout`}
              variant="meeting"
              type="submit"
              className="w-full py-2 rounded-xl !justify-start pl-2 mb-2"
              onClick={() =>
                handleJoinParticipantsJoinBreakoutRoom(
                  breakoutRoomDetails?.name
                )
              }
            />
          )}
        </div>

        {/* Backroom chat and icon */}
        <div className="flex justify-start items-center gap-2 lg:py-4 mx-4 pt-10 sm:pt-20">
          <BsChatSquareFill className="text-custom-dark-blue-1" />
          <HeadingLg children="MEETING CHAT" />
        </div>

        {/* chat container */}
        <div className="flex flex-col flex-grow px-4 pb-2 pt-4 bg-custom-gray-8 mb-4 rounded-xl overflow-y-auto max-h-[300px] mx-4">
          <div className="flex justify-center items-center gap-2 pb-2 ">
            <div className="w-full relative">
              <Button
                children="Chats"
                variant="default"
                type="submit"
                className={`w-full py-2 rounded-xl pl-2  text-[10px] text-center px-1  ${
                  activeTab === "chats"
                    ? "shadow-[0px_4px_6px_#1E656D4D]"
                    : "bg-custom-gray-8 border-2  border-custom-teal !text-custom-teal "
                }  `}
                onClick={() => {
                  handleTabClick("chats");
                  setCShowDot(false);
                  setUnreadMessage(0);
                }}
              />
              {showCDot && (
                <div className="absolute -top-1 -right-1 w-4 h-4 text-xs grid text-center text-white rounded-full  bg-[#ff2b2b] shadow-[0px_1px_3px_#00000036]">
                  {unreadMessage < 10 ? unreadMessage : "9+"}
                </div>
              )}
            </div>
            <div className="w-full relative">
              <Button
                children="Participants"
                variant="default"
                type="submit"
                className={`w-full py-2 rounded-xl pl-2  text-[10px] text-center px-1  ${
                  activeTab === "participants"
                    ? "shadow-[0px_4px_6px_#1E656D4D]"
                    : "bg-custom-gray-8 border-2  border-custom-teal !text-custom-teal "
                }  `}
                onClick={() => {
                  handleTabClick("participants");
                  setUShowDot(false);
                  setUnreadMessageParticipant(0);
                }}
              />
              
            </div>
          </div>

          {/* participants container */}

          {/* participants list */}
          {activeTab === "chats" && (
            <div className="flex-grow pt-2">
              <div className="flex-grow pt-2  rounded-xl flex flex-col justify-center items-center relative">
                {/* chat message */}
                <ScrollToBottom className="flex flex-col gap-2 flex-grow h-[10rem] overflow-y-auto w-full mb-5">
                  {groupMessage &&
                    groupMessage.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 mb-3 ${
                          message.senderEmail === myEmailRef.current
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex flex-col ${
                            message.senderEmail === myEmailRef.current
                              ? "items-end"
                              : "items-start"
                          }`}
                        >
                          <p
                            className={`text-[12px] ${
                              message.senderEmail === myEmailRef.current
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          >
                            <span className="font-bold">{message.name}:</span>{" "}
                            {message.content?.split(" ").map((text) => (
                              <>
                                {text.startsWith("@") ? (
                                  <span className="text-red-500">{text} </span>
                                ) : (
                                  <span>{text} </span>
                                )}
                              </>
                            ))}
                          </p>
                          <p className="text-[#1a1a1a] text-[10px]">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </ScrollToBottom>
                {/* send message */}
                {role !== "Observer" && (
                  <div className="flex justify-between items-center gap-2 relative">
                    <input
                      type="text"
                      placeholder={`Type Message ${groupMessage.length}`}
                      className="rounded-lg py-1 px-2 placeholder:text-[10px]"
                      value={groupMessageContent}
                      onChange={handleGroupChatMessageChange}
                      // onKeyPress={(e) => e.key === "Enter" && handleGroupMessage()}
                    />

                    {suggestions.length > 0 && (
                      <div className="sugesstions absolute -top-[11rem] left-0 h-[10rem] w-[12rem] bg-white z-50 rounded-md p-2 overflow-y-auto">
                        <ul className="suggestions space-y-2">
                          {suggestions.map((s) => (
                            <li
                              key={s.email}
                              onClick={() => handleSuggestionClick(s.name)}
                              className="cursor-pointer text-red-500"
                            >
                              @{s.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="absolute right-11 cursor-pointer">
                      <MdInsertEmoticon />
                    </div>
                    <div
                      className="py-1.5 px-1.5 bg-custom-orange-2 rounded-[50%] text-white cursor-pointer text-sm"
                      onClick={handleGroupMessage}
                    >
                      <IoSend />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {isModeratorPopupModalOpen && currentUser && (
            <div
              ref={modalRef}
              className="absolute bg-white shadow-[0px_3px_6px_#0000004A] rounded-lg w-44 z-50"
              style={{
                top: modalPosition.top + 20,
                left: modalPosition.left - 30,
              }}
            >
              <ul className="text-[12px]">
                <li
                  className="py-2 px-2 hover:bg-gray-200 cursor-pointer text-[#697e89] flex justify-start items-center gap-2"
                  onClick={(e) => openRemoveUserModal(e, userToRemove)}
                >
                  <IoRemoveCircle />
                  <span>Remove</span>
                </li>
                <li
                  className="py-2 px-2 hover:bg-gray-200 cursor-pointer text-[#697e89] flex justify-start items-center gap-2"
                  onClick={(e) => openMoveUserModal(e, currentUser)}
                >
                  <MdMoveDown />
                  <span>Move to Waiting Room</span>
                </li>

                <li
                  className="py-2 px-2 hover:bg-gray-200 cursor-pointer text-[#697e89] flex justify-start items-center gap-2 relative"
                  onClick={(e) => openUserMoveToBreakModal(e, currentUser)}
                >
                  <GoMoveToEnd />
                  <span>Move to</span>
                </li>

                <li
                  className="py-2 px-2 hover:bg-gray-200 cursor-pointer text-[#697e89] flex justify-start items-center gap-2 relative"
                  onClick={(e) => openUserRenameModal(e, currentUser)}
                >
                  <BiEditAlt />
                  <span>Rename</span>
                </li>

                <li
                  className="py-2 px-2 hover:bg-gray-200 cursor-pointer text-[#697e89] flex justify-start items-center gap-2 relative"
                  onClick={(e) =>  handleMuteCurrentUser(currentUser,!currentUser.mute)}
                >
                  {currentUser.mute == true ? <BiMicrophoneOff /> : <BiMicrophone/>}
                  {currentUser.mute == true ? <span>Unmute</span> : <span>Mute</span>}
                  
                  
                </li>
              </ul>
            </div>
          )}

          {activeTab === "participants" && !selectedChat && (
            <div className="flex items-center justify-end">
              {isAllParticipantMuted ? (
                <button
                  className="text-blue-500"
                  onClick={() => handleMuteAll("unmute")}
                >
                  unmute all
                </button>
              ) : (
                <button
                  className="text-blue-500"
                  onClick={() => handleMuteAll("mute")}
                >
                  mute all
                </button>
              )}
            </div>
          )}

          {/* Participant chat */}
          {activeTab === "participants" &&
            !selectedChat &&
            users
              ?.filter((user) => {
                if (role === "Moderator") {
                  // Show all users for the moderator
                  return user.name !== userName;
                } else if (role === "Participant") {
                  // Show only moderators to participants
                  return user.role === "Moderator";
                } else if (role === "Observer") {
                  return user.role !== "Observer";
                }
              })
              //only show the users who are in the same room
              .filter((user) =>
                role === "Moderator"
                  ? true
                  : user.roomName?.toLowerCase() == roomname.toLowerCase() ||
                    user.role == "Moderator"
              )
              //filter out the removed and offline users
              .filter(
                (user) => user.status !== "removed" && user.status !== "offline"
              )
              .map((user) => (
                <div
                  key={user.name}
                  className=" p-2 flex justify-between items-center gap-2 cursor-pointer my-2"
                >
                  <div className="flex-grow-1 text-xs ">
                    <p className="pb-1 font-bold">{user.name}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {(role == "Observer" || role == "Moderator") && (
                      <>
                        {participantsMicMuted[user.email] == 0  ? (
                          <button
                            onClick={() =>
                              handleMicMuteUnmute("unmute", user.email)
                            }
                            className="cursor-pointer"
                          >
                            <IoMdMicOff size={20} />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleMicMuteUnmute("mute", user.email)
                            }
                            className="cursor-pointer"
                          >
                            <IoMdMic size={20} />
                          </button>
                        )}
                        <input className="w-[4rem]" type="range" defaultValue={1} value={participantsMicMuted[user.email]} min="0" max="1" step="0.01" onChange={(e) => handleChangeVoulme(user.email,e.target.value)}/>
                      </>
                    )}

                    {role !== "Observer" && (
                      <button
                        onClick={() => setSelectedChat(user)}
                        className="cursor-pointer"
                      >
                        <BsChatSquareDotsFill />
                      </button>
                    )}

                    {role === "Moderator" && (
                      <button
                        onClick={(event) =>
                          toggleRemoveAndWaitingOptionModal(event, user)
                        }
                      >
                        <BsThreeDotsVertical className="cursor-pointer" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

          {activeTab === "participants" &&
            !selectedChat &&
            waitingRoom.length > 0 &&
            userrole == "Moderator" &&
            waitingRoom.map((user) => (
              <div
                key={user.name}
                className=" p-2 flex justify-between items-center gap-2 cursor-pointer my-2"
              >
                <div className="flex-grow-1 text-xs ">
                  <p className="pb-1 font-bold">{user.name}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedChat(user)}
                    className="cursor-pointer"
                  >
                    <BsChatSquareDotsFill />
                  </button>

                  {role === "Moderator" && (
                    <button
                      onClick={(event) =>
                        toggleRemoveAndWaitingOptionModal(event, user)
                      }
                    >
                      <BsThreeDotsVertical className="cursor-pointer" />
                    </button>
                  )}
                </div>
              </div>
            ))}

          {activeTab === "participants" && selectedChat && (
            <div className="flex-grow pt-2  rounded-xl flex flex-col justify-center items-center">
              {/* chat name and image */}
              <div className="flex w-full items-center justify-center gap-2 mb-4 bg-custom-gray-4 p-2">
                <p className="text-[#1a1a1a] text-[12px] font-bold flex-1">
                  {selectedChat.name}
                </p>

                {role === "Moderator" && (
                  <BsThreeDotsVertical
                    onClick={(event) =>
                      toggleRemoveAndWaitingOptionModal(event, selectedChat)
                    }
                    className="cursor-pointer"
                  />
                )}

                <IoClose
                  className="text-custom-black cursor-pointer"
                  onClick={() => setSelectedChat(null)}
                />
              </div>
              {/* chat message */}
              <div className="flex flex-col gap-2 flex-grow">
                {messages
                  .filter(
                    (message) =>
                      (message.senderEmail ===
                        (selectedChat.email || "unkown@gmail.com") &&
                        message.receiverEmail === myEmailRef.current) ||
                      (message.senderEmail === myEmailRef.current &&
                        message.receiverEmail ===
                          (selectedChat.email || "unkown@gmail.com"))
                  )
                  .map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 ${
                        message.senderEmail === myEmailRef.current
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex flex-col ${
                          message.senderEmail === myEmailRef.current
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <p
                          className={`text-[12px] ${
                            message.senderEmail === myEmailRef.current
                              ? "text-blue-600"
                              : "text-green-600"
                          }`}
                        >
                          <span className="font-bold">
                            {message.senderName}:
                          </span>{" "}
                          {message.message}
                        </p>
                        <p className="text-[#1a1a1a] text-[10px]">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* send message */}
              <div className="flex justify-between items-center gap-2 relative">
                <input
                  type="text"
                  placeholder="Type Message"
                  className="rounded-lg py-1 px-2 placeholder:text-[10px]"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <div className="absolute right-11 cursor-pointer">
                  <MdInsertEmoticon />
                </div>
                <div
                  className="py-1.5 px-1.5 bg-custom-orange-2 rounded-[50%] text-white cursor-pointer text-sm"
                  onClick={handleSendMessage}
                >
                  <IoSend />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* waiting list */}
      {waitingRoom?.length > 0 &&
        // activeTab === "chats" &&
        role === "Moderator" && (
          <div
            className="flex-grow pt-2 bg-custom-gray-8 p-4 rounded-xl mb-4 overflow-y-auto mx-4"
            key={waitingRoom?.length}
          >
            <div className="flex justify-between items-center py-2">
              <h1 className="font-bold text-sm ">
                Waiting ({waitingRoom?.length})
              </h1>
              <Button
                variant="primary"
                type="submit"
                children="Admit All"
                className="text-xs px-2 py-1 rounded-lg text-white"
                onClick={() => admitAllFromWaitingRoom(meetingId)}
              />
            </div>
            {/* participant container */}
            {waitingRoom?.map((user) => (
              <div
                className="flex justify-center items-center gap-2 py-1"
                key={user?.name}
              >
                <p className="text-[#1a1a1a] text-[10px] flex-grow">
                  {user?.name}
                </p>
                <div className="flex justify-center items-center gap-1">
                  <Button
                    variant="primary"
                    type="submit"
                    children="Admit"
                    className="text-xs px-2 py-1 rounded-lg text-white"
                    onClick={() => acceptParticipant(user)}
                  />
                  <Button
                    type="submit"
                    children="Remove"
                    className="text-xs px-2 py-1 rounded-lg text-white"
                    onClick={() => removeFromWaitingRoom(user, meetingId)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      {/* {selectedReceiverId && (
        <ChatDashboard  receiverId={selectedReceiverId} users={users}/>
      )} */}

      {breakoutRoomPopUpOpen && (
        <BreakoutRoomMoveModel
          onClose={() => setBreakoutRoomPopUpOpen(false)}
          handleMove={() =>
            handleJoinParticipantsJoinBreakoutRoom(breakoutRoomDetails.name)
          }
          roomDetails={breakoutRoomDetails}
        />
      )}

      {isPollModelOpen && (
        <ViewPollModel
          onClose={() => setIsPollModelOpen(false)}
          polls={polls}
          onPageChange={handlePollPageChange}
          pollPage={currentPollPage}
          totalPollPages={totalPages}
          meetingId={meetingId}
        />
      )}

      {isRemoveModalOpen && (
        <RemoveUserModal
          onClose={closeRemoveUserModal}
          handleRemoveUser={() => handleRemoveUser(userToRemove._id)}
          userToRemove={userToRemove}
        />
      )}
      {isMoveModalOpen && (
        <MoveToWaitingRoomModal
          onClose={closeMoveUserModal}
          handleMoveUser={() => handleMoveUser(userToMove.id)}
          userToMove={userToMove}
        />
      )}

      {openMoveToBreakModelOpen && (
        <MoveToBreakModal
          onClose={() => setMoveToOpenBreakModelOpen(false)}
          breakoutRooms={breakoutRooms}
          userToMoveBreak={userToMoveBreak}
          handleMoveParticipant={handleMoveParticipant}
        />
      )}

      {openMoveToRenameOpen && (
        <UserRename
          onClose={() => setMoveToOpenRenameOpen(false)}
          user={userToRename}
          handleUserRename={handleUserRename}
          setSelectedChat={setSelectedChat}
        />
      )}

      {brealRoomModelOpen && (
        <BreakoutRoomModal
          onClose={() => setBreakoutRoomModelOpen(false)}
          handleMoveUser={() => handleMoveUser(userToMove.id)}
          userToMove={userToMove}
          users={users}
          handleBreakoutRoom={handleBreakoutRoom}
        />
      )}
    </>
  );
};

export default LeftSidebarOpenUi;
