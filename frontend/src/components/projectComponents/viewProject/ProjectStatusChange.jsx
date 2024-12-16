import React from 'react'

const ProjectStatusChange = ({user, selectedStatus, handleStatusChange}) => {
  return (
    <div>
      {
        (user?.role === "SuperAdmin" || user?.role === "AmplifyAdmin") && (
          <div className="flex justify-end py-5">
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="border rounded-lg text-white font-semibold px-4  py-2 bg-custom-teal outline-none"
          >
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Complete">Complete</option>
            <option value="Inactive">Inactive</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        )
      }
    </div>
  )
}

export default ProjectStatusChange
