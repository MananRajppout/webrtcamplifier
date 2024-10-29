// ... existing imports remain the same

const MeetingFormModal = ({ onClose, project, user, refetchMeetings, meetingToEdit = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    timeZone: "UTC-12:00 International Date Line West",
    duration: "",
    ongoing: false,
    enableBreakoutRoom: false,
    moderator: "",
  });

  // Populate form data if editing
  useEffect(() => {
    if (isEditing && meetingToEdit) {
      setFormData({
        title: meetingToEdit.title || "",
        description: meetingToEdit.description || "",
        startDate: meetingToEdit.startDate?.split('T')[0] || "",
        startTime: meetingToEdit.startTime || "",
        timeZone: meetingToEdit.timeZone || "UTC-12:00 International Date Line West",
        duration: meetingToEdit.duration || "",
        ongoing: meetingToEdit.ongoing || false,
        enableBreakoutRoom: meetingToEdit.enableBreakoutRoom || false,
        moderator: meetingToEdit.moderator?._id || "",
      });
      setSelectedTimeZone(meetingToEdit.timeZone);
    }
  }, [isEditing, meetingToEdit]);

  // ... existing state and useEffect code remains the same

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFormData = {
      ...formData,
      projectId: project._id,
    };

    try {
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/update/meeting/${meetingToEdit._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/create/meeting`;

      const method = isEditing ? 'put' : 'post';

      const response = await axios[method](url, updatedFormData);

      if (response.status === (isEditing ? 200 : 201)) {
        refetchMeetings();
        toast.success(`Meeting ${isEditing ? 'updated' : 'created'} successfully`);
        onClose();
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} meeting:`, error);
      toast.error(`${error.response?.data?.error || 'An error occurred'}`);
    }
  };

  return (
    <div className="fixed top-0 inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
      <div className="bg-white rounded-lg w-[600px] max-w-2xl">
        <h3 className="text-2xl text-custom-dark-blue-2 font-semibold mx-10 py-5 leading-[3.75rem] md:leading-8">
          {isEditing ? 'Edit Meeting' : 'Add New Meeting'}
        </h3>
        
        {/* Rest of the form JSX remains the same */}
      </div>
    </div>
  );
};

export default MeetingFormModal;
