const { useState } = require("react");

const PaymentForm = ({ clientSecret, userId, setPaymentId, setPaymentStatus }) => {
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
        }
      );
      if (error) {
         // Save failed payment to the backend
         await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/save-payment`, {
          userId,
      
          amount: 1, // $1 in cents
          status: "Failed",
          paymentIntent: null, // No paymentIntent since it failed
        });

        toast.error(`Payment failed: ${error.message}`);
      } else if (paymentIntent.status === "succeeded") {
         // Save successful payment to the backend
         const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/save-payment`, {
          userId,
         
          amount: 1, // $1 in cents
          status: "Completed",
          paymentIntent: paymentIntent
        });

        console.log('response', response)

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
        {isProcessing ? "Processing..." : "Pay $1"}
      </button>
    </form>
  );
};


export default PaymentForm