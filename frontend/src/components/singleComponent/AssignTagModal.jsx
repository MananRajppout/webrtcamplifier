import { useEffect, useState } from "react";
import Button from "../shared/button";
import CreateTag from "./CreateTag";

const AssignTagModal = ({ userId, project, onClose, fetchProjects }) => {
  const [tags, setTags] = useState([]);
  const [isCreateTagModalOpen, setIsCreateTagModalOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/tags/getAllTags/${userId}`);
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, [userId,  refreshTrigger]);

  const handleAddTag = (tagId) => {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      }
      return [...prev, tagId];
    });
  };

  const getContrastColor = (bgColor) => {
    // Remove the "#" if it exists
    const color = bgColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
  
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
    // If luminance is less than 0.5, return white, otherwise black
    return luminance < 0.5 ? '#FFFFFF' : '#000000';
  };
  

  const handleComplete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/project/assignTagsToProject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tagIds: selectedTagIds,
          projectId: project._id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        fetchProjects(userId)
        onClose();
      } else {
        console.error('Failed to assign tags');
      }
    } catch (error) {
      console.error('Error assigning tags:', error);
    }
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-custom-teal">Assign Tag</h2>
          <button onClick={onClose} className="text-gray-500 text-4xl hover:text-gray-700">
            ×
          </button>
        </div>

        {/* Add a fixed height container with overflow scroll */}
        <div className="max-h-60 overflow-y-auto">
          <div className="space-y-2">
            {tags.map((tag) => (
              <div key={tag._id} className="flex items-center justify-between p-2 border rounded-md">
                <span
                  className="px-2 py-1 rounded-full border-2 font-semibold text-sm"
                  style={{ 
                    backgroundColor: `${tag.color}20`,
        color: getContrastColor(tag.color),
        borderColor: tag.color 
                  }}
                >
                  {tag.name}
                </span>
                <button 
                  className={`text-sm font-bold hover:underline ${
                    selectedTagIds.includes(tag._id) ? 'text-red-500' : 'text-custom-teal'
                  }`}
                  onClick={() => handleAddTag(tag._id)}
                >
                  {selectedTagIds.includes(tag._id) ? 'Remove' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button className="mt-2 text-lg text-custom-teal font-bold hover:underline"
          onClick={() => setIsCreateTagModalOpen(true)}
          >Add New Tag</button>
        </div>

        <Button
          children='Complete'
          variant="secondary"
          type="submit"
          onClick={handleComplete}
          className="rounded-lg text-white py-1 px-6 mt-4"
        />
      </div>
      {
        isCreateTagModalOpen && (
          <CreateTag
          userId={userId}
            onClose={() => setIsCreateTagModalOpen(false)}
            onTagCreated={() => setRefreshTrigger(prev => prev + 1)}
          />
        )
      }
    </div>
  );
};

export default AssignTagModal;