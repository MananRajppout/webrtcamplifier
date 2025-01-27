const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectFormSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    formData: {
      service: {
        type: String,
        required: true,
      },
      addOns: {
        type: [String], 
        default: [],
      },
      market: {
        type: String,
        default: "",
      },
      language: {
        type: String,
        default: "",
      },
      sessions: [
        {
          number: { type: Number, default: 0 },
          duration: { type: String, default: "" },
        },
      ],
      firstDateOfStreaming: {
        type: Date,
        required: true,
      },
      projectDate: {
        type: Date,
        default: null,
      },
      respondentsPerSession: {
        type: Number,
        default: 0,
      },
      numSessions: {
        type: Number,
        default: 0,
      },
      sessionLength: {
        type: String,
        default: "",
      },
      recruitmentSpecs: {
        type: String,
        default: "",
      },
      preWorkDetails: {
        type: String,
        default: "",
      },
      selectedLanguages: {
        type: String,
        default: "",
      },
      inLanguageHosting: {
        type: String,
        enum: ["yes", "no", ""],
        default: "",
      },
      provideInterpreter: {
        type: String,
        enum: ["yes", "no", ""],
        default: "",
      },
      languageSessionBreakdown: {
        type: String,
        default: "",
      },
      additionalInfo: {
        type: String,
        default: "",
      },
      emailSent:{
        type: String,
        default: "Pending"
      }
    },
  },
  {
    timestamps: true, 
  }
);

const ProjectForm = mongoose.model("ProjectForm", projectFormSchema);

module.exports = ProjectForm;
