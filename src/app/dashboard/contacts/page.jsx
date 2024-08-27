"use client";
import Button from "@/components/shared/button";
import Dropdown from "@/components/shared/Dropdown";
import Search from "@/components/singleComponent/Search";
import { projectStatusOptions } from "@/constant/Index";
import { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { MdAdd } from "react-icons/md";
import { BsEnvelopeCheckFill } from "react-icons/bs";
import ModeratorTable from "@/components/singleComponent/ModeratorTable";
import ContactTable from "@/components/singleComponent/ContactTable";
import AddContactModal from "@/components/singleComponent/AddContactModal";

const page = () => {
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [currentContact, setCurrentContact] = useState(null);
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchContacts();
  }, []);

  const user = {
    _id : '66bb5b41e7e451974c1734c6'
  }

  const fetchContacts = async () => {
    try {
      const response = await fetch(
       `${process.env.NEXT_PUBLIC_API_URL}/api/get-all/contact/${user._id}`
      );
      const data = await response.json();
      console.log(data);
      setContacts(data);

      // setFilteredModerators(data.moderators);
    } catch (error) {
      console.error("Error fetching moderators:", error);
    }
  };

  // Project status related functionality

  const handleSearch = () => {};

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    // Add your status select logic here
  };

  // Modal  functionality

  const handleOpenAddContactModal = () => {
    setShowAddContactModal(true);
  };

  const handleModalClose = () => {
    setShowAddContactModal(false);
  };

  return (
    <div className="my_profile_main_section_shadow bg-[#fafafb] bg-opacity-90 h-full min-h-screen flex flex-col justify-center items-center">
      {/* Navbar */}
      <div className="bg-white py-5 border-b border-solid border-gray-400 w-full">
        {" "}
        <div className="md:px-10 flex justify-between items-center ">
          {/* left div */}
          <div className="w-full text-center flex items-center justify-start">
            <p className="text-2xl font-bold text-custom-teal -mr-[10rem] sm:mr-[-2rem]">
              Contacts
            </p>
          </div>
          {/* right div */}
          <div className="flex justify-center items-center gap-2">
            <Button
              children="Add new Contact"
              type="submit"
              variant="default"
              icon={<MdAdd />}
              className="rounded-xl  text-center  shadow-[0px_3px_6px_#2976a54d] hidden md:flex w-[200px] py-3"
              onClick={handleOpenAddContactModal}
            />
          </div>
          <div className="flex justify-center items-center gap-4">
            <Button
              children=""
              type="submit"
              variant="default"
              icon={<MdAdd />}
              className="rounded-xl  text-center py-3 shadow-[0px_3px_6px_#2976a54d] md:hidden block pr-2 pl-3 mr-5"
              onClick={handleOpenAddContactModal}
            />
          </div>
        </div>
      </div>

      {/* search bar */}
      <div className="border-b border-solid border-gray-400 py-4 w-full bg-white hidden md:block">
        <div className="px-10 flex justify-start items-center ">
          <div className="flex justify-start items-center gap-5">
            <Search placeholder="Search contact name" onSearch={handleSearch} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-grow w-full ">
        <ContactTable contacts={contacts} setContacts={setContacts}
        currentContact={currentContact}
        setCurrentContact={setCurrentContact}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        />
      </div>
      {showAddContactModal && <AddContactModal onClose={handleModalClose} 
      contactToEdit={currentContact}
      isEditing={isEditing}
      />}
    </div>
  );
};

export default page;
