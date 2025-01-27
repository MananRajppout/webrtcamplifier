import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import axios from 'axios';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import Button from '../shared/button';



const UpdateCreditCardModal = ({ userId, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdateCard = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      alert("Stripe is not loaded.");
      return;
    }

    setIsProcessing(true);

    // Create a payment method using Stripe
    const cardElement = elements.getElement(CardElement);
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.error("Error creating payment method:", error.message);
      toast.error(error.message);
      setIsProcessing(false);
      return;
    }

    try {
      // Send the paymentMethodId to the backend
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/update-credit-card`, {
        userId,
        paymentMethodId: paymentMethod.id,
      });

      if (response.status === 200) {
        toast.success("Credit card updated successfully.");
        onClose()
      }
    } catch (error) {
      console.error("Error updating credit card:", error.response.data.error);
      toast.error("Failed to update credit card.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg w-[420px] lg:w-[600px]">
    <form onSubmit={handleUpdateCard}>
      <h3 className='py-5 text-custom-dark-blue-1 font-semibold'>Update Credit Card</h3>
      <CardElement />
      {/* Button */}
      <div className='flex justify-end gap-4 mt-4'>
      <div className="flex ">
          <Button
            variant="cancel"
            onClick={onClose}
            className="rounded-xl text-center py-2 px-5 shadow-[0px_3px_6px_#09828F69]"
          >
            {"Cancel"}
          </Button>
        </div>
      <Button variant='primary' type="submit" disabled={!stripe || isProcessing}
      className="rounded-xl text-center py-2 px-5 shadow-[0px_3px_6px_#09828F69] "
      >
        {isProcessing ? "Updating..." : "Update Card"}
      </Button>
      </div>
    </form>
    </div>
    </div>
  );
};

export default UpdateCreditCardModal
