import React, { useEffect, useState } from "react";

const Step2 = ({ formData, updateFormData, uniqueId, setStepValid  }) => {
  const [sessions, setSessions] = useState([]);
  const [tempSession, setTempSession] = useState({ number: "", duration: "" });
  const [varyingLengths, setVaryingLengths] = useState(false);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);

  const durations = [
    "30 minutes",
    "45 minutes",
    "1 hour (60 minutes)",
    "1.25 hour (75 minutes)",
    "1.5 hour (90 minutes)",
    "2 hour (120 minutes)",
    "2.5 hour (150 minutes)",
    "3 hour (180+ minutes)",
  ];

  useEffect(() => {
    validateStep();
  }, [formData, sessions]);

  const validateStep = () => {
    const isValid =
      formData.market &&
      formData.language &&
      sessions.length > 0 &&
      sessions.every(
        (session) => session.number && session.duration
      );
    setStepValid(isValid); 
  };

  const handleNumSessionsChange = (e) => {
    setTempSession({ ...tempSession, number: e.target.value });
    if (e.target.value && tempSession.duration) {
      handleAddSession({
        number: e.target.value,
        duration: tempSession.duration,
      });
    }
  };

  const handleDurationChange = (e) => {
    setTempSession({ ...tempSession, duration: e.target.value });
    if (tempSession.number && e.target.value) {
      handleAddSession({
        number: tempSession.number,
        duration: e.target.value,
      });
    }
  };

  const handleAddSession = (sessionToAdd) => {
    if (sessionToAdd.number && sessionToAdd.duration) {
      let updatedSessions = [];

      if (varyingLengths) {
        updatedSessions = [...sessions, sessionToAdd];
      } else {
        updatedSessions = [sessionToAdd];
      }

      setSessions(updatedSessions);
      updateFormData({ sessions: updatedSessions });
      setTempSession({ number: "", duration: "" });
      setFieldsDisabled(true);
      setVaryingLengths(false);
    }
  };

  const handleRemoveSession = (index) => {
    const updatedSessions = sessions.filter((_, i) => i !== index);
    setSessions(updatedSessions);
    updateFormData({ sessions: updatedSessions });
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setVaryingLengths(checked);
    setFieldsDisabled(false);

    if (!checked && sessions.length > 1) {
      const updatedSessions = sessions.slice(0, 1);
      setSessions(updatedSessions);
      updateFormData({ sessions: updatedSessions });
    }
  };

  const handleMarketChange = (e) => {
    updateFormData({ market: e.target.value });
  };

  const handleOtherMarketName = (e) => {
    updateFormData({ otherMarket: e.target.value });
  };

  const handleLanguageChange = (e) => {
    updateFormData({ language: e.target.value });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Tell Us About Your Project</h2>

      {/* Respondent Market */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Respondent Market:</label>
        <select
          value={formData.market || ""}
          onChange={handleMarketChange}
          className="border p-2 rounded w-full"
        >
          <option value="">Select Market</option>
          <option value="us">USA</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Input field for Other Market */}
      {formData.market === "other" && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Specify Market Name:</label>
          <input
            type="text"
            value={formData.otherMarket || ""}
            onChange={handleOtherMarketName}
            placeholder="Enter market name"
            className="border p-2 rounded w-full"
          />
        </div>
      )}

      {/* Respondent Language */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Respondent Language:</label>
        <input
          type="text"
          value={formData.language || ""}
          onChange={handleLanguageChange}
          placeholder="Enter language"
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Number of Sessions */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Number of Sessions:</label>
        <input
          type="number"
          value={tempSession.number}
          onChange={handleNumSessionsChange}
          placeholder="Enter number of sessions"
          className="border p-2 rounded w-full"
          disabled={fieldsDisabled}
        />
      </div>

      {/* Duration */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Duration:</label>
        <select
          value={tempSession.duration}
          onChange={handleDurationChange}
          className="border p-2 rounded w-full"
          disabled={fieldsDisabled}
        >
          <option value="">Select Duration</option>
          {durations.map((duration) => (
            <option key={duration} value={duration}>
              {duration}
            </option>
          ))}
        </select>
      </div>

      {/* Varying Length Checkbox */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={varyingLengths}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          Check here if you have sessions of varying lengths
        </label>
      </div>

      {/* Display Added Sessions */}
      <ul className="mb-4">
        {sessions.map((session, index) => (
          <li
            key={index}
            className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded"
          >
            <span>
              {session.number} Sessions - {session.duration}
            </span>
            <button
              onClick={() => handleRemoveSession(index)}
              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

  
    </div>
  );
};

export default Step2;
