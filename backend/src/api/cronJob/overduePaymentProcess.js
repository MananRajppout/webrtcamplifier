const { default: mongoose } = require("mongoose");
const Overdue = require("../models/overdue");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const calculateAmountFromMinutes = (overdueMinutes) => {
  const ratePerHour = 165; 
  const ratePerMinute = ratePerHour / 60;
  return Math.ceil(overdueMinutes * ratePerMinute * 100);
};

const processOverduePayments = async () => {
  console.log("Running overdue payment processing job...");

  const session = await mongoose.startSession();

  try {
    // Find overdue records with paymentStatus "Pending"

    const overdueRecords = await Overdue.find({ paymentStatus: "Pending" });

    console.log("overdue records", overdueRecords);

    for (const record of overdueRecords) {
      const { userId, overdueMinutes } = record;

      session.startTransaction(); // Start a new transaction

      try {
        const user = await User.findById(userId).session(session); // Include the session
        if (!user) {
          console.error(`User with ID ${userId} not found.`);
          continue;
        }

        if (!user.stripeCustomerId || !user.stripePaymentMethodId) {
          console.error(`Stripe details missing for user ${userId}`);
          await Overdue.findByIdAndUpdate(
            record._id,
            { paymentStatus: "Failed" },
            { session }
          );
          await session.commitTransaction(); // Commit transaction even if skipped
          continue;
        }

        const amountToCharge = calculateAmountFromMinutes(overdueMinutes);

        console.log("amount to charge", amountToCharge);

        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountToCharge,
          currency: "usd",
          customer: user.stripeCustomerId,
          payment_method: user.stripePaymentMethodId,
          off_session: true,
          confirm: true,
        });

        if (paymentIntent.status === "succeeded") {
          console.log(`Payment successful for user ${userId}`);

          // Save the payment record
          const payment = new Payment({
            userId,
            amount: amountToCharge / 100,
            status: "Completed",
            paymentIntent: paymentIntent.id,
          });

          await payment.save({ session }); // Save with the transaction session

          // Update the user's credits
          const currentCredits = parseInt(user.credits || "0", 10); // Convert existing credits to integer
          user.credits = (currentCredits + overdueMinutes).toString(); // Add overdue minutes
          await user.save({ session }); // Save with the transaction session

          console.log(`Updated credits for user ${userId}: ${user.credits}`);

          // Update the overdue record
          await Overdue.findByIdAndUpdate(
            record._id,
            { paymentStatus: "Successful" },
            { session } // Use session here
          );

          await session.commitTransaction(); // Commit the transaction
        }
      } catch (error) {
        console.error(`Payment failed for user ${userId}:`, error.message);
        await Overdue.findByIdAndUpdate(
          record._id,
          { paymentStatus: "Failed" },
          { session }
        );
        await session.abortTransaction(); // Rollback the transaction on failure
      } finally {
        session.endSession(); // End the session
      }
    }
  } catch (error) {
    console.error("Error in overdue payment processing job:", error);
  } finally {
    session.endSession(); 
  }

};


module.exports = processOverduePayments;
