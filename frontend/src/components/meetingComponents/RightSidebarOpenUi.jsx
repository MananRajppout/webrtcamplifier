// RightSidebarOpenUi.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import { FaAngleDown, FaFolder, FaTrash } from "react-icons/fa";
import { BsChatSquareDotsFill, BsChatSquareFill } from "react-icons/bs";
import Search from "../singleComponent/Search";
import { IoIosDocument } from "react-icons/io";
import { FaEye } from "react-icons/fa";
import { IoClose, IoSend } from "react-icons/io5";
import { MdInsertEmoticon } from "react-icons/md";
import axios from "axios";
import Button from "../shared/button";
import { useParams, useSearchParams } from "next/navigation";
import { PiCirclesFourFill } from "react-icons/pi";
import toast from "react-hot-toast";
import { BiCopy, BiShareAlt } from "react-icons/bi";
import ShareMediaModel from "../singleComponent/ShareMediaModel";


export function bytesToMbs(size) {
  return (size / (1024 ** 2)).toFixed(2);
}

const RightSidebarOpenUi = ({
  observers,
  setObservers,
  activeTab,
  setActiveTab,
  currentObserver,
  setCurrentObserver,
  selectedChat,
  setSelectedChat,
  isWaiting,
  setIsWaiting,
  handleTabClick,
  chatParticipants,
  files,
  handleSearch,
  observersMessages,
  userName,
  meetingId,
  sendMessageObserver,
  role,
  messages,
  users,
  setSelectedParticipantChat,
  selectedPartcipantChat,
  breakoutRooms,
  selectedRoom,
  setSelectedRoom,
  groupMessage,
  handleMediaUpload,
  mediaBox
}) => {
  const [fileList, setFileList] = useState(files);
  const [inputMessage, setInputMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareMediaModel, setShareMediaModel] = useState(null);

  const params = useParams();
  const searchParams = useSearchParams();

  const userrole = searchParams.get('role');
  const fullName = searchParams.get('fullName');
  const roomname = searchParams.get('roomname') || 'main'
  const id = params.id;






  const myEmailRef = useRef(null);
  useEffect(() => {
    if (typeof window != 'undefined') {
      const email = window.localStorage.getItem('email');
      myEmailRef.current = email

    }
  }, [])


  const fetchFiles = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/files`
      );
      setFileList(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    try {
      if (!file) return;
      const res = handleMediaUpload(file, setUploadProgress);

    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploadProgress(0)
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/upload/delete/${fileId}`
      );
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        meetingId: meetingId,
        senderName: userName,
        receiverName: selectedChat.name,
        message: inputMessage.trim(),
        senderEmail: myEmailRef.current,
        receiverEmail: selectedChat.email || 'unkown@gmail.com',
      };
      sendMessageObserver(newMessage);
      setInputMessage("");
    }
  };

  const handleRoomSwitch = useCallback((roomName) => {
    let url;
    if (roomName.toLowerCase() == "main") {
      url = `/meeting/${id}?fullName=${fullName}&role=${userrole}`
    } else {
      url = `/meeting/${id}?fullName=${fullName}&role=${userrole}&type=breackout&roomname=${roomName}`;
    }
    window.open(url, '_self')
  }, [fullName, userrole, id])


  const copyUrlToClipboard = useCallback(async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy URL!')
    }
  }, []);




  return (
    <>

      {role === "Observer" && breakoutRooms.length > 1 &&
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
                {users.filter(u => u.roomName?.toLowerCase() == selectedRoom.toLowerCase())?.length || 0}
              </h1>
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
                className={`ml-2 transform transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
              />
            </button>
            {isDropdownOpen && (
              <ul
                className={`absolute left-0 text-xs bg-white rounded-lg shadow-[0px_3px_6px_#00000029] text-custom-dark-blue-1 font-semibold w-full`}
              >

                {
                  breakoutRooms.map((name) => (
                    <li
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      index={name}
                      onClick={() => handleRoomSwitch(name)}
                    >
                      {name}
                    </li>
                  ))
                }

              </ul>
            )}
          </div>
        </div>
      }

      {/* Backroom chat and icon */}
      <div className="flex justify-center items-center gap-2 pt-10 lg:pb-4 mx-4 py-5 mt-5 sm:mt-3">
        <BsChatSquareFill className="text-custom-dark-blue-1" />
        <h2 className="uppercase font-bold ">meeting chat</h2>
        <div className="bg-custom-black flex justify-center items-center gap-1 px-2 py-1 rounded-xl">
          <FaEye className="text-custom-orange-1" />
          <p className="text-xs text-white">Viewers</p>
          <p className="text-xs text-white">{observers?.filter((observer) => (observer.status == "online" && observer.role !== "Moderator"))?.length}</p>
        </div>
      </div>

      {/* chat container */}
      <div className="flex flex-col flex-grow px-4 pb-2 pt-4 bg-custom-gray-8 mb-4 rounded-xl overflow-y-auto mx-4">
        {/* tabs */}
        <div className="flex justify-center items-center gap-2 pb-2 ">
          <div className="w-full relative">
            <Button
              children="Observers"
              variant="cancel"
              type="submit"
              className={`w-full py-2 rounded-xl pl-2 text-[10px] text-center px-1 ${activeTab === "observersChat"
                ? "shadow-[0px_4px_6px_#1E656D4D]"
                : "bg-custom-gray-8 border-2 border-custom-teal !text-custom-teal "
                } `}
              onClick={() => handleTabClick("observersChat")}
            />
          
          </div>

        </div>

        {/* observers container */}

        {/* observers list */}
        {activeTab === "observersList" && (
          <div className="flex-grow pt-2">
            <Search
              placeholder="Search Name"
              onSearch={handleSearch}
              inputClassName="!bg-[#F3F4F5] !rounded-xl "
              iconClassName="!bg-[#EBEBEB]"
            />
            {/* participant container */}
            {users
              ?.filter((user) => user.name !== userName)
              .map((user, index) => (
                <div
                  className="flex justify-center items-center gap-2 py-1 my-2 px-2 rounded-md bg-gray-100"
                  key={user?.id}
                >
                  <p className="text-[#1a1a1a] text-sm flex-grow">
                    {index + 1}. {user?.name}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* observers chat */}
        {activeTab === "observersChat" &&
          !selectedChat &&
          observers
            .filter((observer) => observer.name !== userName)
            .filter((observer) => observer.status == "online")
            .filter((observer) => (role == "Moderator" ? true : observer.role == "Moderator"))

            .map((observer) => (
              <div
                key={observer.id}
                className="p-2 items-center gap-2 border-b border-solid my-2 flex justify-between"

              >
                <div className="flex-grow-1 text-xs ">
                  <p className="pb-1 font-bold">{observer.name}</p>
                </div>

                <button onClick={() => setSelectedChat(observer)} className="cursor-pointer">
                  <BsChatSquareDotsFill />
                </button>
              </div>
            ))}

        {activeTab === "observersChat" && selectedChat && (
          <div className="flex-grow pt-2 rounded-xl flex flex-col justify-center items-center">
            {/* chat name and image */}
            <div className="flex w-full items-center justify-center gap-2 mb-4 bg-custom-gray-4 p-2">
              <p className="text-[#1a1a1a] text-[12px] font-bold flex-1">
                {selectedChat.name}
              </p>
              <IoClose
                className="text-custom-black cursor-pointer"
                onClick={() => setSelectedChat(null)}
              />
            </div>
            {/* chat message */}
            <div className="flex flex-col gap-2 flex-grow">
              {observersMessages
                // .filter(
                //   (message) =>
                //     (message.senderName === selectedChat.name &&
                //       message.receiverName === userName) ||
                //     (message.senderName === userName &&
                //       message.receiverName === selectedChat.name)
                // )
                .filter(
                  (message) =>
                    (message.senderEmail === (selectedChat.email || "unkown@gmail.com") &&
                      message.receiverEmail === myEmailRef.current) ||
                    (message.senderEmail === myEmailRef.current &&
                      message.receiverEmail === (selectedChat.email || "unkown@gmail.com"))
                )
                .map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 ${message.senderEmail === myEmailRef.current
                      ? "justify-start"
                      : "justify-end"
                      }`}
                  >
                    <div
                      className={`flex flex-col ${message.senderEmail === myEmailRef.current
                        ? "items-start"
                        : "items-end"
                        }`}
                    >
                      <p
                        className={`text-[12px] ${message.senderEmail === myEmailRef.current
                          ? "text-blue-600"
                          : "text-green-600"
                          }`}
                      >
                        <span className="font-bold">{message.senderName}:</span>{" "}
                        {message.message}
                      </p>
                      <p className="text-[#1a1a1a] text-[10px]">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

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





        {/* particpants chat */}
        {activeTab === "participantChat" &&
          <div className="flex-grow pt-2">
            <div className="flex-grow pt-2  rounded-xl flex flex-col justify-center items-center relative">
              {/* chat message */}
              <div className="flex flex-col gap-2 flex-grow h-[24rem] overflow-y-auto w-full mb-5">
                {
                  groupMessage && groupMessage.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 mb-3 ${message.senderEmail === myEmailRef.current
                        ? "justify-end"
                        : "justify-start"
                        }`}
                    >
                      <div
                        className={`flex flex-col ${message.senderEmail === myEmailRef.current
                          ? "items-end"
                          : "items-start"
                          }`}
                      >
                        <p
                          className={`text-[12px] w-full ${message.senderEmail === myEmailRef.current
                            ? "text-blue-600"
                            : "text-green-600"
                            }`}
                        >
                          <span className="font-bold">
                            {message.name}:
                          </span>{" "}
                          {message.content}
                        </p>
                        <p className="text-[#1a1a1a] text-[10px]">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        }


      </div>

      {/* document hub */}
      <div className="mb-4">
        {/* heading */}
        <div className="flex justify-center items-center gap-2 px-4 pb-2 ">
          <IoIosDocument className="text-custom-dark-blue-1 text-lg" />
          <h1 className="uppercase font-bold flex-1 text-custom-dark-blue-2">
            document hub
          </h1>

          <label className="bg-custom-orange-1 text-white rounded-xl py-1 px-3 text-xs cursor-pointer">
            {uploadProgress != 0 ? `Uploading...` : 'Upload File'}
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>

        </div>
        {/* Upload file div */}
        <div className="bg-custom-gray-8 rounded-xl mx-4 p-2 overflow-y-auto h-[15rem]">
          {/* title */}
          <div className="flex justify-between items-center border-b border-solid border-custom-gray-3 pb-1">
            <p className="text-xs text-custom-gray-3">Name</p>
            <p className="text-xs text-custom-gray-3 mr-11">Size</p>
          </div>
          {/* files */}
          {mediaBox && mediaBox.map((media, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-200 py-3 rounded"
            >
              <div className="flex items-center space-x-2">
                <FaFolder className="h-3 w-3 text-custom-gray-3" />
                <a href={media?.file?.url} target="_blank" download={media?.file?.name} className="text-xs text-custom-gray-3">
                  {media?.file?.name?.slice(0, 20) || "Unkown"}
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-custom-gray-3">{bytesToMbs(media?.file?.size || 49972)} Mb</span>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDeleteFile(media._id)}
                >
                  <FaTrash className="h-3 w-3" />
                </button>
                <button
                  className="text-gray-700"
                  onClick={() => setShareMediaModel(media?.file?.url)}
                >
                  <BiShareAlt className="h-3 w-3" size={35} />
                </button>
              </div>


            </div>
          ))}
        </div>
      </div>


      {
        shareMediaModel &&
        <ShareMediaModel
          onClose={() => setShareMediaModel(null)}
          url={shareMediaModel}
          handleCopy={() => copyUrlToClipboard(shareMediaModel)}
        />
      }
    </>
  );
};

export default RightSidebarOpenUi;
