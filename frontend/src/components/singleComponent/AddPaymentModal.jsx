import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../shared/button";
import Dropdown from "../shared/Dropdown";
import { packages } from "@/constant/Index";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "../stripe/paymentForm";

// Load your Stripe publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const AddPaymentModal = ({ userId, onClose, fetchPaymentData }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentId, setPaymentId] = useState("");
  


  useEffect(() => {
    if (userId) {
      fetchProjects();
    }
  }, [userId]);

  useEffect(() => {
    if (paymentStatus === "succeeded") {
      // Close the modal and refresh payment data when payment succeeds
      onClose();
      fetchPaymentData();
    }
  }, [paymentStatus, onClose, fetchPaymentData]);

  

  const handlePackageSelect = async (selected) => {
    const selectedPkg = packages.find(
      (pkg) =>
        `${pkg.hours} hours @ $${pkg.rate}/hr - $${pkg.total}` === selected
    );
    if (!selectedPkg) {
      console.error("Selected package not found");
      return;
    }

    setSelectedPackage(selectedPkg); 

    // Create a payment intent for the selected package
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/create-payment-intent`,
        { amount: selectedPkg.total } 
      );
      if (response.status === 201) {
        setClientSecret(response?.data?.clientSecret);
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg w-[420px] lg:w-[600px]">
        <h2 className="text-2xl font-semibold mb-1 text-custom-dark-blue-2">
          Add Payment
        </h2>

       

        {/* Select Package Dropdown */}
        <div className="mt-4 lg:flex lg:justify-center lg:items-center lg:gap-4">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Select Package
          </label>
          <Dropdown
            className="w-full"
            options={packages.map(
              (pkg) => `${pkg.hours} hours @ $${pkg.rate}/hr - $${pkg.total}`
            )}
            selectedOption={
              selectedPackage
                ? `${selectedPackage.hours} hours @ $${selectedPackage.rate}/hr - $${selectedPackage.total}`
                : "Select a package"
            }
            onSelect={(selected) => {
              handlePackageSelect(selected); 
            }}
          />
        </div>

        {/* Display Selected Package Details */}
        {selectedPackage && (
          <div className="mt-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold">Selected Package:</h2>
            <div className="flex justify-start items-center gap-3 pt-2">
              <p>
                <strong>Hours:</strong> {selectedPackage.hours}
              </p>
              <p>
                <strong>Rate per Hour:</strong> ${selectedPackage.rate}
              </p>
              <p>
                <strong>Total Price:</strong> ${selectedPackage.total}
              </p>
            </div>
          </div>
        )}

        {/* Display Payment Form */}
        {clientSecret && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Complete Payment</h2>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                clientSecret={clientSecret}
                userId={userId}
                setPaymentId={setPaymentId}
                setPaymentStatus={setPaymentStatus}
                amount={selectedPackage?.total}
              />
            </Elements>
          </div>
        )}

        {/* Button */}
        <div className="flex justify-end gap-4 mt-4">
          <Button
            variant="cancel"
            onClick={onClose}
            className="rounded-xl text-center py-2 px-5 shadow-[0px_3px_6px_#09828F69]"
          >
            {"Cancel"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentModal;
