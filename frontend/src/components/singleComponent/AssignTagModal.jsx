import { useEffect, useState } from "react";
import Button from "../shared/button";
import CreateTag from "./CreateTag";

const AssignTagModal = ({ userId, project, onClose }) => {
  const [tags, setTags] = useState([]);
  const [isCreateTagModalOpen, setIsCreateTagModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  console.log('tags', tags)

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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
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
                    color: tag.color,
                    borderColor: tag.color 
                  }}
                >
                  {tag.name}
                </span>
                <button className="text-sm text-custom-teal font-bold hover:underline">Add</button>
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