const Repository = require("../models/repositoryModel");
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  
});


const uploadFileToS3 = async (filePath, bucketName, key) => {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
    ContentType: path.extname(filePath),
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // Returns the file URL
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3.');
  }
};

const deleteFileFromS3 = async (bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
    console.log('File deleted successfully from S3');
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file from S3.');
  }
};

const createRepository = async (req, res) => {
  let filePath = req.file ? req.file.path : null;
  try {
    if (!req.file || !req.body.meetingId) {
      return res.status(400).json({ error: 'File and meeting ID are required.' });
    }

    const { originalname: fileName, mimetype: type, size } = req.file;
    const { meetingId, projectId, addedBy, role } = req.body;

    let s3Link = '';
    const s3Key = `repository_files/${Date.now()}-${fileName}`;
    try {
      s3Link = await uploadFileToS3(filePath, process.env.S3_BUCKET_NAME, s3Key);
    } catch (uploadError) {
      return res.status(500).json({ error: 'Failed to upload file to S3.' });
    }

    const repository = new Repository({
      fileName,
      type,
      size,
      addedBy,
      role,
      meetingId,
      projectId,
      cloudinaryLink: s3Link, // Change property name if needed
    });

    await repository.save();

    return res.status(201).json({ message: 'File uploaded successfully.', repository });
  } catch (error) {
    console.error('Error in createRepository:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  } finally {
    if (filePath) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('File deleted successfully:', filePath);
        }
      });
    }
  }
};


// const createRepository = async (req, res) => {
//   let filePath = req.file ? req.file.path : null;
//   try {


//     // Check if file and meeting ID are provided
//     if (!req.file || !req.body.meetingId) {
//       return res.status(400).json({ error: 'File and meeting ID are required.' });
//     }

//     // Extract information from request
//     const { originalname: fileName, mimetype: type, size } = req.file;
//     const { meetingId, projectId, addedBy, role } = req.body;



//     // Optional: Upload file to Cloudinary and get the URL
//     let cloudinaryLink = '';
//     try {
//       const result = await cloudinary.uploader.upload(filePath, {
//         resource_type: 'auto', // Automatically determine file type (image, video, etc.)
//         folder: 'repository_files', // Cloudinary folder for uploads
//       });
//       cloudinaryLink = result.secure_url;
//     } catch (uploadError) {
//       console.error('Error uploading to Cloudinary:', uploadError);
//       return res.status(500).json({ error: 'Failed to upload file to Cloudinary.' });
//     }

//     // Create a new repository document
//     const repository = new Repository({
//       fileName,
//       type,
//       size,
//       addedBy,
//       role,
//       meetingId,
//       projectId,
//       cloudinaryLink,
//     });

//     // Save the repository document to MongoDB
//     await repository.save();

//     // Return success response
//     return res.status(201).json({ message: 'File uploaded successfully.', repository });
//   } catch (error) {
//     console.error('Error in createRepository:', error);
//     return res.status(500).json({ error: 'Internal server error.' });
//   } finally {
//     // Delete the file from the server
//     if (filePath) {
//       fs.unlink(filePath, (err) => {
//         if (err) {
//           console.error('Error deleting file:', err);
//         } else {
//           console.log('File deleted successfully:', filePath);
//         }
//       });
//     }
//   }
// }

const getRepositoryByProjectId = async (req, res) => {
  try {
   
    const limit = parseInt(req.query?.limit) || 10;
    const page = parseInt(req.query?.page) || 1;
    let query = { projectId: req.params.projectId };
    if (req.query?.type) {
      const regexPattern = new RegExp(`^${req.query?.type}/`, 'i');
      query.type = { $regex: regexPattern }
    }
    const repositories = await Repository.find(query).skip((page - 1) * limit).limit(limit)
    const totalDocuments = await Repository.countDocuments(query)
    const totalPages = Math.ceil(totalDocuments / limit)
    res.status(200).json({
      page,
      totalPages,
      totalDocuments,
      repositories
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching repository by project ID', error: error.message });

  }
}
const renameFile = async (req, res) => {
  const { id } = req.params;
  const { fileName } = req.body;
  try {
    const updatedFile = await Repository.findByIdAndUpdate(
      id,
      { fileName: fileName },
      { new: true }
    );
    if (!updatedFile) {
      res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json({ message: 'File renamed successfully', updatedFile });
  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).json({ message: 'Error renaming file', error: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFile = await Repository.findByIdAndDelete(id);

    if (!deletedFile) {
      return res.status(404).json({ message: 'File not found' });
    }

    const s3Key = `repository_files/${deletedFile.fileName}`;
    try {
      await deleteFileFromS3(process.env.S3_BUCKET_NAME, s3Key);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
    }

    return res.status(200).json({ message: 'File deleted successfully', deletedFile });
  } catch (error) {
    console.error('Error deleting file:', error);
    return res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
};


// const deleteFile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedFile = await Repository.findByIdAndDelete(id);

//     if (!deletedFile) {
//       res.status(404).json({ message: 'File not found' });
//     }

//     res.status(200).json({ message: 'File deleted successfully', deletedFile });
//   } catch (error) {
//     console.error('Error deleting file:', error);
//     res.status(500).json({ message: 'Error deleting file', error: error.message });
//   }
// };

const getRepositoryByMeetingId = async (req, res) => {
  const { meetingId } = req.params;
  const limit = parseInt(req.query?.limit) || 10;
  const page = parseInt(req.query?.page) || 1;
  try {
    let query = { meetingId }
    if (req.query?.type) {
      const regexPattern = new RegExp(`^${req.query?.type}/`, 'i');
      query.type = { $regex: regexPattern }
    }
    const repositories = await Repository.find(query).skip((page - 1) * limit).limit(limit);
    const totalDocuments = await Repository.countDocuments(query)
    const totalPages = Math.ceil(totalDocuments / limit)
    res.status(200).json({
      page,
      totalPages,
      totalDocuments,
      repositories
    });
  } catch (error) {
    console.error('Error fetching repositories by meeting ID:', error);
    res.status(500).json({ message: 'Error fetching repositories', error: error.message });
  }
};

module.exports = {
  createRepository,
  getRepositoryByProjectId,
  getRepositoryByMeetingId,
  renameFile,
  deleteFile,
};