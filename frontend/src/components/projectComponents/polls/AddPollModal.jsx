import Button from "@/components/shared/button";
import FormDropdownLabel from "@/components/shared/FormDropdownLabel";
import HeadingBlue25px from "@/components/shared/HeadingBlue25px";
import InputField from "@/components/shared/InputField";
import { useGlobalContext } from "@/context/GlobalContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiMinus } from "react-icons/fi";
import { GoPlus } from "react-icons/go";
import { IoTrashSharp } from "react-icons/io5";

const AddPollModal = ({
  onClose,
  pollToEdit,
  project,
  setLocalProjectState,
  setPolls,
}) => {
  const { user } = useGlobalContext();
  const [newPoll, setNewPoll] = useState({
    pollName: "",
    isActive: false,
    questions: [
      {
        question: "",
        type: "single",
        answers: [{ answer: "" }, { answer: "" }],
      },
    ],
  });

  // console.log("poll to edit", pollToEdit);

  useEffect(() => {
    if (pollToEdit) {
      const transformedPoll = {
        pollName: pollToEdit.title,
        isActive: pollToEdit.status,
        questions: pollToEdit.questions.map((q) => {
          if (q.type === "Single Choice" || q.type === "Multiple Choice") {
            return {
              question: q.question,
              type: q.type,
              answers:
                q.choices?.map((choice) => ({
                  answer: choice.text,
                })) || [],
            };
          }
          if (q.type === "Fill in the Blank") {
            return {
              question: q.question,
              type: q.type,
              answers:
                q.blanks?.map((blank) => ({
                  answer: blank,
                })) || [],
            };
          }
          if (q.type === "Long Answer" || q.type === "Short Answer") {
            return {
              question: q.question,
              type: q.type,
              maxLength: q.maxLength || 200,
              minLength: q.minLength || 1,
              answers: [], // Text answers don't need predefined answers
            };
          }
          if (q.type === "Rank Order") {
            return {
              question: q.question,
              type: q.type,
              answers: q.choices?.map((choice) => ({
                answer: choice.text,
              })) || [],
            };
          }
          if (q.type === "Matching") {
            return {
              question: q.question,
              type: q.type,
              answers: q.matching?.map((pair) => ({
                option: pair.option || "",
                answer: pair.answer || "",
              })) || [],
            };
          }
          
          if (q.type === "Rating Scale") {
            return {
              question: q.question,
              type: q.type,
              ratingRange: {
                min: q.ratingRange?.min || 1,
                max: q.ratingRange?.max || 10,
              },
              highScoreLabel: q.highScoreLabel || "",
              lowScoreLabel: q.lowScoreLabel || "",
              answers: [], // Rating doesn't need predefined answers
            };
          }
          // Handle regular questions
          return {
            question: q.question,
            type: q.type.toLowerCase(),
            choices:
              q.choices?.map((choice) => ({
                text: choice.text,
              })) || [],
          };
        }),
      };
      setNewPoll(transformedPoll);
    }
  }, [pollToEdit]);

  const addQuestion = () => {
    setNewPoll({
      ...newPoll,
      questions: [
        ...newPoll.questions,
        {
          question: "",
          type: "Single Choice",
          answers: [{ answer: "" }, { answer: "" }],
          matching: [],
        },
      ],
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = newPoll.questions.map((q, i) => {
      if (i === index) {
        // If changing to matching type, restructure the answers
        if (field === "type" && value === "Matching") {
          return {
            ...q,
            [field]: value,
            answers: q.answers.map((a) => ({
              option: "",
              answer: a.answer || "",
            })),
          };
        }
        // If changing from matching type, restructure the answers
        if (field === "type" && q.type === "Matching") {
          return {
            ...q,
            [field]: value,
            answers: q.answers.map((a) => ({
              answer: a.answer || "",
            })),
          };
        }
        return { ...q, [field]: value };
      }
      return q;
    });
    setNewPoll({ ...newPoll, questions: updatedQuestions });
  };

  const updateAnswer = (qIndex, aIndex, field, value) => {
    const updatedQuestions = newPoll.questions.map((q, i) =>
      i === qIndex
        ? {
            ...q,
            answers: q.answers.map((a, j) =>
              j === aIndex
                ? {
                    ...a,
                    [field]: value,
                  }
                : a
            ),
          }
        : q
    );
    setNewPoll({ ...newPoll, questions: updatedQuestions });
  };

  const addAnswer = (qIndex) => {
    const updatedQuestions = newPoll.questions.map((q, i) =>
      i === qIndex
        ? {
            ...q,
            answers: [...q.answers, { answer: "" }],
          }
        : q
    );
    setNewPoll({ ...newPoll, questions: updatedQuestions });
  };

  const removeAnswer = (qIndex, aIndex) => {
    const updatedQuestions = newPoll.questions.map((q, i) =>
      i === qIndex
        ? {
            ...q,
            answers: q.answers.filter((_, j) => j !== aIndex),
          }
        : q
    );
    setNewPoll({ ...newPoll, questions: updatedQuestions });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = newPoll.questions.filter((_, i) => i !== index);
    setNewPoll({ ...newPoll, questions: updatedQuestions });
  };

  const handleSave = async () => {
    console.log("handleSave triggered");

    try {
      const dataToSend = {
        project: project._id,
        createdBy: user._id,
        title: newPoll.pollName,
        status: newPoll.isActive,
        questions: newPoll.questions.map((q) => {
          if (q.type === "Matching") {
            return {
              question: q.question,
              type: "Matching",
              matching: q.answers.map((a) => ({
                option: a.option || "",
                answer: a.answer || "",
              })),
              choices: [],
              blanks: [],
            };
          }
          if (q.type === "Single Choice" || q.type === "Multiple Choice") {
            return {
              question: q.question,
              type: q.type,
              choices: q.answers.map((a) => ({
                text: a.answer,
                votes: 0,
              })),
              matching: [],
              blanks: [],
            };
          }
          if (q.type === "Fill in the Blank") {
            return {
              question: q.question,
              type: q.type,
              blanks: q.answers.map((a) => a.answer),
              choices: [], // Empty choices for fill in blank
              matching: [], // Empty matching for fill in blank
              highScoreLabel: "",
              lowScoreLabel: "",
            };
          }
          if (q.type === "Long Answer" || q.type === "Short Answer") {
            return {
              question: q.question,
              type: q.type,
              maxLength: q.maxLength || 200,
              minLength: q.minLength || 1,
              choices: [], // Empty choices for text answers
              matching: [], // Empty matching for text answers
            };
          }
          if (q.type === "Rank Order") {
            return {
              question: q.question,
              type: q.type,
              choices: q.answers.map((a) => ({
                text: a.answer,
                votes: 0,
              })),
              matching: [],
            };
          }
          if (q.type === "matching") {
            return {
              question: q.question,
              type: q.type,
              matching: q.answers.map((a) => ({
                option: a.option || "",
                answer: a.answer || "",
              })),
              choices: [],
            };
          }
          if (q.type === "Rating Scale") {
            return {
              question: q.question,
              type: q.type,
              ratingRange: {
                min: q.ratingRange?.min || 1,
                max: q.ratingRange?.max || 10,
              },
              highScoreLabel: q.highScoreLabel || "",
              lowScoreLabel: q.lowScoreLabel || "",
              choices: [], // Empty choices for rating
              matching: [], // Empty matching for rating
              blanks: [], // Empty blanks for rating
            };
          }
          // Handle regular questions
          return {
            question: q.question,
            type: q.type,
            choices: q.answers.map((a) => ({
              text: a.answer,
            })),
          };
        }),
      };
      
       // Log the data being sent to the backend
    console.log("Data being sent to the backend:", dataToSend);

      // if (pollToEdit) {
      //   const response = await axios.put(
      //     `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/update-poll/${pollToEdit._id}`,
      //     dataToSend
      //   );
      //   if (response.status === 200) {
      //     setPolls(response.data);
      //     toast.success("Poll updated successfully");
      //   }
      // } else {
        
      //   const response = await axios.post(
      //     `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/create/poll`,
      //     dataToSend
      //   );

      //   if (response.status === 201) {
      //     setPolls(response.data.polls);
      //     toast.success("Poll created successfully");
      //   }
      // }

      // onClose(); // Close the modal
    } catch (error) {
      console.error("Error saving the poll:", error);
      toast.error("Error saving the poll");
    }
  };

  // console.log("new poll", newPoll);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl h-[90%] overflow-y-scroll">
        <HeadingBlue25px children={pollToEdit ? "Edit Poll" : "Add Poll"} />
        <div className="pt-5">
          <InputField
            label="Title"
            type="text"
            value={newPoll.pollName}
            onChange={(e) =>
              setNewPoll({ ...newPoll, pollName: e.target.value })
            }
          />
        </div>
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            checked={newPoll.isActive}
            onChange={(e) =>
              setNewPoll({ ...newPoll, isActive: e.target.checked })
            }
          />
          <FormDropdownLabel children="Active" className="ml-2 " />
        </div>
        <div className="bg-[#f3f3f3] -mx-6 p-6 mt-3">
          {newPoll?.questions?.map((question, qIndex) => (
            <div key={qIndex} className="mt-4 ">
              <div className="flex justify-between items-center">
                <FormDropdownLabel
                  children={`${qIndex + 1}. Type your question`}
                />
                <IoTrashSharp
                  className="bg-custom-orange-1 text-white p-2 text-3xl rounded-xl cursor-pointer"
                  onClick={() => removeQuestion(qIndex)}
                />
              </div>
              <textarea
                className="w-full mt-2 p-2 border-[0.5px] border-custom-dark-blue-1 bg-white rounded-xl"
                value={question.question}
                onChange={(e) =>
                  updateQuestion(qIndex, "question", e.target.value)
                }
              />
              {/* <div className="flex items-center mt-2 pl-5">
                <input
                  type="radio"
                  name={`type-${qIndex}`}
                  checked={question.type === "Single Choice"}
                  onChange={() =>
                    updateQuestion(qIndex, "type", "Single Choice")
                  }
                />
                <FormDropdownLabel children="Single Choice" className="ml-2" />
                <input
                  type="radio"
                  name={`type-${qIndex}`}
                  className="ml-4"
                  checked={question.type === "Multiple Choice"}
                  onChange={() =>
                    updateQuestion(qIndex, "type", "Multiple Choice")
                  }
                />
                <FormDropdownLabel
                  children="Multiple Choice"
                  className="ml-2"
                />
              </div> */}
              {question?.type === "Fill in the Blank" ? (
                <div className="mt-2">
                  {question?.answers?.map((answer, aIndex) => (
                    <div
                      key={aIndex}
                      className="flex justify-between items-center mt-2 w-full"
                    >
                      <div className="flex-grow">
                        <InputField
                          label={`Blank ${aIndex + 1}`}
                          type="text"
                          value={answer.answer || ""}
                          onChange={(e) =>
                            updateAnswer(
                              qIndex,
                              aIndex,
                              "answer",
                              e.target.value
                            )
                          }
                          placeholder={`Enter text for blank ${aIndex + 1}`}
                        />
                      </div>
                      {question.answers.length > 1 && (
                        <FiMinus
                          className="bg-custom-red text-white p-0.5 font-bold rounded-xl cursor-pointer ml-3"
                          onClick={() => removeAnswer(qIndex, aIndex)}
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex justify-start mt-2">
                    <Button
                      type="button"
                      variant="save"
                      children="Add Blank"
                      className="py-1 px-5 shadow-[0px_3px_6px_#09828F69] rounded-xl"
                      icon={<GoPlus />}
                      onClick={() => addAnswer(qIndex)}
                    />
                  </div>
                </div>
              ) : question?.type === "Short Answer" ||
                question?.type === "Long Answer" ? (
                <div className="mt-2">
                  <div className="flex gap-4">
                    <InputField
                      label="Minimum Length"
                      type="number"
                      value={question.minLength || 1}
                      onChange={(e) =>
                        updateQuestion(
                          qIndex,
                          "minLength",
                          parseInt(e.target.value)
                        )
                      }
                    />
                    <InputField
                      label="Maximum Length"
                      type="number"
                      value={
                        question.maxLength ||
                        (question.type === "Long Answer" ? 1000 : 200)
                      }
                      onChange={(e) =>
                        updateQuestion(
                          qIndex,
                          "maxLength",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
              ) : question?.type === "Rating Scale" ? (
                <div className="mt-2">
                  <div className="flex gap-4">
                    <InputField
                      label="Minimum Rating"
                      type="number"
                      value={question.ratingRange?.min || 1}
                      onChange={(e) =>
                        updateQuestion(qIndex, "ratingRange", {
                          ...question.ratingRange,
                          min: parseInt(e.target.value),
                        })
                      }
                    />
                    <InputField
                      label="Maximum Rating"
                      type="number"
                      value={question.ratingRange?.max || 10}
                      onChange={(e) =>
                        updateQuestion(qIndex, "ratingRange", {
                          ...question.ratingRange,
                          max: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-4 mt-2">
                    <InputField
                      label="Low Score Label"
                      type="text"
                      value={question.lowScoreLabel || ""}
                      onChange={(e) =>
                        updateQuestion(qIndex, "lowScoreLabel", e.target.value)
                      }
                      placeholder="e.g., Poor"
                    />
                    <InputField
                      label="High Score Label"
                      type="text"
                      value={question.highScoreLabel || ""}
                      onChange={(e) =>
                        updateQuestion(qIndex, "highScoreLabel", e.target.value)
                      }
                      placeholder="e.g., Excellent"
                    />
                  </div>
                </div>
              ) : question?.type === "Matching" ? (
                <div className="mt-2">
                  {question?.answers?.map((pair, aIndex) => (
                    <div
                      key={aIndex}
                      className="flex justify-between items-center mt-2 w-full gap-4"
                    >
                      <div className="flex-grow">
                        <InputField
                          label={`Option ${aIndex + 1}`}
                          type="text"
                          value={pair.option || ""}
                          onChange={(e) =>
                            updateAnswer(
                              qIndex,
                              aIndex,
                              "option",
                              e.target.value
                            )
                          }
                          placeholder={`Enter option ${aIndex + 1}`}
                        />
                      </div>
                      <div className="flex-grow">
                        <InputField
                          label={`Answer ${aIndex + 1}`}
                          type="text"
                          value={pair.answer || ""}
                          onChange={(e) =>
                            updateAnswer(
                              qIndex,
                              aIndex,
                              "answer",
                              e.target.value
                            )
                          }
                          placeholder={`Enter answer ${aIndex + 1}`}
                        />
                      </div>
                      {question.answers.length > 2 && (
                        <FiMinus
                          className="bg-custom-red text-white p-0.5 font-bold rounded-xl cursor-pointer ml-3"
                          onClick={() => removeAnswer(qIndex, aIndex)}
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex justify-start mt-2">
                    <Button
                      type="button"
                      variant="save"
                      children="Add Matching Pair"
                      className="py-1 px-5 shadow-[0px_3px_6px_#09828F69] rounded-xl"
                      icon={<GoPlus />}
                      onClick={() => addAnswer(qIndex)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {question?.answers?.map((answer, aIndex) => (
                    <div
                      key={aIndex}
                      className="flex justify-between items-center mt-2 w-full"
                    >
                      <div className="flex-grow">
                        <InputField
                          label={`Answer ${aIndex + 1}`}
                          type="text"
                          value={answer.answer || ""}
                          onChange={(e) =>
                            updateAnswer(
                              qIndex,
                              aIndex,
                              "answer",
                              e.target.value
                            )
                          }
                          placeholder={`Enter answer ${aIndex + 1}`}
                        />
                      </div>
                      {question.answers.length > 2 && (
                        <FiMinus
                          className="bg-custom-red text-white p-0.5 font-bold rounded-xl cursor-pointer ml-3"
                          onClick={() => removeAnswer(qIndex, aIndex)}
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex justify-start mt-2">
                    <Button
                      type="button"
                      variant="save"
                      children="Add Answer"
                      className="py-1 px-5 shadow-[0px_3px_6px_#09828F69] rounded-xl"
                      icon={<GoPlus />}
                      onClick={() => addAnswer(qIndex)}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-5 items-center">
          <div>
            <Button
              type="button"
              variant="save"
              children="Add Question"
              className="py-1 px-5 shadow-[0px_3px_6px_#09828F69] rounded-xl"
              icon={<GoPlus />}
              onClick={addQuestion}
            />
          </div>
          <div className="flex justify-end gap-5 ">
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
              children={pollToEdit ? "Save" : "Add"}
              className="px-5 py-1 rounded-xl"
              onClick={handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPollModal;
