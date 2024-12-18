"use client";
import Search from "@/components/singleComponent/Search";
import { useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import ContactTable from "@/components/singleComponent/ContactTable";
import AddContactModal from "@/components/singleComponent/AddContactModal";
import { useGlobalContext } from "@/context/GlobalContext";
import HeadingBlue25px from "@/components/shared/HeadingBlue25px";
import Button from "@/components/shared/button";
import axios from "axios";
import ContactFilter from "@/components/singleComponent/ContactFilter";
import { useQuery } from "@tanstack/react-query";

const page = () => {
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [currentContact, setCurrentContact] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useGlobalContext();
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);


  const fetchContacts = async (userId, page = 1,  searchQuery = '', filters = {}) => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-all/contact`, {
          params:{
            page,
            limit:10,
            search: searchQuery,
            ...filters,
            userId: userId,
          }
        }
      );
      setContacts(response.data.contacts)
      setTotalPages(response.data.totalPages);
      return response.data.contacts
    
  };

  const { data, isLoading} = useQuery({
    queryKey: ["contacts", searchTerm,  page, user],
    queryFn:() => fetchContacts(user._id, page, searchTerm)
  })

  console.log('contacts', contacts)
  console.log('totalPages', totalPages)

  // useEffect(() => {
  //   if (user?._id) {
  //     console.log("Dependencies changed", { user, page, searchTerm });
  //     fetchContacts(user._id, page, searchTerm);
  //   }
  // }, [user, page, searchTerm]);


  // Debounced search handler
  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(1); 
    fetchContacts(user?._id, 1, term);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
  };


  const handleOpenAddContactModal = () => {
    setShowAddContactModal(true);
  };

  const handleModalClose = () => {
    setShowAddContactModal(false);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchContacts(user?._id, newPage, searchTerm);
  };

  const handleFilter = (filters) => {
    setPage(1);
    fetchContacts(user?._id, 1, searchTerm, filters);
  };

  if(isLoading){
    return(
      <div className='flex flex-col justify-center items-center min-h-[60vh]'>
        <p className="text-center  font-bold text-5xl text-custom-orange-1">
            Loading...
          </p>
      </div>
    )
  }

  return (
    <div className="my_profile_main_section_shadow bg-[#fafafb] bg-opacity-90 h-full min-h-screen flex flex-col justify-center items-center">
      {/* Navbar */}
      <div className="bg-white py-5 border-b border-solid border-gray-400 w-full">
        <div className="md:px-10 flex justify-between items-center">
          {/* left div */}
          <div className="flex-grow text-center">
            <p className="text-2xl font-bold text-custom-teal">Contacts</p>
          </div>
          {/* right div */}
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
      </div>

      {/* search bar */}
      <div className="border-b border-solid border-gray-400 py-4 w-full bg-white">
      <div className="w-full bg-white">
        <div className="p-5 flex justify-Start items-center ">
            <Search placeholder="Search contact name" onSearch={handleSearch} />
          </div>
          <ContactFilter onFilter={handleFilter} userId={user?._id} />
        </div>
      </div>

      {/* Body */}
      <div className="flex-grow w-full">
        {contacts?.length > 0 ? (
          <ContactTable
            contacts={contacts}
            setContacts={setContacts}
            currentContact={currentContact}
            setCurrentContact={setCurrentContact}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            page={page}
            totalPages={totalPages}
            handlePageChange={handlePageChange}

          />
        ) : (
          <div className="flex-grow w-full h-full flex justify-center items-center pt-20">
            <HeadingBlue25px>You have no contacts.</HeadingBlue25px>
          </div>
        )}
      </div>
      {showAddContactModal && (
        <AddContactModal
          onClose={handleModalClose}
          contactToEdit={currentContact}
          isEditing={isEditing}
          fetchContacts={fetchContacts}
          userId={user._id}
        />
      )}
    </div>
  );
};

export default page;
