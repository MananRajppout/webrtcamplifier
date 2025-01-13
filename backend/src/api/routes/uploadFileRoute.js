const express = require('express');
const Multer = require('multer');
const router = express.Router();
const fileController = require('../controllers/uploadFileController');
const fs = require('fs');
const path = require('path');

  
const storage = new Multer.memoryStorage();
const upload = Multer({
  storage,
});


// POST - Upload File
router.post('/upload', upload.single('file'), fileController.uploadFile);
router.post('/upload-recording', fileController.uploadRecordingFile);
router.get('/upload/get/:meetingId', fileController.getFileByMeetingId);
router.get('/upload/get-project/:projectId', fileController.getFileByProjectId);
router.delete('/upload/delete/:id', fileController.deleteFile);
router.put('/upload/rename/:id', fileController.renameFile);

module.exports = router;
