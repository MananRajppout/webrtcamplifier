const { decodeToken } = require("../../utils/jwt");
const Company = require("../models/companyModel"); // Adjust the path as necessary

// Create a new company
const createCompany = async (req, res) => {
  const token = req.cookies.token;
  
  const decoded = decodeToken(token);
  
  if (decoded.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  let { name, industry, mobile, companyEmail, website, country, officialAddress, billingAddress, sameAddress } = req.body;

  // Check for required fields
  if (!name || !industry || !mobile || !companyEmail || !website || !country || !officialAddress) {
    return res.status(404).send("Required information not provided all.");
  }

  // If sameAddress is true, billingAddress is not required
  if (sameAddress && !billingAddress) {
    
    billingAddress = officialAddress;
  } else if (!sameAddress && !billingAddress) {
    return res.status(404).send("Billing address is required when sameAddress is false.");
  }

  try {
    const newCompany = new Company({ 
      name, 
      industry, 
      mobile, 
      companyEmail, 
      website, 
      country, 
      officialAddress, 
      billingAddress, 
      sameAddress, 
    });
    await newCompany.save();
    res.status(201).send({message: "Company created successfully.", data: newCompany});
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).send("Error creating company.");
  }
};

// Update a company
const updateCompany = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).send("Name and description are required.");
  }

  try {
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );
    if (!updatedCompany) {
      return res.status(404).send("Company not found.");
    }

    res.status(200).send("Company updated successfully.");
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).send("Error updating company.");
  }
};

// Delete a company
const deleteCompany = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCompany = await Company.findByIdAndDelete(id);
    if (!deletedCompany) {
      return res.status(404).send("Company not found.");
    }

    res.status(200).send("Company deleted successfully.");
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).send("Error deleting company.");
  }
};

// Get a single company
const getCompany = async (req, res) => {
  const { id } = req.params;

  try {
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).send("Company not found.");
    }

    res.status(200).json(company);
  } catch (error) {
    console.error("Error retrieving company:", error);
    res.status(500).send("Error retrieving company.");
  }
};

// Get all companies with pagination
const getAllCompanies = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const token = req.cookies.token;
  
  const decoded = decodeToken(token);
  
  if (decoded.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const query = {
      isDeleted: false,
      $or: [ // Added search criteria
        { name: { $regex: search, $options: 'i' } },
        { companyEmail: { $regex: search, $options: 'i' } },
        { officialAddress: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { website: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ]
    };
    const companies = await Company.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Company.countDocuments({isDeleted: false});

    res.status(200).json({
      companies,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalRecords: count
    });
  } catch (error) {
    console.error("Error retrieving companies:", error);
    res.status(500).send("Error retrieving companies.");
  }
};

module.exports = {
  createCompany,
  updateCompany,
  deleteCompany,
  getCompany,
  getAllCompanies,
};
