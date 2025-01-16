"use client";
import { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/GlobalContext";
import Button from "../shared/button";
import toast from "react-hot-toast";

const ParticipantPollModal = ({
  onClose,
  pollQuestions,
  activePollId,
  meetingId,
  email,
}) => {
  const { socket } = useGlobalContext();
  const [responses, setResponses] = useState({});

  console.log("pollQuestions", pollQuestions);

  useEffect(() => {
    // Listen for the poll-ended event
    socket.on("poll-ended", (data) => {
      if (data.activePollId === activePollId) {
        toast.error(`${data.message}`);
        onClose(); 
      }
    });

    return () => {
      socket.off("poll-ended");
    };
  }, [activePollId, socket, onClose]);

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
      (q) =>
        !responses[q._id] ||
        (Array.isArray(responses[q._id]) && responses[q._id].length === 0)
    );

    if (unansweredQuestions.length > 0) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    console.log(
      "poll answer response at the fe",
      responses,
      "active poll id",
      activePollId
    );

    // Emit the responses to the backend
    socket.emit("submit-poll-response", {
      activePollId,
      meetingId,
      participantEmail: email,
      responses,
    });

    toast.success("Responses submitted successfully.");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-30">
      <div className="bg-white p-4 rounded-2xl w-[600px] h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-custom-dark-blue-2">Poll</h2>
        <div className="mt-4 space-y-4">
          {pollQuestions.map((question) => (
            <div key={question._id}>
              <label className="block text-sm font-medium">
                {question.question}
                {question.type}
              </label>
              {question.type === "Single Choice" && (
                <div>
                  {question.choices.map((choice, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`single-choice-${question._id}`}
                        value={choice.text}
                        onChange={(e) =>
                          handleInputChange(question._id, e.target.value)
                        }
                      />
                      <label>{choice.text}</label>
                    </div>
                  ))}
                </div>
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
                      <label htmlFor={`${question._id}-${index}`}>
                        {choice.text}
                      </label>
                    </div>
                  ))}
                </div>
              )}

{(question.type === "Short Answer" || question.type === "Long Answer") && (
  <textarea
    className="w-full border border-gray-300 rounded-md px-2 py-1"
    rows={question.type === "Short Answer" ? 2 : 5} // Adjust the number of rows
    placeholder={`Enter your ${question.type === "Short Answer" ? "short" : "long"} answer`}
    onChange={(e) => handleInputChange(question._id, e.target.value)}
  />
)}


              {question.type === "Fill in the Blank" && (
                <div>
                  {question.blanks.map((blank, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <label>{blank}</label>
                      <input
                        type="text"
                        placeholder={`Blank ${index + 1}`}
                        className="border border-gray-300 rounded-md px-2 py-1"
                        onChange={(e) =>
                          handleInputChange(question._id, {
                            ...responses[question._id],
                            [index]: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {question.type === "Rating Scale" && (
                <div>
                  <label>
                    {question.lowScoreLabel || "Min"} -{" "}
                    {question.highScoreLabel || "Max"}
                  </label>
                  <input
                    type="range"
                    min={question.ratingRange.min}
                    max={question.ratingRange.max}
                    className="w-full"
                    onChange={(e) =>
                      handleInputChange(question._id, Number(e.target.value))
                    }
                  />
                  <span>
                    {responses[question._id] || question.ratingRange.min}
                  </span>
                </div>
              )}

              {question.type === "Matching" && (
                <div>
                  {question.matching.map((pair, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <span>{pair.option}</span>
                      <select
                        className="border border-gray-300 rounded-md px-2 py-1"
                        onChange={(e) =>
                          handleInputChange(question._id, {
                            ...responses[question._id],
                            [index]: e.target.value,
                          })
                        }
                      >
                        <option value="">Select an answer</option>
                        {question.matching.map((p, i) => (
                          <option key={i} value={p.answer}>
                            {p.answer}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {question.type === "Rank Order" && (
                <div>
                  {question.choices.map((choice, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <label>{choice.text}</label>
                      <select
                        className="border border-gray-300 rounded-md px-2 py-1"
                        onChange={(e) =>
                          handleInputChange(question._id, {
                            ...responses[question._id],
                            [choice.text]: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Rank</option>
                        {question.choices.map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4 px-3 py-1 rounded-lg">
          <Button variant="primary" 
          className="rounded-lg px-3 py-2"
          onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantPollModal;
