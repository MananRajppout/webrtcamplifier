import React, { useState } from "react";
import Button from "@/components/shared/button";
import HeadingBlue25px from "@/components/shared/HeadingBlue25px";
import InputField from "@/components/shared/InputField";
import toast from "react-hot-toast";

const RatingScaleModal = ({ onClose, onSave, project, user }) => {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(10);
  const [lowScoreLabel, setLowScoreLabel] = useState("");
  const [highScoreLabel, setHighScoreLabel] = useState("");

  const handleSave = () => {
    if (!title || !question || lowScoreLabel === "" || highScoreLabel === "") {
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
          type: "Rating Scale",
          ratingRange: { min: minScore, max: maxScore },
          lowScoreLable: lowScoreLabel,
          highScoreLable: highScoreLabel,
        },
      ],
    };

    onSave(dataToSend);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <HeadingBlue25px children="Add Rating Scale Poll" />
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
            label="Score from"
            type="number"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            min={0}
          />
          <InputField
            label="to"
            type="number"
            value={maxScore}
            onChange={(e) => setMaxScore(Number(e.target.value))}
            min={0}
          />
        </div>
        <div className="mt-4">
          <InputField
            label="Low Score Label"
            type="text"
            value={lowScoreLabel}
            onChange={(e) => setLowScoreLabel(e.target.value)}
          />
          <InputField
            label="High Score Label"
            type="text"
            value={highScoreLabel}
            onChange={(e) => setHighScoreLabel(e.target.value)}
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

export default RatingScaleModal;