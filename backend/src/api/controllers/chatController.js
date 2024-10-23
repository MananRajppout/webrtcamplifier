// Route to get chat history

const ChatMessage = require("../models/chatModel");

// Route to save a new message

const saveChatMessage = async (req, res) => {
  const { meetingId, senderName, receiverName, message } = req.body;

  const newMessage = new ChatMessage({
    meetingId: String(meetingId),
    senderName: String(senderName),
    receiverName: String(receiverName),
    message: String(message)
  });

  try {
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: 'Error saving message' });
  }
}

const getMeetingChatById = async (req, res) => {
  const { meetingId } = req.params;
  try {
    const chatHistory = await ChatMessage.find({ meetingId }).sort('timestamp');
    res.status(200).json(chatHistory);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: 'Error fetching chat history' });
  }
}



module.exports = {
  saveChatMessage, getMeetingChatById
};