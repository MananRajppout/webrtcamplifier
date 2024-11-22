import React, { useState } from "react";
import InputField from "../shared/InputField";
import Button from "../shared/button";
import Heading20pxBlueUC from "../shared/Heading20pxBlueUC";
import { FaCheckCircle, FaCross } from "react-icons/fa";

const ViewExternalAdminModal = ({ onClose, currentAdmin }) => {
  console.log('current admin', currentAdmin)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/moderator-invitation/link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            project: "66b0a6bf824132f349bbbc84", // Assuming projectId is passed as a prop
          }),
        }
      );

      if (response.ok) {
        setSuccessMessage("Moderator created and email sent successfully.");
        setError(null);
      } else {
        const errorMessage = await response.text();
        setError(errorMessage);
        setSuccessMessage(null);
      }
    } catch (error) {
      setError("An error occurred while sending the invitation.");
      setSuccessMessage(null);
    }
  };

  const handleCloseErrorModal = () => {
    setError(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white py-8  rounded-lg w-[420px]">
       <div className="meeting_bg pl-8 py-2 flex justify-center items-start flex-col pt-3">
          <Heading20pxBlueUC
          children={`${currentAdmin.firstName} ${currentAdmin.lastName}`}
          />
          <p className="uppercase text-slate-700 text-xs pt-1">{currentAdmin.role}</p>
          <div className="flex justify-center items-center gap-1 pt-1"> 
            {
              currentAdmin?.status === "Active" ? <FaCheckCircle className="text-custom-teal"/> : <FaCross />
            }
            <p className="font-semibold ">{currentAdmin.status}</p>
          </div>
       </div>
       <div className="pt-5 px-8">
        <p className="text-lg font-semibold text-custom-dark-blue-2 pb-4">External Admin Details</p>
        <div className="flex justify-start items-center gap-10">
            <div className="flex flex-col justify-center items-start">
              <p className="font-semibold text-custom-dark-blue-1">First Name</p>
              <p className="text-sm">{currentAdmin.firstName}</p>
            </div>
            <div className="flex flex-col justify-center items-start">
              <p className="font-semibold text-custom-dark-blue-1">Last Name</p>
              <p className="text-sm">{currentAdmin.lastName}</p>
            </div>
        </div>
        <div className="flex flex-col justify-center items-start pt-3">
              <p className="font-semibold text-custom-dark-blue-1">Email</p>
              <p className="text-sm">{currentAdmin.email}</p>
            </div>
       </div>
       <div className="flex justify-center items-center pt-5">
            <Button
            children='Close'
            type="button"
            variant="default"
            className="text-white px-5 py-2 rounded-lg"
            onClick={onClose}
            />
       </div>
      </div>
    </div>
  );
};

export default ViewExternalAdminModal;
