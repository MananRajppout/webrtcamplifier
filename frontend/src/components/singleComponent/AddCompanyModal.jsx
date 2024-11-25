"use client";
import React, { useState } from "react";
import InputField from "../shared/InputField";
import Button from "../shared/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const AddCompanyModal = ({ onClose }) => {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [website, setWebsite] = useState("");
  const [officialAddress, setOfficialAddress] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [country, setCountry] = useState("");
  const [sameAddress, setSameAddress] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const queryClient = useQueryClient();

  const addCompany = async (newCompany) => {
    console.log("add exter Company", newCompany);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/create-company`,
      newCompany,
      { withCredentials: true }
    );

    return response.data;
  };

  const mutation = useMutation({
    mutationFn: addCompany,
    onSuccess: () => {
      toast.success("Company Added Successfully.");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      onClose();
    },
  });
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data for submission
    const newCompany = {
      name,
      industry,
      mobile,
      companyEmail,
      website,
      officialAddress,
      billingAddress,
      sameAddress,
      country,
    };
    // Call the mutation
    mutation.mutate(newCompany);
  };

  const handleCloseErrorModal = () => {
    setError(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg w-[420px]">
        <h2 className="text-2xl font-semibold mb-1 text-custom-dark-blue-2">
          Add Company
        </h2>

        {error && (
          <div className="text-red-500 mb-4">
            {error} <button onClick={handleCloseErrorModal}>Close</button>
          </div>
        )}
        {successMessage && (
          <div className="text-green-500 mb-4">{successMessage}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center items-center gap-3">
            <InputField
              label="Name"
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <InputField
              label="Industry"
              type="text"
              name="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
          <div className="flex justify-center items-center gap-3">
            <InputField
              label="Mobile"
              type="text"
              name="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />

            <InputField
              label="Email"
              type="text"
              name="companyEmail"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
            />
          </div>
          <div className="w-full">
            <InputField
              label="Official Address"
              type="text"
              name="officialAddress"
              value={officialAddress}
              onChange={(e) => setOfficialAddress(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={sameAddress}
              onChange={(e) => setSameAddress(e.target.checked)}
            />
            <label className="text-sm">Same as Official Address</label>
            <InputField
              label="Billing Address"
              type="text"
              name="billingAddress"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              disabled={sameAddress}
            />
          </div>
          <div className="flex justify-center items-center gap-3">
            <InputField
              label="Country"
              type="text"
              name="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
            <InputField
              label="Website"
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {/* Button */}
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="cancel"
              onClick={onClose}
              className="rounded-xl text-center py-2 px-5 shadow-[0px_3px_6px_#09828F69]"
            >
              {"Cancel"}
            </Button>
            <Button
              type="submit"
              variant="save"
              className="rounded-xl text-center py-2 px-5 shadow-[0px_3px_6px_#09828F69]"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompanyModal;
