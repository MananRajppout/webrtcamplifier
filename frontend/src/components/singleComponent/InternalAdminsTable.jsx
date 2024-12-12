"use client";
import React, { useState, useRef } from "react";
import TableHead from "../shared/TableHead";
import TableData from "../shared/TableData";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { RiPencilFill } from "react-icons/ri";
import { IoTrashBin } from "react-icons/io5";
import Button from "../shared/button";
import Pagination from "../shared/Pagination";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import ViewInternalAdminModal from "./ViewInternalAdminModal copy";
import EditInternalAdminModal from "./EditInternalAdminModal";

const InternalAdminsTable = ({
  internalAdmins,
  page,setPage,
  totalPages,
  handlePageChange, currentAdmin, setCurrentAdmin, companies
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isViewInternalAdminModalOpen, setIsViewInternalAdminModalOpen] = useState(false);
  const [isEditInternalAdminModalOpen, setIsEditInternalAdminModalOpen] = useState(false);
  // const [currentAdmin, setCurrentAdmin] = useState(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const queryClient = useQueryClient(); 

  const modalRef = useRef();

  const handleEditAdminOpenModal = (admin) => {
    setIsEditInternalAdminModalOpen(true)
    closeModal();
  };

  const handleEditAdminCloseModal = () => {
    
  };

  const handleViewAdminOpenModal = (admin) => {
    setIsViewInternalAdminModalOpen(true)
    closeModal();
  };

  const handleViewAdminCloseModal = () => {
  };

  const toggleModal = (event, admin) => {
    const { top, left } = event.currentTarget.getBoundingClientRect();
    setModalPosition({ top, left });
    setCurrentAdmin(admin);
    setIsModalOpen(!isModalOpen);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

  const deleteAdmin = async (adminId) => {
    await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/delete-by-admin/${adminId}`, { withCredentials: true });
  };
  
  const handleDeleteAdmin = useMutation({
    mutationFn: deleteAdmin, // Use the mutation function style
    onSuccess: () => {
      toast.success("Admin Deleted Successfully.");
      queryClient.invalidateQueries({ queryKey: ['internalAdmins'] });
    },
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
 
  

  return (
    <div className=" px-2 md:px-10 pt-10 w-full min-h-80">
      <div className="border-[0.5px] border-custom-dark-blue-1 rounded-xl overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-200 rounded-lg w-full ">
          <thead className="bg-custom-gray-2 rounded-lg py-2 w-full">
            <tr className="shadow-[0px_0px_26px_#00000029] w-full">
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              {/* <TableHead>Company</TableHead> */}
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
              
            
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 rounded-lg w-full">
            {internalAdmins?.map((admin) => (
              <tr
                key={admin._id}
                className="shadow-[0px_0px_26px_#00000029] w-full "
              >
                <TableData>
                  {admin.firstName} 
                </TableData>
                <TableData>
                   {admin.lastName}
                </TableData>
                <TableData>{admin.email}</TableData>
                {/* <TableData>{admin.companyName}</TableData> */}
                <TableData>
                  {admin.status}
                </TableData>

                
                <td className="flex justify-between items-center gap-2 relative py-2">
                  <Button
                    variant="primary"
                    className="w-16 text-center text-[12px] rounded-xl py-1"
                    onClick={(event) => toggleModal(event, admin)}
                  >
                    <BsThreeDotsVertical />
                  </Button>
                  {isModalOpen && currentAdmin === admin && (
                    <div
                      ref={modalRef}
                      className="absolute top-2 right-12 z-50 bg-white shadow-lg rounded-md overflow-hidden"
                    >
                      <button
                        className="flex items-center justify-start px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleViewAdminOpenModal(admin)}
                      >
                        <FaUser className="mr-2" /> View
                      </button>
                      <button
                        className="flex items-center justify-start px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleEditAdminOpenModal(admin)}
                      >
                        <RiPencilFill className="mr-2" /> Edit
                      </button>
                      <button
                        className="flex items-center justify-start px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleDeleteAdmin.mutate(admin._id)} // Call the mutation
>
                        <IoTrashBin className="mr-2" /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end py-3">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
      {/* View Contact Modal */}
      {isViewInternalAdminModalOpen && (
        <ViewInternalAdminModal
          onClose={()=> setIsViewInternalAdminModalOpen(false)}
          currentAdmin={currentAdmin}
        />
      )}

      {/* Edit Moderator Modal */}
      {isEditInternalAdminModalOpen && (
        <EditInternalAdminModal
          onClose={()=> setIsEditInternalAdminModalOpen(false)}
          currentAdmin={currentAdmin}
          companies={companies}
        />
      )}
    </div>
  );
};

export default InternalAdminsTable;
