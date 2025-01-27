import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import UpdateCreditCardModal from './UpdateCreditCardModal';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const UpdateCreditCardWrapper = ({ userId, onClose }) => {
  return (
    <Elements stripe={stripePromise}>
      <UpdateCreditCardModal userId={userId} onClose={onClose} />
    </Elements>
  );
};

export default UpdateCreditCardWrapper;
