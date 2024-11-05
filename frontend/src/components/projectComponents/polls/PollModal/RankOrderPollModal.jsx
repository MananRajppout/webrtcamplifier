// frontend/src/components/projectComponents/polls/PollModal/RankOrderPollModal.jsx
import Button from "@/components/shared/button";
import HeadingBlue25px from "@/components/shared/HeadingBlue25px";
import InputField from "@/components/shared/InputField";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { GoPlus } from "react-icons/go";

const RankOrderPollModal = ({ onClose, onSave, project, user }) => {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState([{ text: "" }]); // Start with one empty choice

  const handleSave = () => {
    if (!title || !question || choices.some((c) => !c.text)) {
      toast.error("Please fill in all fields.");
      return;
    }
    const dataToSend = {
      title,
      question,
      type: "Rank Order",
      choices,
      createdById: user._id,
      projectId: project._id,
    };
    onSave(dataToSend); // Call the provided save function
    onClose(); // Close the modal
  };

  const addChoice = () => {
    setChoices([...choices, { text: "" }]); // Add a new empty choice
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <HeadingBlue25px children="Add Rank Order Poll" />
        <InputField
          label="Poll Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <InputField
          label="Question"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        {choices.map((c, index) => (
          <div key={index} className="mt-4">
            <InputField
              label={`Choice ${index + 1}`}
              type="text"
              value={c.text}
              onChange={(e) => {
                const updatedChoices = [...choices];
                updatedChoices[index].text = e.target.value;
                setChoices(updatedChoices);
              }}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="save"
          children="Add Choice"
          className="py-1 px-5 shadow-[0px_3px_6px_#09828F69] rounded-xl mt-4"
          icon={<GoPlus />}
          onClick={addChoice} // Add new choice on click
        />
        <div className="flex justify-end gap-5 mt-5">
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
            onClick={handleSave} // Save the poll data
          />
        </div>
      </div>
    </div>
  );
};

export default RankOrderPollModal;