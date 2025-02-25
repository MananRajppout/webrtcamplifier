const Project = require("../models/projectModel");
const Meeting = require("../models/meetingModel");
const XLSX = require("xlsx");
const fs = require("fs");
const LiveMeeting = require("../models/liveMeetingModel");
const Contact = require("../models/contactModel");
const { default: mongoose } = require("mongoose");
// Controller to create a new project
const createMeeting = async (req, res) => {
  const meetingData = req.body;
  const session = await mongoose.startSession();
  
  session.startTransaction();
  try {
    // ✅ Step 1: Find the project by projectId
    const project = await Project.findById(meetingData.projectId).session(session);
    if (!project) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Project not found" });
    }

    // ✅ Step 2: Set the meetingPasscode from the project
    meetingData.meetingPasscode = project.projectPasscode;

    // ✅ Step 3: Create and save the new meeting
    const newMeeting = new Meeting(meetingData);
    const savedMeeting = await newMeeting.save({ session });

    // ✅ Step 4: Update `projectIds` for all moderators in `Contact`
    if (meetingData.moderator && meetingData.moderator.length > 0) {
      await Contact.updateMany(
        { _id: { $in: meetingData.moderator } },
        { $addToSet: { projectIds: meetingData.projectId } },
        { session }
      );
    }

    // ✅ Step 5: Commit transaction (finalize all operations)
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Meeting created successfully",
      meeting: savedMeeting,
    });

  } catch (error) {
    // ✅ Rollback transaction in case of failure
    await session.abortTransaction();
    session.endSession();
    
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
    const { startDate, status, timeZone, moderator, search, sortField, sortOrder } = req.query;

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
        { status: { $regex: search, $options: "i" } }, 
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

      // Default sort: Meetings that have not occurred yet
      const defaultSort = { startDate: -1 };

      // Dynamic sort based on query
      const sortOptions = {};
      if (sortField && sortOrder) {
        sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
      }

    // Find all meetings that match the projectId with pagination
    const meetings = await Meeting.find(query)
      .populate("moderator")
      .sort(Object.keys(sortOptions).length ? sortOptions : defaultSort)
      .skip(skip)
      .limit(limit);

    // Fetch LiveMeetings for each meeting and add them
    const meetingsWithLiveMeetings = await Promise.all(
      meetings.map(async (meeting) => {
        const liveMeetings = await LiveMeeting.find({ meetingId: meeting._id });
        return {
          ...meeting.toObject(),
          liveMeetings,
        };
      })
    );

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
      meetings: meetingsWithLiveMeetings,
    });
  } catch (error) {
    console.error("Error retrieving meetings:", error);
    res.status(500).json({
      message: "Failed to retrieve meetings",
      error: error.message,
    });
  }
};


const getLatestMeeting = async (req, res) => {
  try {
    const projectId = req.params.projectId
    // Find all meetings that match the projectId with pagination
    const meeting = await Meeting.findOne({ projectId }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      meeting
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
    const project = await Project.findById(meeting.projectId);

    const meetingWithProjectTitle = {
      ...meeting.toObject(),
      projectTitle: project ? project.name : null,
    };
    res
      .status(200)
      .json({
        message: "Meeting found",
        meetingDetails: meetingWithProjectTitle,
      });
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

const editMeeting = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const meetingId = req.body?.id;
    const updatedData = req.body;

    
    // ✅ Step 1: Find the existing meeting
    const existingMeeting = await Meeting.findById(meetingId).session(session);
    if (!existingMeeting) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Meeting not found" });
    }

    // ✅ Step 2: Check if moderators have changed
    const oldModerators = existingMeeting.moderator.map(id => id.toString());
    const newModerators = updatedData.moderator ? updatedData.moderator.map(id => id.toString()) : [];

    const moderatorsToRemove = oldModerators.filter(id => !newModerators.includes(id));
    const moderatorsToAdd = newModerators.filter(id => !oldModerators.includes(id));

    // ✅ Step 3: Update the meeting
    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      updatedData,
      { new: true, runValidators: true, session }
    );

    // ✅ Step 4: Remove `projectId` from old moderators
    if (moderatorsToRemove.length > 0) {
      await Contact.updateMany(
        { _id: { $in: moderatorsToRemove } },
        { $pull: { projectIds: existingMeeting.projectId } },
        { session }
      );
    }

    // ✅ Step 5: Add `projectId` to new moderators
    if (moderatorsToAdd.length > 0) {
      await Contact.updateMany(
        { _id: { $in: moderatorsToAdd } },
        { $addToSet: { projectIds: existingMeeting.projectId } },
        { session }
      );
    }

    console.log("updatedMeeting",updatedMeeting)

    // ✅ Step 6: Commit transaction (finalize all operations)
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Meeting updated successfully",
      meeting: updatedMeeting,
    });

  } catch (error) {
    // ✅ Rollback transaction in case of failure
    await session.abortTransaction();
    session.endSession();

    console.error("Error updating meeting:", error);
    return res.status(500).json({
      message: "Failed to update meeting",
      error: error.message,
    });
  }
};

