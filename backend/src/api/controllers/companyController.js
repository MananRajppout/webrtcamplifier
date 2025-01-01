const { decodeToken } = require("../../utils/jwt");
const Company = require("../models/companyModel"); // Adjust the path as necessary

// Create a new company
const createCompany = async (req, res) => {
  const token = req.cookies.token;
  
  const decoded = decodeToken(token);
  
  if (decoded?.role !== "SuperAdmin" && decoded?.role !== "AmplifyAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  let { name, industry, mobile, companyEmail, website, country, officialAddress, billingAddress, sameAddress } = req.body;

  // Check for required fields
  if (!name || !industry || !mobile || !companyEmail || !website || !country || !officialAddress) {
    return res.status(404).send({message: "Required information not provided all."});
  }

// If sameAddress is true, billingAddress is not required
if (sameAddress && !billingAddress) {
  billingAddress = officialAddress;
} else if (!sameAddress && !billingAddress) {
  return res.status(404).send({message: "Billing address is required when sameAddress is false."});
}

  try {

    const isExist = await Company.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (isExist) {
      return res.status(400).send({message: "Company name already exists."});
    }
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
    res.status(500).send({message: "Error creating company.", error: error.message});
  }
};

// Update a company
const updateCompany = async (req, res) => {
  const { id } = req.params;
  const token = req.cookies.token;
  
  const decoded = decodeToken(token);
  
  if (decoded?.role !== "SuperAdmin" && decoded?.role !== "AmplifyAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  let {  name, industry, mobile, companyEmail, website, country, officialAddress, billingAddress, sameAddress } = req.body;

  const updates = {};

  // Only add fields to updates if they are provided
  if (name) updates.name = name;
  if (industry) updates.industry = industry;
  if (mobile) updates.mobile = mobile;
  if (companyEmail) updates.companyEmail = companyEmail;
  if (website) updates.website = website;
  if (country) updates.country = country;
  if (officialAddress) updates.officialAddress = officialAddress;
  if (billingAddress) updates.billingAddress = billingAddress;
  if (sameAddress) updates.sameAddress = sameAddress;

  try {

    const company = await Company.findById(id);
    if (!company || company.isDeleted) {
      return res.status(404).send({message: "Company not found."});
    }


    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );
    if (!updatedCompany) {
      return res.status(404).send({message: "Company not found."});
    }

    res.status(200).send({message: "Company updated successfully.", data: updatedCompany});
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).send({message: "Error updating company.", error: error.message});
  }
};

// Delete a company
const deleteCompany = async (req, res) => {
  const { id } = req.params;
  const token = req.cookies.token;
  
  const decoded = decodeToken(token);
  
  if (decoded?.role !== "SuperAdmin" && decoded?.role !== "AmplifyAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const deletedCompany = await Company.findById(id);
    if (!deletedCompany || deletedCompany.isDeleted) {
      return res.status(404).send({message: "Company not found."});
    }

    await Company.findByIdAndUpdate(id, {isDeleted: true})

    res.status(200).send({message: "Company deleted successfully."});
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).send({message: "Error deleting company.", error: error.message});
  }
};

// Get a single company
const getCompany = async (req, res) => {
  const { id } = req.params;
  const token = req.cookies.token;
  
  const decoded = decodeToken(token);
  
  if (decoded?.role !== "SuperAdmin" && decoded?.role !== "AmplifyAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const company = await Company.findById(id);
    if (!company || company.isDeleted) {
      return res.status(404).send({message: "Company not found."});
    }

    res.status(200).json({message: "Company data retrieved successfully.", data:company});
  } catch (error) {
    console.error("Error retrieving company:", error);
    res.status(500).send({message: "Error retrieving company.", error: error.message});
  }
};

// Get all companies with pagination
const getAllCompanies = async (req, res) => {
  const { page = 1, limit = 10, search =''} = req.query;
  const token = req.cookies.token;
  
  const decoded = decodeToken(token);
  
  if (decoded?.role !== "SuperAdmin" && decoded?.role !== "AmplifyAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const query = {
      isDeleted: false,
      $or: [ 
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

    res.status(200).json({message: "Companies data retrieved successfully.",
      companies,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalRecords: count
    });
  } catch (error) {
    console.error("Error retrieving companies:", error);
    res.status(500).send({message: "Error retrieving companies.", error: error.message});
  }
};

module.exports = {
  createCompany,
  updateCompany,
  deleteCompany,
  getCompany,
  getAllCompanies,
};
