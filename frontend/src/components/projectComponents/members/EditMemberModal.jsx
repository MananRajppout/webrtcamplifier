import Button from '@/components/shared/button';
import React, { useState, useEffect } from 'react';


const EditMemberModal = ({ member, onClose, onSave }) => {
  console.log("member", member)
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [name, setName] = useState('');
  useEffect(() => {
    if (member) {
      // Pre-fill the name and roles when the modal opens
      setName(`${member.userId.firstName} ${member.userId.lastName}`);
      setSelectedRoles(member.roles.permissions || []);
    }
  }, [member]);
console.log("selected roles", selectedRoles)
  const handleRoleChange = (role) => {
    if (selectedRoles.includes(role)) {
      // Remove the role if it's already selected
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      // Add the role if it's not already selected
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSave = () => {
    // Call the onSave function to save changes (send new data to the backend)
    const updatedMember = {
      ...member,
      roles: {
        ...member.roles,
        permissions: selectedRoles, // Update permissions array
      },
    };
    onSave(updatedMember);
    onClose(); // Close the modal after saving
  };

  if (!member) return null; // Don't render if there's no member selected

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white py-6 px-10 rounded-lg shadow-lg w-80">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-custom-teal">Edit</h2>
          <button onClick={onClose} className="text-gray-500 text-3xl font-semibold">&times;</button>
        </div>

        <div className="mb-4 flex justify-between items-center gap-5">
          <label className="block text-sm font-semibold text-custom-teal">Name</label>
          <p className='text-sm'>{name}</p>
        </div>

        <div className="mb-4 flex justify-between items-start gap-5">
          <label className="block text-sm font-semibold text-custom-teal">Select User</label>
          <div className="space-y-2">
            {['Admin', 'Moderator', 'Observer'].map((role) => (
              <label key={role} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={() => handleRoleChange(role)}
                  className={`appearance-none h-6 w-6 border-2 border-custom-teal rounded-lg focus:outline-none focus:ring-custom-teal cursor-pointer ${
                    selectedRoles.includes(role)
                      ? 'bg-white border-custom-teal relative before:block before:absolute before:left-1.5 before:top-0.5 before:w-2 before:h-3 before:border-custom-teal before:border-r-2 before:border-b-2 before:rotate-45'
                      : ''
                  }`}
                />
                <span className="text-sm">{role}</span>
              </label>
            ))}
          </div>
        </div>


        <Button 
          variant='secondary'
          onClick={handleSave}
          type='button'
          className='text-white px-8 py-1 rounded-lg'>Save</Button>
        
      </div>
    </div>
  );
};

export default EditMemberModal;
