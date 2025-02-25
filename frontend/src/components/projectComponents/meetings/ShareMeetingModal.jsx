import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { BsCheckCircle } from "react-icons/bs";

const ShareMeetingModal = ({ meeting, onClose }) => {
  const [accessLevel, setAccessLevel] = useState("Observer Access");
  console.log("project", meeting)

  const handleCopyInvite = () => {
    const inviteText =
      accessLevel === "Observer Access"
        ? `You are added as an observer in a Project named ${meeting.title}. The project is now accessible to you as an observer.\n\nJoin Project\n${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/join-meeting-observer/${meeting.projectId}\nPasscode: ${meeting.meetingPasscode}\n\nOr\n\nCreate an account\n${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/register`
        : `You have been invited to a scheduled meeting for the project ${meeting.title}.\n\nJoin Meeting\n${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/join-meeting/${meeting.projectId}`;

    navigator.clipboard.writeText(inviteText);
    toast.success("Project invite copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-2/5 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-5xl">
          &times;
        </button>

        {/* Checkmark icon */}
        <div className="flex justify-center items-center my-4 text-6xl text-green-500">
          <BsCheckCircle />
        </div>

        {/* Title and message */}
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Share Meeting Details
        </h2>

        {/* Dropdown for access level */}
        <div className="mb-4 flex justify-center">
          <select
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value)}
            className="p-2 border rounded-md w-1/2 text-center text-gray-700"
          >
            <option value="Observer Access">Observer Access</option>
            <option value="Participant Access">Participant Access</option>
          </select>
        </div>

        {/* Conditional content based on access level */}
        {accessLevel === "Observer Access" ? (
          <div className="p-4 border rounded-md mb-4">
            <p className="text-sm">
            You are added as an observer in a meeting named {meeting.title}. The
              meeting is now accessible to you as an observer.
            </p>
            <p className="mt-2 text-sm">
              <strong>Join Meeting</strong>
              <br />
              <Link
                href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/join-meeting-observer/${meeting.projectId}`}
                className="text-blue-500"
              >
                {`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/join-meeting-observer/${meeting.projectId}`}
              </Link>
            </p>
            <p className="mt-2 text-sm">
              <strong>Passcode:</strong> {meeting.meetingPasscode}
            </p>
            <p className="mt-4 text-sm">Or</p>
            <p className="mt-2 text-sm">
              <strong>Create an account</strong>
              <br />
              <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/register`} className="text-blue-500">
              {`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/register`}
              </Link>
            </p>
          </div>
        ) : (
          <div className="p-4 border rounded-md mb-4">
            <p className="text-sm">
              You have been invited to a scheduled Amplify Meeting
            </p>
            <p className="mt-2 text-sm">
              <strong>Title:</strong> {meeting.title}
            </p>
            <p className="mt-2 text-sm">
              <strong>Time:</strong>{" "}
              {meeting.startDate + " " + meeting.startTime}
            </p>
            <p className="mt-2 text-sm">
              <strong>Join Meeting</strong>
              <br />
              <Link
                href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/join-meeting/${meeting.projectId}`}
                className="text-blue-500"
              >
                {`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/join-meeting/${meeting.projectId}`}
              </Link>
            </p>
          </div>
        )}

        {/* Copy button */}
        <button
          onClick={handleCopyInvite}
          className="bg-custom-teal text-white w-full py-2 rounded-md hover:bg-teal-700"
        >
          {accessLevel === "Observer Access"
            ? "Copy Meeting Invite"
            : "Copy Meeting Invite"}
        </button>
      </div>
    </div>
  );
};

export default ShareMeetingModal;
