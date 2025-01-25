const bcrypt = require("bcryptjs");
const Project = require("../models/projectModel");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Meeting = require("../models/meetingModel");
const User = require("../models/userModel");
const Tag = require("../models/tagModel");
const { sendEmail } = require("../../config/email.config");
const dotenv = require("dotenv");
const LiveMeeting = require("../models/liveMeetingModel");
const ProjectForm = require("../models/projectFormSchema");
dotenv.config();

// Controller to create a new project
const createProject = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    // Extract formData from the request body
    session.startTransaction();
    const formData = req.body;

    // Step 0: Check if the user who is creating the project has a verified email
    const user = await User.findById(formData.createdBy);
    if (!user || !user.isEmailVerified) {
      res.status(400).json({
        message: "Email needs to be verified before creating a project.",
      });
      return;
    }

    if (user.role === "AmplifyTechHost" || user.role === "AmplifyModerator") {
      res.status(403).json({
        message: "You are not allowed to create a project.",
      });
      return;
    }

    const updatedMembers = formData.members.map((member) => ({
      ...member,
      roles: {
        ...member.roles,
        permissions: Array.isArray(member.roles.role)
          ? [...member.roles.role]
          : member.roles.role // If roles is a single string
          ? [member.roles.role] // Wrap it in an array for permissions
          : [], // Default to an empty array if roles is undefined
      },
    }));

    // Step 1: Create the project
    const newProject = new Project({
      name: formData.name,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      projectPasscode: formData.projectPasscode,
      createdBy: formData.createdBy,
      tags: formData.tags,
      members: updatedMembers,
      status: formData.status,
    });

   
    const savedProject = await newProject.save({ session });
    if (savedProject && savedProject?.members?.length > 0) {
      const emails = savedProject?.members?.map((e) => {
        return e.email;
      });

      let html = `<p>Hello,</p>
        <p>You have been added to the project <strong>${savedProject?.name}</strong>.</p>
        <p>Please click the link below to accept the invitation:</p>
        <a href="https://abc.com/invite?project=${savedProject?.name}">Accept Invitation</a>`;
      sendEmail(emails, "Invitation to join project", html);
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      message: "Project and meeting created successfully",
      projectId: savedProject._id,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      message: "Failed to create project",
      error: error.message,
    });
  }
};

const createProjectByExternalAdmin = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { projectData, uniqueId, userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.role === "AmplifyTechHost" || user.role === "AmplifyModerator") {
      res.status(403).json({
        message: "You are not allowed to create a project.",
      });
      return;
    }

    // Generate a project name using user.firstName and a random number
    const projectName = `${user.firstName}_${Math.floor(Math.random() * 1000)}`;

    // Create the new project
    const newProject = new Project({
      name: projectName,
      description: "",
      startDate: projectData.startDate,
      status: projectData.status,
      createdBy: userId,
      projectDetails: {
        respondentMarket: projectData.respondentMarket,
        respondentLanguage: projectData.respondentLanguage,
        sessions: projectData.sessions,
      },
    });

    const savedProject = await newProject.save({ session });

    // Delete the ProjectForm document
    if (uniqueId) {
      await ProjectForm.findByIdAndDelete(uniqueId, { session });
    }

    // Fetch the newly created project with populated fields
    const project = await Project.findById(savedProject._id)
      .populate("members.userId", "firstName lastName addedDate lastUpdatedOn")
      .populate("tags", "name description color")
      .session(session);

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      message: "Project saved successfully",
      projectId: savedProject._id,
      project
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating project:", error);
    res.status(500).json({
      message: "Failed to create project",
      error: error.message,
    });
  }
};

