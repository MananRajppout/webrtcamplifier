// frontend/src/components/projectComponents/polls/PollModal/MatchingPollModal.jsx
import Button from "@/components/shared/button";
import HeadingBlue25px from "@/components/shared/HeadingBlue25px";
import InputField from "@/components/shared/InputField";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { GoPlus } from "react-icons/go";

const MatchingPollModal = ({ onClose, onSave, project, user }) => {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [matching, setMatching] = useState([{ option: "", answer: "" }]);

  const handleSave = () => {
    if (!title || !question || matching.some((m) => !m.option || !m.answer)) {
      toast.error("Please fill in all fields.");
      return;
    }
    const dataToSend = {
      title,
      question,
      type: "Matching",
      matching,
      createdById: user._id,
      projectId: project._id,
    };
    onSave(dataToSend);
    onClose();
  };

  const addMatchingPair = () => {
    setMatching([...matching, { option: "", answer: "" }]);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <HeadingBlue25px children="Add Matching Poll" />
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
        {matching.map((m, index) => (
          <div key={index} className="mt-4">
            <InputField
              label={`Option ${index + 1}`}
              type="text"
              value={m.option}
              onChange={(e) => {
                const updatedMatching = [...matching];
                updatedMatching[index].option = e.target.value;
                setMatching(updatedMatching);
              }}
            />
            <InputField
              label={`Answer ${index + 1}`}
              type="text"
              value={m.answer}
              onChange={(e) => {
                const updatedMatching = [...matching];
                updatedMatching[index].answer = e.target.value;
                setMatching(updatedMatching);
              }}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="save"
          children="Add Option/Answer"
          className="py-1 px-5 shadow-[0px_3px_6px_#09828F69] rounded-xl mt-4"
          icon={<GoPlus />}
          onClick={addMatchingPair}
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
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default MatchingPollModal;