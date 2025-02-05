const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;


const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Moderator', 'Observer', 'Participant', 'AmplifyAdmin', 'AmplifyModerator', 'AmplifyObserver', 'AmplifyParticipant', 'AmplifyTechHost'],
    required: true
  },
  contactIds: [{ type: Schema.Types.ObjectId, ref: "Contact", default: [] }]  ,
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  termsAccepted: {
    type: Boolean,
    required: true
  },
  termsAcceptedTime: {
    type: Date,
    default: Date.now
  },
  isCreditCardAdded: {
    type: Boolean,
    default: false
  },
  token: {
    type: String,
  },
  company: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    default: 'self'
  },
  createdById: {
    type: Schema.Types.ObjectId,
  },
  credits:{
    type: String,
    default: "0"
  },
  stripeCustomerId: {
    type: String,
  },
  stripePaymentMethodId: {
    type: String,
  },
  

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;

