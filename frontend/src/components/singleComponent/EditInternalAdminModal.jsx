import React, { useState } from "react";
import InputField from "../shared/InputField";
import Button from "../shared/button";
import Heading20pxBlueUC from "../shared/Heading20pxBlueUC";
import { FaCheckCircle, FaCross } from "react-icons/fa";
import Dropdown from "../shared/Dropdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const EditInternalAdminModal = ({ onClose, currentAdmin, companies }) => {
  const [firstName, setFirstName] = useState(currentAdmin.firstName);
  const [lastName, setLastName] = useState(currentAdmin.lastName);
  const [email, setEmail] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(currentAdmin.company);
  const [status, setStatus] = useState(currentAdmin.status); // Add state for status
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const queryClient = useQueryClient();

  const handleSelectedCompany = (company) => {
    setSelectedCompany(company);
  };

  // Add a new function to handle status change
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    const adminData = {
      id: currentAdmin._id,
      status: newStatus,
    };
    mutation.mutate(adminData);
  };

  const updateInternalAdmin = async (adminData) => {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/update-by-admin`,
      adminData,
      {
        withCredentials: true,
      }
    );

    return response.data;
  };

  const mutation = useMutation({
    mutationFn: updateInternalAdmin,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["internalAdmins"] });
      onClose();
    },
    onError: (error) => {
      console.log('error', error)
      toast.error(`${error.response?.data?.message}`)
      setError(error.response?.data?.message || "An error occurred.");
    },
  });

  const handleSave = () => {
    const adminData = {
      id: currentAdmin._id,
      firstName,
      lastName,
      company: selectedCompany,
    };
    mutation.mutate(adminData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white py-8  rounded-lg w-[420px]">
        <div className="meeting_bg pl-8 py-2 flex justify-center items-start flex-col pt-3">
          <Heading20pxBlueUC
            children={`${currentAdmin.firstName} ${currentAdmin.lastName}`}
          />
          <p className="uppercase text-slate-700 text-xs pt-1">
            {currentAdmin.role}
          </p>
          <div className="flex items-center">
            <input
              type="radio"
              id="active"
              name="status"
              value="Active"
              checked={status === "Active"}
              onChange={() => handleStatusChange("Active")} // Update status on change
            />
            <label htmlFor="active" className="ml-2">
              Active
            </label>
            <input
              type="radio"
              id="inactive"
              name="status"
              value="Inactive"
              checked={status === "Inactive"}
              onChange={() => handleStatusChange("Inactive")} // Update status on change
            />
            <label htmlFor="inactive" className="ml-2">
              Inactive
            </label>
          </div>
        </div>
        <div className="pt-5 px-8">
          <p className="text-lg font-semibold text-custom-dark-blue-2 pb-4">
            Edit Internal Admin
          </p>
          <div className="flex justify-start items-center gap-10">
            <div className="flex flex-col justify-center items-start">
              <p className="font-semibold text-custom-dark-blue-1">
                First Name
              </p>
              <InputField
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="flex flex-col justify-center items-start">
              <p className="font-semibold text-custom-dark-blue-1">Last Name</p>
              <InputField
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col justify-center items-start pt-3">
            <p className="font-semibold text-custom-dark-blue-1">Email</p>
            <p className="text-sm">{currentAdmin.email}</p>
          </div>
        </div>
        <div className="flex flex-col justify-center items-start pt-3 pl-8">
          <p className="font-semibold text-custom-dark-blue-1">Company</p>
          <Dropdown
            options={companies}
            selectedOption={selectedCompany}
            onSelect={handleSelectedCompany}
            className="min-w-60"
          />
        </div>
        <div className="flex justify-center items-center pt-5 gap-5">
          <Button
            children="Cancel"
            type="button"
            variant="default"
            className="text-white px-5 py-2 rounded-lg"
            onClick={onClose}
          />
          <Button
            children="Save"
            type="button"
            variant="secondary"
            className="text-white px-5 py-2 rounded-lg"
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default EditInternalAdminModal;
