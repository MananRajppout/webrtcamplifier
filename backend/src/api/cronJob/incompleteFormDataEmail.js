const { sendEmail } = require("../../config/email.config");
const ProjectForm = require("../models/projectFormSchema");
const User = require("../models/userModel");

const processIncompleteFormSent = async () => {
  console.log("Running cron job to send pending project emails...");

  try {
    // Fetch documents with emailSent: "Pending"
    const pendingForms = await ProjectForm.find({ "formData.emailSent": "Pending" });

    console.log(`Found ${pendingForms.length} pending forms to process.`);

    for (const form of pendingForms) {
      try {
        // Fetch user data
        const user = await User.findById(form.user);
        if (!user) {
          console.error(`User with ID ${form.user} not found.`);
          continue;
        }

        const { formData } = form;

        // Format sessions for the email
        const formattedSessions = formData.sessions
          .map(
            (session, index) =>
              `<p>Session ${index + 1}: ${session.number} sessions - Duration: ${session.duration}</p>`
          )
          .join("");

        // Email content
        const emailContent = `
          <h2>Project Information</h2>
          <p><strong>First Name:</strong> ${user.firstName}</p>
          <p><strong>Last Name:</strong> ${user.lastName}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <h3>Form Data:</h3>
          <p><strong>Service:</strong> ${formData.service}</p>
          <p><strong>Add-Ons:</strong> ${formData.addOns.join(", ")}</p>
          <p><strong>Market:</strong> ${formData.market}</p>
          <p><strong>Language:</strong> ${formData.language}</p>
          <h4>Sessions:</h4>
          ${formattedSessions}
          <p><strong>First Date of Streaming:</strong> ${formData.firstDateOfStreaming}</p>
          <p><strong>Respondents per Session:</strong> ${formData.respondentsPerSession}</p>
          <p><strong>Number of Sessions:</strong> ${formData.numSessions}</p>
          <p><strong>Session Length:</strong> ${formData.sessionLength}</p>
          <p><strong>Pre-Work Details:</strong> ${formData.preWorkDetails}</p>
          <p><strong>Selected Languages:</strong> ${formData.selectedLanguages}</p>
          <p><strong>Additional Info:</strong> ${formData.additionalInfo}</p>
        `;

        // Send the email
        await sendEmail("enayetflweb@gmail.com", "Project Information", emailContent);

        // Update the form document after successful email
        form.formData.emailSent = "Sent";
        await form.save();

        console.log(`Email sent and status updated for form ID: ${form._id}`);
      } catch (error) {
        console.error(`Error processing form ID ${form._id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }

}


module.exports = processIncompleteFormSent;