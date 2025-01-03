import React, { useEffect, useState } from "react";
import HeadingBlue25px from "../shared/HeadingBlue25px";
import InputField from "../shared/InputField";
import Dropdown from "../shared/Dropdown";
import { IoTrashSharp } from "react-icons/io5";
import FormDropdownLabel from "../shared/FormDropdownLabel";
import HeadingLg from "../shared/HeadingLg";
import ParagraphLg from "../shared/ParagraphLg";
import axios from "axios";
import Button from "../shared/button";
import toast from "react-hot-toast";

const BreakoutRoomModal = ({ onClose, formData, setFormData, roomToEdit, users, handleBreakoutRoom }) => {
  const [newRoom, setNewRoom] = useState({
    name: "",
    participants: [],
    interpreter: false,
    interpreterName: "",
    interpreterEmail: "",
    interpreterLanguage: "English",
    duration: 0,
  });

  const addParticipantToRoom = (participant) => {
    const isExist = newRoom.participants.find(p => p.name == participant.name);
    if(isExist) return;
    setNewRoom({
      ...newRoom,
      participants: [...newRoom.participants, participant],
    });
  };

  const removeParticipantFromRoom = (index) => {
    const updatedParticipants = newRoom.participants.filter(
      (_, i) => i !== index
    );
    setNewRoom({ ...newRoom, participants: updatedParticipants });
  };



  const handleSave = async () => {
    try {
      if(newRoom.duration == 0){
        toast.error("Duration must be greater than 0.");
        return;
      }
      handleBreakoutRoom(newRoom.name,newRoom.participants, newRoom.duration);
      onClose();
    } catch (error) {
      console.error("Error creating breakout room:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 ">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl overflow-y-auto h-[90%]">
        <HeadingBlue25px
          children={roomToEdit ? "Edit Breakout Room" : "Add Breakout Room"}
        />

        <div className="pt-5">
          <InputField
            label="Breakout Room Name"
            type="text"
            value={newRoom.name}
            onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
          />
          <InputField
            label="Room Duration In Minutes"
            type="number"
            value={newRoom.duration}
            onChange={(e) => setNewRoom({ ...newRoom, duration: e.target.value })}
          />
        </div>
        <div className="w-full">
          <FormDropdownLabel children="Participants" />
          <Dropdown
            options={users.filter(u => u.role == "Participant" && u.status == "online").map(u => u.name)}
            selectedOption="Select Participant"
            onSelect={(option) => {
              const participant = users?.find(
                (p) => p.name === option
              );
              addParticipantToRoom(participant);
            }}
            className="w-full mt-2 z-20"
          />
        </div>

        {/* Participants list div */}
        <div className="pt-5">
          <HeadingLg children="Participants List" />
          <div className="border-[0.5px] border-solid border-custom-dark-blue-1 rounded-xl h-[200px] overflow-y-scroll mt-2">
            {/* table heading */}
            <div className="flex justify-start items-center py-3 px-5 shadow-sm">
              <div className="w-[30%]">
                <HeadingLg children="Name" />
              </div>
             
            </div>
            {/* table item */}
            {newRoom.participants.map((participant, index) => (
              <div
                className="flex justify-between items-center py-3 px-5 shadow-sm"
                key={index}
              >
                <div className="w-[30%]">
                  <ParagraphLg children={participant.name} />
                </div>
                <div className="w-[5%] flex justify-end">
                  <IoTrashSharp
                    className="bg-custom-orange-1 text-white p-2 text-3xl rounded-xl cursor-pointer"
                    onClick={() => removeParticipantFromRoom(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-4 gap-5">
          <Button
            type="button"
            variant="cancel"
            children="Cancel"
            className="px-5 py-1 rounded-xl"
            onClick={onClose}
          />
          <Button
            type="button"
            variant="save"
            children="Save"
            className="px-5 py-1 rounded-xl"
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default BreakoutRoomModal;
