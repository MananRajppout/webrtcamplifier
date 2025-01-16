
// In your PollResponse or ActivePoll model file

const mongoose = require("mongoose");

const pollResponseSchema = new mongoose.Schema({
  activePollId: { type: mongoose.Schema.Types.ObjectId, ref: "ActivePoll", required: true },
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: "LiveMeeting", required: true },
  participantId: { type: String, required: true },
  participantEmail: { type: String, required: true },
  responses: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
      answer: mongoose.Schema.Types.Mixed,
    },
  ],
  submittedAt: { type: Date, default: Date.now },
});

// Static method for fetching poll results
pollResponseSchema.statics.getPollResults = async function (activePollId) {
  try {
    // Fetch the ActivePoll document
    const activePoll = await mongoose.model("ActivePoll").findById(activePollId);
    if (!activePoll) {
      throw new Error("Active poll not found");
    }

    // Fetch the poll details
    const poll = await mongoose.model("Poll").findById(activePoll.pollId).lean();
    if (!poll) {
      throw new Error("Poll not found");
    }

    // Fetch responses for the poll
    const pollResponses = await this.find({ activePollId });
    if (!pollResponses || pollResponses.length === 0) {
      return { success: false, message: "No responses found for this poll" };
    }

    // Group responses by participant
    const results = pollResponses.map((response) => ({
      participantId: response.participantId,
      participantEmail: response.participantEmail,
      responses: response.responses.map((res) => {
        const question = poll.questions.find((q) => q._id.toString() === res.questionId.toString());
        return {
          question: question ? question.question : "Question not found",
          answer: res.answer,
        };
      }),
    }));

    return { success: true, results };
  } catch (error) {
    console.error("Error in getPollResults:", error);
    throw new Error(error.message || "Failed to fetch poll results");
  }
};

const PollResponse = mongoose.model("PollResponse", pollResponseSchema);

module.exports = PollResponse;


// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const pollResponseSchema = new Schema({
//   activePollId: { type: mongoose.Schema.Types.ObjectId, ref: 'ActivePoll', required: true },
//   meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveMeeting', required: true },
//   participantId: {
//     type: String, 
//     required: true,
//   },
//   participantEmail: { type: String, required: true },
//   responses: [
//     {
//       questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true }, 
//       answer: mongoose.Schema.Types.Mixed, 
//     },
//   ],
//   submittedAt: { type: Date, default: Date.now },
// });


// pollResponseSchema.pre('save', async function (next) {
//   const LiveMeeting = mongoose.model('LiveMeeting');

//   try {
//     const meeting = await LiveMeeting.findOne({ meetingId: this.meetingId });
//     if (!meeting) {
//       console.error(`Meeting with ID ${this.meetingId} not found.`);
//       throw new Error('Associated meeting not found.');
//     }

//     const participantExists = meeting.participantsList.some(
//       (participant) => participant.id === this.participantId
//     );

//     if (!participantExists) {
//       console.error(`Participant ID ${this.participantId} not found in meeting.`);
//       throw new Error('Participant ID does not exist in the meeting.');
//     }

//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// const PollResponse = mongoose.model('PollResponse', pollResponseSchema);

// module.exports = PollResponse;




// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const pollResponseSchema = new Schema({
//   activePollId: { type: mongoose.Schema.Types.ObjectId, ref: 'ActivePoll', required: true },
//   meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveMeeting', required: true },
//   participantId: { type: String, required: true }, 
//   participantEmail: { type: String, required: true }, 
//   responses: [
//     {
//       questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll.questions', required: true },
//       answer: mongoose.Schema.Types.Mixed, 
//     },
//   ],
//   submittedAt: { type: Date, default: Date.now },
// });


// const PollResponse = mongoose.model('PollResponse', pollResponseSchema);

// module.exports = PollResponse;