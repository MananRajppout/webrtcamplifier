import { WebSocketServer, WebSocket } from "ws";
import {IncomingMessage} from "http";
import { wssQuery } from "../interface/recordingServerInterface.js";
import { createWriteStream, WriteStream,mkdirSync,existsSync } from 'fs';
import path, { join } from 'path';
import { mergeAndConvertVideos } from "../service/ffmepgService.js";
import { saveRecordingToDatabase } from "../service/httpService.js";
import { getFileSize } from "../processor/getFileSizeProcessor.js";
import { config } from "dotenv";
config();


/** 
    * Initialize the recording server.
    * @param wss WebSocketServer instance
    * @returns void
*/
export const initRecordingServer = (wss: WebSocketServer) => {
    // WebSocket connection handler
    wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
        const queryParams = new URLSearchParams(req.url?.split('?')[1]);

        const query: wssQuery = {
            meetingId: queryParams.get('meetingId') || '',
            projectId: queryParams.get('projectId') || '',
            email: queryParams.get('email') || '',
            role: queryParams.get('role') || '',
            name: queryParams.get('name') || '',
        };


        const dirPath = join(process.cwd(),'recordings', `${query.meetingId}-${Date.now()}`);
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
                            let outputFileName;
                            if(process.env.STATUS_MODE == "development"){
                                outputFileName = outputFilePath?.split(`\\`).pop();
                            }else{
                                outputFileName = outputFilePath?.split(`/`).pop();
                            }

                            
                            const formdata = new FormData();
                            const publucRecordingURL = `/recordings/${outputFileName}`;
                            const filename = `recording-${new Date().toDateString()}`;
                            const size = getFileSize(path.join(process.cwd(),'public',publucRecordingURL));
                            // meetingId, email, role, projectId, addedBy, filename,size,recording_url
                            formdata.append('recording_url', publucRecordingURL);
                            formdata.append('meetingId',query.meetingId);
                            formdata.append('projectId',query.projectId);
                            formdata.append('role',query.role);
                            formdata.append('addedBy',query.name);
                            formdata.append('email',query.email);
                            formdata.append('filename',filename);
                            formdata.append('size',size.toString());
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