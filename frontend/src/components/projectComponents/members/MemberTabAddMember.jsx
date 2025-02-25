import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "@/components/shared/button";
import toast from "react-hot-toast";
import { useGlobalContext } from "@/context/GlobalContext";

const MemberTabAddMember = ({
  onClose,
  project,
  userId,
  setLocalProjectState,
}) => {
  const [peoples, setPeoples] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const { user } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);

  console.log("peoples", peoples)

  const fetchContacts = async () => {
    try {
      const apiEndpoint =
        user?.role === "SuperAdmin" || user?.role === "AmplifyAdmin"
          ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/getAllAmplifyAdminsByAdminId`
          : `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/create/contact-from-member-tab/${userId}/${project?._id}`;

      const response = await axios.get(apiEndpoint, { withCredentials: true });
      setPeoples(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const existingMemberIds = new Set(project?.members?.map((member)=> member?.userId?._id))

  const newPeoples = peoples.filter((person) => !existingMemberIds.has(person._id))

  // Handle checkbox toggle
  const handleRoleChange = (personId, role) => {
    setSelectedRoles((prevRoles) => {
      const rolesForPerson = prevRoles[personId] || [];
      if (rolesForPerson.includes(role)) {
        // Remove role if it is already selected
        return {
          ...prevRoles,
          [personId]: rolesForPerson.filter((r) => r !== role),
        };
      } else {
        // Add the role to the person's roles
        return {
          ...prevRoles,
          [personId]: [...rolesForPerson, role],
        };
      }
    });
  };

  const handleSubmit = async () => {
    const selectedPeople = newPeoples
      .filter(
        (person) =>
          selectedRoles[person._id] && selectedRoles[person._id].length > 0
      )
      .map((person) => ({
        personId: person._id,
        roles: selectedRoles[person._id],
      }));

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/app-people-to-project`,
        {
          projectId: project._id,
          people: selectedPeople,
        }
      );
      if (response.status === 200) {
        console.log("response.data", response.data)
        setLocalProjectState(response.data.updatedProject);
      }
      onClose();
    } catch (error) {
      console.error("Error adding people:", error);
    }
  };

  // Function to copy the registration link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/register`
    );
    toast.success("Link copied to clipboard!");
  };

  const handleSendEmail = async (person) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/send-email-to-new-contact`,
        person,
        { withCredentials: true }
      );
      if(response.status === 200){
        toast.success(`${response.data.message}`)
      }
    } catch (error) {
      toast.error(`${error.response.data.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg w-[50%]">
        <h2 className="text-2xl font-semibold mb-4 text-custom-dark-blue-2">
          Add New Contact
        </h2>
        <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border border-gray-300">Name</th>
                <th className="px-4 py-2 border border-gray-300">Admin</th>
                <th className="px-4 py-2 border border-gray-300">Moderator</th>
                <th className="px-4 py-2 border border-gray-300">Observer</th>
              </tr>
            </thead>
            <tbody>
              {newPeoples.map((person) => (
                <tr key={person._id}>
                  <td className="px-4 py-2 border border-gray-300 text-sm font-semibold">
                    {person.firstName} {person.lastName}
                    {!person.isUser && (
                      <span className="text-xs font-normal block">
                        {person.email}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-center">
                    <input
                      type="checkbox"
                      className="cursor-pointer"
                      checked={
                        selectedRoles[person._id]?.includes("Admin") || false
                      }
                      onChange={() => handleRoleChange(person._id, "Admin")}
                      disabled={!person.isUser}
                    />
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-center">
                    <input
                      type="checkbox"
                      className="cursor-pointer"
                      checked={
                        selectedRoles[person._id]?.includes("Moderator") ||
                        false
                      }
                      onChange={() => handleRoleChange(person._id, "Moderator")}
                      disabled={!person.isUser}
                    />
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-center">
                    <input
                      type="checkbox"
                      className="cursor-pointer"
                      checked={
                        selectedRoles[person._id]?.includes("Observer") || false
                      }
                      onChange={() => handleRoleChange(person._id, "Observer")}
                      disabled={!person.isUser}
                    />
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-center">
                    {!person.isUser && (
                      <div className="flex flex-col gap-2 justify-center items-center">
                        <Button
                          className=" text-white px-3 py-1 rounded-lg text-xs"
                          variant="secondary"
                          type="button"
                          onClick={handleCopyLink}
                        >
                          Copy Link
                        </Button>
                        <Button
                          className=" text-white px-3 py-1 rounded-lg text-xs"
                          variant="secondary"
                          type="button"
                          onClick={() => handleSendEmail(person)}
                        >
                          Send Email
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center items-center gap-5 pt-5">
          <Button
            onClick={onClose}
            variant="primary"
            type="submit"
            children="Close"
            className="px-5 py-1 rounded-xl"
          />
          <Button
            onClick={handleSubmit}
            variant="primary"
            type="submit"
            children="Add People"
            className="px-5 py-1 rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default MemberTabAddMember;
