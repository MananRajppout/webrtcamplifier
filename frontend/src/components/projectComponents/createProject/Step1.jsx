import React from "react";

const Step1 = ({ formData, updateFormData, uniqueId }) => {
  const optionalAddOnServices = [
    "Top-Notch Recruiting",
    "Insight-Driven Moderation and Project Design",
    "Multi-Language Services",
    "Asynchronous Activities (Pretasks, Bulletin Boards, etc.)",
  ];

  const handleServiceChange = (value) => {
    updateFormData({
      service: value,
      addOns: value === "tier2" ? formData.addOns || [] : [],
    });
  };

  const handleCheckboxChange = (service) => {
    const updatedAddOns = formData.addOns || [];
    if (updatedAddOns.includes(service)) {
      updateFormData({
        addOns: updatedAddOns.filter((addOn) => addOn !== service),
      });
    } else {
      updateFormData({ addOns: [...updatedAddOns, service] });
    }
  };

  // const handleDateChange = (e) => {
  //   updateFormData({ firstDateOfStreaming: e.target.value });
  // };


  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate < today) {
      toast.error("You cannot select a past date!");
      return;
    }
    updateFormData({ firstDateOfStreaming: selectedDate });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <h2 className="text-custom-teal text-2xl font-bold mb-6 text-center">
        Choose Your Service
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tier 1 Card */}
        <div className="border p-6 rounded-lg shadow-md flex flex-col justify-between">
          <div>
            <label className="block">
              <input
                type="radio"
                name="service"
                value="tier1"
                checked={formData.service === "tier1"}
                onChange={() => handleServiceChange("tier1")}
                className="mr-2 cursor-pointer"
              />
              <h3 className="text-xl font-semibold text-custom-teal">
                Tier 1: Signature Platform Access
              </h3>
            </label>
            <p className="text-sm text-custom-dark-blue-1 mt-2">
              DIY Streaming using Amplify’s Virtual Backroom
            </p>
            <ul className="list-disc pl-6 mt-2 text-sm">
              <li>Amplify’s Virtual Backroom Platform Access</li>
              <li>Live Streaming</li>
              <li>Participant Chat</li>
              <li>Whiteboards</li>
              <li>Breakout Rooms</li>
              <li>Polling</li>
              <li>Observation Room</li>
              <li>Live observation with real-time observer and moderator chat</li>
              <li>Session Deliverables:</li>
              <ul className="list-circle pl-6">
                <li>Audio Recording</li>
                <li>Video Recording</li>
                <li>AI Transcripts</li>
                <li>Chat Transcripts</li>
                <li>Whiteboard & Poll Results</li>
              </ul>
            </ul>
          </div>
          {/* Calendar for Tier 1 */}
          <div className="mt-4">
            <label className="block mb-2 font-medium">First Date of Streaming:</label>
            <input
              type="date"
              value={formData.firstDateOfStreaming || ""}
              min={today} 
              onChange={handleDateChange}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* Tier 2 Card */}
        <div className="border p-6 rounded-lg shadow-md flex flex-col justify-between">
          <div>
            <label className="block">
              <input
                type="radio"
                name="service"
                value="tier2"
                checked={formData.service === "tier2"}
                onChange={() => handleServiceChange("tier2")}
                className="mr-2 cursor-pointer"
              />
              <h3 className="text-xl font-semibold text-custom-teal">
                Tier 2: Concierge Platform Access
              </h3>
            </label>
            <p className="text-sm text-custom-dark-blue-1 mt-2">
              Stream your sessions with the support of Amplify’s first-class team
            </p>
            <ul className="list-disc pl-6 mt-2 text-sm">
              <li>Everything in the Signature Platform Access, plus:</li>
              <ul className="list-disc pl-6">
                <li>Amplify’s Hosting and Project Support</li>
                <li>Hosted Session Check-In:</li>
                <ul className="list-disc pl-6">
                  <li>Test video and sound with each participant</li>
                  <li>Recommend lighting and camera adjustments as needed</li>
                  <li>Verify IDs upon request</li>
                  <li>Verify pre-session requirements (HW, items, etc.)</li>
                  <li>
                    Follow-up with missing participants by phone, email, or text
                  </li>
                </ul>
                <li>Continuous Meeting Monitoring:</li>
                <ul className="list-disc pl-6">
                  <li>
                    Tech Host monitors all sessions to help troubleshoot any
                    participant challenges and provide moderator and observer support
                  </li>
                </ul>
                <li>Amplify Project Support:</li>
                <ul className="list-disc pl-6">
                  <li>
                    Amplify’s project team is available to help with all project setup
                    and to provide backend platform assistance and support
                  </li>
                </ul>
              </ul>
              <li>Access to Optional Add-On Services:</li>
              <ul className="list-disc pl-6">
                {optionalAddOnServices.map((service) => (
                  <li key={service}>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        value={service}
                        checked={formData.addOns?.includes(service)}
                        onChange={() => handleCheckboxChange(service)}
                        className="mr-2 cursor-pointer"
                        disabled={formData.service !== "tier2"} // Disable if not tier2
                      />
                      {service}
                    </label>
                  </li>
                ))}
              </ul>
            </ul>
          </div>
          {/* Calendar for Tier 2 */}
          <div className="mt-4">
            <label className="block mb-2 font-medium">First Date of Streaming:</label>
            <input
              type="date"
              value={formData.firstDateOfStreaming || ""}
              min={today} 
              onChange={handleDateChange}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1;
