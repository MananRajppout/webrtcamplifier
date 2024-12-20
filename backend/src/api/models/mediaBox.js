const mongoose = require('mongoose')

const mediaBoxSchema = new mongoose.Schema({
    meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    uploaderEmail: { type: String, default: undefined},
    file: {
        url: {type: String},
        public_id: {type: String},
        name: {type: String},
        mimetype: {type: String},
        size: {type: Number}
    },
    timestamp: { type: Date, default: Date.now },
    role: { type: String, required: false },
    projectId: {type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false},
    addedBy: {type: String, required: false,default: 'unknown'}, 
  });
  
  const MediaBoxModel = mongoose.model('media', mediaBoxSchema);
  module.exports = MediaBoxModel;