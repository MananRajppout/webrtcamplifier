import Button from "@/components/shared/button";
import Dropdown from "@/components/shared/Dropdown";
import FormDropdownLabel from "@/components/shared/FormDropdownLabel";
import InputField from "@/components/shared/InputField";
import { timeZone } from "@/constant/Index";
import { generatePasscode } from "@/utils/generatePasscode";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCircle } from "react-icons/fa";

const AddMeetingModal = ({ onClose, project, user, refetchMeetings, meetingToEdit = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    timeZone: "UTC-12:00 International Date Line West",
    duration: "",
    ongoing: false,
    enableBreakoutRoom: false,
    moderator: [],
    status: "Draft",
  });
  const [selectedTimeZone, setSelectedTimeZone] = useState(
    formData.timeZone || "UTC-12:00 International Date Line West"
  );
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Populate form data if editing
  useEffect(() => {
    if (isEditing && meetingToEdit) {
      setFormData({
        id: meetingToEdit._id || "",
        title: meetingToEdit.title || "",
        description: meetingToEdit.description || "",
        startDate: meetingToEdit.startDate?.split('T')[0] || "",
        startTime: meetingToEdit.startTime || "",
        timeZone: meetingToEdit.timeZone || "UTC-12:00 International Date Line West",
        duration: meetingToEdit.duration || "",
        ongoing: meetingToEdit.ongoing || false,
        enableBreakoutRoom: meetingToEdit.enableBreakoutRoom || false,
        moderator: meetingToEdit.moderator || [],
        status: meetingToEdit.status || "Draft",
      });
      setSelectedTimeZone(meetingToEdit.timeZone);
    }
  }, [isEditing, meetingToEdit]);


  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-all/contact/${user._id}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.statusText}`);
      }
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      alert(
        `Error fetching contacts: ${error.message}. Please try again later.`
      );
    } finally {
      setIsLoading(false);
    }
  };
  // Function to refresh the passcode
  const refreshPasscode = () => {
    const newPasscode = generatePasscode();
    setFormData((prevFormData) => ({
      ...prevFormData,
      meetingPasscode: newPasscode,
    }));
  };

  // Automatically generate passcode when the component mounts or when the start date changes
  useEffect(() => {
    if (!formData.meetingPasscode) {
      refreshPasscode();
    }
  }, [formData.startDate]);

  // Update formData when time zone is selected
  const handleTimeZoneSelect = (selectedTimeZone) => {
    setSelectedTimeZone(selectedTimeZone);
    setFormData((prevFormData) => ({
      ...prevFormData,
      timeZone: selectedTimeZone,
    }));
  };

  // Update formData for other input fields
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle moderator multi-select
    if (name === "moderator") {
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
      setFormData(prevFormData => ({
        ...prevFormData,
        moderator: [...prevFormData.moderator, ...selectedOptions.filter(id => !prevFormData.moderator.includes(id))]
    }));
      return;
    }

    // Rest of your existing handleInputChange logic...
    if (name === "duration") {
      if (value === "" || /^[1-9]\d*$/.test(value)) {
        setFormData(prevFormData => ({
          ...prevFormData,
          [name]: value,
        }));
      }
    } else {
      setFormData(prevFormData => ({
        ...prevFormData,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

// Validation logic

    // Validation logic
    if (!formData.ongoing) { // Check if ongoing is not selected
      if (!formData.startDate || !formData.startTime) {
          toast.error("Start Date and Start Time are required unless 'Ongoing/TBD' is checked.");
          return;
      }
  }

if (!formData.duration) {
  toast.error("Duration is required.");
  return;
}

    const updatedFormData = {
      ...formData,
      projectId: project._id,
    };

    console.log('form data', updatedFormData)

    // try {
    //   const url = isEditing 
    //     ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/edit-meeting`
    //     : `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/create/meeting`;

    //   const method = isEditing ? 'put' : 'post';

    //   const response = await axios[method](url, updatedFormData);

    //   if (response.status === (isEditing ? 200 : 201)) {
    //     refetchMeetings();
    //     toast.success(`Meeting ${isEditing ? 'updated' : 'created'} successfully`);
    //     onClose();
    //   }
    // } catch (error) {
    //   console.error(`Error ${isEditing ? 'updating' : 'creating'} meeting:`, error);
    //   toast.error(`${error.response?.data?.error || 'An error occurred'}`);
    // }
  };

  return (
    <div className="fixed top-0 inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 ">
      <div className="bg-white rounded-lg w-[600px] max-w-2xl  ">
        <h3 className="text-2xl text-custom-dark-blue-2 font-semibold mx-10 py-5 leading-[3.75rem] md:leading-8">
        {isEditing ? 'Edit Meeting' : 'Add New Meeting'}
        </h3>

        <div className="px-5 space-y-2 ">
          <div className="flex justify-start items-center gap-5">
            <InputField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Meeting Title"
            />
            <div className="mb-4 sm:mb-0">
              <label
                htmlFor="moderator"
                className="block sm:text-sm font-semibold mb-2 text-sm text-black"
              >
                Moderators
              </label>
              <select
                name="moderator"
                id="moderator"
                multiple
                value={formData.moderator}
                onChange={handleInputChange}
                className="px-4 py-2 sm:py-2 border border-[#000000] rounded-lg flex items-center justify-between w-full text-custom-dark-blue-1 z-50"
              >
                <option value="">Select Moderator</option>
                {contacts.map((contact, index) => (
                  <option key={index} value={contact._id}>
                    {contact.firstName} {contact.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <InputField
            label="Description"
            placeholder="Write Description"
            className="w-full"
            name="description"
            type="text"
            value={formData.description}
            onChange={handleInputChange}
          />
          <div>
            <div className="flex justify-start items-start gap-5 flex-col md:flex-row">
              <div>
                <p className="block text-sm font-semibold mb-2">Start Date/Time</p>
                <div className="flex items-center">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-[0.5px] rounded-lg focus:outline-none border-black"
                  />
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-[0.5px] rounded-lg focus:outline-none ml-2 border-black"
                  />
                </div>
              </div>
            </div>
            <div>
              <FormDropdownLabel className="mb-2 z-50 mt-3">
                Time Zone
              </FormDropdownLabel>
              <Dropdown
                options={timeZone}
                selectedOption={selectedTimeZone}
                onSelect={handleTimeZoneSelect}
                className="w-full z-20"
              />
            </div>
            <div className="flex justify-start items-end gap-5 mt-1">
              <InputField
                label="Duration (in minutes)"
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full"
                min="1"
              />
              <div className="hidden justify-start items-center gap-2 md:flex">
                <input
                  type="checkbox"
                  name="ongoing"
                  checked={formData.ongoing}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="ongoing" className="text-sm font-semibold">
                  Ongoing/TBD
                </label>
              </div>
              <div className="hidden justify-start items-center gap-2 md:flex">
                <input
                  type="checkbox"
                  name="enableBreakoutRoom"
                  checked={formData.enableBreakoutRoom}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label
                  htmlFor="enableBreakoutRoom"
                  className="text-sm font-semibold"
                >
                  Breakout Room
                </label>
              </div>
            </div>
            <div className="flex justify-between mb-2 md:hidden">
              <div className="flex justify-start items-center gap-2">
                <input
                  type="checkbox"
                  name="ongoing"
                  checked={formData.ongoing}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="ongoing" className="text-sm font-semibold">
                  Ongoing/TBD
                </label>
              </div>
              <div className="flex justify-start items-center gap-2">
                <input
                  type="checkbox"
                  name="enableBreakoutRoom"
                  checked={formData.enableBreakoutRoom}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label
                  htmlFor="enableBreakoutRoom"
                  className="text-sm font-semibold"
                >
                  Breakout Room
                </label>
              </div>
            </div>
            {/* <div className="flex justify-start items-end gap-5 ">
              <InputField
                label="Passcode"
                name="meetingPasscode"
                type="text"
                value={formData.meetingPasscode}
                onChange={handleInputChange}
                className="w-full"
              />
              <div
                className="flex justify-start items-center gap-2 cursor-pointer"
                onClick={refreshPasscode}
              >
                <FaCircle />
                <p>Refresh</p>
              </div>
            </div> */}
          </div>
          <div className="flex justify-center items-center gap-5  pb-8">
            <Button
              onClick={onClose}
              variant="primary"
              type="submit"
              children="Close"
              className="px-5 py-1 rounded-xl"
            />
            <Button
              onClick={handleSubmit}
              variant="primary"
              type="submit"
              children="Save"
              className="px-5 py-1 rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMeetingModal;
