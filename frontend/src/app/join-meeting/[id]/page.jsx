"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Logo from "@/components/shared/Logo";
import InputField from "@/components/shared/InputField";
import Button from "@/components/shared/button";
import joinMeetingImage from "../../../../public/join-meeting.png";
import Footer from "@/components/shared/Footer";
import { useGlobalContext } from "@/context/GlobalContext";
import toast from "react-hot-toast";
import useSocketListen from "@/hooks/useSocketListen";

const Page = () => {
  const [meetingId, setMeetingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const { socket } = useGlobalContext();

  const params = useParams();
 
  const router = useRouter();


  const fetchMeeting = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-latest/meeting/${params.id}`);
      setMeetingId(response?.data?.meeting?._id)
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchMeeting();
  }, []);

  // Function to get the role based on the URL
  const getRoleFromUrl = () => {
    const urlPath = window.location.pathname;
    if (urlPath.includes("join-meeting")) {
      return "Participant";
    }
    return "Observer";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        image: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  useSocketListen("meeting-not-found", () => {
    toast.error("Live Meeting not found");
  })

  const handleSubmit = async (e) => {
    e.preventDefault();

    const role = getRoleFromUrl();


    // Emit socket event instead of making an API call

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('email', formData.email);
    }

    // Prepare the image in Base64 format if it exists
    let imageData = null;
    if (formData.image) {
      imageData = await convertImageToBase64(formData.image);
    }

    // Emit socket event
    socket.emit("participantWantToJoin", {
      name: formData.fullName,
      email: formData.email,
      image: imageData, // Include the image in the expected format
      role: role,
      meetingId: meetingId,
    });


    // Listen for the response from the socket
    socket.on("participantJoinMeetingResponse", (response) => {
      if (response.message === "Participant added to waiting room") {

        router.push(
          `/participant-waiting-room/${meetingId}?fullName=${encodeURIComponent(
            formData.fullName
          )}&email=${encodeURIComponent(
            formData.email
          )}&role=Participant`
        );
      } else if (response.message === "Participant already in waiting room" || response.message === "Participant added to waiting room") {

        router.push(
          `/participant-waiting-room/${meetingId}?fullName=${encodeURIComponent(
            formData.fullName
          )}&email=${encodeURIComponent(
            formData.email
          )}&role=Participant`
        );
      } else if (response.message === "Participant already in the meeting") {
        router.push(
          `/meeting/${meetingId}?fullName=${encodeURIComponent(
            formData.fullName
          )}&email=${encodeURIComponent(
            formData.email
          )}&role=Participant`
        );
      } else if (response.message === "Meeting not found") {
        toast.error("Meeting not found");
      } else {
        console.error("Error joining meeting:", response.message);
      }
    });
  };


  // Helper function to convert the image to Base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          fileBase64: reader.result, // Base64 string including MIME type
          fileName: file.name, // Original file name
        });
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div>
      <div className="bg-white lg:flex lg:justify-center lg:items-center">
        {/* left div */}
        <div className="w-full lg:w-[40%] flex flex-col justify-center items-center px-10">
          <div className="pt-5">
            <Logo />
          </div>
          <h1 className="text-3xl text-custom-dark-blue-2 font-bold uppercase lg:py-10 py-8">
            Join Meeting
          </h1>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center items-center gap-2 w-full"
          >
            <div className="lg:flex lg:justify-start lg:items-center lg:gap-5 w-full">
              <InputField
                label="Full Name"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div className="lg:flex lg:justify-start lg:items-center lg:gap-5 w-full">
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className=" w-full">
              <label className="block text-sm font-semibold mb-2 text-black">
                Upload Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-2 border-[0.5px] rounded-xl focus:outline-none border-black"
              />
              {imagePreview && (
                <div className="mt-4">
                  <Image
                    src={imagePreview}
                    alt="Uploaded Preview"
                    height={100}
                    width={100}
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>
            <div className="w-full lg:pt-2 min-h-[60vh]">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2 rounded-xl mb-10 lg:mb-0"
              >
                Join Meeting
              </Button>
            </div>
          </form>
        </div>
        {/* right div */}
        <div className="lg:w-[60%] hidden lg:flex justify-center">
          <Image
            src={joinMeetingImage}
            alt="join meeting image"
            height={300}
            width={500}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page;
