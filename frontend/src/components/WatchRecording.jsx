// import React from 'react'

// const WatchRecording = ({ transcriptionurl, videourl }) => {
//   return (
//     <div className="fixed top-0 left-0 right-0 w-screen h-screen bg-black/20 z-[1000000000000000000000]">
       
//     </div>
//   )
// }

// export default WatchRecording



"use client";
import { useState, useRef, useEffect } from "react";

const WatchRecording = ({ transcriptionurl, videourl, onClose }) => {
  const videoRef = useRef(null);
  const [transcription, setTranscription] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);

  // Fetch Transcription from API
  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const response = await fetch(transcriptionurl);
        const data = await response.json();
        setTranscription(data || []);
      } catch (error) {
        console.error("Error fetching transcription:", error);
      }
    };

    fetchTranscription();
  }, [transcriptionurl]);

  // Track video time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Close on outside click
  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay") {
      onClose();
    }
  };

  // Close on ESC key
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onClose]);

  return (
    <div
      id="modal-overlay"
      onClick={handleOutsideClick}
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
    >
      <div className="bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-3xl">
        {/* Video Player */}
        <video
          ref={videoRef}
          controls
          onTimeUpdate={handleTimeUpdate}
          className="w-full rounded-lg"
        >
          <source src={videourl} type="video/mp4" />
        </video>

        {/* Transcript with Highlighted Words */}
        <div className="mt-4 p-2 bg-gray-100 rounded-md text-lg text-center">
          {transcription.length === 0 ? (
            <p className="text-gray-500">Loading transcription...</p>
          ) : (
            transcription.map(({ word, start, end }, index) => (
              <span
                key={index}
                className={`mx-1 ${
                  currentTime >= start && currentTime <= end
                    ? "bg-yellow-300 px-1 rounded"
                    : ""
                }`}
              >
                {word}
              </span>
            ))
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WatchRecording;
