const Poll = require('../models/pollModel');

// Create a new poll
const createPoll = async (req, res) => {
  try {
    const poll = await Poll.create(req.body)
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
    const polls = await Poll.find({ projectId: req.params.projectId }).populate("createdById", "firstName lastName email").populate("projectId", "name description").skip((page - 1) * limit).limit(limit);;
    const totalDocuments = await Poll.countDocuments({ projectId: req.params.projectId});
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
    const poll = await Poll.findById(req.params.id);
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
    return res.status(200).json(poll);
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
    const { pollId, userId, answer } = req.body;

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found.' });

    const existingResponse = poll.responses.find(r => r.userId.toString() === userId);
    if (existingResponse) {
      return res.status(400).json({ message: 'You have already submitted a response.' });
    }

    // Handle response based on poll type
    switch (poll.type) {
      case 'Single Choice':
        if (typeof answer !== 'number' || answer < 0 || answer >= poll.choices.length) {
          return res.status(400).json({ message: 'Invalid choice.' });
        }
        poll.choices[answer].votes += 1;
        poll.responses.push({ userId, answer });
        break;

      case 'Multiple Choice':
        if (!Array.isArray(answer) || answer.some(i => i < 0 || i >= poll.choices.length)) {
          return res.status(400).json({ message: 'Invalid multiple choices.' });
        }
        answer.forEach(i => poll.choices[i].votes += 1);
        break;

      case 'Matching':
        if (!Array.isArray(answer) || answer.length !== poll.matching.length) {
          return res.status(400).json({ message: 'Invalid matching answer.' });
        }
        poll.responses.push({ userId, answer });
        break;

      case 'Rank Order':
        if (!Array.isArray(answer) || answer.length !== poll.choices.length) {
          return res.status(400).json({ message: 'Invalid rank order.' });
        }
        poll.responses.push({ userId, answer });
        break;

      case 'Short Answer':
      case 'Long Answer':
        if (typeof answer !== 'string' || answer.length < poll.minLength || answer.length > poll.maxLength) {
          return res.status(400).json({ message: 'Invalid text answer.' });
        }
        poll.responses.push({ userId, answer });
        break;

      case 'Fill in the Blank':
        if (!Array.isArray(answer) || answer.length !== poll.blanks.length) {
          return res.status(400).json({ message: 'Invalid blank answers.' });
        }
        poll.responses.push({ userId, answer });
        break;

      case 'Rating Scale':
        if (typeof answer !== 'number' || answer < poll.ratingRange.min || answer > poll.ratingRange.max) {
          return res.status(400).json({ message: 'Invalid rating.' });
        }
        poll.responses.push({ userId, answer });
        break;

      default:
        return res.status(400).json({ message: 'Invalid poll type.' });
    }

    await poll.save();
    return res.status(200).json({ message: 'Response submitted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get poll results
const getPollResults = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found.' });

    return res.status(200).json(poll.responses);
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
};
