'use client';
import Button from "@/components/shared/button";
import { CgClose } from "react-icons/cg";
import toast from "react-hot-toast";
import { useGlobalContext } from "@/context/GlobalContext";

const EnablePollModal = ({ onClose, poll, meetingId }) => {
  const { socket } = useGlobalContext();

  const handleStartPoll = async () => {
    socket.emit(
      "start-poll",
      { meetingId, pollId: poll._id },
      (response) => {
      
        if (response.success) {
          toast.success(`${response.message}`)
          onClose();
        } else {
          console.error(response.message);
          toast.error(`${response.message}`)
        }
      }
    );
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
