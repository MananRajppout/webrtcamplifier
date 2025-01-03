import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();


export const saveRecordingToDatabase = async (formdata:FormData) => axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/live-meeting/add-recordings`, formdata,{
    headers: {
        'Content-Type': 'application/json'
    }
});