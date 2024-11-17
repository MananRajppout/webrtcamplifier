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

module.exports = router;
