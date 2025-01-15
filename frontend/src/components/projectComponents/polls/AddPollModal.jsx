import Button from "@/components/shared/button";
import HeadingBlue25px from "@/components/shared/HeadingBlue25px";
import InputField from "@/components/shared/InputField";
import { useGlobalContext } from "@/context/GlobalContext";
import axios from "axios";
import React, {  useState } from "react";
import toast from "react-hot-toast";
import { FiMinus } from "react-icons/fi";
import { GoPlus } from "react-icons/go";

const AddPollModal = ({
  onClose,
  pollToEdit,
  project,
  fetchPolls
}) => {
  const [title, setTitle] = useState("");
  const { user } = useGlobalContext();
  const [questions, setQuestions] = useState([
    {
      question: "",
      type: "Single Choice",
      choices: [{ text: "" }],
      minLength: 1,
      maxLength: 200,
      blanks: [""],
    },
  ]);

  const questionTypes = [
    "Single Choice",
    "Multiple Choice",
    "Short Answer",
    "Long Answer",
    "Fill in the Blank",
    "Rating Scale",
    "Matching",
    "Rank Order",
  ];
  // matching, rank order,
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        type: "Single Choice",
        choices: [{ text: "" }],
        minLength: 1,
        maxLength: 200,
        blanks: [""],
        matching: [],
      },
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = questions.map((q, i) => {
      if (i === index) {
        const updatedQuestion = { ...q, [field]: value };
        if (field === "type") {
          // Reset fields based on the new type
          switch (value) {
            case "Matching":
              updatedQuestion.matching = [{ option: "", answer: "" }];
              updatedQuestion.choices = [];
              updatedQuestion.minLength = undefined;
              updatedQuestion.maxLength = undefined;
              updatedQuestion.blanks = undefined;
              break;
            case "Rank Order":
              updatedQuestion.choices = [{ text: "" }];
              updatedQuestion.matching = undefined;
              updatedQuestion.minLength = undefined;
              updatedQuestion.maxLength = undefined;
              updatedQuestion.blanks = undefined;
              break;
            case "Fill in the Blank":
              updatedQuestion.blanks = [""];
              updatedQuestion.choices = undefined;
              updatedQuestion.matching = undefined;
              updatedQuestion.minLength = undefined;
              updatedQuestion.maxLength = undefined;
              break;
            case "Short Answer":
            case "Long Answer":
              updatedQuestion.minLength = 1;
              updatedQuestion.maxLength = 200;
              updatedQuestion.choices = undefined;
              updatedQuestion.matching = undefined;
              updatedQuestion.blanks = undefined;
              break;
            case "Single Choice":
            case "Multiple Choice":
              updatedQuestion.choices = [{ text: "" }];
              updatedQuestion.matching = undefined;
              updatedQuestion.minLength = undefined;
              updatedQuestion.maxLength = undefined;
              updatedQuestion.blanks = undefined;
              break;
            default:
              break;
          }
        }
        return updatedQuestion;
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };
  

  const addChoice = (qIndex) => {
    const updatedQuestions = questions.map((q, i) =>
      i === qIndex ? { ...q, choices: [...q.choices, { text: "" }] } : q
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

  const removeChoice = (qIndex, cIndex) => {
    const updatedQuestions = questions.map((q, i) =>
      i === qIndex
        ? { ...q, choices: q.choices.filter((_, j) => j !== cIndex) }
        : q
    );
    setQuestions(updatedQuestions);
  };

  const addBlank = (qIndex) => {
    const updatedQuestions = questions.map((q, i) =>
      i === qIndex ? { ...q, blanks: [...q.blanks, ""] } : q
    );
    setQuestions(updatedQuestions);
  };

  const updateBlank = (qIndex, bIndex, value) => {
    const updatedQuestions = questions.map((q, i) =>
      i === qIndex
        ? {
            ...q,
            blanks: q.blanks.map((b, j) => (j === bIndex ? value : b)),
          }
        : q
    );
    setQuestions(updatedQuestions);
  };

  const handleSave = async () => {
    if (!title || questions.some((q) => !q.question)) {
      toast.error("Please fill in all questions and the title.");
      return;
    }

    const dataToSend = {
      title,
      createdById: user._id,
      projectId: project._id,
      questions: questions.map((q) => {
        const baseQuestion = { question: q.question, type: q.type };
        switch (q.type) {
          case "Single Choice":
          case "Multiple Choice":
            return {
              ...baseQuestion,
              choices: q.choices.map((c) => ({ text: c.text })),
            };
          case "Short Answer":
          case "Long Answer":
            return {
              ...baseQuestion,
              minLength: q.minLength,
              maxLength: q.maxLength,
            };
          case "Fill in the Blank":
            return {
              ...baseQuestion,
              blanks: q.blanks,
            };
          case "Rating Scale":
            return {
              ...baseQuestion,
              ratingRange: { min: q.minLength, max: q.maxLength },
              lowScoreLabel: q.lowScoreLabel,
              highScoreLabel: q.highScoreLabel,
            };
          case "Matching":
            return {
              ...baseQuestion,
              matching: q.matching.map((m) => ({
                option: m.option,
                answer: m.answer,
              })),
            };
          case "Rank Order":
            return {
              ...baseQuestion,
              choices: q.choices.map((c) => ({ text: c.text })),
            };
          default:
            return baseQuestion;
        }
      }),
    };

    if (pollToEdit) {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/update-poll/${pollToEdit._id}`,
        dataToSend
      );
      if (response.status === 200) {
        fetchPolls()
        toast.success("Poll updated successfully");
      }
    } else {
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/create/poll`,
        dataToSend
      );


      if (response.status === 201) {
        fetchPolls()
        toast.success("Poll created successfully");
      }
    }

    onClose();
  };

  const updateMatching = (qIndex, mIndex, field, value) => {
    const updatedQuestions = questions.map((q, i) =>
      i === qIndex
        ? {
            ...q,
            matching: q.matching.map((m, j) =>
              j === mIndex ? { ...m, [field]: value } : m
            ),
          }
        : q
    );
    setQuestions(updatedQuestions);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <HeadingBlue25px children="Add Poll" />
        <InputField
          label="Poll Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="mt-4 border-b pb-4">
            <InputField
              label={`Question ${qIndex + 1}`}
              type="text"
              value={q.question}
              onChange={(e) =>
                updateQuestion(qIndex, "question", e.target.value)
              }
            />
            <label className="block font-semibold mt-2">Question Type</label>
            <select
              className="border p-2 rounded w-full"
              value={q.type}
              onChange={(e) => updateQuestion(qIndex, "type", e.target.value)}
            >
              {questionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {q.type === "Single Choice" || q.type === "Multiple Choice" ? (
              <div className="mt-2">
                <label className="block font-semibold">Choices</label>
                {q.choices.map((choice, cIndex) => (
                  <div key={cIndex} className="flex items-center mt-2">
                    <InputField
                      label={`Choice ${cIndex + 1}`}
                      type="text"
                      value={choice.text}
                      onChange={(e) =>
                        updateChoice(qIndex, cIndex, e.target.value)
                      }
                    />
                    <FiMinus
                      className="ml-2 text-red-500 cursor-pointer"
                      onClick={() => removeChoice(qIndex, cIndex)}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="save"
                  children="Add Choice"
                  icon={<GoPlus />}
                  className="rounded-lg px-3 py-2"
                  onClick={() => addChoice(qIndex)}
                />
              </div>
            ) : null}

            {q.type === "Fill in the Blank" && (
              <div className="mt-2">
                <label className="block font-semibold">Blanks</label>
                {q.blanks.map((blank, bIndex) => (
                  <InputField
                    key={bIndex}
                    label={`Blank ${bIndex + 1}`}
                    type="text"
                    value={blank}
                    onChange={(e) =>
                      updateBlank(qIndex, bIndex, e.target.value)
                    }
                  />
                ))}
                <Button
                  type="button"
                  variant="save"
                  children="Add Blank"
                  className="rounded-lg px-3 py-2"
                  icon={<GoPlus />}
                  onClick={() => addBlank(qIndex)}
                />
              </div>
            )}

            {(q.type === "Short Answer" || q.type === "Long Answer") && (
              <div className="mt-2">
                <InputField
                  label="Min Length"
                  type="number"
                  value={q.minLength}
                  onChange={(e) =>
                    updateQuestion(qIndex, "minLength", e.target.value)
                  }
                  min={1}
                />
                <InputField
                  label="Max Length"
                  type="number"
                  value={q.maxLength}
                  onChange={(e) =>
                    updateQuestion(qIndex, "maxLength", e.target.value)
                  }
                  min={1}
                />
              </div>
            )}

            {q.type === "Rating Scale" && (
              <div className="mt-2">
                <InputField
                  label="Low Score Label"
                  type="text"
                  value={q.lowScoreLabel}
                  onChange={(e) =>
                    updateQuestion(qIndex, "lowScoreLabel", e.target.value)
                  }
                />
                <InputField
                  label="High Score Label"
                  type="text"
                  value={q.highScoreLabel}
                  onChange={(e) =>
                    updateQuestion(qIndex, "highScoreLabel", e.target.value)
                  }
                />
                <InputField
                  label="Min Score"
                  type="number"
                  value={q.minLength}
                  onChange={(e) =>
                    updateQuestion(qIndex, "minLength", e.target.value)
                  }
                />
                <InputField
                  label="Max Score"
                  type="number"
                  value={q.maxLength}
                  onChange={(e) =>
                    updateQuestion(qIndex, "maxLength", e.target.value)
                  }
                />
              </div>
            )}

{q.type === "Matching" && q.matching && (
  <div className="mt-2">
    <label className="block font-semibold">Matching Pairs</label>
    {q.matching.map((pair, mIndex) => (
      <div
        key={mIndex}
        className="flex justify-between items-center mt-2"
      >
        <InputField
          label={`Option ${mIndex + 1}`}
          type="text"
          value={pair.option}
          onChange={(e) =>
            updateMatching(qIndex, mIndex, "option", e.target.value)
          }
        />
        <InputField
          label={`Answer ${mIndex + 1}`}
          type="text"
          value={pair.answer}
          onChange={(e) =>
            updateMatching(qIndex, mIndex, "answer", e.target.value)
          }
        />
      </div>
    ))}
    <Button
      type="button"
      variant="save"
      children="Add Matching Pair"
      icon={<GoPlus />}
      className="rounded-lg px-3 py-2"
      onClick={() => {
        const updatedQuestions = questions.map((q, i) =>
          i === qIndex
            ? {
                ...q,
                matching: [...q.matching, { option: "", answer: "" }],
              }
            : q
        );
        setQuestions(updatedQuestions);
      }}
    />
  </div>
)}


            {q.type === "Rank Order" && (
              <div className="mt-2">
                <label className="block font-semibold">Choices</label>
                {q.choices.map((choice, cIndex) => (
                  <div key={cIndex} className="flex items-center mt-2">
                    <InputField
                      label={`Choice ${cIndex + 1}`}
                      type="text"
                      value={choice.text}
                      onChange={(e) =>
                        updateChoice(qIndex, cIndex, e.target.value)
                      }
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="save"
                  children="Add Choice"
                  icon={<GoPlus />}
                  className="rounded-lg px-3 py-2"
                  onClick={() => addChoice(qIndex)}
                />
              </div>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="save"
          children="Add Question"
          className="rounded-lg px-3 py-2"
          icon={<GoPlus />}
          onClick={addQuestion}
        />

        <div className="flex justify-end gap-5 mt-5">
          <Button
            type="button"
            variant="cancel"
            children="Cancel"
            className="rounded-lg px-3 py-2"
            onClick={onClose}
          />
          <Button
            type="button"
            variant="save"
            children="Save"
            className="rounded-lg px-3 py-2"
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default AddPollModal;
