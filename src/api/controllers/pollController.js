const Poll = require("../models/pollModel");
const Project = require("../models/projectModel");
const { validationResult } = require("express-validator");

// Controller to create a new poll
const createPoll = async (req, res) => {
  // Check for validation errors

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { project, pollName, isActive, questions, createdBy} = req.body;
  

  try {
    // Check if the project exists
    const existingProject = await Project.findById(project);
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }


    // Create a new poll instance
    const newPoll = new Poll({
      project,
      pollName,
      isActive,
      questions,
      createdBy
    });

    // Save the poll to the database
    const savedPoll = await newPoll.save();
    const polls = await Poll.find({project})
      .populate('createdBy', 'firstName lastName email')
    res.status(201).json({ message: "Poll Saved Successfully", polls }); // Respond with the saved poll
   
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Controller to get all polls with pagination
const getAllPolls = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 items per page

  try {
    const polls = await Poll.find({project: req.params.projectId})
      .skip((page - 1) * limit) 
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName email')

    const totalDocuments = await Poll.countDocuments(); // Total number of documents in collection
    const totalPages = Math.ceil(totalDocuments / limit); // Calculate total number of pages

    res.status(200).json({
      page: parseInt(page),
      totalPages,
      totalDocuments,
      polls,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get a poll by ID
const getPollById = async (req, res) => {
  const { id } = req.params;
  try {
    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }
    res.status(200).json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePollStatus = async(req, res) => {
  const { id } = req.params; 
  const { isActive } = req.body; 

  try {
    const poll = await Poll.findByIdAndUpdate(
      id,
      { isActive: isActive }, 
      { new: true } 
    );

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }
    const polls = await Poll.find({project: poll.project})
      .populate('createdBy', 'firstName lastName email')
    return res.status(200).json({
      message: `Poll status changed to ${isActive ? "Active" : "Inactive"}`,
      polls,
    });
  } catch (error) {
    console.error("Error updating poll status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


// Controller to update a poll
const updatePoll = async (req, res) => {
  const { id } = req.params;
  const { pollName, isActive, questions } = req.body;

  try {
    const updatedPoll = await Poll.findByIdAndUpdate(
      id,
      { pollName, isActive, questions },
      { new: true }
    );

    if (!updatedPoll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const polls = await Poll.find({project: updatedPoll.project})
    .populate('createdBy', 'firstName lastName email')
    res.status(200).json({
      message: "Poll updated successfully",
      polls,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Controller to delete a poll
const deletePoll = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPoll = await Poll.findByIdAndDelete(id);
    if (!deletedPoll) {
      return res.status(404).json({ message: "Poll not found" });
    }
    const polls = await Poll.find({project: deletedPoll.project})
      .populate('createdBy', 'firstName lastName email')
    res.status(200).json({ message: "Poll deleted successfully", polls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPoll,
  getAllPolls,
  getPollById,
  updatePoll,
  deletePoll,
  changePollStatus
};
