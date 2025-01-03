"use client";
import React, { useState, useRef, useEffect } from "react";
import TableHead from "../shared/TableHead";
import TableData from "../shared/TableData";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { RiPencilFill } from "react-icons/ri";
import ViewContactModal from "./ViewContactModal";
import AddContactModal from "./AddContactModal";
import { IoTrashBin } from "react-icons/io5";
import Button from "../shared/button";
import Pagination from "../shared/Pagination";
import toast from "react-hot-toast";
import ConfirmationModal from "../shared/ConfirmationModal";

const ContactTable = ({
  contacts,
  setContacts,
  currentContact,
  setCurrentContact,
  isEditing,
  setIsEditing,
  page,
  totalPages,
  handlePageChange
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items per page
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isViewContactModalOpen, setIsViewContactModalOpen] = useState(false);
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
 

  const modalRef = useRef();

 
  const handleEditContactOpenModal = (contact) => {
    closeModal();
    setIsEditing(true);
    setCurrentContact(contact);
    setIsEditContactModalOpen(true);
  };

  const handleEditContactCloseModal = () => {
    setIsEditContactModalOpen(false);
  };

  const handleViewContactOpenModal = (contact) => {
    closeModal();
    setCurrentContact(contact);
    setIsViewContactModalOpen(true);
  };

  const handleViewContactCloseModal = () => {
    setIsViewContactModalOpen(false);
  };

  

 // Add useEffect to handle click outside
 useEffect(() => {
  if (isModalOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }
  
  // Cleanup function to remove event listener
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isModalOpen]); 

const handleClickOutside = (event) => {
  if (modalRef.current && !modalRef.current.contains(event.target) && 
      !event.target.closest('button')) {
    closeModal();
  }
};

const toggleModal = (event, contact) => {
  const { top, left, bottom } = event.currentTarget.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  
  // Check if there's enough space below
  const spaceBelow = windowHeight - bottom;
  const modalHeight = 150; // Approximate height of modal
  
  // If space below is less than modal height, position above the button
  const topPosition = spaceBelow < modalHeight ? 
    'auto' : top;
  const bottomPosition = spaceBelow < modalHeight ?
    `${windowHeight - top}px` : 'auto';

  setModalPosition({ top: topPosition, left, bottom: bottomPosition });
  setCurrentContact(contact);
  setIsModalOpen(!isModalOpen);
};

  const closeModal = () => {
    setIsModalOpen(false);
  };

 
  const handleDeleteContact = async (contactId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/delete/contact/${contactId}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setContacts((prevContacts) =>
          prevContacts.filter((contact) => contact._id !== contactId)
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting moderator:", error);
      toast.error("Error deleting moderator.");
    } finally {
      setShowDeleteConfirmation(false);
      setContactToDelete(null);
    }
  };

  // Add new function to initiate delete
  const initiateDelete = (contact) => {
    setContactToDelete(contact);
    setShowDeleteConfirmation(true);
    closeModal();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentModerators = filteredModerators.slice(indexOfFirstItem, indexOfLastItem);

  // const totalPages = Math.ceil(filteredModerators.length / itemsPerPage);

  // const handlePageChange = (newPage) => {
  //   setCurrentPage(newPage);
  // };

  const formatDate = (dateInput) => {
    const date = new Date(dateInput);

    const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-based, so we add 1
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year

    return `${month}, ${day}, ${year}`;
  };

  return (
    <div className=" px-2 md:px-10 pt-10 w-full min-h-80">
      <div className="border-[0.5px] border-custom-dark-blue-1 rounded-xl overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-200 rounded-lg w-full ">
          <thead className="bg-custom-gray-2 rounded-lg py-2 w-full">
            <tr className="shadow-[0px_0px_26px_#00000029] w-full">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Added Date</TableHead>
              <TableHead>Last Updated On</TableHead>
              <TableHead>Actions</TableHead>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 rounded-lg w-full">
            {contacts?.map((contact, index) => (
              <tr
                key={contact._id}
                className="shadow-[0px_0px_26px_#00000029] w-full "
              >
                <TableData>
                  {contact.firstName} {contact.lastName}
                </TableData>
                <TableData>{contact.email}</TableData>
                <TableData>{contact.companyName}</TableData>
                <TableData>
                  {contact?.roles?.length > 0
                    ? contact.roles.join(", ")
                    : "No roles assigned"}
                </TableData>

                <TableData>{formatDate(contact.addedDate)}</TableData>
                <TableData>{formatDate(contact.lastUpdatedOn)}</TableData>
                <td className="flex justify-between items-center gap-2 relative py-2">
                  <Button
                    variant="primary"
                    className="w-16 text-center text-[12px] rounded-xl py-1"
                    onClick={(event) => toggleModal(event, contact)}
                  >
                    <BsThreeDotsVertical />
                  </Button>
                  {isModalOpen && currentContact === contact && (
                    <div
                      ref={modalRef}
                      style={{
                        position: 'fixed',
                        top: modalPosition.top !== 'auto' ? `${modalPosition.top}px` : 'auto',
                        left: `${modalPosition.left}px`,
                        bottom: modalPosition.bottom,
                      }}
                      className="z-50 bg-white shadow-lg rounded-md overflow-hidden"
                    >
                      <button
                        className="flex items-center justify-start px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleViewContactOpenModal(contact)}
                      >
                        <FaUser className="mr-2" /> View
                      </button>
                      <button
                        className="flex items-center justify-start px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleEditContactOpenModal(contact)}
                      >
                        <RiPencilFill className="mr-2" /> Edit
                      </button>
                      <button
                        className="flex items-center justify-start px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => initiateDelete(contact)}
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
      {isViewContactModalOpen && (
        <ViewContactModal
          user={currentContact}
          onClose={handleViewContactCloseModal}
        />
      )}

      {/* Edit Moderator Modal */}
      {isEditContactModalOpen && (
        <AddContactModal
          onClose={handleEditContactCloseModal}
          contactToEdit={currentContact}
          isEditing={isEditing}
        />
      )}

      {/* Add the confirmation modal */}
      {showDeleteConfirmation && (
        <ConfirmationModal
          heading="Delete Contact"
          text="Are you sure you want to delete this contact? This action cannot be undone."
          onCancel={() => setShowDeleteConfirmation(false)}
          onYes={() => handleDeleteContact(contactToDelete._id)}
        />
      )}
    </div>
  );
};

export default ContactTable;
