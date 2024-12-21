"use client";
import React, { useState, useRef, useEffect } from "react";
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
import ConfirmationModal from "../shared/ConfirmationModal";

const InternalAdminsTable = ({
  internalAdmins,
  page,
  setPage,
  totalPages,
  handlePageChange,
  currentAdmin,
  setCurrentAdmin,
  companies,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isViewInternalAdminModalOpen, setIsViewInternalAdminModalOpen] =
    useState(false);
  const [isEditInternalAdminModalOpen, setIsEditInternalAdminModalOpen] =
    useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const queryClient = useQueryClient();

  const modalRef = useRef();

  const handleEditAdminOpenModal = (admin) => {
    setIsEditInternalAdminModalOpen(true);
    closeModal();
  };

  const handleEditAdminCloseModal = () => {};

  const handleViewAdminOpenModal = (admin) => {
    setIsViewInternalAdminModalOpen(true);
    closeModal();
  };

  // Add useEffect to handle click outside
  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const handleClickOutside = (event) => {
    if (
      modalRef.current &&
      !modalRef.current.contains(event.target) &&
      !event.target.closest("button")
    ) {
      closeModal();
    }
  };

  const toggleModal = (event, admin) => {
    const { top, left, bottom } = event.currentTarget.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Check if there's enough space below
    const spaceBelow = windowHeight - bottom;
    const modalHeight = 150; // Approximate height of modal

    // If space below is less than modal height, position above the button
    const topPosition = spaceBelow < modalHeight ? "auto" : top;
    const bottomPosition =
      spaceBelow < modalHeight ? `${windowHeight - top}px` : "auto";

    setModalPosition({ top: topPosition, left, bottom: bottomPosition });
    setCurrentAdmin(admin);
    setIsModalOpen(!isModalOpen);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const deleteAdmin = async (adminId) => {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/delete-by-admin/${adminId}`,
      { withCredentials: true }
    );
  };

  const handleDeleteAdmin = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      toast.success("Admin Deleted Successfully.");
      queryClient.invalidateQueries({ queryKey: ["internalAdmins"] });
    },
    onError: (error) => {
      console.log('error', error)
      toast.error(`${error.response?.data?.message}`)
      setError(error.response?.data?.message || "An error occurred.");
    },
  });

  const handleDeleteClick = (admin) => {
    setAdminToDelete(admin);
    setShowDeleteConfirmation(true);
    closeModal();
  };

  const handleConfirmDelete = () => {
    handleDeleteAdmin.mutate(adminToDelete._id);
    setShowDeleteConfirmation(false);
    setAdminToDelete(null);
  };

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
                <TableData>{admin.firstName}</TableData>
                <TableData>{admin.lastName}</TableData>
                <TableData>{admin.email}</TableData>
                {/* <TableData>{admin.companyName}</TableData> */}
                <TableData>{admin.status}</TableData>

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
                      className="z-50 bg-white shadow-lg rounded-md overflow-hidden"
                      style={{
                        position: "fixed",
                        top:
                          modalPosition.top !== "auto"
                            ? `${modalPosition.top}px`
                            : "auto",
                        left: `${modalPosition.left}px`,
                        bottom: modalPosition.bottom,
                      }}
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
                        onClick={() => handleDeleteClick(admin)}
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
          onClose={() => setIsViewInternalAdminModalOpen(false)}
          currentAdmin={currentAdmin}
        />
      )}

      {/* Edit Moderator Modal */}
      {isEditInternalAdminModalOpen && (
        <EditInternalAdminModal
          onClose={() => setIsEditInternalAdminModalOpen(false)}
          currentAdmin={currentAdmin}
          companies={companies}
        />
      )}

      {showDeleteConfirmation && (
        <ConfirmationModal
          heading="Delete Admin"
          text={`Are you sure you want to delete ${adminToDelete?.firstName} ${adminToDelete?.lastName}?`}
          onCancel={() => setShowDeleteConfirmation(false)}
          onYes={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default InternalAdminsTable;
