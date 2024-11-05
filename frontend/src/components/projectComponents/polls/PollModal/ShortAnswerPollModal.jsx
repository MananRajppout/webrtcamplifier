import React, { useState } from "react";
import Button from "@/components/shared/button";
import HeadingBlue25px from "@/components/shared/HeadingBlue25px";
import InputField from "@/components/shared/InputField";
import toast from "react-hot-toast";

const ShortAnswerPollModal = ({ onClose, onSave, project, user }) => {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [minLength, setMinLength] = useState(1);
  const [maxLength, setMaxLength] = useState(200);

  const handleSave = () => {
    if (!title || !question) {
      toast.error("Please fill in all fields.");
      return;
    }

    const dataToSend = {
      title,
      createdById: user._id,
      projectId: project._id,
      questions: [
        {
          question,
          type: "Short Answer",
          minLength,
          maxLength,
        },
      ],
    };
    onSave(dataToSend);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <HeadingBlue25px children="Add Short Answer Poll" />
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
        <div className="flex justify-between mt-4">
          <InputField
            label="Min Length"
            type="number"
            value={minLength}
            onChange={(e) => setMinLength(Number(e.target.value))}
            min={1}
          />
          <InputField
            label="Max Length"
            type="number"
            value={maxLength}
            onChange={(e) => setMaxLength(Number(e.target.value))}
            min={1}
          />
        </div>
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
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default ShortAnswerPollModal;