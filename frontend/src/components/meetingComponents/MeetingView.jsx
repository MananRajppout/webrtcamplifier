import React, { forwardRef, useState } from "react";
import Logo from "../shared/Logo";
import { FaVideo } from "react-icons/fa";
import HeadingBlue25px from "../shared/HeadingBlue25px";
import { IoLogOutSharp } from "react-icons/io5";
import WhiteBoard from "./WhiteBoard";
import OngoingMeeting from "./OngoingMeeting";
import EndOFMeeting from "./EndOFMeeting";
import Button from "../shared/button";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import ParticipantPollModal from "./ParticipantPollModal";
import PollResultModal from "./PollResultModal";

const MeetingView = ({
  role,
  users,
  isWhiteBoardOpen,
  setIsWhiteBoardOpen,
  meetingStatus,
  isRecordingOpen,
  setIsRecordingOpen,
  isBreakoutRoom,
  setIsBreakoutRoom,
  breakoutRooms,
  setBreakoutRooms,
  projectStatus,
  iframeLink,
  meetingDetails,
  endMeeting,
  isMeetingEnd,
  setting,
  setSetting,
  handleMediaUpload,
  allPaericipantsAudioTracksRef,
  setAllParticipantsAudioTracks,
  pollData,
  setPollData,
  meetingId,
  pollResult,
  isPollResultModalOpen,
  setIsPollResultModalOpen,
  projectId,
  user,
  micmuteByModerator,
  myAudioTracksRef,
  handleGenerateCaption,
  captionON
}) => {
  const searchParams = useSearchParams();
  const roomname = searchParams.get("roomname");
  const type = searchParams.get("type");
  const userEmail = searchParams.get("email");
  const ModeratorType = searchParams.get("ModeratorType");

  const handleCopyParticipantLink = () => {
    const meetingLink = `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/join-meeting/${meetingDetails.projectId}`;

    const textToCopy = `Meeting Link- ${meetingLink}`;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success("Meeting link and password copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy meeting link and password");
      });
  };

  const handleCopyObserverLink = () => {
    const meetingLink = `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/join-meeting-observer/${meetingDetails.projectId}`;
    const meetingPassword = `${meetingDetails.meetingPasscode}`;
    const textToCopy = `Meeting Link- ${meetingLink}\nMeeting Password - ${meetingPassword}`;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success("Meeting link and password copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy meeting link and password");
      });
  };

  return (
    <div className="px-5 sm:py-5  flex-col justify-between items-between h-full  meeting_bg relative">
      <div className="md:h-1/7 h-auto py-2">
        {/* First ------ nav bar */}
        <div className="flex justify-between items-center pb-2">
          {/* participant name */}
          <div className=" justify-start items-center space-x-2 pb-2 hidden md:flex">
            <FaVideo />
            <p className=" text-custom-gray-3 font-semibold hidden md:flex">
              {meetingStatus == "Ongoing"
                ? "On going Meeting"
                : "End of Meeting"}
            </p>
            <Button
              children={`${projectStatus}`}
              type="button"
              variant={`${projectStatus !== "Open" ? "secondary" : "primary"}`}
              className={`text-white py-1 px-3 rounded-xl text-sm hidden md:flex`}
            />
            <Button
              children={`${ModeratorType ? "Admin" :role} View`}
              type="button"
              variant={`${role !== "Moderator" ? "secondary" : "primary"}`}
              className={`text-white py-1 px-3 rounded-xl text-sm hidden md:flex`}
            />
            {role === "Observer" && (
              <Button
                children={
                  isWhiteBoardOpen ? "Close Whiteboard" : "Open Whiteboard"
                }
                type="button"
                variant={`${role !== "Moderator" ? "secondary" : "primary"}`}
                className={`text-white py-1 px-3 rounded-xl text-sm hidden md:flex`}
                onClick={() => setIsWhiteBoardOpen((prev) => !prev)}
              />
            )}
          </div>
          {/* logo */}
          <Logo />
        </div>

        {/* Second ---------- name bar */}
        <div className="flex justify-between items-center pb-4 ">
          <HeadingBlue25px
            children={`${meetingDetails?.projectTitle} ${
              type == "breackout" && roomname ? `- ${roomname}` : ""
            }`}
          />

          {role === "Moderator" && (
            <div className="flex justify-between items-center gap-3">
              <Button
                children="Copy Link for Participants"
                type="button"
                onClick={handleCopyParticipantLink}
                className=" rounded-lg text-custom-dark-blue-1 text-xs px-3 py-1 "
              />
              <Button
                children="Copy Link for Observers"
                type="button"
                className=" rounded-lg text-custom-dark-blue-1 text-xs px-3 py-1 "
                onClick={handleCopyObserverLink}
              />
            </div>
          )}
          
        </div>
      </div>

      {/*Third ---------- meeting stream */}
      <div className="h-auto relative">
        {meetingStatus ? (
          <>
           

            <div className={`flex-1  ${isRecordingOpen ? "block" : "hidden"}`}>
              <EndOFMeeting role={role} />
            </div>

            

            <div className={`flex-1  ${isMeetingEnd ? "block" : "hidden"}`}>
              <div
                className="rounded-md pb-10 h-[75vh] flex items-center justify-center bg-white"
                style={{ width: "100%", position: "relative" }}
              >
                <p className="font-normal">
                  This Meeting has been ended by the host
                </p>
              </div>
            </div>
            
            <div
              className={`flex-1  ${
                !isRecordingOpen  && !isMeetingEnd
                  ? "block"
                  : "hidden"
              }`}
            >
              <OngoingMeeting
                users={users}
                iframeLink={iframeLink}
                role={role}
                endMeeting={endMeeting}
                setAllParticipantsAudioTracks={setAllParticipantsAudioTracks}
                allPaericipantsAudioTracksRef={allPaericipantsAudioTracksRef}
                myAudioTracksRef={myAudioTracksRef}
                isMeetingEnd={isMeetingEnd}
                setting={setting}
                setSetting={setSetting}
                pollData={pollData}
                setPollData={setPollData}

                isWhiteBoardOpen={isWhiteBoardOpen}
                handleMediaUpload={handleMediaUpload}
                micmuteByModerator={micmuteByModerator}
                handleGenerateCaption={handleGenerateCaption}
              captionON={captionON}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 h-full">
            <EndOFMeeting role={role} />
          </div>
        )}
      </div>
      {role === "Participant" && pollData && (
        <ParticipantPollModal
          activePollId={pollData.pollId}
          pollQuestions={pollData.pollQuestions}
          onClose={() => setPollData(null)}
          meetingId={meetingId}
          email={userEmail}
        />
      )}
      {role === "Moderator" && isPollResultModalOpen && (
        
        <PollResultModal
          setIsPollResultModalOpen={setIsPollResultModalOpen}
          pollResult={pollResult}
          uploaderEmail={user.email}
          meetingId={meetingId}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default MeetingView;
