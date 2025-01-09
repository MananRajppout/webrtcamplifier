import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();


export const saveRecordingToDatabase = async (formdata:FormData) => axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/upload-recording`, formdata,{
    headers: {
        'Content-Type': 'application/json'
    }
});