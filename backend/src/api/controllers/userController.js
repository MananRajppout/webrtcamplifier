const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const config = require("../../config/auth.config");
const randomstring = require("randomstring");
const ExcelJS = require("exceljs");
var jwt = require("jsonwebtoken");
const { sendEmail, sendVerifyEmail } = require("../../config/email.config");
const Contact = require("../models/contactModel");
const { default: mongoose } = require("mongoose");
const Meeting = require("../models/meetingModel");
const Project = require("../models/projectModel");
const { decodeToken } = require("../../utils/jwt");

const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {  // Corrected condition for minimum length
    errors.push("Password must be at least 8 characters long.");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number.");
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (@$!%*?&)."
    );
  }

  return errors.length > 0 ? errors : null;
};

const validateEmail = (email) => {
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_PATTERN.test(email)) {
    return "Invalid email format.";
  }
  return null;
};

const signup = async (req, res) => {
  const session = await mongoose.startSession()

  session.startTransaction()
  try {
    const { firstName, lastName, email, password, terms } = req.body;

    // Validate required fields
    if (!(firstName && lastName && email && password && terms !== undefined)) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Validate email format
    const emailError = validateEmail(email);
    if (emailError) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ message: emailError });
    }
    // Validate password criteria
    const passwordErrors = validatePassword(password);
    if (passwordErrors) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ message: passwordErrors.join(" ") });
    }
    // Check if the user already exists
    const userExist = await userModel.findOne({ email }).select("_id").session(session);
    if (userExist) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ message: "Email already in use" });
    }
    // Hash the password before saving it in the database
    const hashedPassword = bcrypt.hashSync(password, 8);


    const contacts = await Contact.find({ email }).session(session);

    const contactIds = contacts.map(contact => contact._id)



    // Create new user with all necessary data
    const newUser = new userModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "Admin",
      isEmailVerified: false,
      termsAccepted: terms,
      termsAcceptedTime: new Date(),
      contactIds: contactIds
    });
    // Save the new user
    const userSavedData = await newUser.save({ session });

    // Send a verification email
    sendVerifyEmail(firstName, email, newUser._id);

    
    if (contacts.length > 0) {
      // Update all matching contacts to set isUser field to true
      await Contact.updateMany({ email }, { $set: { isUser: true, userId: newUser._id } }, {session});
    }

    const newContact = new Contact({
      firstName,
      lastName,
      email,
      companyName: "N/A",
      roles: ["Moderator"],
      createdBy: userSavedData._id,
      isUser: true,
      userId: newUser._id
    });

    const savedContact = await newContact.save({session});

    await userModel.findByIdAndUpdate(userSavedData._id, {$push: {contactIds: savedContact._id}},
      {session}
    )

    await session.commitTransaction()
    session.endSession()

    // Respond with success message
    return res.status(200).json({
      message: "User registered successfully. Please verify your email!",
    });
  } catch (error) {
    await session.abortTransaction()
      session.endSession()
    console.error("Signup error:", error);
    return res.status(500).json({ message: error.message });
  }
};

