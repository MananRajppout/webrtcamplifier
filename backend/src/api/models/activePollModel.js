const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activePollSchema = new Schema({
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveMeeting', required: true },
  pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true },
  status: {
    type: String,
    enum: ['Active', 'Ended'],
    default: 'Active',
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, required: true },
});

const ActivePoll = mongoose.model('ActivePoll', activePollSchema);

module.exports = ActivePoll;
