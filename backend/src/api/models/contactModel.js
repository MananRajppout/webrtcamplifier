const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, match: /.+\@.+\..+/ },
    companyName: { type: String },
    roles: [
      {
        type: String,
        enum: [
          "Admin",
          "Moderator",
          "Observer",
          "AmplifyAdmin",
          "AmplifyModerator",
          "AmplifyObserver",
          "AmplifyTechHost",
        ],
        required: true,
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    addedDate: { type: Date, default: Date.now },
    lastUpdatedOn: { type: Date, default: Date.now },
    isUser: { type: Boolean, default: false },
  },
  { timestamps: true }
);

contactSchema.pre("save", function (next) {
  this.lastUpdatedOn = Date.now();
  next();
});

const Contact = mongoose.model("Contact", contactSchema);
module.exports = Contact;
