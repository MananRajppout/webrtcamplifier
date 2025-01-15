const Poll = require('../models/pollModel');

// Create a new poll
const createPoll = async (req, res) => {
  try {
    // Validate required fields
    const { title, createdById, projectId, questions } = req.body;
    if (!title || !createdById || !projectId || !questions || !questions.length) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Validate each question
    for (const question of questions) {
      if (!question.question || !question.type) {
        return res
          .status(400)
          .json({ message: "Each question must have a question and type." });
      }

      switch (question.type) {
        case "Single Choice":
        case "Multiple Choice":
          if (!Array.isArray(question.choices) || !question.choices.length) {
            return res
              .status(400)
              .json({ message: "Choice-based questions must have choices." });
          }
          break;
        case "Matching":
          if (!Array.isArray(question.matching) || !question.matching.length) {
            return res
              .status(400)
              .json({ message: "Matching questions must have pairs." });
          }
          break;
        case "Fill in the Blank":
          if (!Array.isArray(question.blanks) || !question.blanks.length) {
            return res
              .status(400)
              .json({ message: "Fill in the Blank questions must have blanks." });
          }
          break;
        case "Rating Scale":
          if (
            !question.ratingRange ||
            question.ratingRange.min === undefined ||
            question.ratingRange.max === undefined
          ) {
            return res
              .status(400)
              .json({ message: "Rating Scale questions must have a range." });
          }
          break;
        default:
          break;
      }
    }

    const poll = await Poll.create(req.body);
    return res.status(201).json(poll);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


// Get all polls
const getAllPolls = async (req, res) => {
  
  try {
    const limit = parseInt(req.query?.limit) || 10;
    const page = parseInt(req.query?.page) || 0;
    const status = req.query.status;

    const query = { projectId: req.params.projectId };

    if(status == "active"){
      query.status = true;
    }
    

    const polls = await Poll.find(query).populate("createdById", "firstName lastName email").populate("projectId", "name description").skip((page - 1) * limit).limit(limit);;
    const totalDocuments = await Poll.countDocuments(query);
    const totalPages = Math.ceil(totalDocuments / limit);
    return res.status(200).json({
      page,
      totalPages,
      totalDocuments,
      polls,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get a specific poll by ID
const getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate("createdById", "email name");;
    if (!poll) return res.status(404).json({ message: 'Poll not found.' });
    return res.status(200).json(poll);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update an existing poll
const updatePoll = async (req, res) => {
  try {
    const poll = await Poll.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!poll) return res.status(404).json({ message: 'Poll not found.' });

    const polls = await Poll.find({ projectId: poll.projectId }).populate("createdById", "firstName lastName email").populate("projectId", "name description").limit(10);;

    return res.status(200).json(polls);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Delete a poll
const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findByIdAndDelete(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found.' });
    return res.status(200).json({ message: 'Poll deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Submit a response to a poll
const submitPollResponse = async (req, res) => {
  try {
    const { pollId, userId, responses } = req.body;

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found." });

    // Check if the user has already submitted a response
    if (poll.responses.some((r) => r.userId.toString() === userId)) {
      return res.status(400).json({ message: "You have already submitted a response." });
    }

    // Validate and process responses
    poll.questions.forEach((question) => {
      const response = responses[question._id];
      if (!response) {
        throw new Error(`Missing response for question: ${question.question}`);
      }

      switch (question.type) {
        case "Single Choice":
        case "Multiple Choice":
          if (!question.choices.some((choice) => choice.text === response)) {
            throw new Error(`Invalid choice for question: ${question.question}`);
          }
          break;
        case "Rating Scale":
          if (
            typeof response !== "number" ||
            response < question.ratingRange.min ||
            response > question.ratingRange.max
          ) {
            throw new Error(`Invalid rating for question: ${question.question}`);
          }
          break;
        // Add more validation for other types
        default:
          break;
      }
    });

    // Save responses
    poll.responses.push({ userId, answer: responses });
    await poll.save();

    return res.status(200).json({ message: "Response submitted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// Get poll results
const getPollResults = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found." });

    const results = poll.responses.map((response) => ({
      userId: response.userId,
      answer: response.answer,
      timestamp: response.timestamp,
    }));

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const changeActiveStatus = async (req, res) => {
  try {
    const { isActive } = req.body; 
    const pollId = req.params.id;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const poll = await Poll.findByIdAndUpdate(
      pollId,
      { status: isActive },
      { new: true }
    ).populate('createdById', 'firstName lastName email').populate('projectId', 'name description');

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found.' });
    }

    // Fetch updated polls for the same project to send updated data back to the frontend
    const updatedPolls = await Poll.find({ projectId: poll.projectId }).populate(
      'createdById',
      'firstName lastName email'
    ).populate('projectId', 'name description');

    return res.status(200).json({
      message: 'Poll status updated successfully.',
      polls: updatedPolls,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createPoll,
  getAllPolls,
  getPollById,
  updatePoll,
  deletePoll,
  submitPollResponse,
  getPollResults,
  changeActiveStatus,
};