const createProjectByAmplifyAdmin = async (req, res) => {
  try {
    const  payload  = req.body;
    // Validate required fields
    if (!payload || !payload.startDate || !payload.createdBy) {
      return res
        .status(400)
        .json({ message: "Invalid payload. Required fields are missing." });
    }

    const user = await User.findById(payload.createdBy);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (
      user.role !== "AmplifyAdmin" &&
      user.role !== "SuperAdmin"
    ) {
      res.status(403).json({
        message: "You are not allowed to create a project.",
      });
      return;
    }

  
    // Create the new project
    const newProject = new Project(payload);

    const savedProject = await newProject.save();

    res.status(201).json({
      message: "Project saved successfully",
      projectId: savedProject._id,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// Controller to get all projects with pagination
const getAllProjects = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    startDate,
   
    status,
    tag,
    role,
  } = req.query;
  const { id } = req.params;

  try {
    // Find projects where createdBy matches the provided user ID or userId in the people array matches the user ID
    const userData = await User.findById(id);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    const userEmail = userData.email;

    // Create search query
    const searchQuery = search
      ? {
          $and: [
            {
              $or: [
                { createdBy: id },
                { members: { $elemMatch: { email: userEmail } } }, 
              ],
            },
            {
              $or: [
                { name: { $regex: search, $options: "i" } }, // Case-insensitive search
                { description: { $regex: search, $options: "i" } },
              ],
            },
          ],
        }
      : { $or: [{ createdBy: id }, { "members.email": userEmail }] };
    if (startDate) {
      searchQuery.startDate = { $gte: new Date(startDate) };
    }
  
    if (status) {
      searchQuery.status = status;
    }
    if (tag) {
      searchQuery.tags = tag;
    }
    if (role) {
      searchQuery["members.roles"] = role;
    }

    const projects = await Project.find(searchQuery)
      .populate("members.userId", "firstName lastName addedDate lastUpdatedOn")
      .populate("tags", "name description color")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Calculate cumulative minutes for each project
    // const projectsWithMinutes = await Promise.all(
    //   projects.map(async (project) => {
    //     // Find related meetings
    //     const meetings = await Meeting.find({ projectId: project._id });

    //     // Find associated live meetings and calculate cumulative duration
    //     const liveMeetings = await LiveMeeting.find({
    //       meetingId: { $in: meetings.map((meeting) => meeting._id) },
    //     });

    //     // const cumulativeMinutes = liveMeetings.reduce(
    //     //   (acc, liveMeeting) => acc + (liveMeeting.duration || 0),
    //     //   0
    //     // );

    //     return {
    //       project
    //     };
    //   })
    // );

    const totalDocuments = await Project.countDocuments(searchQuery); // Total number of documents matching the criteria
    const totalPages = Math.ceil(totalDocuments / limit); // Calculate total number of pages

    res.status(200).json({
      page: parseInt(page),
      totalPages,
      totalDocuments,
      projects
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get a project by ID
const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id)
      .populate("members.userId", "firstName lastName addedDate lastUpdatedOn")
      .populate("tags", "name description color");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to update a project
const updateProject = async (req, res) => {
  const { id } = req.body;

  try {
    // Hash the passcode using bcryptjs if provided
    if (req.body.passcode) {
      req.body.passcode = await bcrypt.hash(passcode, 8); // Adjust saltRounds as per your security requirements
    }

    const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// DELETE route
const deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id).select("_id");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const meetingIds = await Meeting.distinct("_id", { projectId: id });
    await LiveMeeting.deleteMany({ meetingId: { $in: meetingIds } });
    await Project.findByIdAndDelete(id);
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchProjectsByFirstName = async (req, res) => {
  const { name } = req.query; // Get the firstName from query parameters

  // Check if firstName query parameter is provided
  if (!name) {
    return res.status(400).json({
      message: "Please provide a firstName to search for.",
    });
  }

  try {
    // Search for Projects by matching the first name (case-insensitive)
    const Projects = await Project.find({
      name: { $regex: name, $options: "i" },
    }).populate("tags", "name description color");

    if (Projects.length === 0) {
      return res.status(404).json({
        message: `No Projects found with the first name: ${name}`,
      });
    }

    res.status(200).json(Projects);
  } catch (error) {
    console.error(`Error during search: ${error.message}`);
    res.status(500).json({
      message:
        "Server error while searching for Projects. Please try again later.",
    });
  }
};

const projectStatusChange = async (req, res) => {
  const { projectId } = req.params;
  const { status } = req.body;
  // Validate status to ensure it's one of the allowed values
  const validStatuses = [
    "Draft",
    "Active",
    "Complete",
    "Inactive",
    "Closed",
    "Pause",
    "Unpause",
    "Reopen",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message:
        "Invalid status. Status must be one of 'Draft', 'Active', 'Complete', 'Inactive','Pause','Unpause','Reopen' or 'Closed'.",
    });
  }

  try {
    // Find the project by ID and update the status
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { status, updatedAt: Date.now() },
      { new: true } // Return the updated document
    );
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    // test
    res.status(200).json({
      message: "Project status updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project status:", error);
    res.status(500).json({
      message: "Failed to update project status",
      error: error.message,
    });
  }
};
// Edit project general info

const updateGeneralProjectInfo = async (req, res) => {
  const { projectId } = req.params;
  const { name, description, startDate, endDate, projectPasscode } = req.body;
  try {
    // Validate the input
    if (!name || !startDate || !projectPasscode) {
      return res.status(400).json({
        message: "Name, Start Date, and Project Passcode are required.",
      });
    }
    // Find the project by its ID
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    // Update project fields with the new values
    project.name = name;
    project.description = description || project.description;
    project.startDate = startDate;
    project.endDate = endDate || project.endDate;
    project.projectPasscode = projectPasscode;
    // Save the updated project
    await project.save();
    return res
      .status(200)
      .json({ message: "Project updated successfully.", project });
  } catch (error) {
    console.error("Error updating project:", error);
    return res
      .status(500)
      .json({ message: "Server error. Could not update the project." });
  }
};

const addPeopleIntoProject = async (req, res) => {
  const { projectId, people } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    people.forEach((person) => {
      project.members.push({
        userId: person.personId,
        roles: person.roles,
        email: person.email,
      });
    });
    const updatedProject = await project.save();
    const populatedProject = await Project.findById(
      updatedProject._id
    ).populate("members.userId");

    res.status(200).json({
      message: "People added successfully",
      updatedProject: populatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding people", error });
  }
};

const editMemberRole = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { updatedMember } = req.body;

    // Find the project by ID and update the specific member's roles
    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId, "members._id": updatedMember._id },
      {
        $set: { "members.$.roles": updatedMember.roles },
      },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project or member not found" });
    }
    const populatedProject = await Project.findById(projectId).populate(
      "members.userId"
    );
    return res.status(200).json({
      message: "Member roles updated successfully",
      updatedProject: populatedProject,
    });
  } catch (error) {
    console.error("Error updating member roles:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteMemberFromProject = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    // Find the project and remove the member from the members array
    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId },
      { $pull: { members: { _id: memberId } } },
      { new: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ message: "Project or member not found" });
    }
    const populatedProject = await Project.findById(projectId).populate(
      "members.userId"
    );
    return res.status(200).json({
      message: "Member removed successfully",
      updatedProject: populatedProject,
    });
  } catch (error) {
    console.error("Error removing member from project:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateBulkMembers = async (req, res) => {
  try {
    const { projectId, members } = req.body;

    const updatedProject = await Project.updateOne(
      { _id: projectId },
      { $set: { members: members } }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    const populatedProject = await Project.findById(projectId).populate(
      "members.userId"
    );

    return res.status(200).json({
      message: "Members updated successfully",
      updatedProject: populatedProject,
    });
  } catch (error) {
    console.error("Error updating bulk members:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const assignTagsToProject = async (req, res) => {
  try {
    const { tagsToAdd = [], tagsToRemove = [], projectId } = req.body;

    // Validate project existence
    const project = await Project.findById(projectId).select("tags");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Add new tags
    if (tagsToAdd.length > 0) {
      const validTagsToAdd = await Tag.distinct("_id", {
        _id: { $in: tagsToAdd },
      });
      project.tags = [
        ...new Set([
          ...project.tags.map((tag) => tag.toString()),
          ...validTagsToAdd,
        ]),
      ];
    }

    // Remove tags
    if (tagsToRemove.length > 0) {
      project.tags = project.tags.filter(
        (tag) => !tagsToRemove.includes(tag.toString())
      );
    }

    // Save updated project
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { tags: project.tags },
      { new: true }
    );

    return res.status(200).json({
      result: updatedProject,
      message: "Tags updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllProjectsForAmplify = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    startDate,
    endDate,
    status,
    tag,
    role,
  } = req.query;

  try {
    // Create search query
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } }, // Case-insensitive search
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    if (startDate) {
      searchQuery.startDate = { $gte: new Date(startDate) };
    }
    if (endDate) {
      searchQuery.endDate = { $lte: new Date(endDate) };
    }
    if (status) {
      searchQuery.status = status;
    }
    if (tag) {
      searchQuery.tags = tag;
    }
    if (role) {
      searchQuery["members.roles"] = role;
    }

    const projects = await Project.find(searchQuery)
      .populate("members.userId", "firstName lastName addedDate lastUpdatedOn")
      .populate("tags", "name description color")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalDocuments = await Project.countDocuments(searchQuery); // Total number of documents matching the criteria
    const totalPages = Math.ceil(totalDocuments / limit); // Calculate total number of pages

    res.status(200).json({
      page: parseInt(page),
      totalPages,
      totalDocuments,
      projects,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendEmailToNewContact = async (req, res) => {
  const memberData = req.body;
  try {
    const createdBy = await User.findById(memberData.createdBy);
    const email = memberData.email;

    let html = `
  <p>Hello, ${memberData.firstName}</p>
  <p>You have been added to the project of <strong>${createdBy?.firstName}</strong>.</p>
  <p>Please click the link below to register into the system and accept the invitation:</p>
  <a href="${process.env.FRONTEND_BASE_URL}/register">Register</a>
`;

    sendEmail(email, "Invitation to join project", html);

    res.status(200).json({
      message: "Email successfully sent. ",
    });
  } catch (error) {
    console.error("Error", error);
    res.status(500).json({ message: error.message });
  }
};

const getProjectByUserId = async (req, res) => {
  const { id } = req.params; // Extract the userId from params

  if (!id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const projects = await Project.find({ createdBy: id }).sort({
      createdAt: 1,
    }); // Sort projects by creation date (most recent first)

    if (projects.length === 0) {
      return res
        .status(404)
        .json({ message: "No projects found for this user." });
    }

    res.status(200).json({
      message: "Projects retrieved successfully.",
      projects,
    });
  } catch (error) {
    console.error("Error fetching projects by user ID:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve projects.", error: error.message });
  }
};

const saveProgress = async (req, res) => {
  try {
    const { uniqueId, formData, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!formData || Object.keys(formData).length === 0) {
      return res.status(400).json({ error: "Form data is required" });
    }

    if (uniqueId) {
      let existingForm = await ProjectForm.findById(uniqueId);

      if (!existingForm) {
        // If not found, create a new form entry
        const newForm = new ProjectForm({
          user: userId,
          formData,
        });

        const savedForm = await newForm.save();

        return res.status(201).json({
          success: true,
          message: "Form not found. New progress saved successfully.",
          uniqueId: savedForm._id,
        });
      } else {
        // If found, update the formData
        existingForm.formData = { ...existingForm.formData, ...formData };
        await existingForm.save();

        return res.status(200).json({
          success: true,
          message: "Progress updated successfully",
          uniqueId: existingForm._id,
        });
      }
    } else {
      // Create a new form if uniqueId is not provided
      const newForm = new ProjectForm({
        user: userId,
        formData,
      });

      const savedForm = await newForm.save();

      return res.status(201).json({
        success: true,
        message: "Progress saved successfully",
        uniqueId: savedForm._id,
      });
    }
  } catch (error) {
    console.error("Error in saveProgress:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while saving progress. Please try again later.",
    });
  }
};

const emailProjectInfo = async (req, res) => {
  try {
    const { userId, uniqueId, formData } = req.body;

    if (!userId || !uniqueId) {
      return res
        .status(400)
        .json({ error: "userId and uniqueId are required" });
    }

    // Fetch user data from the User collection
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch form data from the ProjectForm collection
    const projectForm = await ProjectForm.findById(uniqueId);
    // if (!projectForm) {
    //   return res.status(404).json({ error: "ProjectForm not found" });
    // }
    // Format sessions for the email
    const formattedSessions = formData.sessions
      .map(
        (session, index) =>
          `<p>Session ${index + 1}: ${session.number} sessions - Duration: ${
            session.duration
          }</p>`
      )
      .join("");

    // Email content
    const emailContent = `
  <h2>Project Information</h2>
  <p><strong>First Name:</strong> ${user.firstName}</p>
  <p><strong>Last Name:</strong> ${user.lastName}</p>
  <p><strong>Email:</strong> ${user.email}</p>
  <h3>Form Data:</h3>
  <p><strong>Service:</strong> ${formData.service}</p>
  <p><strong>Add-Ons:</strong> ${formData.addOns.join(", ")}</p>
  <p><strong>Market:</strong> ${formData.market}</p>
  <p><strong>Language:</strong> ${formData.language}</p>
  <h4>Sessions:</h4>
  ${formattedSessions}
  <p><strong>First Date of Streaming:</strong> ${
    formData.firstDateOfStreaming
  }</p>
  <p><strong>Respondents per Session:</strong> ${
    formData.respondentsPerSession
  }</p>
  <p><strong>Number of Sessions:</strong> ${formData.numSessions}</p>
  <p><strong>Session Length:</strong> ${formData.sessionLength}</p>
  <p><strong>Pre-Work Details:</strong> ${formData.preWorkDetails}</p>
  <p><strong>Selected Languages:</strong> ${formData.selectedLanguages}</p>
  <p><strong>Additional Info:</strong> ${formData.additionalInfo}</p>
`;

    // ! email should be change to info@amplifyresearch.com

    try {
      await sendEmail(
        "enayetflweb@gmail.com",
        "Project Information",
        emailContent
      );
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return res.status(500).json({ error: "Failed to send email" });
    }

    // Delete the ProjectForm document
    await ProjectForm.findByIdAndDelete(uniqueId);

    return res
      .status(200)
      .json({ message: "Email sent and form deleted successfully" });
  } catch (error) {
    console.error("Error in emailProjectInfo:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  searchProjectsByFirstName,
  createProject,
  createProjectByExternalAdmin,
  createProjectByAmplifyAdmin,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  projectStatusChange,
  updateGeneralProjectInfo,
  addPeopleIntoProject,
  editMemberRole,
  deleteMemberFromProject,
  updateBulkMembers,
  assignTagsToProject,
  getAllProjectsForAmplify,
  sendEmailToNewContact,
  getProjectByUserId,
  saveProgress,
  emailProjectInfo,
};
