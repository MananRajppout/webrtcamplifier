"use client";
import Image from "next/image";
import React, { useState } from "react";
import Logo from "@/components/shared/Logo";
import InputField from "@/components/shared/InputField";
import Button from "@/components/shared/button";
import joinMeetingImage from "../../../../public/join-meeting-edited.png";
import Footer from "@/components/shared/Footer";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useParams, useRouter } from 'next/navigation';
import axios from "axios";

const page = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    passcode:""
    
  });
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const params = useParams();
  const router = useRouter();
  const meetingId = params.id;

  console.log("meetingid", meetingId);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/verify-meeting-passcode`, {
        meetingId,
        passcode: formData.passcode,
      });

      if (response.status === 200) {
        // Passcode is correct, proceed to join the meeting
        console.log("Navigating to meeting with fullName:", formData.fullName);
        router.push(`/meeting/${meetingId}?fullName=${encodeURIComponent(formData.fullName)}&role=Observer`);

        

      } 
     
    } catch (error) {
     
      if (error.response && error.response.status === 401) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="2xl:min-h-screen">
      <div className="bg-white lg:flex lg:justify-center lg:items-center lg:pl-20 min-h-screen">
    
        {/* left div */}
        <div className="w-full lg:w-[40%] flex flex-col justify-center items-center px-10">
          <div className="pt-5">
            <Logo />
          </div>
          <h1 className="text-3xl text-custom-dark-blue-2 font-bold uppercase lg:py-8 py-10 2xl:py-14 ">
            Join Meeting
          </h1>
          <div className="lg:flex lg:justify-between lg:items-center gap-5 w-full 2xl:px-28">
            <InputField label="Full Name" name="fullName" type="text"
            value={formData.fullName}
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
        <div className="lg:w-[60%] hidden lg:flex lg:justify-center lg:items-center ">
          <Image
            src={joinMeetingImage}
            alt="join meeting image"
            height={500}
            width={700}
            className=''
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default page;
