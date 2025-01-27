import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import axios from "axios";
import toast from "react-hot-toast";

const { useState } = require("react");

const PaymentForm = ({ clientSecret, userId, setPaymentId, setPaymentStatus, amount, totalHours}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      toast.error("Stripe is not loaded yet. Please try again.");
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);

    try {
      const { paymentIntent, error } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
          setup_future_usage: "off_session",
        }
      );
      if (error) {
          // Save failed payment to the backend
        const failedPaymentData = {
          userId,
          amount,
          status: "Failed",
          paymentIntent: null,
          totalHours
        };
        

        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/save-payment`, failedPaymentData);


        toast.error(`Payment failed: ${error.message}`);
      } else if (paymentIntent.status === "succeeded") {
        const successfulPaymentData = {
          userId,
          amount,
          status: "Completed",
          paymentIntent: paymentIntent,
          paymentMethodId: paymentIntent.payment_method, 
          totalHours
        };
       

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/save-payment`,
          successfulPaymentData
        );

        setPaymentId(response.data.payment._id)
        setPaymentStatus("succeeded")
        toast.success("Payment successful!");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <CardElement className="mb-4 border p-2" />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="px-4 py-2 bg-custom-teal text-white rounded-lg"
      >
        {isProcessing ? "Processing..." : `Pay $ ${amount}`}
      </button>
    </form>
  );
};


export default PaymentForm