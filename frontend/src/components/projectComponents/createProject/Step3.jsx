import Button from "@/components/shared/button";
import { useGlobalContext } from "@/context/GlobalContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const Step3 = ({ formData, updateFormData, uniqueId }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useGlobalContext();
  const router = useRouter()

  const validateForm = () => {
    const requiredFields = [
      "respondentsPerSession",
      "numSessions",
      "sessionLength",
      "preWorkDetails",
      "languageSessionBreakdown",
      "additionalInfo",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field] || formData[field].trim() === ""
    );

    // Check multi-language hosting and interpreter conditions
    if (
      formData.addOns?.includes("Multi-Language Services") &&
      !formData.inLanguageHosting
    ) {
      missingFields.push("inLanguageHosting");
    }

    if (formData.inLanguageHosting === "yes" && !formData.provideInterpreter) {
      missingFields.push("provideInterpreter");
    }

    if (missingFields.length > 0) {
      toast.error("Please fill up all required fields.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Prepare email data
    const emailData = {
      formData,
      userId: user._id,
      uniqueId
    };

    try {
      setIsLoading(true)
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/email-project-info`, emailData);
      if (response.status === 200) {
        toast.success("Project information submitted successfully.");
       router.push("/dashboard/project")
      } else {
        toast.error("Failed to submit project information.");
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error("Error submitting project information:", error);
      toast.error("An error occurred while submitting the project. Please try again.");
    } finally {
      setIsLoading(false)
    }
  };

  // Conditional visibility for "Will you need hosting in a language other than English?"
  const showLanguageHosting = formData.addOns?.includes(
    "Multi-Language Services"
  );
  const showRecruiting = formData.addOns?.includes("Top-Notch Recruiting");

  // Conditional visibility for "Will you provide an interpreter?"
  const showInterpreter = formData.inLanguageHosting === "yes";


  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Project Information Request</h2>

      {/* Instructions */}
      <div className="mb-6">
        <p className="text-sm">
          An Amplify Team member will be in touch by the end of the next
          business day with a quote, or to gather more information so that we
          can provide you with the best pricing and service. If you need costs
          sooner or have more information to provide, please feel free to email{" "}
          <a
            href="mailto:info@amplifyresearch.com"
            className="text-blue-500 underline"
          >
            info@amplifyresearch.com
          </a>
          . Thank you!
        </p>
      </div>

      {/* Number of Respondents per Session */}
      <div className="mb-4">
        <label className="block font-medium mb-2">
          Number of Respondents per Session:
        </label>
        <input
          type="number"
          value={formData.respondentsPerSession || ""}
          onChange={(e) =>
            updateFormData({ respondentsPerSession: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Number of Sessions */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Number of Sessions:</label>
        <input
          type="number"
          value={formData.numSessions || ""}
          onChange={(e) => updateFormData({ numSessions: e.target.value })}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Length(s) of Sessions */}
      <div className="mb-4">
        <label className="block font-medium mb-2">
          Length(s) of Sessions (minutes):
        </label>
        <input
          type="number"
          value={formData.sessionLength || ""}
          onChange={(e) => updateFormData({ sessionLength: e.target.value })}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Recruitment Specs */}

      {showRecruiting && (
        <div className="mb-4">
          <label className="block font-medium mb-2">
            What are the target recruitment specs? Please include as much
            information as possible:
          </label>
          <textarea
            value={formData.recruitmentSpecs || ""}
            onChange={(e) =>
              updateFormData({ recruitmentSpecs: e.target.value })
            }
            className="border p-2 rounded w-full"
          />
        </div>
      )}

      {/* Pre-Work Details */}
      <div className="mb-4">
        <label className="block font-medium mb-2">
          Will there be any pre-work or additional assignments?
        </label>
        <textarea
          value={formData.preWorkDetails || ""}
          onChange={(e) => updateFormData({ preWorkDetails: e.target.value })}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Language */}
      <div className="mb-4">
        <label className="block font-medium mb-2">What language?</label>
        <input
          type="text"
          value={formData.selectedLanguages || ""}
          placeholder="Type a language"
          onChange={(e) =>
            updateFormData({ selectedLanguages: e.target.value.trim() })
          }
          className="border p-2 rounded w-full"
        />
      </div>

      {showLanguageHosting && (
        <div className="mb-4">
          <label className="block font-medium mb-2">
            Will you need hosting in a language other than English?
          </label>
          <div>
            <label>
              <input
                type="radio"
                name="inLanguageHosting"
                value="yes"
                checked={formData.inLanguageHosting === "yes"}
                onChange={(e) =>
                  updateFormData({ inLanguageHosting: e.target.value })
                }
                className="mr-2"
              />
              Yes
            </label>
            <label className="ml-4">
              <input
                type="radio"
                name="inLanguageHosting"
                value="no"
                checked={formData.inLanguageHosting === "no"}
                onChange={(e) =>
                  updateFormData({ inLanguageHosting: e.target.value })
                }
                className="mr-2"
              />
              No
            </label>
          </div>
        </div>
      )}

      {/* Provide Interpreter */}
      {showInterpreter && (
        <div className="mb-4">
          <label className="block font-medium mb-2">
            Will you provide an interpreter?
          </label>
          <div>
            <label>
              <input
                type="radio"
                name="provideInterpreter"
                value="yes"
                checked={formData.provideInterpreter === "yes"}
                onChange={(e) =>
                  updateFormData({ provideInterpreter: e.target.value })
                }
                className="mr-2"
              />
              Yes
            </label>
            <label className="ml-4">
              <input
                type="radio"
                name="provideInterpreter"
                value="no"
                checked={formData.provideInterpreter === "no"}
                onChange={(e) =>
                  updateFormData({ provideInterpreter: e.target.value })
                }
                className="mr-2"
              />
              No
            </label>
          </div>
        </div>
      )}

      {/* English/Non-English Session Breakdown */}
      <div className="mb-4">
        <label className="block font-medium mb-2">
          If some sessions will be in English and some will be non-English,
          please specify how many of each:
        </label>
        <textarea
          type="number"
          value={formData.languageSessionBreakdown || ""}
          onChange={(e) =>
            updateFormData({ languageSessionBreakdown: e.target.value })
          }
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Additional Info */}
      <div className="mb-4">
        <label className="block font-medium mb-2">
          Anything else we should know about the project?
        </label>
        <textarea
          value={formData.additionalInfo || ""}
          onChange={(e) => updateFormData({ additionalInfo: e.target.value })}
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="flex justify-end">
        <Button
          children={ isLoading ? "Submitting": "Submit"}
          variant= { isLoading ? "closed" : "primary"}
          className="rounded-lg px-4 py-2"
          onClick={handleSubmit}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default Step3;
