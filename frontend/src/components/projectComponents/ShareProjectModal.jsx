import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { BsCheckCircle } from "react-icons/bs";

const ShareProjectModal = ({ project, onClose }) => {
  const [accessLevel, setAccessLevel] = useState("Observer Access");

  const handleCopyInvite = () => {
    const inviteText =
      accessLevel === "Observer Access"
        ? `You are added as an observer in a Project named ${project.name}. The project is now accessible to you as an observer.\n\nJoin Project\n${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/login\n\nOr\n\nCreate an account\n${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/register`
        : `Participant does not have access to the project.`;

    navigator.clipboard.writeText(inviteText);
    toast.success("Project invite copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 md:w-2/5 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-5xl"
        >
          &times;
        </button>

        {/* Checkmark icon */}
        <div className="flex justify-center items-center my-4 text-6xl text-green-500">
          <BsCheckCircle />
        </div>

        {/* Title and message */}
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Project is successfully created!
        </h2>
        <h3 className="text-md text-center text-gray-500 mb-4">
          {accessLevel === "Observer Access"
            ? "Share project"
            : "Generate link to share"}
        </h3>

        {/* Dropdown for access level */}
        <div className="mb-4 flex justify-center">
         
            <p >Observer Access</p>
          
        </div>

       
          <div className="p-4 border rounded-md mb-4">
            <p className="text-sm">
            You are added as an observer in a Project named{" "}
              <strong>{project.name}</strong>. The project is now accessible to
              you as an observer.
            </p>
            <p className="mt-2 text-sm">
              <strong>Join Project</strong>
              <br />
              <Link
                href={`https://amplifier.hgsingalong.com/login`}
                className="text-blue-500"
              >
                https://amplifier.hgsingalong.com/login
              </Link>
            </p>
            <p className="mt-2 text-sm">
              <strong>Passcode:</strong> {project.projectPasscode}
            </p>
            <p className="mt-4 text-sm">Or</p>
            <p className="mt-2 text-sm">
              <strong>Create an account</strong>
              <br />
              <Link
                href={`https://amplifier.hgsingalong.com/register`}
                className="text-blue-500"
              >
                https://amplifier.hgsingalong.com/register
              </Link>
            </p>
          </div>
       

        {/* Copy button */}
        <button
          onClick={handleCopyInvite}
          className="bg-custom-teal text-white w-full py-2 rounded-md hover:bg-teal-700"
        >
          {accessLevel === "Observer Access"
            ? "Copy Project Invite"
            : "Copy Meeting Invite"}
        </button>
      </div>
    </div>
  );
};

export default ShareProjectModal;
