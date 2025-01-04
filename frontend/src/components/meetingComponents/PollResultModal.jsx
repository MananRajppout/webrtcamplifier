import React from 'react'
import Button from '../shared/button'

const PollResultModal = ({setIsPollResultModalOpen, pollResult, uploaderEmail,
  meetingId, projectId}) => {
  const handleSubmit = () => {
    
  }
  
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
                  <p className="font-bold">{participant.participantEmail}</p>
                  <div>
                    {participant.responses.map((response, i) => (
                      <div key={i} className="mb-2">
                        <p>
                          <span className="font-semibold">
                            Question:{" "}
                          </span>
                          {response.questionId}
                        </p>
                        <p>
                          <span className="font-semibold">Answer: </span>
                          {response.answer}
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
