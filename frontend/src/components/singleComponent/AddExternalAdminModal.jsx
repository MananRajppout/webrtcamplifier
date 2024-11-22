'use client'
import React, { useState } from "react";
import InputField from "../shared/InputField";
import Button from "../shared/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const AddExternalAdminModal = ({
  onClose,

}) => {
  const [firstName, setFirstName] = useState( "");
  const [lastName, setLastName] = useState( "");
  const [email, setEmail] = useState( "");
  const [companyName, setCompanyName] = useState(    ""  );
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const queryClient = useQueryClient()

  const addExternalAdmin = async (newAdmin) => {
    console.log('add exter admin', newAdmin)
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/create-by-admin`,
      newAdmin,
      { withCredentials: true } // Include cookies
    );
    console.log('response', response.data)
    return response.data; // Return the response data
  };

  const mutation = useMutation({
    mutationFn: addExternalAdmin,
    onSuccess: () => {
      toast.success('Admin Added Successfully.')
      queryClient.invalidateQueries({ queryKey: ['externalAdmins'] });
      onClose()
    },
  });
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email.includes('@')) {
      setError("Invalid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Prepare data for submission
    const newAdmin = {
      firstName,
      lastName,
      email,
      companyName,
      password,
    };
    // Call the mutation
    mutation.mutate(newAdmin);
  };

  const handleCloseErrorModal = () => {
    setError(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg w-[420px]">
        <h2 className="text-2xl font-semibold mb-1 text-custom-dark-blue-2">
           Add External Admin
        </h2>

        {error && (
          <div className="text-red-500 mb-4">
            {error} <button onClick={handleCloseErrorModal}>Close</button>
          </div>
        )}
        {successMessage && (
          <div className="text-green-500 mb-4">{successMessage}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center items-center gap-3">
            <InputField
              label="First Name"
              type="text"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <InputField
              label="Last Name"
              type="text"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="flex justify-center items-center gap-3">
          <InputField
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputField
            label="Company"
            type="text"
            name="company-name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          </div>
          <div className="flex justify-center items-center gap-3">
          <InputField
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          </div>
        
         

         

          {/* Button */}
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="cancel"
              onClick={onClose}
              className="rounded-xl text-center py-2 px-5 shadow-[0px_3px_6px_#09828F69]"
            >
              {"Cancel"}
            </Button>
            <Button
              type="submit"
              variant="save"
              className="rounded-xl text-center py-2 px-5 shadow-[0px_3px_6px_#09828F69]"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExternalAdminModal;
