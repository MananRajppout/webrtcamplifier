import React from 'react';
import Button from '../shared/button';
import { useGlobalContext } from '@/context/GlobalContext';
import toast from 'react-hot-toast';

const PollResultModal = ({ setIsPollResultModalOpen, pollResult, uploaderEmail, meetingId, projectId }) => {
  const { socket } = useGlobalContext();

  const handleSubmit = () => {
    socket.emit(
      'save-poll-results-csv',
      { pollResult, uploaderEmail, meetingId, projectId, role: 'Moderator', addedBy: uploaderEmail },
      (response) => {
        if (response.success) {
          toast.success(`${response.message}`);
          setIsPollResultModalOpen(false);
        } else {
          toast.error(`${response.message}`);
        }
      }
    );
  };

  const renderAnswer = (answer) => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    } else if (typeof answer === 'object') {
      return Object.entries(answer)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } else {
      
      return answer?.toString() || 'N/A';
    }
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-30">
      <div className="bg-white p-4 rounded-2xl w-[800px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Poll Results</h2>
        {pollResult && pollResult.length > 0 ? (
          pollResult.map((participant, index) => (
            <div key={index} className="mb-6">
              <h3 className="font-bold text-lg mb-2">Participant: {participant?.participantName}</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2 text-left">Question</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {participant.responses.map((response, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 px-4 py-2">{response?.question || 'N/A'}</td>
                      <td className="border border-gray-300 px-4 py-2">{renderAnswer(response?.answer)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>No poll results available.</p>
        )}
        <div className="flex justify-end mt-4 gap-4">
          <Button 
          className='rounded-lg px-3 py-2'
          variant="secondary" onClick={() => setIsPollResultModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" 
           className='rounded-lg px-3 py-2'
          onClick={handleSubmit}>
            Save as CSV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PollResultModal;
