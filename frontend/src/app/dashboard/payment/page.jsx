"use client";
import Button from "@/components/shared/button";
import HeadingBlue25px from "@/components/shared/HeadingBlue25px";
import Pagination from "@/components/shared/Pagination";
import AddPaymentModal from "@/components/singleComponent/AddPaymentModal";
import UpdateCreditCardWrapper from "@/components/singleComponent/UpdateCreditCardWrapper";
import { useGlobalContext } from "@/context/GlobalContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { GrUpdate } from "react-icons/gr";
import { MdAdd } from "react-icons/md";

const Payment = () => {
  const { user } = useGlobalContext();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [projectPage, setProjectPage] = useState(1);
  const [totalProjectPages, setTotalProjectPages] = useState(1);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isUpdateCreditCardModalOpen, setIsUpdateCreditCardModalOpen] =
    useState(false);
  const [remainingCredits, setRemainingCredits] = useState(null);
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?._id) {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/remaining-credits/${user._id}`
          );
          console.log("res", response.data);
          setRemainingCredits(response.data.remainingCredits);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) {
      fetchPaymentData(page);
    }
  }, [user, page]);

  useEffect(() => {
    if (user?._id) {
      fetchProjectData(projectPage);
    }
  }, [user, projectPage]);

  const fetchPaymentData = async (page) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-user-payment-data/${user._id}`,
        {
          params: {
            page,
            limit: 10,
          },
        }
      );
      setPayments(response.data.payments);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectData = async (page) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/project-minutes-usage/${user._id}`,
        {
          params: {
            page,
            limit: 10,
          },
        }
      );
      
      setTotalProjectPages(response.data.totalPages);
      setProjectPage(response.data.currentPage);
      setProjects(response.data.projects)
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  };
  

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleOpenAddPaymentModal = () => {
    setIsAddPaymentModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddPaymentModalOpen(false);
  };

  const handleOpenUpdateCreditCardModal = () => {
    setIsUpdateCreditCardModalOpen(true);
  };

  const handleUpdateCreditCardModalClose = () => {
    setIsUpdateCreditCardModalOpen(false);
  };

  const handleProjectPageChange = (newPage) => {
    setProjectPage(newPage);
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
            <div>
              <Button
                children="Update Credit Card"
                type="submit"
                variant="default"
                icon={<GrUpdate />}
                className="rounded-xl text-center shadow-[0px_3px_6px_#2976a54d] hidden md:flex w-[200px] py-3"
                onClick={handleOpenUpdateCreditCardModal}
              />
              <Button
                children="."
                type="submit"
                variant="default"
                icon={<GrUpdate />}
                className="rounded-xl text-center py-3 mr-2 shadow-[0px_3px_6px_#2976a54d] md:hidden block pr-2 pl-3"
                onClick={handleOpenUpdateCreditCardModal}
              />
            </div>
            <div>
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
      </div>

      {/* Body */}
      <div className="flex-grow w-full">
        <div className="px-2 md:px-10 pt-10 w-full">
          <HeadingBlue25px
            children={`Remaining Balance ${remainingCredits} minutes`}
          />
        </div>
        <div className="px-2 md:px-10 pt-10 w-full min-h-80">
          <div className="  pb-5  w-full">
            <HeadingBlue25px children="Your Purchases" />
          </div>
          <div className="border-[0.5px] border-custom-dark-blue-1 rounded-xl overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200 rounded-lg w-full">
              <thead className="bg-custom-gray-2 rounded-lg py-2 w-full">
                <tr className="shadow-[0px_0px_26px_#00000029] w-full">
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Payment Date
                  </th>
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
                    <tr
                      key={payment._id}
                      className="shadow-[0px_0px_26px_#00000029] w-full"
                    >
                      <td className="px-4 py-2">${payment.amount}</td>
                      <td className="px-4 py-2">{payment.status}</td>
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
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
        <div className="px-2 md:px-10 pt-10 w-full min-h-80">
          <div className="  pb-5  w-full">
            <HeadingBlue25px children="Your Usages" />
          </div>
          <div className="border-[0.5px] border-custom-dark-blue-1 rounded-xl overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200 rounded-lg w-full">
              <thead className="bg-custom-gray-2 rounded-lg py-2 w-full">
                <tr className="shadow-[0px_0px_26px_#00000029] w-full">
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Project Name
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Cumulative minutes
                  </th>
                  
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 rounded-lg w-full">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : projects.length > 0 ? (
                  projects.map((project) => (
                    <tr
                      key={project._id}
                      className="shadow-[0px_0px_26px_#00000029] w-full"
                    >
                      <td className="px-4 py-2">{project?.name}</td>
                      <td className="px-4 py-2">{project?.cumulativeMinutes || 0}</td>
                      
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-4xl">
                      No project usage available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end py-3">
            <Pagination
               currentPage={projectPage}
    totalPages={totalProjectPages}
    onPageChange={handleProjectPageChange}
            />
          </div>
        </div>
      </div>
      {isAddPaymentModalOpen && (
        <AddPaymentModal
          userId={user._id}
          onClose={handleModalClose}
          fetchPaymentData={fetchPaymentData}
        />
      )}
      {isUpdateCreditCardModalOpen && (
        <UpdateCreditCardWrapper
          userId={user._id}
          onClose={handleUpdateCreditCardModalClose}
        />
      )}
    </div>
  );
};

export default Payment;
