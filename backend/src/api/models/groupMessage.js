const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    senderEmail: { type: String, default: undefined},
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    name: {type: String,default: 'Unknown'}
  });
  
  const GroupMessage = mongoose.model('Message', messageSchema);
  module.exports = GroupMessage;