import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaFilter } from "react-icons/fa";

const ProjectFilter = ({ onFilter }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [tag, setTag] = useState("");

  const statusOptions = ["Draft", "Active", "Complete", "Inactive", "Closed"];
  const roleOptions = ["All", "Admin", "Moderator", "Observer"];

  useEffect(() => {
    const filters = {
      startDate: startDate ? startDate.toISOString().split("T")[0] : "",
      endDate: endDate ? endDate.toISOString().split("T")[0] : "",
      status,
      role,
      tag,
    };
    onFilter(filters);
  }, [startDate, endDate, status, role, tag]);

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setStatus("");
    setRole("");
    setTag("");
  };

  return (
    <div className="p-4 bg-white border-2 shadow">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <FaFilter className="text-gray-500" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-custom-teal focus:ring-custom-teal text-sm pl-2 py-1 bg-[#eaeaea]"
            />
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-custom-teal focus:ring-custom-teal text-sm pl-2 py-1 bg-[#eaeaea]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-custom-teal focus:ring-custom-teal text-sm p-1 bg-[#eaeaea]"
            >
              <option value="">All</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-custom-teal focus:ring-custom-teal text-sm p-1 bg-[#eaeaea]"
            >
              {roleOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-custom-teal focus:ring-custom-teal text-sm pl-2 py-1 bg-[#eaeaea]"
            />
          </div>
        </div>

        <button
          onClick={handleClear}
          className="text-custom-teal text-sm hover:underline font-bold underline cursor-pointer whitespace-nowrap"
        >
          Clear Filter
        </button>
      </div>
    </div>
  );
};

export default ProjectFilter;
