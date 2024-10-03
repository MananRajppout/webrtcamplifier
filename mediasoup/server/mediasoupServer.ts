import express from 'express'
import http from 'http'
import ConnectSocketProcessor from '../api/processors/socket/connectSocketProcessor.js';
import MediasoupListner from '../api/processors/socket/mediasoupSocketEventlistnerProcessor.js'
import {config} from 'dotenv';
import roomRouter from '../api/routes/roomRoute.js'
const app = express();


config()
app.use(roomRouter);


const mediaServer = http.createServer(app);

//create socker server
const createSocketConnect = new ConnectSocketProcessor();
createSocketConnect.io.attach(mediaServer);

//init mediasoup listners
const mediasoupListener = new MediasoupListner(createSocketConnect.io);
mediasoupListener.initMediasoupListners();



export default mediaServer;