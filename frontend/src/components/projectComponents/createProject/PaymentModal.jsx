import Button from '@/components/shared/button';
import PaymentForm from '@/components/stripe/paymentForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import React, { useEffect, useState } from 'react'

// Load your Stripe publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const PaymentModal = ({ userId, setPaymentStatus, amount, credits, onClose}) => {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [paymentId, setPaymentId] = useState("");

  const packages = [
    { hours: 1, rate: 150, description: "1 Hour: $150.00" },
    { hours: 25, rate: 3500, description: "25 Hours: $3,500.00" },
    { hours: 100, rate: 13500, description: "100 Hours: $13,500.00" },
    { hours: 250, rate: 32500, description: "250 Hours: $32,500.00" },
    { hours: 500, rate: 60000, description: "500 Hours: $60,000.00" },
  ];

  const totalHours = credits.reduce(
    (sum, qty, index) => sum + qty * packages[index].hours,
    0
  );

  const totalPrice = credits.reduce(
    (sum, qty, index) => sum + qty * packages[index].rate,
    0
  );

 

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/create-payment-intent`,
          { amount }
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

    createPaymentIntent();
  }, [amount]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg w-[420px] lg:w-[600px]">
        <h2 className="text-2xl font-semibold mb-1 text-custom-dark-blue-2">
          Add Payment
        </h2>

       {/* Credits Summary */}
       <h3 className="text-lg font-semibold mt-4">Selected Credits</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm mt-2">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Qty</th>
              <th className="border border-gray-300 p-2">Package</th>
              <th className="border border-gray-300 p-2">Total Hours</th>
              <th className="border border-gray-300 p-2">Total Price (USD)</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg, index) =>
              credits[index] > 0 ? (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{credits[index]}</td>
                  <td className="border border-gray-300 p-2">
                    {pkg.description}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {credits[index] * pkg.hours}
                  </td>
                  <td className="border border-gray-300 p-2">
                    ${(credits[index] * pkg.rate).toFixed(2)}
                  </td>
                </tr>
              ) : null
            )}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td className="border border-gray-300 p-2 text-right" colSpan="2">
                Grand Total:
              </td>
              <td className="border border-gray-300 p-2">{totalHours}</td>
              <td className="border border-gray-300 p-2">
                ${totalPrice.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>


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
                amount={amount}
                totalHours={totalHours}
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
  )
}

export default PaymentModal
