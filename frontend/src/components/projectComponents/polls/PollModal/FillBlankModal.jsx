import React, { useState } from "react";
import Button from "@/components/shared/button";
import HeadingBlue25px from "@/components/shared/HeadingBlue25px";
import InputField from "@/components/shared/InputField";
import toast from "react-hot-toast";
import { GoPlus } from "react-icons/go";

const FillBlankModal = ({ onClose, onSave, project, user }) => {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", blanks: [""] }, // Initialize with one question and one blank
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { question: "", blanks: [""] }]); // Add a new question
  };

  const updateQuestion = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value; // Update the specific question
    setQuestions(updatedQuestions);
  };

  const addBlank = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].blanks.push(""); // Add a new blank to the specific question
    setQuestions(updatedQuestions);
  };

  const updateBlank = (qIndex, bIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].blanks[bIndex] = value; // Update the specific blank
    setQuestions(updatedQuestions);
  };

  const handleSave = () => {
    if (!title || questions.some(q => !q.question || q.blanks.some(blank => !blank))) {
      toast.error("Please fill in all fields.");
      return;
    }

    const dataToSend = {
      title,
      createdById: user._id,
      projectId: project._id,
      questions: questions.map(q => ({
        question: q.question,
        type: "Fill in the Blank",
        blanks: q.blanks,
      })),
    };

    onSave(dataToSend);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <HeadingBlue25px children="Add Fill in the Blank Poll" />
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
            <div className="mt-2">
              <label className="block font-semibold text-custom-dark-blue-2">Blanks</label>
              {q.blanks.map((blank, bIndex) => (
                <InputField
                  key={bIndex}
                  label={`Blank ${bIndex + 1}`}
                  type="text"
                  value={blank}
                  onChange={(e) => updateBlank(qIndex, bIndex, e.target.value)}
                />
              ))}
              <Button
                 type="button"
                 variant="save"
                 className="py-1 px-5 shadow-[0px_3px_6px_#09828F69] rounded-xl mb-5"
                 icon={<GoPlus />}
                children="+ Add Blank"
                onClick={() => addBlank(qIndex)}
              />
            </div>
          </div>
        ))}
        <Button
           type="button"
           variant="save"
           className="py-1 px-5 shadow-[0px_3px_6px_#09828F69] rounded-xl"
           icon={<GoPlus />}
          children="Add Question"
          onClick={addQuestion}
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

export default FillBlankModal;