import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import toast from 'react-hot-toast';
import PaymentForm from '../stripe/paymentForm';

// Load your Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);


const Step3 = ({ userId, setPaymentId, setPaymentStatus }) => {

  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  

  useEffect(() => {
    const createPaymentIntent = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/create-payment-intent`,
          { amount: 1 } 
        );
        if (response.status === 201) {
          setClientSecret(response.data.clientSecret);
          // toast.success("Payment intent created successfully!");
        }
      } catch (error) {
        console.error("Error creating payment intent:", error);
        // toast.error("Failed to create payment intent. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, []);
  



  return (
    <div className="px-5 md:px-0">
      <p className="text-custom-teal text-lg font-bold text-center">
        Complete Your Payment to Create Project
      </p>
      {isLoading && <p>Loading...</p>}
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm clientSecret={clientSecret}
          userId={userId}
          setPaymentId={setPaymentId}
          setPaymentStatus={setPaymentStatus}
          amount={1}
          />
        </Elements>
      )}
    </div>
  )
}



export default Step3
