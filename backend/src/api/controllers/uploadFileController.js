const MediaBoxModel = require('../models/mediaBox.js');
const AWS = require('aws-sdk');
const axios = require('axios');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

// Helper: Upload to S3
async function uploadToS3(buffer, mimetype, fileName) {
  const uniqueFileName = `${Date.now()}-${fileName}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `mediabox/${uniqueFileName}`,
    Body: buffer,
    ContentType: mimetype,
  };

  const data = await s3.upload(params).promise();
  return { url: data.Location, key: params.Key };
}

// Helper: Delete from S3
async function deleteFromS3(key) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };
  await s3.deleteObject(params).promise();
}

function calculateBase64Size(base64String) {
 
  const base64Header = /^data:image\/\w+;base64,/;
  const cleanedBase64 = base64String.replace(base64Header, '');

  // Calculate padding (if any)
  const padding = (cleanedBase64.endsWith('==') ? 2 : cleanedBase64.endsWith('=') ? 1 : 0);

  // Calculate size in bytes
  const sizeInBytes = (cleanedBase64.length * 3) / 4 - padding;
  return sizeInBytes;
}

async function handleUpload(file,mimetype) {
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET
  })

  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
    mimetype
  });
  return res;
}

exports.uploadFile = async (req, res) => {
  try {
    const { meetingId, email, role, projectId, addedBy, filename, filebase64 } = req.body;

    console.log("upload file req.body", req.body)

    if (!req.file && !filebase64) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let buffer, mimetype, originalname;
    if (req.file) {
      buffer = req.file.buffer;
      mimetype = req.file.mimetype;
      originalname = req.file.originalname;
    } else if (filebase64) {
      const base64Data = filebase64.split(';base64,').pop();
      buffer = Buffer.from(base64Data, 'base64');
      mimetype = 'image/png'; 
      originalname = filename;
    }

    // Upload to S3
    const s3Response = await uploadToS3(buffer, mimetype, originalname);

    // Save to Database
    const newMedia = await MediaBoxModel.create({
      meetingId,
      uploaderEmail: email,
      role,
      projectId,
      addedBy,
      file: {
        url: s3Response.url,
        public_id: s3Response.key,
        name: originalname,
        mimetype: mimetype,
        size: buffer.length,
      },
    });

    console.log('upload file new media', newMedia)

    // Emit Event
    const EventsEmitter = req.app.get('EventsEmitter');
    EventsEmitter.emit('mediabox:on-upload', { media: newMedia });

    res.status(201).json({
      success: true,
      message: 'Upload Successfully',
      file: newMedia,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(501).json({ success: false, message: error.message });
  }
};

exports.uploadRecordingFile = async (req, res) => {
  try {
    const { meetingId, email, role, projectId, addedBy, filename,size,recording_url,transcribtion,words } = req.body;

    // Save to Database
    const newMedia = await MediaBoxModel.create({
      meetingId,
      uploaderEmail: email,
      role,
      projectId,
      addedBy,
      file: {
        url: recording_url,
        public_id: "recording_server",
        name: filename,
        mimetype: "video/mp4",
        size: Number(size) || 0,
        transcribtion,
        words
      },
    });

    // Emit Event
    const EventsEmitter = req.app.get('EventsEmitter');
    EventsEmitter.emit('mediabox:on-upload', { media: newMedia });

    res.status(201).json({
      success: true,
      message: 'Upload Successfully',
      file: newMedia,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(501).json({ success: false, message: error.message });
  }
};




// POST - Get Files By Meeting Id
exports.getFileByMeetingId = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const media = await MediaBoxModel.find({ meetingId }).sort({ timestamp: -1 }).skip(startIndex).limit(limit);
    const totalDocuments = await MediaBoxModel.countDocuments({ meetingId });
    const totalPages = Math.ceil(totalDocuments / limit);

    console.log("getFileByMeetingId", media)

    res.status(200).json({
      success: true,
      media,
      totalPages,
      totalDocuments,
    });
  } catch (error) {
    console.error('Error fetching files by meeting ID:', error);
    res.status(501).json({ success: false, message: error.message });
  }
};

// POST - Get Files By Project Id
exports.getFileByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    console.log("project Id", projectId)

    const media = await MediaBoxModel.find({ projectId }).sort({ timestamp: -1 }).skip(startIndex).limit(limit);
    const totalDocuments = await MediaBoxModel.countDocuments({ projectId });
    const totalPages = Math.ceil(totalDocuments / limit);

    // console.log("getFileByProjectId", getFileByProjectId)

    res.status(200).json({
      success: true,
      media,
      totalPages,
      totalDocuments,
    });
  } catch (error) {
    console.error('Error fetching files by project ID:', error);
    res.status(501).json({ success: false, message: error.message });
  }
};

// DELETE - Delete File
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await MediaBoxModel.findByIdAndDelete(id);

    if (!media) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
console.log("delete id", id)
    // Delete from S3
    await deleteFromS3(media.file.public_id);

    // Emit Event
    const EventsEmitter = req.app.get('EventsEmitter');
    EventsEmitter.emit('mediabox:on-delete', { media });

    res.status(200).json({
      success: true,
      message: 'File Deleted Successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(501).json({ success: false, message: error.message });
  }
};

// PUT - Rename File
// exports.renameFile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { fileName } = req.body;

//     const media = await MediaBoxModel.findById(id)
//     console.log("file name", fileName)

//     console.log("media", media)

//     // const media = await MediaBoxModel.findByIdAndUpdate (id, {file: {name: fileName}});

//     // if (!media) {
//     //   return res.status(404).json({ success: false, message: 'File not found' });
//     // }

//     // // Emit Event
//     // const EventsEmitter = req.app.get('EventsEmitter');
//     // EventsEmitter.emit('mediabox:on-update', { media });

//     // res.status(200).json({
//     //   success: true,
//     //   message: 'File Renamed Successfully',
//     //   media,
//     // });
//   } catch (error) {
//     console.error('Error renaming file:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };




exports.renameFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileName } = req.body;

    // Fetch media record from DB
    const media = await MediaBoxModel.findById(id);
    if (!media) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Get the file from S3
    const oldFileUrl = media.file.url;
    const oldFileKey = media.file.public_id; // Key used to delete from S3

    console.log("Downloading file from S3:", oldFileUrl);

    const response = await axios({
      method: 'get',
      url: oldFileUrl,
      responseType: 'arraybuffer',
    });

    const fileBuffer = Buffer.from(response.data);
    const mimetype = media.file.mimetype;

    // Delete old file from S3
    await deleteFromS3(oldFileKey);
    console.log("Deleted old file from S3:", oldFileKey);

    // Upload the file with the new name
    const s3Response = await uploadToS3(fileBuffer, mimetype, fileName);
    console.log("Uploaded new file to S3:", s3Response.url);

    // Update the database
    media.file.url = s3Response.url;
    media.file.public_id = s3Response.key;
    media.file.name = fileName;

    await media.save();

    res.status(200).json({
      success: true,
      message: 'File renamed successfully',
      file: media,
    });

  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
