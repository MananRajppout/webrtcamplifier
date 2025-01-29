'use client'
import axios from 'axios';
import React, { useEffect } from 'react'

const page = ({params,searchParams}) => {


    const fetchMeeting = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-latest/meeting/${params.id}`);
            const paramsQuery = new URLSearchParams(window.location.search);
            window.location.assign(`/meeting/${response?.data?.meeting?._id}?${paramsQuery.toString()}`)
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    useEffect(() => {
        fetchMeeting();
    }, []);
    return (
        <div>page</div>
    )
}

export default page