const mongoose = require('mongoose');

// Schema for individual choices (used in choice-based questions)
const choiceSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

// Schema for matching questions (pairing options with answers)
const matchingSchema = new mongoose.Schema({
  option: { type: String, required: true },
  answer: { type: String, required: true },
});

// Schema for storing user responses
const responseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answer: mongoose.Schema.Types.Mixed, 
  timestamp: { type: Date, default: Date.now },
});

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'Single Choice',
        'Multiple Choice',
        'Matching',
        'Rank Order',
        'Short Answer',
        'Long Answer',
        'Fill in the Blank',
        'Rating Scale',
      ],
      required: true,
    },
    choices: { type: [choiceSchema], default: [] }, // Default to empty array
    matching: { type: [matchingSchema], default: [] }, // Default to empty array
    ratingRange: {
      min: { type: Number, default: null }, // Default to null for clarity
      max: { type: Number, default: null },
    },
    blanks: { type: [String], default: [] },
    minLength: { type: Number, default: null },
    maxLength: { type: Number, default: null },
    responses: { type: [responseSchema], default: [] },
    lowScoreLabel: { type: String, default: "" },
    highScoreLabel: { type: String, default: "" },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);


const pollSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [questionSchema], // Array of questions within a poll
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  status: {type: Boolean, default:true}
}, { timestamps: true });

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;
