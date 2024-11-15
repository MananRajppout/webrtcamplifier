const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const liveMeetingSchema = new Schema({
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
  waitingRoom: [{
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true },
  }],
  removedParticipants: [{
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true },
    
  }],
  moderator: {
    name: { type: String, required: true },
    id: { type: String, required: true },
    role: { type: String, required: true }
  },
  participantsList: [{
    name: { type: String, required: true },
    id: { type: String, required: true },
    role: { type: String, required: true },
    email: {type: String, requried: true},
    roomName: {type: String, required: false, default: "main"}
    }],
  observerList: [{
    name: { type: String, required: true },
    id: { type: String, required: true },
    role: { type: String, required: true }
  }],
  ongoing: {
    type: Boolean,
    default: false
  },
  isStreaming: {
    type: Boolean,
    default: false
  },
  webRtcRoomId: {
    type: String,
    default: null
  },
  iframeUrl: {
    type: String,
    default: null
  },
  participantChat: [{type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage'}],
  observerChat: [{type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage'}],
  breakRooms: [{
    roomName: {type: String}
  }]
});

const LiveMeeting = mongoose.model('LiveMeeting', liveMeetingSchema);

module.exports = LiveMeeting;