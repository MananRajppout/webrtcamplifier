const Project = require("../models/projectModel");
const Meeting = require("../models/meetingModel");
const Contact = require("../models/contactModel");

// Controller to create a new project
const createMeeting = async (req, res) => {
  const meetingData = req.body;
  try {
    // Find the project by projectId
    const project = await Project.findById(meetingData.projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Set the meetingPasscode from the project
    meetingData.meetingPasscode = project.projectPasscode;

    // Create and save the new meeting
    const newMeeting = new Meeting(meetingData);
    const savedMeeting = await newMeeting.save();
    // Send a success response with the saved meeting details
    res.status(201).json({
      message: "Meeting created successfully",
      meeting: savedMeeting,
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({
      message: "Failed to create meeting",
      error: error.message,
    });
  }
};

const getAllMeetings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { startDate, status, timeZone, moderator, search } = req.query;

    const query = { projectId: req.params.projectId };
    if (startDate) {
      query.startDate = { $eq: new Date(startDate) };
    }
    if (status) {
      query.status = status;
    }
    if (timeZone) {
      query.timeZone = timeZone;
    }
    if (moderator) {
      query.moderator = moderator;
    }
    if (search) {
      query.$or = [
        { status: { $regex: search, $options: 'i' } }, // Case-insensitive search
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }
    // Find all meetings that match the projectId with pagination
    const meetings = await Meeting.find(query)
      .populate("moderator")
      .skip(skip)
      .limit(limit);

    // Count total documents matching the projectId
    const totalDocuments = await Meeting.countDocuments(query);

    // Calculate total pages
    const totalPages = Math.ceil(totalDocuments / limit);

    // If no meetings are found, return a 404 error
    if (!meetings || meetings.length === 0) {
      return res.status(404).json({
        message: "No meetings found for this project",
      });
    }

    // Return the matched meetings with pagination info
    res.status(200).json({
      page: parseInt(page),
      totalPages,
      totalDocuments,
      meetings,
    });
  } catch (error) {
    console.error("Error retrieving meetings:", error);
    res.status(500).json({
      message: "Failed to retrieve meetings",
      error: error.message,
    });
  }
};

//Verify moderator meeting passcode
const verifyModeratorMeetingPasscode = async (req, res) => {
  const { meetingId, passcode } = req.body;

  try {
    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (meeting.meetingPasscode === passcode) {
      return res.status(200).json({ message: "Passcode is correct" });
    } else {
      return res.status(401).json({ message: "Invalid passcode" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

const getMeetingById = async (req, res) => {
  const { meetingId } = req.params;
  try {
    const meeting = await Meeting.findById(meetingId).populate("moderator");
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    res.status(200).json({ message: "Meeting found", meetingDetails: meeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMeeting = async (req, res) => {
  const { meetingId } = req.params;
  try {
    const meeting = await Meeting.deleteOne({ _id: meetingId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting Not Found" });
    }
    res.status(200).json({ message: "Meeting successfully deleted", meeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const meetingStatusChange = async (req, res) => {
  const { status, meetingId } = req.body;
  try {
    const data = await Meeting.findByIdAndUpdate(
      meetingId,
      { status },
      { new: true, runValidators: true }
    );
    if (!data) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    return res.status(200).json({
      message: 'Meeting status updated successfully',
      data,
    });
  } catch (error) {
    console.error('Error updating meeting status:', error);
    return res.status(500).json({
      message: 'Failed to update meeting status',
      error: error.message,
    });
  }
};

const editMeeting = async (req, res) => {
  try {
    const data = await Meeting.findByIdAndUpdate({ _id: req.body?.id }, req.body, { new: true, runValidators: true });
    if (!data) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    return res.status(200).json({ data, message: "Meeting updated successfully" });
  } catch (error) {
    console.error('Error updating meeting:', error);
    return res.status(500).json({
      message: 'Failed to update meeting',
      error: error.message,
    });
  }
}

module.exports = {
  createMeeting,
  getAllMeetings,
  verifyModeratorMeetingPasscode,
  getMeetingById,
  deleteMeeting,
  meetingStatusChange,
  editMeeting
};
