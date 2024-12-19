'use client'
import Button from '@/components/shared/button'
import HeadingBlue25px from '@/components/shared/HeadingBlue25px'
import AddCompanyModal from '@/components/singleComponent/AddCompanyModal'
import CompanyTable from '@/components/singleComponent/CompanyTable'
import Search from '@/components/singleComponent/Search'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'
import { MdAdd } from 'react-icons/md'

const page = () => {
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentCompany, setCurrentCompany] = useState(null)

  const handleOpenAddCompanyModal = () => {
    setShowAddCompanyModal(true)
  }

  
  const handleSearch = (term) => {
    setSearchTerm(term)
    setPage(1)
  }
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    // fetchExternalAdmins(newPage, searchTerm)
  };
  const handleAddCompanyModalClose = () => {
    setShowAddCompanyModal(false)
  }

  const fetchCompanies = async (page=1, searchQuery = '') => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-all-companies`, {
      params: {
        page, limit: 10, search: searchQuery
      },
      withCredentials: true,
    });

    setTotalPages(response?.data?.totalPages)
    return response.data; 
  };


  const { data, isLoading } = useQuery({
    queryKey: ['companies', searchTerm,  page],
    queryFn: ()=> fetchCompanies(page, searchTerm),
  });

  const companies = data?.companies


  
  return (
    <div className="my_profile_main_section_shadow bg-[#fafafb] bg-opacity-90 h-full min-h-screen flex flex-col justify-center items-center">
    {/* Navbar */}
    <div className="bg-white py-5 border-b border-solid border-gray-400 w-full">
      <div className="md:px-10 flex justify-between items-center">
        {/* left div */}
        <div className="flex-grow text-start">
          <p className="text-2xl font-bold text-custom-teal">Companies</p>
        </div>
        {/* right div */}
        <div className="flex justify-end items-center gap-2">
          <Button
            children="Add New Company"
            type="submit"
            variant="default"
            icon={<MdAdd />}
            className="rounded-xl text-center shadow-[0px_3px_6px_#2976a54d] hidden md:flex w-[250px] py-3"
            onClick={handleOpenAddCompanyModal}
          />
          <Button
            children="."
            type="submit"
            variant="default"
            icon={<MdAdd />}
            className="rounded-xl text-center py-3 mr-2 shadow-[0px_3px_6px_#2976a54d] md:hidden block pr-2 pl-3"
            onClick={handleOpenAddCompanyModal}
          />
        </div>
      </div>
    </div>

    {/* search bar */}
    <div className="border-b border-solid border-gray-400 py-2 w-full bg-white">
    <div className="w-full bg-white">
      <div className="p-2 flex justify-start items-center ">
          <Search placeholder="Search company name" onSearch={handleSearch} />
          
        </div>
      </div>
    </div>

    {/* Body */}
    <div className="flex-grow w-full">
      { isLoading ? (
         <div className='flex flex-col justify-center items-center min-h-[60vh]'>
         <p className="text-center  font-bold text-5xl text-custom-orange-1">
             Loading...
           </p>
       </div>
      ) :  companies?.length > 0 ? (
        <CompanyTable
        companies={companies}
        page={page}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        currentCompany={currentCompany} 
        setCurrentCompany={setCurrentCompany} 
        />
      ) : (
        <div className="flex-grow w-full h-full flex justify-center items-center pt-20">
          <HeadingBlue25px>You Have No Companies.</HeadingBlue25px>
        </div>
      )}
    </div>
    {showAddCompanyModal && (
      <AddCompanyModal
        onClose={handleAddCompanyModalClose}
       
      />
    )}
  </div>
  )
}

export default page
