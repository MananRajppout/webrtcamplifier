import React, { useState } from "react";
import InputField from "../shared/InputField";
import Button from "../shared/button";
import Heading20pxBlueUC from "../shared/Heading20pxBlueUC";
import Dropdown from "../shared/Dropdown";
import { Mutation, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const EditCompanyModal = ({ onClose, currentCompany }) => {
  const [name, setName] = useState(currentCompany.name);
  const [industry, setIndustry] = useState(currentCompany.industry);
  const [companyEmail, setCompanyEmail] = useState(currentCompany.companyEmail);
  const [mobile, setMobile] = useState(currentCompany.mobile);
  const [website, setWebsite] = useState(currentCompany.website);
  const [country, setCountry] = useState(currentCompany.country);
  const [officialAddress, setOfficialAddress] = useState(
    currentCompany.officialAddress
  );
  const [billingAddress, setBillingAddress] = useState(
    currentCompany.billingAddress
  );
  const [sameAddress, setSameAddress] = useState(currentCompany.sameAddress);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const queryClient = useQueryClient();

  const updateCompany = async (companyData) => {
    console.log('update external admin ', companyData)
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/update-company/${companyData.id}`,
      companyData,
      {
        withCredentials: true,
      }
    );

    console.log('response', response.data)
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: updateCompany,
    onSuccess: (data) => {
      console.log('data in side on success', data)
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      onClose();
    },
    onError: (error) => {
      setError(error.response?.data?.message || "An error occurred.");
    },
  });

  const handleSave = () => {
    const companyData = {
      name, industry, companyEmail, mobile, website, country, officialAddress, billingAddress,
      id:currentCompany._id
    }

    mutation.mutate(companyData)
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white py-8  rounded-lg w-[420px]">
        <div className="meeting_bg pl-8 py-2 flex justify-center items-start flex-col pt-3">
          <Heading20pxBlueUC children={`${currentCompany.name}`} />
        </div>
        <div className="pt-5 px-8">
          <p className="text-lg font-semibold text-custom-dark-blue-2 pb-4">
            Edit Company Information
          </p>
          <div className="flex justify-start items-center gap-10">
            <div className="flex flex-col justify-center items-start">
              <InputField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col justify-center items-start">
              <InputField
                label="Industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-start items-center gap-10">
            <div className="flex flex-col justify-center items-start">
              <InputField
                label="Official Address"
                value={officialAddress}
                onChange={(e) => setOfficialAddress(e.target.value)}
              />
            </div>
            <div className="flex flex-col justify-center items-start">
              <InputField
                label="Billing Address"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-start items-center gap-10">
            <div className="flex flex-col justify-center items-start">
              <InputField
                label="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div className="flex flex-col justify-center items-start">
              <InputField
                label="Mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-start items-center gap-10">
            <div className="flex flex-col justify-center items-start">
              <InputField
                label="Email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col justify-center items-start">
              <InputField
                label="Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center pt-5 gap-5">
          <Button
            children="Cancel"
            type="button"
            variant="default"
            className="text-white px-5 py-2 rounded-lg"
            onClick={onClose}
          />
          <Button
            children="Save"
            type="button"
            variant="secondary"
            className="text-white px-5 py-2 rounded-lg"
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
};

export default EditCompanyModal;
