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
import ViewCompanyModal from "./ViewCompanyModal";
import EditCompanyModal from "./EditCompanyModal";
import ConfirmationModal from "../shared/ConfirmationModal";

const CompanyTable = ({
  companies,
  page,
  totalPages,
  handlePageChange, currentCompany, setCurrentCompany
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isViewCompanyModalOpen, setIsViewCompanyModalOpen] = useState(false);
  const [isEditCompanyModalOpen, setIsEditCompanyModalOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);

  
  const itemsPerPage = 10; 
  const queryClient = useQueryClient(); 
  const modalRef = useRef();

  const handleEditCompanyOpenModal = (company) => {
    setIsEditCompanyModalOpen(true)
    closeModal();
  };

  const handleViewCompanyOpenModal = (company) => {
    setIsViewCompanyModalOpen(true)
    closeModal();
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
  
  const toggleModal = (event, company) => {
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
    setCurrentCompany(company);
    setIsModalOpen(!isModalOpen);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const deleteCompany = async (companyId) => {
    await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/delete-company/${companyId}`, { withCredentials: true });
  };
  
  const handleDeleteCompany = useMutation({
    mutationFn: deleteCompany, 
    onSuccess: () => {
      toast.success("Company Deleted Successfully.");
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setShowDeleteConfirmation(false);
      setCompanyToDelete(null);
    },
  });

  // Add new function to initiate delete
  const initiateDelete = (company) => {
    setCompanyToDelete(company);
    setShowDeleteConfirmation(true);
    closeModal();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
 
  

  return (
    <div className=" px-2 md:px-10 pt-10 w-full min-h-80">
      <div className="border-[0.5px] border-custom-dark-blue-1 rounded-xl overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-200 rounded-lg w-full ">
          <thead className="bg-custom-gray-2 rounded-lg py-2 w-full">
            <tr className="shadow-[0px_0px_26px_#00000029] w-full">
              <TableHead>Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Company Email</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Official Address</TableHead>
              <TableHead>Billing Address</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Action</TableHead>
              
            
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 rounded-lg w-full">
            {companies?.map((company) => (
              <tr
                key={company._id}
                className="shadow-[0px_0px_26px_#00000029] w-full "
              >
                <TableData>
                  {company.name} 
                </TableData>
                <TableData>
                  {company.industry} 
                </TableData>
                <TableData>
                  {company.mobile} 
                </TableData>
                <TableData>
                  {company.companyEmail} 
                </TableData>
                <TableData>
                  {company.website} 
                </TableData>
                <TableData>
                  {company.officialAddress} 
                </TableData>
                <TableData>
                  {company.billingAddress} 
                </TableData>
                <TableData>
                  {company.country} 
                </TableData>
                

                
                <td className="flex justify-between items-center gap-2 relative py-2">
                  <Button
                    variant="primary"
                    className="w-16 text-center text-[12px] rounded-xl py-1"
                    onClick={(event) => toggleModal(event, company)}
                  >
                    <BsThreeDotsVertical />
                  </Button>
                  {isModalOpen && currentCompany === company && (
                    <div
                      ref={modalRef}
                      className="z-50 bg-white shadow-lg rounded-md overflow-hidden"
                      style={{
                        position: 'fixed',
                        top: modalPosition.top !== 'auto' ? `${modalPosition.top}px` : 'auto',
                        left: `${modalPosition.left}px`,
                        bottom: modalPosition.bottom,
                      }}
                    >
                      <button
                        className="flex items-center justify-start px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleViewCompanyOpenModal(company)}
                      >
                        <FaUser className="mr-2" /> View
                      </button>
                      <button
                        className="flex items-center justify-start px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleEditCompanyOpenModal(company)}
                      >
                        <RiPencilFill className="mr-2" /> Edit
                      </button>
                      <button
                        className="flex items-center justify-start px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => initiateDelete(company)}
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
      {isViewCompanyModalOpen && (
        <ViewCompanyModal
          onClose={()=> setIsViewCompanyModalOpen(false)}
          currentCompany={currentCompany}
        />
      )}

      {/* Edit Moderator Modal */}
      {isEditCompanyModalOpen && (
        <EditCompanyModal
          onClose={()=> setIsEditCompanyModalOpen(false)}
          currentCompany={currentCompany}
        />
      )}

      {/* Add the confirmation modal */}
      {showDeleteConfirmation && (
        <ConfirmationModal
          heading="Delete Company"
          text="Are you sure you want to delete this company? This action cannot be undone."
          onCancel={() => setShowDeleteConfirmation(false)}
          onYes={() => handleDeleteCompany.mutate(companyToDelete._id)}
        />
      )}
    </div>
  );
};

export default CompanyTable;
