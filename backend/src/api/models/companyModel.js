const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AddCompany = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      enum: ['Food', 'Electronic', 'Vehicle', 'Other'],
      default: 'Other',
    },
    mobile: {
      type: String,
      required: true
    },
    companyEmail: {
      type: String,
      required: true
    },
    officialAddress: {
      type: String,
      required: true
    },
    billingAddress: {
      type: String,
      required: function() {
        return !this.sameAddress;
      }
    },
    sameAddress: {
      type: Boolean
    },
    country: {
      type: String,
      required: true
    },
    website: {
      type: String,
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

AddCompany.pre('save', function(next) {
  if (this.sameAddress) {
    this.billingAddress = this.officialAddress;
  }
  next();
});

const Company = mongoose.model("Company", AddCompany);

module.exports = Company;
