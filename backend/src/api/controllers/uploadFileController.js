const MediaBoxModel = require('../models/mediaBox.js');
const { v2:cloudinary } = require('cloudinary');


async function handleUpload(file) {
  cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_KEY, 
    api_secret: process.env.CLOUD_SECRET
  })

  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return res;
}

// POST - Upload File
exports.uploadFile = async (req, res) => {
  try {
    const {meetingId,email} = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
  
    //upload file on cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const cldRes = await handleUpload(dataURI);

    //save on db
    const newMedia = await MediaBoxModel.create({
      meetingId,
      uploaderEmail: email,
      file: {
        url: cldRes.secure_url,
        public_id: cldRes.public_id,
        name: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });

    const EventsEmitter = req.app.get('EventsEmitter');
    EventsEmitter.emit('mediabox:on-upload',{media: newMedia});
    res.status(201).json({
      success: true,
      message: "Upload Successfully"
    })
  } catch (error) {
    res.status(501).json({
      success: false,
      message: error.message
    })
  } 

};
