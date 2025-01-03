'use client'
import Button from '@/components/shared/button';
import Pagination from '@/components/shared/Pagination';
import AddPaymentModal from '@/components/singleComponent/AddPaymentModal';
import { useGlobalContext } from '@/context/GlobalContext'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { MdAdd } from 'react-icons/md';

const Payment = () => {
  const {user} = useGlobalContext()
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  console.log('payment', payments)
  useEffect(() => {
    if (user?._id) {
      fetchPaymentData(page);
    }
  }, [user, page]);

  const fetchPaymentData = async (page) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-user-payment-data/${user._id}`, {
        params: {
          page,
          limit: 10,
        },
      });
      setPayments(response.data.payments);
      setTotalPages(response.data.totalPages); 
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleOpenAddPaymentModal = () => {
    setIsAddPaymentModalOpen(true)
  }
  

  const handleModalClose = () => {
    setIsAddPaymentModalOpen(false);
  };

  return (
    <div className="my_profile_main_section_shadow bg-[#fafafb] bg-opacity-90 h-full min-h-screen flex flex-col justify-center items-center">
    {/* Navbar */}
    <div className="bg-white py-5 border-b border-solid border-gray-400 w-full">
      <div className="md:px-10 flex justify-between items-center">
        {/* left div */}
        <div className="flex-grow text-center">
          <p className="text-2xl font-bold text-custom-teal">Payment</p>
        </div>
         {/* right div */}
         <div className="flex justify-end items-center gap-2">
            <Button
              children="Add new Payment"
              type="submit"
              variant="default"
              icon={<MdAdd />}
              className="rounded-xl text-center shadow-[0px_3px_6px_#2976a54d] hidden md:flex w-[200px] py-3"
              onClick={handleOpenAddPaymentModal}
            />
            <Button
              children="."
              type="submit"
              variant="default"
              icon={<MdAdd />}
              className="rounded-xl text-center py-3 mr-2 shadow-[0px_3px_6px_#2976a54d] md:hidden block pr-2 pl-3"
              onClick={handleOpenAddPaymentModal}
            />
          </div>
      </div>
    </div>

    

    {/* Body */}
    <div className="flex-grow w-full">
    <div className="px-2 md:px-10 pt-10 w-full min-h-80">
      <div className="border-[0.5px] border-custom-dark-blue-1 rounded-xl overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-200 rounded-lg w-full">
          <thead className="bg-custom-gray-2 rounded-lg py-2 w-full">
            <tr className="shadow-[0px_0px_26px_#00000029] w-full">
              <th className="px-4 py-2 text-left font-medium text-gray-700">Amount</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Project</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Payment Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 rounded-lg w-full">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment._id} className="shadow-[0px_0px_26px_#00000029] w-full">
                  <td className="px-4 py-2">${payment.amount }</td>
                  <td className="px-4 py-2">{payment.status}</td>
                  <td className="px-4 py-2">{payment.projectId ? payment.projectId.name : "N/A"}</td>
                  <td className="px-4 py-2">
            {new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(payment.createdAt))}
          </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-4xl">
                  No payments available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end py-3">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
      
    </div>
    </div>
    {
      isAddPaymentModalOpen && (
        <AddPaymentModal
        userId={user._id}
        onClose={handleModalClose}
        fetchPaymentData={fetchPaymentData}
        />
      )
    }
  </div>
  )
}

export default Payment
