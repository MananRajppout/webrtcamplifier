const MeetingParticipantModal = ({ title, data, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-3/4 max-h-[80%] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Join Time</th>
              <th className="px-4 py-2 text-left">Leave Time</th>
            </tr>
          </thead>
          <tbody>
            {data.map((participant, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">{participant.name}</td>
                <td className="px-4 py-2">{participant.email}</td>
                <td className="px-4 py-2">
                  {participant.joiningTime
                    ? new Date(participant.joiningTime).toLocaleString()
                    : "N/A"}
                </td>
                <td className="px-4 py-2">
                  {participant.leavingTime
                    ? new Date(participant.leavingTime).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MeetingParticipantModal;
