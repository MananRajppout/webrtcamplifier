const File = require('../models/UploadFileModel.js');
const fs = require('fs');
const path = require('path');

// POST - Upload File
exports.uploadFile = (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const newFile = new File({
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    size: file.size,
  });

  newFile.save()
    .then((savedFile) => res.status(201).json(savedFile))
    .catch((error) => res.status(500).json({ message: 'Failed to save file', error }));
};

// GET - List All Files
exports.getFiles = (req, res) => {
  File.find()
    .then((files) => {
      
      res.status(200).json(files);
    })
    .catch((error) => {
      console.error('Error retrieving files:', error); // Debugging
      res.status(500).json({ message: 'Failed to retrieve files', error });
    });
};


// DELETE - Delete a File


exports.deleteFile = (req, res) => {
  const fileId = req.params.id;

  File.findByIdAndDelete(fileId)
    .then((deletedFile) => {
      if (!deletedFile) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Debugging: Check the path before deleting
      const filePath = path.resolve(__dirname, '..', 'uploads', deletedFile.filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error('File does not exist:', filePath);
        return res.status(404).json({ message: 'File not found on filesystem' });
      }

      // Remove file from the filesystem
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          return res.status(500).json({ message: 'Failed to delete file from filesystem', err });
        }

        res.status(200).json({ message: 'File deleted successfully' });
      });
    })
    .catch((error) => res.status(500).json({ message: 'Failed to delete file', error }));
};