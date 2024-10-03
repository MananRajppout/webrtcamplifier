import express from 'express'
import http from 'http'
import ConnectSocketProcessor from '../api/processors/socket/connectSocketProcessor.js';
import ChatListner from '../api/processors/socket/chatSocketEventlistenProcessor.js'
import {config} from 'dotenv';
const app = express();

config()


const chatServer = http.createServer(app);

//create socker server
const createSocketConnect = new ConnectSocketProcessor();
createSocketConnect.io.attach(chatServer);

//init chats listners
const chatListner = new ChatListner(createSocketConnect.io);
chatListner.initChatListeners();




export default chatServer;