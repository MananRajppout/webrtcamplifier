import React, { useState } from "react";
import HeadingH1 from "../shared/HeadingH1";
import ParagraphBlue2 from "../shared/ParagraphBlue2";
import { FaEnvelopeOpenText, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import Button from "../shared/button";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import InputField from "../shared/InputField";

const PasswordResetUI = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Your password has been successfully reset. Please login to your account.");
      } else {
        setMessage(data.message || "An error occurred.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="py-20">
      <div className="max-w-[800px] mx-auto shadow_primary px-10 lg:px-20 bg-white rounded-xl">
        <div className="flex justify-center items-center py-5">
          <FaEnvelopeOpenText className="h-20 w-20" />
        </div>

        {message ? (
          <div className="px-3">
            <HeadingH1 children="PASSWORD RESET" />
            <ParagraphBlue2 children={message} />
            <div className="pt-10 pb-32">
              <Link href="/login">
                <Button
                  children="Back to Login"
                  variant="primary"
                  className="py-2 rounded-2xl w-full font-bold text-xl"
                />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePasswordReset}>
            <div className="px-3">
              <HeadingH1 children="RESET YOUR PASSWORD" />
              <div className="py-4">
                <InputField
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  icon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  }
                />
              </div>
              <div className="py-4">
                <InputField
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  icon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  }
                />
              </div>
            </div>
            <div className="pt-10 pb-32">
              <Button
                children="Reset Password"
                variant="primary"
                className="py-2 rounded-2xl w-full font-bold text-xl"
                type="submit"
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordResetUI;
