const e = require('cors');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const liveMeetingSchema = new Schema({
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
  waitingRoom: [{
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, default: null },
  }],
  removedParticipants: [{
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, default: null },
    
  }],
  moderator: {
    name: { type: String, required: true },
    id: { type: String, required: true },
    role: { type: String, required: true },
    joiningTime: {type: Date, required: false, default: Date.now},
    leavingTime: {type: Date, required: false, default: null},
    status: {type: String, required: false, default: "offline",enum: ['online', 'offline']},
  },
  participantsList: [{
      name: { type: String, required: true },
      id: { type: String, required: true },
      role: { type: String, required: true },
      email: {type: String, requried: true},
      image: { type: String, default: null },
      roomName: {type: String, required: false, default: "main"},
      joiningTime: {type: Date, required: false, default: Date.now},
      leavingTime: {type: Date, required: false, default: null},
      status: {type: String, required: false, default: "offline",enum: ['online', 'offline', 'removed']},
    }],
  observerList: [{
    name: { type: String, required: true },
    id: { type: String, required: true },
    role: { type: String, required: true },
    email: {type: String,default: null},
    joiningTime: {type: Date, required: false, default: Date.now},
    leavingTime: {type: Date, required: false, default: null},
    status: {type: String, required: false, default: "offline",enum: ['online', 'offline']},
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
  isMeetindEnded: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  recordings: [{
    url: String
  }],
  
  participantChat: [{type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage'}],
  observerChat: [{type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage'}],
  breakRooms: [{
    roomName: {type: String}
  }]
});

const LiveMeeting = mongoose.model('LiveMeeting', liveMeetingSchema);

module.exports = LiveMeeting;