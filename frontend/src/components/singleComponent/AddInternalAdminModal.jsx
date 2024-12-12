"use client";
import React, { useState } from "react";
import InputField from "../shared/InputField";
import Button from "../shared/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const AddInternalAdminModal = ({ onClose }) => {
  const [firstName, setFirstName] = useState("User6FN");
  const [lastName, setLastName] = useState("User6LN");
  const [email, setEmail] = useState("user6@gmail.com");
  // const [companyName, setCompanyName] = useState("abc");
  const [password, setPassword] = useState("Ab123456@");
  const [confirmPassword, setConfirmPassword] = useState("Ab123456@");
  const [role, setRole] = useState("AmplifyAdmin");
  const [error, setError] = useState(null);
  // const [successMessage, setSuccessMessage] = useState(null);
  const queryClient = useQueryClient();

  const roles = [
    "AmplifyAdmin",
    "AmplifyModerator",
    "AmplifyObserver",
    "AmplifyParticipant",
    "AmplifyTechHost",
  ];

  const addInternalAdmin = async (newAdmin) => {
    console.log("add Internaladmin", newAdmin);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/createAmplifyAdmin`,
      newAdmin,
      { withCredentials: true }
    );

    return response.data;
  };

  const mutation = useMutation({
    mutationFn: addInternalAdmin,
    onSuccess: () => {
      toast.success("Admin Added Successfully.");
      queryClient.invalidateQueries({ queryKey: ["internalAdmins"] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to add admin. Please try again.");
    },
  });
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email.includes("@")) {
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
      role,
      password,
      termsAccepted: true,
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
          Add Internal Admin
        </h2>

        {error && (
          <div className="text-red-500 mb-4">
            {error} <button onClick={handleCloseErrorModal}>Close</button>
          </div>
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
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="role"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
              >
                {roles.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption}
                  </option>
                ))}
              </select>
            </div>
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

export default AddInternalAdminModal;
