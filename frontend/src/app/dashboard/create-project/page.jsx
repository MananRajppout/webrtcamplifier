"use client";
import React, { useState } from "react";
import Step1 from "@/components/projectComponents/createProject/Step1";
import Step2 from "@/components/projectComponents/createProject/Step2";
import Step3 from "@/components/projectComponents/createProject/Step3";
import Step4 from "@/components/projectComponents/createProject/Step4";
import Button from "@/components/shared/button";
import { useGlobalContext } from "@/context/GlobalContext";
import toast from "react-hot-toast";
import axios from "axios";

const Page = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    service: "",
    addOns: [],
    market: "",
    language: "",
    sessions: [],
    firstDateOfStreaming: "",
    projectDate: "",
    respondentsPerSession: "",
    numSessions: "",
    sessionLength: "",
    recruitmentSpecs: "",
    preWorkDetails: "",
    selectedLanguages: "",
    inLanguageHosting: "",
    provideInterpreter: "",
    languageSessionBreakdown: "",
    additionalInfo: "",
  });
  const [uniqueId, setUniqueId] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useGlobalContext()
  const [stepValid, setStepValid] = useState(true);

  console.log('Form Data', formData)

  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const isStep3 = () => {
    if (formData.service === "tier1") {
      return false; // Tier 1 always skips Step 3
    }
  
    if (formData.service === "tier2") {
      const today = new Date();
      const twoWeeksFromToday = new Date(today);
      twoWeeksFromToday.setDate(today.getDate() + 14);
  
      const firstStreamingDate = formData.firstDateOfStreaming
        ? new Date(formData.firstDateOfStreaming)
        : null;
  
      const isDateWithinTwoWeeks =
        firstStreamingDate && firstStreamingDate <= twoWeeksFromToday;
  
      const isTier2WithAddOns = formData.addOns && formData.addOns.length > 0;
  
      return isDateWithinTwoWeeks || isTier2WithAddOns;
    }
  
    return false; // Default fallback
  };
  
  // Define steps dynamically based on user selection
  const steps = [Step1, ...(formData.service === "tier1" ? [Step2, Step4] : isStep3() ? [Step3] : [Step2, Step4]),
  ];
  
 const StepComponent = steps[currentStep];

  
  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));



  const saveProgress = async () => {
    setIsLoading(true);
    try {
      const payload = {
        formData,
        userId: user?._id, 
      };
  
      // Include uniqueId in the payload if it exists
      if (uniqueId) {
        payload.uniqueId = uniqueId;
      }
  
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/save-progress`, payload);
  
      // If the form is newly saved, capture the uniqueId from the response
      if (!uniqueId) {
        setUniqueId(response.data.uniqueId);
      }
      console.log('response', response)
      // Navigate to the next step
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } catch (error) {
      console.error("Error saving progress:", error);
      toast.error(`${error.response.data.error}`);

      
    } finally {
      setIsLoading(false); 
    }
  };

  // Validation for enabling/disabling the "Next" button
const isNextButtonDisabled = () => {
  if (currentStep === 0) {
    // Step 1 validation: Ensure 'service' and 'firstDateOfStreaming' are filled
    return !formData.service || !formData.firstDateOfStreaming;
  }

  if (currentStep === 1) {
    // Step 2 validation: Ensure 'stepValid' is true (from Step2 component)
    return !stepValid;
  }

  return false; // Allow "Next" for other steps
};

  

  return (
    <div className="my_profile_main_section_shadow bg-[#fafafb] bg-opacity-90 h-full min-h-screen pb-10">
      <div className="bg-white py-5 w-full">
        <div className="md:px-10 flex justify-around md:justify-between items-center w-full">
          <div>
            <p className="text-custom-teal text-2xl font-bold text-center">
              New Project
            </p>
          </div>
        </div>
      </div>

      <div className="flex-grow mx-auto pt-5 md:px-10">
        <StepComponent
          formData={formData}
          updateFormData={updateFormData}
          uniqueId={uniqueId}
          setStepValid={setStepValid}
        />
        <div className="flex justify-between mt-4">
          {currentStep > 0 && (
            <Button
              children="Back"
              variant="secondary"
              className="rounded-lg px-4 py-2"
              onClick={goBack}
            />
          )}
          {currentStep < steps.length - 1 && (
            <Button
              children={isLoading ? "Saving..." : "Next"}
              variant={isNextButtonDisabled() ? "closed" : "secondary"}
              className={`rounded-lg px-4 py-2 ${
                isNextButtonDisabled() ? " cursor-not-allowed" : ""
              }`}
              onClick={saveProgress}
              disabled={isNextButtonDisabled() || isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
