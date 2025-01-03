'use client';
import { useState } from "react";
import Button from "@/components/shared/button";
import { CgClose } from "react-icons/cg";
import axios from "axios";
import toast from "react-hot-toast";

const EnablePollModal = ({ onClose, poll, meetingId }) => {
  const [endTime, setEndTime] = useState("");

  const handleStartPoll = async () => {
    try {

      const currentDate = new Date();
      const [hours, minutes] = endTime.split(":");
      const endDateTime = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        parseInt(hours, 10),
        parseInt(minutes, 10)
      );

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/start-poll`, {
        meetingId,
        pollId: poll._id,
        endTime:endDateTime.toISOString(),
      });
      toast.success(`${response.data.message}`)
      onClose();
    } catch (error) {
      console.error("Error starting poll:", error);
      toast.error(`${error.response.data.message}`)
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-30">
      <div className="bg-white p-4 rounded-2xl w-[400px]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-custom-dark-blue-2">Enable Poll</h2>
          <Button onClick={onClose} variant="plain">
            <CgClose />
          </Button>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium">End Time</label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded-md px-2 py-1"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="primary" onClick={handleStartPoll}
          className="px-2 py-1 rounded-lg"
          >
            Start Poll
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnablePollModal;
