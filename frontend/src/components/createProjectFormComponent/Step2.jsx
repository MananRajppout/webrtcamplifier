import React, { useState, useEffect } from "react";
import HeadingLg from "../shared/HeadingLg";
import Button from "../shared/button";
import { MdAdd } from "react-icons/md";
import AddContactModal from "../singleComponent/AddContactModal";
import { useGlobalContext } from "@/context/GlobalContext";

const Step2 = ({
  formData,
  setFormData,
  contacts,
  setContacts,
  isLoading,
  fetchContacts,
}) => {
  const [selectedRoles, setSelectedRoles] = useState({});
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const { user } = useGlobalContext();
  
  const handleRoleChange = (index, role) => {
    setSelectedRoles((prevSelectedRoles) => {
      // Ensure the roles array exists
      const currentRoles = prevSelectedRoles[index]?.role || []; // Get the existing roles or initialize as an empty array
  
      let updatedRoles;
  
      if (currentRoles.includes(role)) {
        // If the role is already selected, remove it
        updatedRoles = currentRoles.filter((r) => r !== role);
      } else {
        // Add the role if it's not already selected
        updatedRoles = [...currentRoles, role];
      }
  
      // Return the updated selectedRoles object
      return {
        ...prevSelectedRoles,
        [index]: {
          role: updatedRoles, // Updated roles array
          permissions: updatedRoles, // Mirror roles array in permissions
        },
      };
    });
  };
  
  

  useEffect(() => {
    const updatedMembers = contacts
      .map((contact, index) => {
        const rolesForMember = selectedRoles[index] || { role: [], permissions: [] };
        return rolesForMember.role.length > 0
          ? {
              userId: contact._id,
              email: contact.email,
              roles: rolesForMember, // Include the structured roles object
            }
          : null;
      })
      .filter((member) => member !== null); // Filter out members with no roles
  
    setFormData((prevFormData) => ({
      ...prevFormData,
      members: updatedMembers,
    }));
  }, [selectedRoles, contacts, setFormData]);
  

  if (isLoading) {
    return (
      <p className="text-center text-5xl text-custom-dark-blue-1 font-bold">
        Loading... Please wait
      </p>
    );
  }

  const handleOpenAddContactModal = () => {
    setShowAddContactModal(true);
  };

  const handleModalClose = () => {
    setShowAddContactModal(false);
  };

  return (
    <div className="px-5 md:px-0">
      <p className="text-custom-teal text-2xl font-bold text-center">
        Add People
      </p>

      {/* participant list div */}
      <div className="pt-3">
        <div className="flex justify-between items-center ">
          <HeadingLg children="Project Team" />
          <div className="flex justify-end items-center gap-2">
            <Button
              children="Add new Contact"
              type="submit"
              variant="default"
              icon={<MdAdd />}
              className="rounded-xl text-center shadow-[0px_3px_6px_#2976a54d] hidden md:flex w-[200px] py-3"
              onClick={handleOpenAddContactModal}
            />
            <Button
              children="."
              type="submit"
              variant="default"
              icon={<MdAdd />}
              className="rounded-xl text-center py-3 mr-2 shadow-[0px_3px_6px_#2976a54d] md:hidden block pr-2 pl-3"
              onClick={handleOpenAddContactModal}
            />
          </div>
        </div>
        <div className="border-[0.5px] border-solid border-custom-dark-blue-1 rounded-xl h-[300px] overflow-y-scroll mt-2">
          {contacts && contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-center text-lg font-bold text-custom-dark-blue-1">
                NO PEOPLE FOUND
              </p>
              <p className="text-center text-sm text-custom-dark-blue-2">
                Try sharing the project after creating the project.
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b-2 border-custom-dark-blue-1">
                    Name
                  </th>
                  <th className="px-4 py-2 border-b-2 border-custom-dark-blue-1">
                    Admin
                  </th>
                  <th className="px-4 py-2 border-b-2 border-custom-dark-blue-1">
                    Moderator
                  </th>
                  <th className="px-4 py-2 border-b-2 border-custom-dark-blue-1">
                    Observer
                  </th>
                </tr>
              </thead>
              <tbody>
                {contacts?.map((contact, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border-b border-custom-dark-blue-1">
                      {contact.firstName} {contact.lastName}
                    </td>
                    <td className="px-4 py-2 border-b border-custom-dark-blue-1 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedRoles[index]?.role?.includes("Admin") || false
                        }
                        onChange={() => handleRoleChange(index, "Admin")}
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-custom-dark-blue-1 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedRoles[index]?.role?.includes("Moderator") || false
                        }
                        onChange={() => handleRoleChange(index, "Moderator")}
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-custom-dark-blue-1 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedRoles[index]?.role?.includes("Observer") || false
                        }
                        onChange={() => handleRoleChange(index, "Observer")}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {showAddContactModal && (
        <AddContactModal
          onClose={handleModalClose}
          fetchContacts={fetchContacts}
          userId={user._id}
        />
      )}
    </div>
  );
};

export default Step2;
