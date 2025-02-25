"use client";
import React, { useState } from "react";
import axios from "axios";
import InputField from "../shared/InputField";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Button from "../shared/button";
import toast from "react-hot-toast";

const PasswordModal = ({ onClose, id }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const formErrors = {};
    if (!currentPassword) formErrors.currentPassword = "Current password is required.";
    if (newPassword.length < 8)
      formErrors.newPassword =
        "Password must contain at least 8 characters, including upper case, lower case, numbers, and special characters.";
    if (newPassword !== confirmPassword)
      formErrors.confirmPassword = "Passwords do not match.";
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/changePassword`,
        {
          userId: id,
          oldPassword: currentPassword,
          newPassword: newPassword,
        }
      );

      if (response.status === 200) {
        toast.success(response.data.message || "Password updated successfully.");
        onClose();
      }
    } catch (error) {
      const backendMessage = error.response?.data?.message || "An unexpected error occurred.";
      toast.error(backendMessage);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 px-5">
      <div className="bg-white p-8 rounded-lg w-[420px]">
        <h2 className="text-2xl font-semibold mb-1 text-custom-dark-blue-2">
          Change Password
        </h2>
        <p className="text-custom-gray-6 text-[11px] mb-3">
          Make sure you remember the password to log in. Your new password must
          be different from previously used passwords.
        </p>
        <form onSubmit={handleSubmit}>
          <InputField
            label="Current Password"
            type={showCurrentPassword ? "text" : "password"}
            name="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={errors.currentPassword}
            id="currentPassword"
            icon={
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="focus:outline-none"
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            }
          />
          <InputField
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.newPassword}
            id="newPassword"
            icon={
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="focus:outline-none"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            }
          />
          <InputField
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            id="confirmPassword"
            icon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="focus:outline-none"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            }
          />
          <div className="flex justify-end gap-4 mt-4">
            <Button
              children="Cancel"
              type="button"
              variant="cancel"
              onClick={onClose}
              className="rounded-xl text-center py-2 px-5 shadow-[0px_3px_6px_#031F3A59]"
            />
            <Button
              children="Save"
              type="submit"
              variant="save"
              className="rounded-xl text-center py-2 px-5 shadow-[0px_3px_6px_#09828F69]"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
