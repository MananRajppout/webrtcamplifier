import { WebSocketServer, WebSocket } from "ws";
import {IncomingMessage} from "http";
import { wssQuery } from "../interface/recordingServerInterface.js";
import { createWriteStream, WriteStream,mkdirSync,existsSync } from 'fs';
import { join } from 'path';
import { dir } from "console";
import { mergeAndConvertVideos } from "../service/ffmepgService.js";
import { saveRecordingToDatabase } from "../service/httpService.js";
import { AxiosError, AxiosResponse } from "axios";



/*
    * Initialize the recording server
    * @param wss WebSocketServer instance
    * @returns void
*/
export const initRecordingServer = (wss: WebSocketServer) => {
    // WebSocket connection handler
    wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
        const queryParams = new URLSearchParams(req.url?.split('?')[1]);

        const query: wssQuery = {
            meetingId: queryParams.get('meetingId') || '',
            projectId: queryParams.get('projectId') || ''
        };

        const dirPath = join(process.cwd(),'recordings', query.meetingId);
        if(!existsSync(dirPath)){
            mkdirSync(dirPath,{recursive:true});
        }

        let currentChunkId: string | undefined;

      
        let fileStream: WriteStream | undefined;
        // Handle message event
        ws.on('message', (message: string) => {
            const data = JSON.parse(message);
            switch (data.type) {
                case 'start':
                    console.log('Start recording');
                    break;
                case 'media':
                    if(currentChunkId == data.id){
                        const buffer = Buffer.from(data.payload, 'base64');
                        fileStream?.write(buffer);
                    }
                    break;

                case 'change-file':
                    currentChunkId = data.id;
                    let filePath: string = join(dirPath, `${data.fileName}.webm`);

                    if (fileStream) {
                        fileStream.end();
                    }

                    fileStream = createWriteStream(filePath);
                    break;

                case 'stop':
                    fileStream?.end();
                    ws.close();

                    const mergeChunksRecordings = mergeAndConvertVideos(dirPath);
                    mergeChunksRecordings.then(async (outputFilePath) => {
                        try {
                            const outputFileName = outputFilePath?.split(`\\`).pop();
                            const formdata = new FormData();
                            const publucRecordingURL = `/recordings/${outputFileName}`;
                            
                            formdata.append('recordingUrl', publucRecordingURL);
                            formdata.append('meetingId',query.meetingId);
                            console.log(formdata)
                            const res = await saveRecordingToDatabase(formdata);
                            
                        } catch (error) {
                            console.log((error as Error).message);
                        }
                    }).catch((err) => {
                        console.error('Error merging and converting videos:', err);
                    });
                    break;

            }
        });
        
    });
}