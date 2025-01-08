import React from 'react'
import Button from '../shared/button'
import { useGlobalContext } from '@/context/GlobalContext';
import toast from 'react-hot-toast';

const PollResultModal = ({setIsPollResultModalOpen, pollResult, uploaderEmail,
  meetingId, projectId}) => {
    const { socket } = useGlobalContext();

    const handleSubmit = () => {
      socket.emit(
        'save-poll-results-csv',
        { pollResult, uploaderEmail, meetingId, projectId, role: 'Moderator', addedBy: uploaderEmail },
        (response) => {
          if (response.success) {
            toast.success(`${response.message}`);
            console.log('response.file',response.file)
            setIsPollResultModalOpen(false);
          } else {
            toast.error(`${response.message}`);
          }
        }
      );
    };
  

    const normalizedPollResult = pollResult.map(participant => ({
      ...participant,
      responses: participant.responses.map(response => ({
        ...response,
        answer: Array.isArray(response.answer) ? response.answer : [response.answer],
      })),
    }));
    
  
  console.log('pollResult', pollResult, "uploaderEmail", uploaderEmail, "meetingId", meetingId, "projectId", projectId)


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-30">
      <div className="bg-white p-2 rounded-2xl w-[800px]">
      <div>
            {pollResult.map((participant, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 border-b"
              >
                <div>
                  <p className="font-bold">{participant?.participantEmail}</p>
                  <div>
                    {participant.responses.map((response, i) => (
                      <div key={i} className="mb-2">
                        <p>
                          <span className="font-semibold">
                            Question:{" "}
                          </span>
                          {response?.question}
                        </p>
                        <p>
                <span className="font-semibold">Answer: </span>
                {Array.isArray(response?.answer)
                  ? response.answer.join(', ')
                  : response?.answer}
              </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4  gap-5">

          <Button variant="primary" onClick={()=>setIsPollResultModalOpen(false)}
            className='px-3 py-1 rounded-lg'
            >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}
           className='px-3 py-1 rounded-lg'
          >
            Save as CSV
          </Button>
        </div>
    </div>
    </div>
  )
}

export default PollResultModal
