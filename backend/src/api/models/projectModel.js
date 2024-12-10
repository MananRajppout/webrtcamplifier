const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['Draft', 'Active', 'Complete', 'Inactive', 'Closed'], default: 'Draft' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'Contact' },
      roles: {
        role: { type: String, enum: ['Admin', 'Moderator', 'Observer', 'Participant', 'AmplifyAdmin', 'AmplifyModerator', 'AmplifyObserver', 'AmplifyParticipant', 'AmplifyTechHost'] },
        permissions: { type: Schema.Types.Array }
      },
      email: { type: String }
    }
  ],
  tags: { type: [Schema.Types.ObjectId], default: [], ref: 'Tag' },
  projectPasscode: { type: String, required: true },
  startTime: { type: String },
}, { timestamps: true });

// Middleware to update the updatedAt field on save
projectSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;




