'use client';
import { useState } from "react";
import { useGlobalContext } from "@/context/GlobalContext";
import Button from "../shared/button";

const ParticipantPollModal = ({ onClose, pollQuestions, pollId, meetingId, email }) => {
  const { socket } = useGlobalContext();
  const [responses, setResponses] = useState({});
  console.log('meeting id', meetingId)

const handleInputChange = (questionId, value) => {
  setResponses((prev) => ({
    ...prev,
    [questionId]: value,
  }));
};

const handleMultipleChoiceChange = (questionId, option, isChecked) => {
  setResponses((prev) => {
    const currentSelection = prev[questionId] || [];
    return {
      ...prev,
      [questionId]: isChecked
        ? [...currentSelection, option]
        : currentSelection.filter((item) => item !== option),
    };
  });
};

const handleSubmit = () => {
  // Validate responses (e.g., ensure all required questions are answered)
  const unansweredQuestions = pollQuestions.filter(
    (q) => !responses[q._id] || responses[q._id].length === 0
  );

  if (unansweredQuestions.length > 0) {
    alert("Please answer all questions before submitting.");
    return;
  }

  console.log('poll answer response at the fe', responses)

  // Emit the responses to the backend
  socket.emit("submit-poll-response", {
    meetingId,
    pollId,
    responses,
    participantEmail: email
  });
  onClose();
};

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-30">
      <div className="bg-white p-4 rounded-2xl w-[600px]">
        <h2 className="text-xl font-semibold text-custom-dark-blue-2">Poll</h2>
        <div className="mt-4 space-y-4">
        {pollQuestions.map((question) => (
  <div key={question._id}>
    <label className="block text-sm font-medium">{question.question}</label>
    {question.type === "Single Choice" && (
      <select
        className="w-full border border-gray-300 rounded-md px-2 py-1"
        onChange={(e) => handleInputChange(question._id, e.target.value)}
      >
        <option value="">Select an answer</option>
        {question.choices.map((choice, index) => (
          <option key={index} value={choice.text}>
            {choice.text}
          </option>
        ))}
      </select>
    )}

    {/* Multiple Choice Question Handling */}
    {question.type === "Multiple Choice" && (
      <div>
        {question.choices.map((choice, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`${question._id}-${index}`}
              onChange={(e) =>
                handleMultipleChoiceChange(
                  question._id,
                  choice.text,
                  e.target.checked
                )
              }
            />
            <label htmlFor={`${question._id}-${index}`}>{choice.text}</label>
          </div>
        ))}
      </div>
    )}

    {question.type === "Short Answer" && (
      <input
        type="text"
        className="w-full border border-gray-300 rounded-md px-2 py-1"
        onChange={(e) => handleInputChange(question._id, e.target.value)}
      />
    )}
  </div>
))}
        </div>
        <div className="flex justify-end mt-4 px-3 py-1 rounded-lg">
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantPollModal;
