import React, { useState } from 'react'
import Button from '../shared/button';

const CreateTag = ({userId, onClose, onTagCreated}) => {
  const [name, setName] = useState("New Project");
  const [description, setDescription] = useState("New project added to the system...");
  const [selectedColor, setSelectedColor] = useState("bg-green-600");

  const colors = [
    "bg-green-600", "bg-yellow-300", "bg-blue-500", "bg-purple-600", "bg-gray-700",
    "bg-green-200", "bg-yellow-200", "bg-blue-200", "bg-purple-200", "bg-gray-300"
  ];

  // Update the save button click handler
const handleSaveTag = async () => {
  try {
    const colorMap = {
      'bg-green-600': '#34D399',
      'bg-yellow-300': '#FCD34D',
      'bg-blue-500': '#3B82F6',
      'bg-purple-600': '#9333EA',
      'bg-gray-700': '#374151',
      'bg-green-200': '#B5E2CC',
      'bg-yellow-200': '#FEF08A',
      'bg-blue-200': '#BFDBFE',
      'bg-purple-200': '#E9D5FF',
      'bg-gray-300': '#D1D5DB'
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/tags/createTag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        description: description,
        color: colorMap[selectedColor],
        createdById: userId
      })
    });

    if (response.ok) {
      onClose();
      // Trigger refetch in parent component
      if (typeof onTagCreated === 'function') {
        onTagCreated();
      }
    }
  } catch (error) {
    console.error('Error creating tag:', error);
  }
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Tag</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-5xl">&times;</button>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
            placeholder="New Project"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-300"
            placeholder="New project added to the system..."
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Colors</label>
          <div className="flex space-x-2">
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={() => setSelectedColor(color)}
                className={`${color} w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-green-600' : 'border-transparent'}`}
              />
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Preview</label>
          <div className='flex justify-center items-center p-5 border-2 rounded-lg'>
          <div className={`inline-block px-4 py-2 text-white rounded-lg ${selectedColor}`}>
            {name}
          </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
          children='Save'
          variant="secondary"
          type="submit"
          className="rounded-lg text-white py-1 px-10 mt-4"
          onClick={handleSaveTag}
          />
      
        </div>
      </div>
    </div>
  );
}

export default CreateTag