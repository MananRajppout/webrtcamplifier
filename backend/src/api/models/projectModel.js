const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    name: { type: String, default: "Untitled" },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        "Draft",
        "Active",
        "Complete",
        "Inactive",
        "Closed",
        "Pause",
        "Unpause",
        "Reopen",
      ],
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "Contact" },
        roles: {
          role: {
            type: [String],
            enum: [
              "Admin",
              "Moderator",
              "Observer",
              "Participant",
              "AmplifyAdmin",
              "AmplifyModerator",
              "AmplifyObserver",
              "AmplifyParticipant",
              "AmplifyTechHost",
            ],
          },
          permissions: { type: Schema.Types.Array },
        },
        email: { type: String },
      },
    ],
    tags: { type: [Schema.Types.ObjectId], default: [], ref: "Tag" },
    projectPasscode: { type: String, default: "A3h@xP" },
    cumulativeMinutes:{
      type: String
    },
    meetingLink: {
      type: String
    },
    projectDetails: {
      respondentMarket: { type: String },
      respondentLanguage: { type: String },
      sessions: [
        {
          number: { type: Number },
          duration: { type: String },
        },
      ],
    },
  },
  { timestamps: true }
);

// Middleware to update the updatedAt field on save
projectSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
