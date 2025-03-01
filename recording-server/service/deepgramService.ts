import { createClient } from "@deepgram/sdk";
import "dotenv/config";
import fs from "fs";
import path from "path";

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const deepgram = createClient(DEEPGRAM_API_KEY);

export async function transcribe(path:string,meeting_id:string) {
    try {
        console.log("transcribtion start")
        const response = await deepgram.listen.prerecorded.transcribeFile(
            fs.createReadStream(path),
            {
                model: "nova-3",
                punctuate: true,
                utterances: true
            }
        );
        console.log("transcribtion finish")
        if (response.error) {
            console.error("Deepgram API Error:", response.error);
            const transcribtion = await create_transcribtion_file("",meeting_id)
            const words = await create_transcribtion_punctaute_file(JSON.stringify([]),meeting_id)
            return {transcribtion,words}
        } else {
            const transcribtionData = response.result.results?.channels[0]?.alternatives[0]?.transcript;
            const wordsData = response.result.results?.channels[0]?.alternatives[0]?.words;


            const transcribtion = await create_transcribtion_file(transcribtionData,meeting_id)
            const words = await create_transcribtion_punctaute_file(JSON.stringify(wordsData),meeting_id)
            return {transcribtion,words}
        }
    } catch (err) {
        console.error("Error:", err);
    }
}


async function create_transcribtion_file(data:string,meeting_id:string):Promise<string>{
    const file_dir = `/transcriptions/${meeting_id}-${Date.now()}.txt`;
    const filePath = path.join(process.cwd(),'public',file_dir);
    fs.writeFileSync(filePath,data,{encoding: "utf-8"});
    return file_dir;
}

async function create_transcribtion_punctaute_file(data:string,meeting_id:string):Promise<string>{
    const file_dir = `/transcription-punctaute/${meeting_id}-${Date.now()}.json`;
    const filePath = path.join(process.cwd(),'public',file_dir);
    fs.writeFileSync(filePath,data,{encoding: "utf-8"});
    return file_dir;
}