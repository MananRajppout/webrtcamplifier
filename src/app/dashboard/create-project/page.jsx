"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Button from "@/components/shared/button";
import Step1 from "@/components/createProjectFormComponent/Step1";
import Step2 from "@/components/createProjectFormComponent/Step2";
import Step3 from "@/components/createProjectFormComponent/Step3";
import { PiNotebookFill } from "react-icons/pi";
import { FaUserClock, FaUsers } from "react-icons/fa";
import { HiOutlineMinus } from "react-icons/hi2";
import { useRouter } from 'next/navigation';

const Page = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: General Information
    name: "",  
    description: "",  
    startDate: "",
    endDate: "",  
    projectPasscode: "", 
    createdBy: ""     ,
    tags:[],
    // Step 2: Add People
    members: [
      {
        userId: "",  
        role: "", 
        email: "" 
      },
    ],
    
    // Step 3: Add Meeting
    meeting: {
      title: "",  
      moderator: "",  
      description: "", 
      startDate: "",  
      startTime: "",  
      timeZone: "",  
      duration: "",  
      ongoing: false,  
      enableBreakoutRoom: false,  
      meetingPasscode: "",  
    }
  });
  const router = useRouter()

  
  // console.log('form data', formData)
  const user = {
    _id : '66bb5b41e7e451974c1734c6'
  }
  
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/get-all/contact/${user._id}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('contact data', data)
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      alert(`Error fetching contacts: ${error.message}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // const nextStep = () => {
  //   setCurrentStep((prevStep) => prevStep + 1);
  // };

  const prevStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleFormSubmit = async () => {
    // Add the createdBy field to the formData
    const updatedFormData = {
      ...formData,
      createdBy: user._id,
    };
  
    console.log(updatedFormData);
  
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/create/project`, updatedFormData);
      console.log(response);
      alert('Project created successfully!');
      router.push('/dashboard/project')
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };
  

 

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 formData={formData} setFormData={setFormData}  />;
      case 2:
        return <Step2 formData={formData} setFormData={setFormData}
        contacts={contacts}
        setContacts={setContacts}
        isLoading={isLoading}
        />;
      case 3:
        return <Step3 formData={formData} setFormData={setFormData}   contacts={contacts}
        setContacts={setContacts}
        
        />;
      // case 4:
      //   return <Step4 formData={formData} setFormData={setFormData} />;
      // case 5:
      //   return <Step5 formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  const validateForm = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.name !== "" &&
          formData.description !== "" &&
          formData.endDate !== "" &&
          formData.projectPasscode !== ""
        );
      case 2:
        // Ensure every person in the people array has a name, email, and role
        return formData.members.every(
          (person) =>  person.role !== ""
        );
      case 3:
        return (
          formData.meeting.title !== "" &&
          formData.meeting.moderator !== "" &&
          formData.meeting.startDate !== "" &&
          formData.meeting.startTime !== "" &&
          formData.meeting.timeZone !== "" &&
          formData.meeting.duration !== "" &&
          formData.meeting.meetingPasscode !== "" 
        );
      default:
        return true;
    }
  };
  
  
  const nextStep = () => {
    if (validateForm()) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      alert('Please fill out all required fields before proceeding.');
    }
  };
  

  const getIconClass = (step) => {
    return currentStep >= step ? 'bg-custom-orange-1' : 'bg-custom-dark-blue-1';
  };
  
  const getLineClass = (step) => {
    return currentStep >= step ? 'text-custom-orange-1 text-5xl' : 'text-custom-dark-blue-1 text-5xl';
  };


  return (
    <div className="my_profile_main_section_shadow bg-[#fafafb] bg-opacity-90 h-full min-h-screen pb-10">
      <div className="bg-white py-5 w-full">
        <div className="md:px-10 flex justify-around md:justify-between items-center w-full">
          <div>
            <p className='text-custom-teal text-2xl font-bold text-center' >New Project</p>
          </div>
        </div>
      </div>
  <div className="create_project_progress_bar_bg py-1 w-full flex justify-center items-center ">
        <div className={`text-white ${getIconClass(1)} p-2 rounded-full`}>
          <PiNotebookFill />
        </div>
        <HiOutlineMinus className={getLineClass(2)} />
        <div className={`text-white ${getIconClass(2)} p-2 rounded-full`}>
          <FaUsers />
        </div>
        <HiOutlineMinus className={getLineClass(3)} />
        <div className={`text-white ${getIconClass(3)} p-2 rounded-full`}>
          <FaUserClock />
        </div>

      </div>
      <div className="flex-grow mx-auto pt-5 md:px-10 ">
        {renderStep()}

        {/* Navigation buttons */}
        <div className="flex justify-end gap-3 mt-2">
          {currentStep > 1 && (
            <Button
              onClick={prevStep}
              variant="cancel"
              className="rounded-lg px-7 py-1"
            >
              Back
            </Button>
          )}
          {currentStep < 3 && (
            <Button
              onClick={nextStep}
              variant="save"
              className="rounded-lg px-7 py-1"
            >
              Next
            </Button>
          )}
          {currentStep === 3 && (
            <Button
              variant="save"
              type="button"
              className="rounded-lg px-7 py-1"
              onClick={handleFormSubmit}
            >
              Save Project
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