const bulkUploadMeeting = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read the uploaded Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[1];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const rejectedData = [];
    const successResults = [];
    const meetingsToInsert = [];

    // Add a column for status messages
    const updatedSheetData = sheetData.map((row, index) => ({
      ...row,
      statusMessage: '', // Placeholder for statusMessage
    }));

    // Process each row
    await Promise.all(
      updatedSheetData.map(async (row, index) => {
        try {
          let formattedTime = row.startTime;
          if (typeof row.startTime === 'number') {
            const totalMinutes = Math.round(row.startTime * 1440);
            const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
            const minutes = (totalMinutes % 60).toString().padStart(2, '0');
            formattedTime = `${hours}:${minutes}`;
          }

          // Validate the projectId
          const project = await Project.findById(row.projectId);
          if (!project) {
            rejectedData.push({
              row: index + 1,
              message: `Project not found for projectId: ${row.projectId}`,
            });
            row.statusMessage = `Project not found for projectId: ${row.projectId}`;
            return;
          }

          // Prepare meeting data
          const meetingData = {
            projectId: row.projectId,
            title: row.title,
            description: row.description || '',
            startDate: row.startDate ? new Date(row.startDate) : null,
            startTime: formattedTime || null,
            moderator: row.moderator ? row.moderator.split(',').map(id => id.trim()) : [],
            timeZone: row.timeZone,
            duration: row.duration,
            ongoing: row.ongoing === 'true',
            enableBreakoutRoom: row.enableBreakoutRoom === 'true',
            meetingPasscode: project.projectPasscode,
            status: row.status || 'Draft',
          };

          // Add to bulk insert array
          meetingsToInsert.push(meetingData);

          // Mark as success
          row.statusMessage = 'Meeting processed successfully';
          successResults.push({
            row: index + 1,
            message: 'Meeting processed successfully',
          });
        } catch (error) {
          rejectedData.push({
            row: index + 1,
            message: error.message,
          });
          row.statusMessage = error.message;
        }
      })
    );

    // Insert all valid meetings at once
    if (meetingsToInsert.length > 0) {
      await Meeting.insertMany(meetingsToInsert);
    }

    // Define the order of columns with `statusMessage` explicitly in J column
    const columnsOrder = [
      'projectId',
      'title',
      'description',
      'startDate',
      'startTime',
      'moderator',
      'timeZone',
      'duration',
      'ongoing',
      'enableBreakoutRoom',
      'statusMessage', // Ensure this is in J column
    ];

    // Ensure column order is respected
    const finalSheetData = updatedSheetData.map((row) => {
      const orderedRow = {};
      columnsOrder.forEach((key) => {
        orderedRow[key] = row[key] || ''; // Ensure missing keys are filled with empty values
      });
      return orderedRow;
    });

    // Write the updated data to a buffer
    const newSheet = XLSX.utils.json_to_sheet(finalSheetData);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
    const fileBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });

    // Convert the file buffer to Base64
    const base64File = fileBuffer.toString('base64');

    // Send JSON response with the Base64 file
    res.status(200).json({
      message: 'Bulk upload processed',
      successResults,
      rejectedData,
      file: base64File, // Base64-encoded file
    });
  } catch (error) {
    console.error("Error in bulkUploadMeeting:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    // Cleanup: Delete the uploaded file
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error(`Error deleting file: ${req.file.path}`, err);
        } else {
          console.log(`Successfully deleted file: ${req.file.path}`);
        }
      });
    }
  }
};

module.exports = {
  createMeeting,
  getAllMeetings,
  verifyModeratorMeetingPasscode,
  getMeetingById,
  deleteMeeting,
  editMeeting,
  bulkUploadMeeting,
  getLatestMeeting
};
