import { JOIN_ROOM, MESSAGE,redisChannel } from "../../constants/eventsConstant.js";
import {Redis} from 'ioredis';
import createSendMessageProcessor from "../chat/sendMessageProcessor.js";
import createRecieveMessageProcessor from "../chat/receiveMessageProcessor.js";
import { Server } from "socket.io";




class createSocketConnect {
    private _io: Server;
    private redispub:Redis;
    private redissub:Redis;

    constructor(io:Server) {
        this._io = io;

        // Initialize Redis publisher and subscriber clients
         // Type assertion for environment variable
         const redisUrl = process.env.REDIS_URL as string;
         if (!redisUrl) {
             throw new Error('REDIS_URL environment variable is not set');
         }

        this.redispub = new Redis(redisUrl);

        this.redissub = new Redis(redisUrl);

        // Subscribe to the Redis channel
        this.redissub.subscribe(redisChannel);

        // Initialize Redis listener
        this.initRedisListener();
    }

    get io() {
        return this._io;
    }

    initChatListeners() {
        console.log("Chat Listening Start");
        const io = this._io;
        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            socket.on(JOIN_ROOM,({room_id,name},callback) => {
                console.log('user join')
                
                socket.join(room_id)
                callback(socket.id);
            })


            socket.on(MESSAGE, ({room_id, text,name}) => {
                createSendMessageProcessor(this.redispub,{ room_id, text,name,socketId:socket.id })
                
            });
        });
    }

    initRedisListener() {
        const io = this._io;
        createRecieveMessageProcessor(this.redissub,this.redispub,io)
    }
}

export default createSocketConnect;
