'use client'
import Button from '@/components/shared/button'
import Dropdown from '@/components/shared/Dropdown'
import HeadingBlue25px from '@/components/shared/HeadingBlue25px'
import AddExternalAdminModal from '@/components/singleComponent/AddExternalAdminModal'
import ExternalAdminsTable from '@/components/singleComponent/ExternalAdminsTable'
import Search from '@/components/singleComponent/Search'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { MdAdd } from 'react-icons/md'

const page = () => {
  const [showAddExternalAdminModal, setShowAddExternalAdminModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [selectedCompany, setSelectedCompany] = useState('')

  const handleSelectedCompany = (company) => {
    setSelectedCompany(company)
  }
  

  const handleOpenAddExternalAdminModal = () => {
    setShowAddExternalAdminModal(true)
  }
  
  const handleSearch = (term) => {
    setSearchTerm(term)
    setPage(1)
    fetchExternalAdmins(1, term)
  }
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchExternalAdmins(newPage, searchTerm)
  };
  const handleModalClose = () => {
    setShowAddExternalAdminModal(false)
  }
  
  const fetchExternalAdmins = async (page=1, searchQuery = '', company='') => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/users/find-all`, {
      params: {
        page, limit: 10, search: searchQuery, company
      },
      withCredentials: true,
    });

    setTotalPages(response?.data?.data?.data?.totalPages)
    return response.data; 
  };

  const { data } = useQuery({
    queryKey: ['externalAdmins', searchTerm, selectedCompany, page],
    queryFn: ()=> fetchExternalAdmins(page, searchTerm, selectedCompany),
  });

  const externalAdmins = data?.data?.result

//  useEffect(() => {
   
//   fetchExternalAdmins(page, searchTerm)
//  }, [page, searchTerm])
 
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
          <p className="text-2xl font-bold text-custom-teal">External Admins</p>
        </div>
        {/* right div */}
        <div className="flex justify-end items-center gap-2">
          <Button
            children="Add New External Admin"
            type="submit"
            variant="default"
            icon={<MdAdd />}
            className="rounded-xl text-center shadow-[0px_3px_6px_#2976a54d] hidden md:flex w-[250px] py-3"
            onClick={handleOpenAddExternalAdminModal}
          />
          <Button
            children="."
            type="submit"
            variant="default"
            icon={<MdAdd />}
            className="rounded-xl text-center py-3 mr-2 shadow-[0px_3px_6px_#2976a54d] md:hidden block pr-2 pl-3"
            onClick={handleOpenAddExternalAdminModal}
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
      {externalAdmins?.length > 0 ? (
        <ExternalAdminsTable
        externalAdmins={externalAdmins}
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
          <HeadingBlue25px>You have no external admins.</HeadingBlue25px>
        </div>
      )}
    </div>
    {showAddExternalAdminModal && (
      <AddExternalAdminModal
        onClose={handleModalClose}
       
      />
    )}
  </div>
  )
}

export default page
