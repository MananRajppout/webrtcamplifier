'use client'
import Button from '@/components/shared/button'
import Dropdown from '@/components/shared/Dropdown'
import HeadingBlue25px from '@/components/shared/HeadingBlue25px'
import AddExternalAdminModal from '@/components/singleComponent/AddExternalAdminModal'
import AddInternalAdminModal from '@/components/singleComponent/AddInternalAdminModal'
import ExternalAdminsTable from '@/components/singleComponent/ExternalAdminsTable'
import InternalAdminsTable from '@/components/singleComponent/InternalAdminsTable'
import Search from '@/components/singleComponent/Search'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { MdAdd } from 'react-icons/md'

const page = () => {
  const [showAddInternalAdminModal, setShowAddInternalAdminModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [selectedCompany, setSelectedCompany] = useState('')

  const handleSelectedCompany = (company) => {
    setSelectedCompany(company)
  }
  

  const handleOpenAddInternalAdminModal = () => {
    setShowAddInternalAdminModal(true)
  }
  
  const handleSearch = (term) => {
    setSearchTerm(term)
    setPage(1)
    fetchInternalAdmins(1, term)
  }
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchInternalAdmins(newPage, searchTerm)
  };
  const handleModalClose = () => {
    setShowAddInternalAdminModal(false)
  }
  
  const fetchInternalAdmins = async (page=1, searchQuery = '', company='') => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/find-all`, {
      params: {
        page, limit: 10, search: searchQuery, company
      },
      withCredentials: true,
    });
    setTotalPages(response?.data?.data?.totalPages)
    return response.data; 
  };

  const { data } = useQuery({
    queryKey: ['internalAdmins', searchTerm, selectedCompany, page],
    queryFn: ()=> fetchInternalAdmins(page, searchTerm, selectedCompany),
  });

  const internalAdmins = data?.data?.result

 
    // New function to fetch all companies
    const fetchAllCompanies = async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-all-companies`, {
        withCredentials: true,
      });
      return response.data; 
    };
  
    // New query to fetch companies
    const { data: companiesData } = useQuery({
      queryKey: ['companies'],
      queryFn: fetchAllCompanies,
    });
  
    // You can access the companies data here
    // const companies = companiesData?.data;
    const companies = companiesData?.companies.reduce((acc, cur) => {
     
      if (!acc.includes(cur.name)) {
        acc.push(cur.name);
      }
      return acc;
    }, []);
    
    // Log the unique company names
    

  return (
    <div className="my_profile_main_section_shadow bg-[#fafafb] bg-opacity-90 h-full min-h-screen flex flex-col justify-center items-center">
    {/* Navbar */}
    <div className="bg-white py-5 border-b border-solid border-gray-400 w-full">
      <div className="md:px-10 flex justify-between items-center">
        {/* left div */}
        <div className="flex-grow text-start">
          <p className="text-2xl font-bold text-custom-teal">Internal Admins</p>
        </div>
        {/* right div */}
        <div className="flex justify-end items-center gap-2">
          <Button
            children="Add New User"
            type="submit"
            variant="default"
            icon={<MdAdd />}
            className="rounded-xl text-center shadow-[0px_3px_6px_#2976a54d] hidden md:flex w-[250px] py-3"
            onClick={handleOpenAddInternalAdminModal}
          />
          <Button
            children="."
            type="submit"
            variant="default"
            icon={<MdAdd />}
            className="rounded-xl text-center py-3 mr-2 shadow-[0px_3px_6px_#2976a54d] md:hidden block pr-2 pl-3"
            onClick={handleOpenAddInternalAdminModal}
          />
        </div>
      </div>
    </div>

    {/* search bar */}
    <div className="border-b border-solid border-gray-400 py-2 w-full bg-white">
    <div className="w-full bg-white">
      <div className="p-2 flex justify-between items-center ">
          <Search placeholder="Search name & email" onSearch={handleSearch} />
          <div className='flex justify-end items-center gap-2'>
          <Dropdown
          options={companies}
          selectedOption={selectedCompany}
          onSelect={handleSelectedCompany}
          className='min-w-60'
          />
          <Button 
          children='Clear Filter'
          variant='secondary'
          type='button'
          onClick={()=> setSelectedCompany('')}
          className='px-3 py-2 rounded-lg'
          />
          </div>
        </div>
        {/* <ContactFilter onFilter={handleFilter} userId={user?._id} /> */}
      </div>
    </div>

    {/* Body */}
    <div className="flex-grow w-full">
      {internalAdmins?.length > 0 ? (
        <InternalAdminsTable
        internalAdmins={internalAdmins}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        currentAdmin={currentAdmin} 
        setCurrentAdmin={setCurrentAdmin} 
        companies={companies}
        />
      ) : (
        <div className="flex-grow w-full h-full flex justify-center items-center pt-20">
          <HeadingBlue25px>You have no internal admins.</HeadingBlue25px>
        </div>
      )}
    </div>
    {showAddInternalAdminModal && (
      <AddInternalAdminModal
        onClose={handleModalClose}
       
      />
    )}
  </div>
  )
}

export default page
