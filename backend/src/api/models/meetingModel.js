const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const meetingSchema = new Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String },
  startDate: { 
    type: Date,
    validate: {
      validator: function(value) {
      return this.ongoing || value != null;
      },
      message: 'Start Date is required unless Ongoing/TBD is checked.'
    }
  },
  startTime: {
    type: String,
    validate: {
      validator: function(value) {
        return this.ongoing || value != null;
      },
      message: 'Start Time is required unless Ongoing/TBD is checked.'
    },
    trim: true
  },

  moderator: { type: [mongoose.Schema.Types.ObjectId], ref: 'Contact', default: [] },
  
  timeZone: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required:true
  },
  ongoing: {
    type: Boolean,
    default: false
  },

  enableBreakoutRoom: {
    type: Boolean,
    default: false
  },

  meetingPasscode: { type: String, required: true },
  status: {
    type: String,
    enum: ['Active', 'Complete', 'Scheduled'],
    default: 'Scheduled'
  },
  
}, { timestamps: true });

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;

