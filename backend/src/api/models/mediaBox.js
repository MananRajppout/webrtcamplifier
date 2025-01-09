const mongoose = require('mongoose')



function getterFIle(url) {
    // Check if public_id is "recording_server" and modify the URL
    if (this.file && this.file.public_id === "recording_server" && url) {
      return `${process.env.NEXT_PUBLIC_RECORDING_SERVER_URL}${url}`;
    }
    return url; // Return the original URL if the condition is not met
  }

const mediaBoxSchema = new mongoose.Schema({
    meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    uploaderEmail: { type: String, default: undefined },
    file: {
        url: { type: String,get: getterFIle},
        public_id: { type: String },
        name: { type: String },
        mimetype: { type: String },
        size: { type: Number }
    },
    timestamp: { type: Date, default: Date.now },
    role: { type: String, required: false },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
    addedBy: { type: String, required: false, default: 'unknown' },
});


mediaBoxSchema.set('toJSON', { getters: true, virtuals: true });
mediaBoxSchema.set('toObject', { getters: true, virtuals: true });



const MediaBoxModel = mongoose.model('media', mediaBoxSchema);
module.exports = MediaBoxModel;