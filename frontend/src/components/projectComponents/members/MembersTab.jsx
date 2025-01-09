import TableData from "@/components/shared/TableData";
import TableHead from "@/components/shared/TableHead";
import axios from "axios";
import React, {  useState } from "react";
import { IoTrashSharp } from "react-icons/io5";
import { RiPencilFill } from "react-icons/ri";
import toast from "react-hot-toast";
import EditMemberModal from "./EditMemberModal";
import Pagination from "@/components/shared/Pagination";
import { useGlobalContext } from "@/context/GlobalContext";

const MembersTab = ({ project, setLocalProjectState }) => {
  const [selectedMember, setSelectedMember] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); 
  const membersPerPage = 10;
  const { user } = useGlobalContext()
console.log("user.role", user.role)
  // Function to handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

    // Calculate the current members to display
    const indexOfLastMember = currentPage * membersPerPage;
    const indexOfFirstMember = indexOfLastMember - membersPerPage;
    const currentMembers = project?.members?.slice(indexOfFirstMember, indexOfLastMember) || [];
  
    


  const handleEditMember = (member) => {
    console.log('inside handle edit member', member)
    setSelectedMember(member);
    setIsModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null); // Clear the selected member when modal closes
  };

  // Function to handle saving the edited member role

  const handleSaveMember = async (updatedMember) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/edit-member-role/${project._id}`,
        {
          updatedMember: updatedMember,
        }
      );

      if (response.status === 200) {
        toast.success(`${response.data.message}`);
        setLocalProjectState(response.data.updatedProject);
        // fetchProjects(userId);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error(`${error.response.data.message}`);
    }

    setIsModalOpen(false);
  };

  const handleRemoveMember = async (memberId) => {
    // Handle remove logic here, e.g., make an API call to remove the member
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/delete-member-from-project/${project._id}/${memberId}`
      );

      if (response.status === 200) {
        setLocalProjectState(response.data.updatedProject);
        toast.success(`${response.data.message}`);
        // fetchProjects(userId);
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(`${error.response.data.message}`);
    }
  };


  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg ">
        <thead className="border-b-[0.5px] border-solid border-custom-dark-blue-1">
          <tr>
            <TableHead>Member Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Added Date</TableHead>
            <TableHead>Last Updated On</TableHead>
            {
              (user?.role !== "AmplifyTechHost" && user?.role !== "AmplifyModerator" && user?.role !== "Moderator"  )  && (
                <TableHead>Action</TableHead>
              )
            }
          </tr>
        </thead>
        <tbody>
          {currentMembers.map((member) => (
            <tr key={member._id} className="hover:bg-gray-100 py-1">
              <TableData>
                {member?.userId?.firstName} {member?.userId?.lastName}
              </TableData>
              <TableData>
                {/* {member?.roles?.role} */}
                {member?.roles?.permissions?.join(", ")}{" "}
                {/* Display all roles (e.g., Admin, Moderator) */}
              </TableData>
              <TableData>
                {new Date(member?.userId?.addedDate).toLocaleDateString()}{" "}
                {/* Format Added Date */}
              </TableData>
              <TableData>
                {new Date(member?.userId?.lastUpdatedOn).toLocaleDateString()}{" "}
                {/* Format Last Updated On */}
              </TableData>
              {
                (user?.role !== "AmplifyTechHost" && user?.role !== "AmplifyModerator" && user?.role !== "Moderator"  )  && (
                  <TableData>
                {/* Actions (Edit, Remove) */}
                <div className="flex items-center space-x-2">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => handleEditMember(member)}
                  >
                    <RiPencilFill />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveMember(member._id)}
                  >
                    <IoTrashSharp />
                  </button>
                </div>
              </TableData>
                )
              }
            </tr>
          ))}
        </tbody>
      </table>

      {project?.members?.length > membersPerPage && ( 
        <div className="flex justify-end py-3">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(project.members.length / membersPerPage)}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      {isModalOpen && (
        <EditMemberModal
          member={selectedMember}
          onClose={handleCloseModal}
          onSave={handleSaveMember}
        />
      )}
    </div>
  );
};

export default MembersTab;
