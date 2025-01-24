"use client";
import Button from "@/components/shared/button";
import HeadingBlue25px from "@/components/shared/HeadingBlue25px";
import InputField from "@/components/shared/InputField";
import { useGlobalContext } from "@/context/GlobalContext";
import { generatePasscode } from "@/utils/generatePasscode";
import React, { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const CreateProjectByAmplifyAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    projectPasscode: "",
    createdBy: "",
    tags: [],
    status: "",
  });
  const { user } = useGlobalContext()
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()
  // Function to refresh the passcode
  const refreshPasscode = () => {
    const newPasscode = generatePasscode();
    setFormData((prevFormData) => ({
      ...prevFormData,
      projectPasscode: newPasscode,
    }));
  };

  // Automatically generate passcode when the component mounts or when the end date changes
  useEffect(() => {
    if (!formData.projectPasscode) {
      refreshPasscode();
    }
  }, [formData.endDate]);

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 5); // Add 5 years to the current year
  const maxDateString = maxDate.toISOString().split("T")[0];

  // Handle invalid date selection
  const handleInvalidDate = (selectedDate, fieldName) => {
    if (selectedDate < today) {
      toast.error(`${fieldName} cannot be earlier than today!`);
      return true;
    }
    return false;
  };

   // Handle form submission
   const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.description || !formData.startDate) {
      toast.error("Name, Description, and Start Date are required!");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the payload
      const payload = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        projectPasscode: formData.projectPasscode,
        status: "Active",
        createdBy: user._id,
      };
      // Send POST request to API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/create-project-by-amplify-admin`,
        payload
      );

      if (response.status === 201) {
        toast.success("Project created successfully!");
        router.push("/dashboard/project")
      } else {
        toast.error("Failed to create project. Please try again!");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("An error occurred while creating the project.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="my_profile_main_section_shadow bg-[#fafafb] bg-opacity-90 h-full min-h-screen pb-10">
      <div className="bg-white py-5 w-full">
        <div className="md:px-10 flex justify-around md:justify-between items-center w-full">
          <div>
            <p className="text-custom-teal text-2xl font-bold text-center">
              New Project
            </p>
          </div>
        </div>
      </div>

      <div className="flex-grow mx-auto pt-5 md:px-10 ">
        <div className="px-5">
          <HeadingBlue25px children="General Information" />
          {/* form items container div */}
          <div className="pt-3 w-full md:w-1/2 space-y-5 ">
            {/* container for name and moderator */}

            <div className="w-full">
              <InputField
                label="Name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className=" w-full">
              <InputField
                label="Description"
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <p className="block text-sm font-semibold mb-2">
                Fieldwork Start Date
              </p>
              <div className="flex items-center">
                <input
                  type="date"
                  value={formData.startDate}
                  min={today} // Disable earlier dates
                  max={maxDateString}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    if (!handleInvalidDate(selectedDate, "Start Date")) {
                      setFormData({ ...formData, startDate: selectedDate });
                    }
                  }}
                  className="w-full px-4 py-2 border-[0.5px] rounded-lg focus:outline-none border-black"
                />
              </div>
            </div>

            {/* passcode */}
            <div className="w-full flex justify-start items-end gap-2">
              <InputField
                label="Passcode"
                value={formData.projectPasscode}
                onChange={(e) =>
                  setFormData({ ...formData, projectPasscode: e.target.value })
                }
                type="text"
                name="passcode"
              />
              <div
                className="flex justify-start items-center gap-2"
                onClick={refreshPasscode}
              >
                <FaCircle />
                <p>Refresh Passcode</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Button
          children={isLoading ? "Saving" : "Save"}
          variant={isLoading ? "closed" : "primary"}
          className="px-4 py-2 rounded-lg"
          onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateProjectByAmplifyAdmin;
