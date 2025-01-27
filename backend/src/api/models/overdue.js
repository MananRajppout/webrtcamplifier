const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const overdueSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

  overdueMinutes: { type: Number, required: true, default: 0 },
  
  paymentStatus: {type: String, default: "Pending"} , 
  lastChecked: { type: Date, default: Date.now },
});

const Overdue = mongoose.model("Overdue", overdueSchema);

module.exports = Overdue;
