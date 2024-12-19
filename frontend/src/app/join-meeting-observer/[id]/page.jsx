"use client";
import Image from "next/image";
import React, { useState } from "react";
import Logo from "@/components/shared/Logo";
import InputField from "@/components/shared/InputField";
import joinMeetingImage from "../../../../public/join-meeting-edited.png";
import Footer from "@/components/shared/Footer";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Button from "@/components/shared/button";
import toast from "react-hot-toast";
import { useGlobalContext } from "@/context/GlobalContext";

const page = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    passcode: "",
  });
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const {socket} = useGlobalContext()

  const params = useParams();
  const router = useRouter();
  const meetingId = params.id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    if(typeof window !== 'undefined'){
      window.localStorage.setItem('email',formData.email);
    }
    socket.emit("observerJoinMeeting", {
      name: formData.fullName,
      email: formData.email,
      role: "Observer",
      passcode: formData.passcode,
      meetingId: meetingId,
    });

    socket.on("observerJoinMeetingResponse", (response) => {
     
      if(response.message === "Meeting not found") {
        toast.error("Meeting not found");
      } else if (response.message === "Invalid passcode") {
        toast.error("Invalid passcode");
      } else if(response.message === "Live meeting not found") {
        toast.error("Live meeting not found");
      } else  if(response.message === "Observer already added to the meeting") {
        router.push(
          `/meeting/${meetingId}?fullName=${encodeURIComponent(
            formData.fullName
          )}&role=Observer`
        );
      } else if (response.message === "Observer added to the meeting") {
        // localStorage.setItem("RoletoSend", response.data._id);
        if (response.isStreaming) {
          router.push(
            `/meeting/${meetingId}?fullName=${encodeURIComponent(
              formData.fullName
            )}&role=Observer`
          );
        } else {
          router.push(
            `/observer-waiting-room/${meetingId}?fullName=${encodeURIComponent(
              formData.fullName
            )}&role=Observer`
          );
        }

      }
     
    });

   
  };

  return (
    <div className="2xl:min-h-screen">
      <div className="bg-white lg:flex lg:justify-center lg:items-center lg:pl-20 min-h-screen">
        {/* left div */}
        <div className="w-full lg:w-[40%] flex flex-col justify-center items-center px-10">
          <div className="pt-5">
            <Logo />
          </div>
          <h1 className="text-3xl text-custom-dark-blue-2 font-bold uppercase lg:py-8 py-10 2xl:py-14">
            Join Meeting
          </h1>
          <div className="lg:flex lg:justify-between lg:items-center gap-5 w-full 2xl:px-28">
            <InputField
              label="Full Name"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          <div className="lg:flex lg:justify-between lg:items-center gap-5 w-full 2xl:px-28">
            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="w-full 2xl:px-28">
            <InputField
              label="Passcode"
              name="passcode"
              type={showPasscode ? "text" : "password"}
              value={formData.passcode}
              onChange={handleChange}
              icon={
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="focus:outline-none"
                >
                  {showPasscode ? <FaEyeSlash /> : <FaEye />}
                </button>
              }
            />
          </div>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <div className="w-full 2xl:px-28 pt-2 pb-10 lg:pb-0">
            <Button
              children="Join Meeting"
              type="submit"
              variant="primary"
              className="w-full py-2 rounded-xl"
              onClick={handleSubmit}
            />
          </div>
        </div>
        {/* right div */}
        <div className="lg:w-[60%] hidden lg:flex lg:justify-center lg:items-center">
          <Image
            src={joinMeetingImage}
            alt="join meeting image"
            height={500}
            width={700}
            className=""
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default page;
