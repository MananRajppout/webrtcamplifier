const bcrypt = require("bcryptjs");
const Contact = require("../models/contactModel");
const Project = require("../models/projectModel");
const { validationResult } = require("express-validator");
const User = require("../models/userModel");
const { default: mongoose } = require("mongoose");

// Controller to create a new project
const createContact = async (req, res) => {
  const { firstName, lastName, email, companyName, roles, createdBy } = req.body;

  // Validation to check if all required fields are present
  if (!firstName || !lastName || !email || !companyName || !roles || !createdBy) {
    return res.status(400).json({
      message: "All fields are required: firstName, lastName, email, companyName, roles, createdBy."
    });
  }

  try {
    const user = await User.findById(createdBy);

    if (!user || !user.isEmailVerified) {
      return res.status(400).json({
        message: 'Email needs to be verified before creating a contact.',
      });
    }

    // Search the user collection to match the email field
    const matchingUser = await User.findOne({ email });

    let isUserFlag = false;
    if (matchingUser) {
      isUserFlag = true; // Set isUser to true if email matches a user
    }

    const newContact = new Contact({
      firstName, lastName, email, companyName, roles, createdBy, isUser: isUserFlag,
    });



    const savedContact = await newContact.save();

    res.status(201).json(savedContact);
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

// Controller to get all projects with pagination
const getAllContacts = async (req, res) => {

  const { page = 1, limit = 10, search = '', startDate, endDate, role, company, userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: "UserId is required" });
  }
  const searchQuery = { createdBy: userId };

  if (search) {
    searchQuery.$or = [
      { firstName: { $regex: search, $options: 'i' } }, // Case-insensitive search
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { companyName: { $regex: search, $options: 'i' } },
      { roles: { $regex: search, $options: 'i' } },
    ]
  }

  if (startDate) {
    searchQuery.addedDate = { $gte: new Date(startDate) }
  }
  if (endDate) {
    searchQuery.addedDate = { $lte: new Date(endDate) }
  }
  if (company) {
    searchQuery.companyName = company
  }
  if (role) {
    searchQuery["roles"] = role;
  }

  try {
    const contacts = await Contact.find(searchQuery)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    const totalDocuments = await Contact.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalDocuments / limit); 

    res.status(200).json({
      page: parseInt(page),
      totalPages,
      totalDocuments,
      contacts,
    });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

// Controller to get a project by ID
const getContactById = async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to update a project
const updateContact = async (req, res) => {
  const { id } = req.params;
  const {
    firstName, lastName, email, companyName, roles
  } = req.body;

  try {

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      {
        firstName, lastName, email, companyName, roles
      },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    console.error('error in update contact function', error)
    res.status(500).json({ message: error.message });
  }
};

const deleteContact = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContactsByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const { search = '' } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'createdBy ID is required' });
    }

    let query = { createdBy: id };

    if (search) {
      // Create a case-insensitive search across multiple fields
      query = {
        $and: [
          { createdBy: id },
          {
            $or: [
              // Search in first name and last name
              { firstName: { $regex: search, $options: 'i' } },
              { lastName: { $regex: search, $options: 'i' } },
              // Search in email
              { email: { $regex: search, $options: 'i' } },
              // Search in company name
              { companyName: { $regex: search, $options: 'i' } },
              // Search in roles array
              { roles: { $regex: search, $options: 'i' } }
            ]
          }
        ]
      };
    }

    const contacts = await Contact.find(query).sort({ addedDate: -1 });

    if (contacts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};


//search API
const searchContactsByFirstName = async (req, res) => {
  const { firstName } = req.query;  // Get the firstName from query parameters

  // Check if firstName query parameter is provided
  if (!firstName) {
    return res.status(400).json({
      message: "Please provide a firstName to search for."
    });
  }

  try {

    // Search for contacts by matching the first name (case-insensitive)
    const contacts = await Contact.find({ firstName: { $regex: firstName, $options: 'i' } });

    // Log the number of contacts found
    (`${contacts.length} contact(s) found for the search term: ${firstName}`);

    if (contacts.length === 0) {
      return res.status(404).json({
        message: `No contacts found with the first name: ${firstName}`
      });
    }

    res.status(200).json(contacts);
  } catch (error) {
    console.error(`Error during search: ${error.message}`);
    res.status(500).json({
      message: "Server error while searching for contacts. Please try again later."
    });
  }
};

// create contact from member tab
const createContactForMemberTab = async (req, res) => {
  const { userId, projectId } = req.params;
  try {
    // Fetch all contacts created by the user (userId)
    const contacts = await Contact.find({ createdBy: userId });
    // Fetch the project using projectId
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    // Extract all member user IDs from the project
    const projectMemberIds = project.members.map(member => member.userId.toString());
    // Filter out contacts that are already members of the project
    const nonMemberContacts = contacts.filter(contact => !projectMemberIds.includes(contact._id.toString()));
    // Return the filtered list of contacts to the frontend
    res.status(200).json(nonMemberContacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getUniqueCompanies = async (req, res) => {
  try {
    if (!req?.query?.userId) {
      return res.status(400).json({ message: "UserId is required" });
    }
    const data = await Contact.distinct("companyName", { createdBy: req?.query?.userId });
    return res.status(200).json({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}


module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  getContactsByUserId,
  searchContactsByFirstName,
  getContactsByUserId,
  createContactForMemberTab,
  getUniqueCompanies
};
