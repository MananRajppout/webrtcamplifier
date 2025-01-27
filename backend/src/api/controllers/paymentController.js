const dotenv = require("dotenv");
const Payment = require("../models/paymentModel");
const { default: mongoose } = require("mongoose");
const User = require("../models/userModel");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createStripeCustomer = async (req, res) => {
  const { userId, email } = req.body;
console.log("createStripeCustomer", userId, email)
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.stripeCustomerId) {
      return res
        .status(200)
        .json({
          message: "Customer already exists",
          stripeCustomerId: user.stripeCustomerId,
        });
    }

    const customer = await stripe.customers.create({
      email: email || user.email,
      name: `${user.firstName} ${user.lastName}`,
    });

    console.log("stripe customer", customer)

    user.stripeCustomerId = customer.id;
    await user.save();

    res
      .status(201)
      .json({
        message: "Stripe customer created successfully",
        stripeCustomerId: customer.id,
      });
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    res
      .status(500)
      .json({ message: "Failed to create Stripe customer", error });
  }
};

const createPaymentIntent = async (req, res) => {
  const { amount } = req.body;
  // Validate amount
  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  const price = Math.round(amount * 100);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price,
      currency: "usd",
      payment_method_types: ["card"],
    });
    res.status(201).json({
      message: "Payment intent created successfully",
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error.message);
    res.status(500).json({
      error: "Failed to create payment intent",
      details: error.message,
    });
  }
};

const savePayment = async (req, res) => {
  const { userId, amount, status, paymentIntent, totalHours, paymentMethodId } =
    req.body;
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!userId || !amount || !status || !totalHours) {
      return res.status(400).json({
        message: "userId, amount,total hours and status are required fields",
      });
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    // Attach the payment method to the customer if not already saved
    if (paymentMethodId && user.stripeCustomerId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: user.stripeCustomerId,
      });

      // Set the payment method as the default for future charges
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      user.stripePaymentMethodId = paymentMethodId;
    }

    // Save the payment record in the database
    const payment = new Payment({
      userId,
      amount,
      status,
      paymentIntent,
    });

    await payment.save({ session });

    const currentCredits = parseInt(user.credits) || 0;
    user.credits = (currentCredits + parseInt(totalHours) * 60).toString();

    await user.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Payment saved successfully", payment });
  } catch (error) {
    // Rollback the transaction
    await session.abortTransaction();
    session.endSession();
    console.error("Error saving payment:", error);
    res.status(500).json({ message: "Failed to save payment", error });
  }
};

const updatePaymentProjectId = async (req, res) => {
  const { paymentId, projectId } = req.body;

  try {
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { projectId },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({ message: "Payment updated successfully", payment });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ message: "Failed to update payment", error });
  }
};

const getPaymentDataByUserId = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!id) {
    return res.status(400).json({ message: "UserId is required" });
  }

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch payments with pagination
    const payments = await Payment.find({ userId: id })
      .populate("projectId")
      .skip(skip)
      .limit(parseInt(limit));

    // Count total documents for pagination
    const totalDocuments = await Payment.countDocuments({ userId: id });
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).json({
      page: parseInt(page),
      totalPages,
      totalDocuments,
      payments,
    });
  } catch (error) {
    console.error("Error fetching payment data:", error);
    res.status(500).json({ message: "Failed to fetch payment data", error });
  }
};

module.exports = {
  createPaymentIntent,
  savePayment,
  updatePaymentProjectId,
  getPaymentDataByUserId,
  createStripeCustomer,
};
