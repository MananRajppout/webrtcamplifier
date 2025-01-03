'use client';
import { useState } from "react";
import { useGlobalContext } from "@/context/GlobalContext";
import Button from "../shared/button";

const ParticipantPollModal = ({ onClose, pollQuestions, pollId, meetingId }) => {
  const { socket } = useGlobalContext();
  const [responses, setResponses] = useState({});

  const handleInputChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = () => {
    socket.emit("submit-poll-response", {
      meetingId,
      pollId,
      responses,
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
              <label className="block text-sm font-medium mb-2">{question.question}</label>

              {question.type === "Single Choice" && (
                <select
                  className="w-full border border-gray-300 rounded-md px-2 py-1"
                  onChange={(e) => handleInputChange(question._id, e.target.value)}
                >
                  <option value="">Select an answer</option>
                  {question.choices.map((choice) => (
                    <option key={choice._id} value={choice.text}>
                      {choice.text}
                    </option>
                  ))}
                </select>
              )}

              {question.type === "Multiple Choice" && (
                <div className="space-y-2">
                  {question.choices.map((choice) => (
                    <div key={choice._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={choice._id}
                        value={choice.text}
                        onChange={(e) => {
                          const selectedChoices = responses[question._id] || [];
                          if (e.target.checked) {
                            setResponses((prev) => ({
                              ...prev,
                              [question._id]: [...selectedChoices, e.target.value],
                            }));
                          } else {
                            setResponses((prev) => ({
                              ...prev,
                              [question._id]: selectedChoices.filter((c) => c !== e.target.value),
                            }));
                          }
                        }}
                      />
                      <label htmlFor={choice._id}>{choice.text}</label>
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

              {question.type === "Rating Scale" && (
                <div className="flex items-center space-x-2">
                  <span>{question.lowScoreLable || "Low"}</span>
                  <input
                    type="range"
                    min={question.ratingRange?.min || 1}
                    max={question.ratingRange?.max || 5}
                    onChange={(e) => handleInputChange(question._id, e.target.value)}
                  />
                  <span>{question.highScoreLable || "High"}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantPollModal;
