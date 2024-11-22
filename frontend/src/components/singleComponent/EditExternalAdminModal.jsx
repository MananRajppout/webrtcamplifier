import React, { useState } from "react";
import InputField from "../shared/InputField";
import Button from "../shared/button";
import Heading20pxBlueUC from "../shared/Heading20pxBlueUC";
import { FaCheckCircle, FaCross } from "react-icons/fa";
import Dropdown from "../shared/Dropdown";

const EditExternalAdminModal = ({ onClose, currentAdmin, companies }) => {
  console.log('current admin', currentAdmin)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [seletecCompany, setseletecCompany] = useState(currentAdmin.company)

  const handleSelectedCompany = (company) => {
    setseletecCompany(company)
  }
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white py-8  rounded-lg w-[420px]">
       <div className="meeting_bg pl-8 py-2 flex justify-center items-start flex-col pt-3">
          <Heading20pxBlueUC
          children={`${currentAdmin.firstName} ${currentAdmin.lastName}`}
          />
          <p className="uppercase text-slate-700 text-xs pt-1">{currentAdmin.role}</p>
          <div className="flex items-center">
              <input 
                type="radio" 
                id="active" 
                name="status" 
                value="Active" 
                checked={currentAdmin?.status === "Active"} 
                
              />
              <label htmlFor="active" className="ml-2">Active</label>
              <input 
                type="radio" 
                id="inactive" 
                name="status" 
                value="Inactive" 
                checked={currentAdmin?.status !== "Active"} 
                
              />
              <label htmlFor="inactive" className="ml-2">Inactive</label>
            </div>
       </div>
       <div className="pt-5 px-8">
        <p className="text-lg font-semibold text-custom-dark-blue-2 pb-4">Edit External Admin</p>
        <div className="flex justify-start items-center gap-10">
            <div className="flex flex-col justify-center items-start">
              <p className="font-semibold text-custom-dark-blue-1">First Name</p>
             
            </div>
            <div className="flex flex-col justify-center items-start">
              <p className="font-semibold text-custom-dark-blue-1">Last Name</p>
             
            </div>
        </div>
        <div className="flex flex-col justify-center items-start pt-3">
              <p className="font-semibold text-custom-dark-blue-1">Email</p>
              <p className="text-sm">{currentAdmin.email}</p>
            </div>
       </div>
        <div className="flex flex-col justify-center items-start pt-3 pl-8">
              <p className="font-semibold text-custom-dark-blue-1">Company</p>
              <Dropdown
          options={companies}
          selectedOption={seletecCompany}
          onSelect={handleSelectedCompany}
          className='min-w-60'
          />
            </div>
       </div>
       < div className="flex justify-center items-center pt-5">
            <Button
            children='Close'
            type="button"
            variant="default"
            className="text-white px-5 py-2 rounded-lg"
            onClick={onClose}
              />
              
       </div>
      
    </div>
  );
};

export default EditExternalAdminModal;
