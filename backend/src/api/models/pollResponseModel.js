const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pollResponseSchema = new Schema({
  activePollId: { type: mongoose.Schema.Types.ObjectId, ref: 'ActivePoll', required: true },
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveMeeting', required: true },
  participantId: { type: String, required: true }, 
  participantEmail: { type: String, required: true }, 
  responses: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll.questions', required: true },
      answer: mongoose.Schema.Types.Mixed, 
    },
  ],
  submittedAt: { type: Date, default: Date.now },
});


const PollResponse = mongoose.model('PollResponse', pollResponseSchema);

module.exports = PollResponse;