const signin = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User Not found." });
    }
    if (user.status === 'Inactive') {
      return res.status(404).json({ message: "Your account is inactive. " });
    }
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    let token = jwt.sign(
      {
        id: user._id,
        name: user.firstName,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: 86400 }
    );

    await userModel.findByIdAndUpdate(user._id, { token: token });

    let options;
    if (process.env.STATUS_MODE != "production") {
      options = {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        httpOnly: true, // Protects against XSS attacks
        secure: process.env.MODE === "production", // Allow over HTTP (not recommended for production)
      };
    } else {
      options = {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        domain: ".hgsingalong.com", // Shared across all subdomains
        path: "/", // Available across the entire domain
        httpOnly: true, // Prevent client-side access
        secure: true, // Required for HTTPS
        sameSite: "Lax", // Adjust as needed ("Strict", "None", or "Lax")
      };
    }

    res.cookie("token", token, options);

    return res.status(200).json({
      message: "User Successfully logged in. ",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    // Handle file upload
    if (req.file) {
      const file = req.file;
      const filePath = `/uploads/${file.filename}`;
      req.body.profilePicture = filePath;
    }

    delete req.body.password;
    const user = await userModel.findById(req.body._id || req.body.id);
    // Check if the user is deleted
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found." });
    }
    const updatedContact = await userModel.findByIdAndUpdate(
      { _id: req.body._id || req.body.id },
      req.body,
      { new: true }
    );

    // Generate new token
    const token = jwt.sign(
      {
        id: updatedContact._id,
        name: updatedContact.firstName,
        role: updatedContact.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: 86400 }
    );

    res.status(200).json({
      message: "User info successfully updated",
      data: {
        _id: updatedContact._id,
        firstName: updatedContact.firstName,
        lastName: updatedContact.lastName,
        email: updatedContact.email,
        role: updatedContact.role,
        companyName: updatedContact.companyName,
        roles: updatedContact.roles,
        isEmailVerified: updatedContact.isEmailVerified,
        createdAt: updatedContact.createdAt,
        updatedAt: updatedContact.updatedAt,
        accessToken: token,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteById = async (req, res) => {
  try {
    if (!req.query.id) {
      return res.status(400).json({ message: "id is required" });
    }
    const exist = await userModel.findById(req.query.id).select("name");
    if (!exist || exist.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }
    await userModel.findByIdAndDelete({
      _id: req.query._id || req.query.id,
    });
    const ids = await Project.distinct("_id", { createdBy: req.query.id });
    await Meeting.deleteMany({ projectId: { $in: ids } });
    await Project.deleteMany({ createdBy: req.query.id });
    await Contact.deleteMany({ createdBy: req.query.id });
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const findById = async (req, res) => {
  try {
    const result = await userModel.findById({
      _id: req.query._id || req.query.id,
    });
    if (!result || result.isDeleted) {
      res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ message: "User retrieved successfully", data: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const findAll = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = decodeToken(token);
    console.log("decoded", decoded)

    if (decoded?.role !== "SuperAdmin" && decoded?.role !== "AmplifyAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const search = req.query.search || "";
    const company = req.query.company || "";

    // Build the query object
    const query = {
      isDeleted: false,
      role: { $in: ["Admin", "Moderator", "Observer"] },
      ...(search && {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { role: { $regex: search, $options: "i" } },
        ],
      }),
      ...(company && { company: company }),
    };
    const result = await userModel
      .find(query)
      .limit(limit)
      .skip(limit * (page - 1));

    const totalRecords = await userModel.countDocuments({
      isDeleted: false,
      role: { $in: ["Admin", "Moderator", "Observer"] },
    });

    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
      message: "User info successfully fetched",
      data: { result, totalRecords, totalPages },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, message: "Internal server error." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.body.token;
    const tokenData = await userModel.findOne({ token: token });
    if (tokenData) {
      const newPassword = bcrypt.hashSync(req.body.newPassword, 8);
      const UserData = await userModel.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: newPassword, token: "" } },
        { new: true }
      );
      res.status(200).send({
        message: "User password has been reset successfully",
        data: UserData,
      });
    } else {
      res.status(200).send({
        message: "Unauthorized.",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const sendResetPasswordMail = async (name, email, token) => {
  try {
    const html = `<p> Hi ${name}, please copy the link <a href="${process.env.FRONTEND_BASE_URL}/resetPassword?token=${token}"> reset your password </a>.</p>`;
    await sendEmail(email, "For Reset password", html);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await userModel.findOne({ email: email });
    if (userData) {
      const randomString = randomstring.generate();
      await userModel.updateOne(
        { email: email },
        { $set: { token: randomString } }
      );
      sendResetPasswordMail(userData.firstName, userData.email, randomString);
      res.status(200).send({
        message: "Please check your inbox and reset your password",
      });
    } else {
      res.status(200).send({
        message: "This email does not exist",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifymail = async (req, res) => {
  const id = req.query.id;

  try {
    const user = await userModel.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already verified
    if (user.isEmailVerified) {
      return res.status(200).json({ message: "Account is already verified" });
    }

    const verifiedMail = await userModel.updateOne(
      { _id: id }, // Correct query object
      { $set: { isEmailVerified: true } }
    );
    return res.status(200).json({ message: "Email successfully verified" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const uploadUserExcel = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ error: "Please upload a file.", status: 400 });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);

    const worksheet = workbook.worksheets[0];
    const headers = [
      "firstName",
      "lastName",
      "email",
      "password",
      "role",
      "status",
      "createdBy",
    ];

    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          rowData[header] = cell.value;
        });
        rows.push(rowData);
      }
    });

    for (const rowData of rows) {
      const email = rowData.email;
      const passwordErrors = validatePassword(rowData.password);
      if (passwordErrors) {
        return res
          .status(400)
          .json({ message: passwordErrors.join(" "), status: 400 });
      }

      const userExist = await userModel.findOne({ email: email }).select("_id");

      if (!userExist) {
        const newUser = new userModel({
          firstName: rowData.firstName,
          lastName: rowData.lastName,
          email: rowData.email,
          password: bcrypt.hashSync(rowData.password, 8),
          role: rowData.role,
          status: rowData.status,
          createdBy: rowData.createdBy,
        });
        await newUser.save();
      }
    }

    return res.status(200).json({
      message: "Users imported successfully from Excel.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const downloadUserExcel = async (req, res) => {
  try {
    const users = await userModel.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Role",
      "Status",
      "Created By",
      "Joined On",
      "Created At",
      "Updated At",
      "Last Login At",
    ];
    worksheet.addRow(headers);

    users.forEach((user) => {
      const row = [
        user.firstName,
        user.lastName,
        user.email,
        user.role,
        user.status,
        user.createdBy,
        user.joinedOn,
        user.createdAt,
        user.updatedAt,
        user.lastLoginAt,
      ];
      worksheet.addRow(row);
    });

    const filePath = "uploads/users.xlsx";
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, "users.xlsx", (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Error downloading file.");
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: 500 });
  }
};

const changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    const isPasswordSame = await bcrypt.compare(newPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ 
        error: true, 
        message: "Old password is incorrect." 
      });
    }

    if (isPasswordSame) {
      return res.status(400).json({
        error: true,
        message: "New password must be different from the old password.",
      });
    }

    const passwordErrors = validatePassword(newPassword);

    if (passwordErrors) {
      return res.status(400).json({ 
        error: true, 
        message: passwordErrors.join(" ") 
      });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 8);
    await userModel.findByIdAndUpdate(user._id, { password: hashedPassword });

    return res.status(200).json({ 
      error: false, 
      message: "Password changed successfully." 
    });

  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ 
      error: true, 
      message: "An unexpected error occurred. Please try again later." 
    });
  }
};

const userCreateByAdmin = async (req, res) => {
  const token = req.cookies.token;

  const decoded = decodeToken(token);

  if (decoded?.role !== "SuperAdmin" && decoded?.role !== "AmplifyAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { firstName, lastName, email, companyName, password } = req.body;
  // Validate input fields
  if (!firstName || !lastName || !email || !companyName || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const userExist = await userModel.findOne({ email }).select("_id");

  if (userExist) {
    return res.status(400).json({ message: "Email already in use" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user object
  const newUser = new userModel({
    firstName,
    lastName,
    email,
    company: companyName,
    password: hashedPassword,
    createdBy: decoded.email,
    termsAccepted: true,
    termsAcceptedTime: new Date(),
    isEmailVerified: true,
  });
  const userSavedData = await newUser.save();

  // Send a verification email
  sendVerifyEmail(firstName, email, newUser._id);

  const contacts = await Contact.find({ email });

  if (contacts.length > 0) {
    // Update all matching contacts to set isUser field to true
    await Contact.updateMany({ email }, { $set: { isUser: true } });
  }

  const newContact = new Contact({
    firstName,
    lastName,
    email,
    companyName,
    roles: ["Admin"],
    createdBy: userSavedData._id,
    isUser: true,
  });

  await newContact.save();

  // Respond with success message
  return res.status(200).json({
    message: "User registered successfully. ",
  });
};

const updateByAdmin = async (req, res) => {
  const token = req.cookies.token;

  const decoded = decodeToken(token);

  if (decoded?.role !== "SuperAdmin" && decoded?.role !== "AmplifyAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { id, firstName, lastName, status, company } = req.body;

  try {
    let user = await userModel.findById(id);
    if (decoded?.role === "AmplifyAdmin") {
      user = await userModel.findOne({ _id: id });
    }
    // Check if the user is deleted
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prevent AmplifyAdmin from updating another AmplifyAdmin
    if (decoded?.role === "AmplifyAdmin" && user?.role === "AmplifyAdmin") {
      return res.status(403).json({
        message: "Access denied: You cannot update another AmplifyAdmin.",
      });
    }
    // Prepare an object to hold the updates
    const updates = {};

    // Only add fields to updates if they are provided
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (status) updates.status = status;
    if (company) updates.company = company;

    // Update the user in the database
    const updatedUser = await userModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteByAdmin = async (req, res) => {
  const { id } = req.params;
  const token = req.cookies.token;

  const decoded = decodeToken(token);

  if (decoded?.role !== "SuperAdmin" && decoded?.role !== "AmplifyAdmin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const exist = await userModel.findById(id);

  if (!exist || exist.isDeleted) {
    return res.status(404).json({ message: "User not found" });
  }

  // Prevent AmplifyAdmin from updating another AmplifyAdmin
  if (decoded?.role === "AmplifyAdmin" && exist?.role === "AmplifyAdmin") {
    return res.status(403).json({
      message: "Access denied: You cannot delete another AmplifyAdmin.",
    });
  }

  try {
    await userModel.findByIdAndUpdate(id, { isDeleted: true });

    return res.status(200).json({ message: "User  deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createAmplifyAdmin = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const token = req.cookies.token;
    const decoded = decodeToken(token);

    const { firstName, lastName, email, role, password, termsAccepted } =
      req.body;

    const validRoles = [
      "AmplifyAdmin",
      "AmplifyModerator",
      "AmplifyObserver",
      "AmplifyTechHost",
    ];

    if (!validRoles.includes(req.body?.role)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid role" });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const contacts = await Contact.find({email})

    const contactIds = contacts.map(contact => contact._id)

    // Create new user with all necessary data
    const newUser = new userModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      isEmailVerified: true,
      termsAccepted,
      termsAcceptedTime: new Date(),
      createdById: decoded?.id,
      contactIds: contactIds
    });
    // Save the new user
    const userSavedData = await newUser.save({ session });

    if (contacts.length > 0) {
      // Update all matching contacts to set isUser field to true
      await Contact.updateMany({ email }, { $set: { isUser: true, userId: newUser._id } }, {session});
    }

    const newContact = new Contact({
      firstName,
      lastName,
      email,
      companyName: "N/A",
      roles: role,
      createdBy: decoded.id,
      isUser: true,
      userId: newUser._id
    });

    const savedContact = await newContact.save({ session });

    await userModel.findByIdAndUpdate(userSavedData._id, {$push: {contactIds: savedContact._id}}, { session })

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(userSavedData);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("error in createAmplifyAdmin", error);
    return res.status(500).json({ message: error.message });
  }
};

const getAllAmplifyAdminsByAdminId = async (req, res) => {
  try {
    const decoded = decodeToken(req.cookies.token);
    if (decoded?.role !== "SuperAdmin" && decoded?.role !== "AmplifyAdmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const search = req.query.search || "";
    const company = req.query.company || "";

    // Build the query object
    const query = {
      isDeleted: false,
      // createdBy: decoded?.email,
      role: {
        $in: [
          "AmplifyAdmin",
          "AmplifyModerator",
          "AmplifyObserver",
          "AmplifyParticipant",
          "AmplifyTechHost",
        ],
      },
      ...(search && {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { role: { $regex: search, $options: "i" } },
        ],
      }),
      ...(company && { company: company }),
    };
    const result = await userModel
      .find(query)
      .limit(limit)
      .skip(limit * (page - 1));

    const totalRecords = await userModel.countDocuments({
      isDeleted: false,
      role: {
        $in: [
          "AmplifyAdmin",
          "AmplifyModerator",
          "AmplifyObserver",
          "AmplifyParticipant",
          "AmplifyTechHost",
        ],
      },
    });

    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
      message: "User info successfully fetched",
      data: { result, totalRecords, totalPages },
    });

    // const data = await Contact.find({ createdBy: decoded?.id });
    // return res.status(200).json(data);
  } catch (error) {
    console.error("error in getAllAmplifyAdminsByAdminId", error);
    return res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(400).json({ message: "No active session found" });
    }
    // Clear the token from the user document in database
    const decoded = decodeToken(token);
    if (decoded?.id) {
      await userModel.findByIdAndUpdate(decoded.id, { token: null });
    }

    let options;
    if (process.env.STATUS_MODE != "production") {
      options = {
        expires: new Date(Date.now()), // 15 days
        httpOnly: true, // Protects against XSS attacks
        secure: process.env.MODE === "production", // Allow over HTTP (not recommended for production)
      };
    } else {
      options = {
        expires: new Date(Date.now()),
        domain: ".hgsingalong.com", // Shared across all subdomains
        path: "/", // Available across the entire domain
        httpOnly: true, // Prevent client-side access
        secure: true, // Required for HTTPS
        sameSite: "Lax", // Adjust as needed ("Strict", "None", or "Lax")
      };
    }

    res.cookie("token", token, options);

    // Clear the cookie
    // res.clearCookie("token");

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signup,
  signin,
  update,
  deleteById,
  findById,
  findAll,
  resetPassword,
  forgotPassword,
  verifymail,
  uploadUserExcel,
  downloadUserExcel,
  changePassword,
  userCreateByAdmin,
  updateByAdmin,
  deleteByAdmin,
  createAmplifyAdmin,
  getAllAmplifyAdminsByAdminId,
  logout,
};
