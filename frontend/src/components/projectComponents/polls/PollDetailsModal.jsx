import Button from "@/components/shared/button";

const PollDetailsModal = ({ poll, onClose }) => {
  console.log("poll", poll);
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center ">
      <div className="bg-white p-6 rounded-lg shadow-lg w-2/3 lg:w-1/2">
        <h2 className="text-xl font-bold mb-4 text-custom-dark-blue-1">
          {poll.pollName}
        </h2>

        <p className="text-custom-dark-blue-1">
          <strong>Total Questions:</strong> {poll.questions.length}
        </p>
        <div>
          {poll?.questions?.map((question, index) => (
            <div key={question._id} className="mt-4">
              <p>
                <strong>Question {index + 1}:</strong> {question.question}
              </p>
              <p className="py-1">
                <strong>Type:</strong> {question.type}
              </p>

              {/* Single/Multiple Choice Questions */}
              {["Single Choice", "Multiple Choice"].includes(question.type) &&
                question.choices && (
                  <>
                    <p>
                      <strong>Options:</strong>
                    </p>
                    <ul className="list-disc list-inside">
                      {question.choices.map((choice) => (
                        <li key={choice._id}>{choice.text}</li>
                      ))}
                    </ul>
                  </>
                )}

              {/* Matching Questions/Data */}
              {question.matching && question.matching.length > 0 && (
                <>
                  <p>
                    <strong>Matching Pairs:</strong>
                  </p>
                  <ul className="list-disc list-inside">
                    {question.matching.map((pair, idx) => (
                      <li key={idx || pair._id}>
                        {pair.option} ➔ {pair.answer}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Rank Order Questions */}
              {question.type === "Rank Order" &&
                question.choices &&
                question.choices.length > 0 && (
                  <>
                    <p>
                      <strong>Items to Rank:</strong>
                    </p>
                    <ul className="list-disc list-inside">
                      {question.choices.map((choice, idx) => (
                        <li key={choice._id || idx}>{choice.text}</li>
                      ))}
                    </ul>
                  </>
                )}

              {/* Rating Scale Questions */}
              {question.type === "Rating Scale" && question.ratingRange && (
                <>
                  <p>
                    <strong>Rating Scale:</strong>
                  </p>
                  <p>
                    Range: {question.ratingRange.min} to{" "}
                    {question.ratingRange.max}
                  </p>
                  {(question.lowScoreLable || question.highScoreLable) && (
                    <p>
                      {question.lowScoreLable &&
                        `Low: ${question.lowScoreLable}`}
                      {question.lowScoreLable &&
                        question.highScoreLable &&
                        " | "}
                      {question.highScoreLable &&
                        `High: ${question.highScoreLable}`}
                    </p>
                  )}
                </>
              )}

              {/* Fill in the Blank Questions */}
              {question.type === "Fill in the Blank" && question.blanks && (
                <>
                  <p>
                    <strong>Blanks:</strong>
                  </p>
                  <ul className="list-disc list-inside">
                    {question.blanks.map((blank, idx) => (
                      <li key={idx}>{blank}</li>
                    ))}
                  </ul>
                </>
              )}

              {/* Text-based Questions */}
              {["Short Answer", "Long Answer"].includes(question.type) && (
                <>
                  <p>
                    <strong>Answer Constraints:</strong>
                  </p>
                  {question.minLength && (
                    <p>Minimum length: {question.minLength} characters</p>
                  )}
                  {question.maxLength && (
                    <p>Maximum length: {question.maxLength} characters</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button
            children={"Close"}
            type="button"
            className=" font-semibold px-4 py-2 rounded-lg "
            variant="secondary"
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default PollDetailsModal;
