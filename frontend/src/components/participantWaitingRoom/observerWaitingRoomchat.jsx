import { BsChatSquareFill } from "react-icons/bs";
import HeadingLg from "../shared/HeadingLg";
import Button from "../shared/button";
import { useEffect, useRef, useState } from "react";
import { IoClose, IoSend } from "react-icons/io5";
import { useParams, useSearchParams } from "next/navigation";
import { MdInsertEmoticon } from "react-icons/md";

const ObserverWaintingRoomChat = ({ observersMessages, observers, sendMessageObserver }) => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [inputMessage, setInputMessage] = useState('');

    const params = useParams();
    const searchParams = useSearchParams();
    const userName = searchParams.get('fullName');
    const meetingId = params.id;
    const myEmailRef = useRef(null);

    const userrole = searchParams.get('role');


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



    useEffect(() => {
        if (typeof window != 'undefined') {
            const email = window.localStorage.getItem('email');
            myEmailRef.current = email
        }
    }, [])

    return (
        <>
            <div className="">
                {/* Backroom chat and icon */}
                <div className="flex justify-start items-center gap-2 pb-4 pt-14 mx-4">
                    <BsChatSquareFill className="text-custom-dark-blue-1" />
                    <HeadingLg children="MEETING CHAT" />
                </div>

                {/* chat container */}
                <div className="flex flex-col flex-grow px-4 pb-2 pt-4 bg-custom-gray-8 mb-4 rounded-xl overflow-y-auto max-h-[300px] mx-4">
                    

                    {/* Participant chat */}
                    {!selectedChat && observers.filter(p => p.role == "Moderator").map((user) => (
                        <div
                            key={user.name}
                            className="bg-custom-gray-2 p-2 flex justify-center items-center gap-2 border-b border-solid border-custom-gray-1 cursor-pointer"
                            onClick={() => setSelectedChat(user)}
                        >
                            <div className="flex-grow-1 text-xs ">
                                <p className="pb-1 font-bold">{user.name}</p>
                            </div>
                        </div>
                    ))}


                    {selectedChat && (
                        <div className="flex-grow pt-2  rounded-xl flex flex-col justify-center items-center">
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
        </>
    );
};

export default ObserverWaintingRoomChat;


