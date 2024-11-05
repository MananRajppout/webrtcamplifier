// frontend/src/components/projectComponents/polls/PollModal/RankOrderPollModal.jsx
import Button from "@/components/shared/button";
import HeadingBlue25px from "@/components/shared/HeadingBlue25px";
import InputField from "@/components/shared/InputField";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { GoPlus } from "react-icons/go";

const RankOrderPollModal = ({ onClose, onSave, project, user }) => {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", type: "Rank Order", choices: [{ text: "" }] },
  ]);

  const addChoice = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].choices.push({ text: "" });
    setQuestions(updatedQuestions);
  };

  const updateQuestion = (index, value) => {
    const updatedQuestions = questions.map((q, i) =>
      i === index ? { ...q, question: value } : q
    );
    setQuestions(updatedQuestions);
  };

  const updateChoice = (qIndex, cIndex, value) => {
    const updatedQuestions = questions.map((q, i) =>
      i === qIndex
        ? {
            ...q,
            choices: q.choices.map((c, j) =>
              j === cIndex ? { text: value } : c
            ),
          }
        : q
    );
    setQuestions(updatedQuestions);
  };

  const handleSave = () => {
    if (!title || questions.some((q) => !q.question || q.choices.some((c) => !c.text))) {
      toast.error("Please fill in all questions, answers, and the title.");
      return;
    }
    const dataToSend = {
      title,
      createdById: user._id,
      projectId: project._id,
      questions: questions.map(q => ({
        question: q.question,
        type: q.type,
        choices: q.choices.map(c => ({ text: c.text })),
      })),
    };
    onSave(dataToSend);
    onClose();
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
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="mt-4">
            <InputField
              label={`Question ${qIndex + 1}`}
              type="text"
              value={q.question}
              onChange={(e) => updateQuestion(qIndex, e.target.value)}
            />
            <div className="bg-[#f3f3f3] p-4 mt-2">
              {q.choices.map((choice, cIndex) => (
                <div key={cIndex} className="flex justify-between items-center mt-2">
                  <InputField
                    label={`Choice ${cIndex + 1}`}
                    type="text"
                    value={choice.text}
                    onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="save"
                className="py-1 px-5 shadow-[0px_3px_6px_#09828F69] rounded-xl"
                icon={<GoPlus />}
                children="Add Choice"
                onClick={() => addChoice(qIndex)}
              />
            </div>
          </div>
        ))}
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

export default RankOrderPollModal;