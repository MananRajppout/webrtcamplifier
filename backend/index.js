const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const session = require("express-session");

const cors = require("cors");
const { Timestamp } = require("mongodb");
const { default: mongoose } = require("mongoose");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(http, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

let participants = [];
let moderators = [];


dotenv.config();
app.use(
  cors({
    origin: [process.env.FRONTEND_BASE_URL, "https://new-amplify-fe-kj4c.vercel.app", "http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
  })
);
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Import models
const User = require("./src/api/models/userModelMessage.js");
const Chat = require("./src/api/models/chatModelMesage.js");
const userRoleRoutes = require("./src/api/routes/userJoinMeetRoute.js");

// Import routes
const userRoutes = require("./src/api/routes/userMessRoutes.js");
// const uploadFileRoutes = require("./src/api/routes/uploadFileRoute.js");
app.use("/api", userRoleRoutes);

// Import other route files
require("./src/api/routes/userRoute.js")(app);
require("./src/api/routes/pollRoute.js")(app);
require("./src/api/routes/projectRoute.js")(app);
require("./src/api/routes/meetingRoute.js")(app);
require("./src/api/routes/liveMeetingRoute.js")(app);
require("./src/api/routes/contactRoute.js")(app);
require("./src/api/routes/meetingLinkRoute.js")(app);
require("./src/api/routes/addAdminRoute.js")(app);
require("./src/api/routes/moderatorInvitationRoute.js")(app);
require("./src/api/routes/breakoutroomRoutes.js")(app);
require("./src/api/routes/videoRoute.js")(app);
require("./src/api/routes/companyRoute.js")(app);
require("./src/api/routes/repositoryRoute.js")(app);

mongoose.set("strictQuery", false);

// Mongoose connection options
const options = {
  serverSelectionTimeoutMS: 50000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
};

mongoose
  .connect(process.env.MONGO_URI, options)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error(`Error connecting to the database: ${err}`);
  });

// Middleware setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("register", ({ username, role }) => {
    socket.username = username;
    socket.role = role;

    if (role === "moderator") {
      moderators.push({ id: socket.id, username });
    } else {
      participants.push({ id: socket.id, username });
    }

    io.emit("moderators", moderators);
  });

  // Handle message sending
  socket.on("message", (message) => {
    if (socket.role === "moderator") {
      io.emit("message", { ...message, role: "moderator", starred: true });
    } else {
      moderators.forEach((mod) => {
        io.to(mod.id).emit("message", { ...message, role: "participant" });
      });
    }
  });

  socket.on("broadcast", (message) => {
    io.emit("broadcast", { ...message, role: "moderator", broadcast: true });
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log(`${socket.username} disconnected`);

    // Remove user from respective role list
    if (socket.role === "moderator") {
      moderators = moderators.filter((mod) => mod.id !== socket.id);
    } else {
      participants = participants.filter((part) => part.id !== socket.id);
    }

    io.emit("moderators", moderators);
  });
});



// Use the user routes
// app.use("/api", uploadFileRoutes);

// Start the server
const PORT = process.env.PORT || 8008;
http.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});