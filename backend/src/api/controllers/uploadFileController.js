const MediaBoxModel = require('../models/mediaBox.js');
const { v2:cloudinary } = require('cloudinary');


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




// POST - Upload File
exports.uploadFile = async (req, res) => {
  try {
    const {meetingId,email,role,projectId,addedBy,filename,filebase64} = req.body;
    let file = req.file;
    if (!file && !filebase64) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
  
    //upload file on cloudinary
    let cldRes;
    if(file){
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      cldRes = await handleUpload(dataURI,file.mimetype);
    }

    if(filebase64){
      let dataURI = "data:" + '' + ";base64," + filebase64;
      file = {
        mimetype: 'image/png',
        originalname: filename,
        size: calculateBase64Size(dataURI)
      }
    
      cldRes = await handleUpload(dataURI,file.mimetype);
    }

    

    //save on db
    const newMedia = await MediaBoxModel.create({
      meetingId,
      uploaderEmail: email,
      role,
      projectId,
      addedBy,
      file: {
        url: cldRes.secure_url,
        public_id: cldRes.public_id,
        name: file?.originalname,
        mimetype: file?.mimetype,
        size: file?.size
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



//POST - Get Files By Meeting Id
exports.getFileByMeetingId = async (req, res) => {
  try {
    const {meetingId} = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const media = await MediaBoxModel.find({meetingId}).sort({timestamp: -1}).skip(startIndex).limit(limit);
    const totalDocument = await MediaBoxModel.countDocuments;
    const totalPages = Math.ceil(totalDocument / limit);
    res.status(200).json({
      success: true,
      media,
      totalPages,
      totalDocument
    })
  } catch (error) {
    res.status(501).json({
      success: false,
      message: error.message
    })
  }
}


//POST - Get Files By Project Id
exports.getFileByProjectId = async (req, res) => {
  try {
    const {projectId} = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const media = await MediaBoxModel.find({projectId}).sort({timestamp: -1}).skip(startIndex).limit(limit);
    const totalDocument = (await MediaBoxModel.find({projectId})).length;
    const totalPages = Math.ceil(totalDocument / limit);
    
    res.status(200).json({
      success: true,
      media,
      totalPages,
      totalDocument
    })
  } catch (error) {
    res.status(501).json({
      success: false,
      message: error.message
    })
  }
}


//DELETE - Delete File
exports.deleteFile = async (req, res) => {
  try {
 
    const {id} = req.params;
    const media = await MediaBoxModel.findOne({_id: id});
    console.log(media);
    await MediaBoxModel.findByIdAndDelete(id);
   
    const EventsEmitter = req.app.get('EventsEmitter');
    EventsEmitter.emit('mediabox:on-delete',{media});
    res.status(200).json({
      success: true,
      message: "File Deleted Successfully"
    })
  } catch (error) {
    res.status(501).json({
      success: false,
      message: error.message
    })
  }
}


//PUT - Rename File
exports.renameFile = async (req, res) => {
  try {
    const {id} = req.params;
    const {fileName} = req.body;
    const media = await MediaBoxModel.findByIdAndUpdate (id, {file: {name: fileName}});
    const EventsEmitter = req.app.get('EventsEmitter');
    EventsEmitter.emit('mediabox:on-update',{media});
    res.status(200).json({
      success: true,
      message: "File Renamed Successfully"
    })
  }
  catch (error) {
    res.status(501).json({
      success: false,
      message: error.message
    })
  }
}
