import React from 'react'

const TabNavigation = ({activeTab, handleTabChange, }) => {
  return (
    <div className="flex justify-around space-x-10 overflow-x-auto border-b">
            <button
              className={`py-2 border-custom-dark-blue-1 ${
                activeTab === "Meetings" ? "border-b-2 " : "opacity-25"
              }`}
              onClick={() => handleTabChange("Meetings")}
            >
              Meetings
            </button>
            <button
              className={`py-2 border-custom-dark-blue-1 ${
                activeTab === "Project Team" ? "border-b-2 " : "opacity-25"
              }`}
              onClick={() => handleTabChange("Project Team")}
            >
              Project Team
            </button>
            <button
              className={`py-2 border-custom-dark-blue-1 ${
                activeTab === "Polls" ? "border-b-2 " : "opacity-25"
              }`}
              onClick={() => handleTabChange("Polls")}
            >
              Polls
            </button>
            <button
              className={`py-2 border-custom-dark-blue-1 ${
                activeTab === "Files" ? "border-b-2 " : "opacity-25"
              }`}
              onClick={() => handleTabChange("Files")}
            >
              Files
            </button>
          </div>
  )
}

export default TabNavigation
