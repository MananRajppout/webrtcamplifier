const dotenv = require("dotenv");
const Payment = require("../models/paymentModel");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)


const createPaymentIntent = async (req, res) => {
  const {amount } = req.body;
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
  const { userId, projectId, amount, status, paymentIntent } = req.body;

  try {
    // Save the payment record in the database
    const payment = new Payment({
      userId,
      projectId,
      amount,
      status,
      paymentIntent, 
    });

    await payment.save();

    res.status(201).json({ message: "Payment saved successfully", payment });
  } catch (error) {
    console.error("Error saving payment:", error);
    res.status(500).json({ message: "Failed to save payment", error });
  }
}

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

const getPaymentDataByUserId = async(req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!id) {
    return res.status(400).json({ message: "UserId is required" });
  }

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch payments with pagination
    const payments = await Payment.find({ userId: id })
      .populate('projectId')
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
}

module.exports = {
  createPaymentIntent, savePayment, updatePaymentProjectId, getPaymentDataByUserId 
}