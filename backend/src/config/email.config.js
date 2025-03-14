const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "test356sales@gmail.com",
    pass: "ajjvnbfwmbrwbibg",
  },
});

async function sendEmail(to, subject, html) {
  return new Promise(async (resolve, reject) => {
    try {
      const info = await transporter.sendMail({
        from: "test356sales@gmail.com",
        to,
        subject,
        html,
      });
      resolve(`Email sent successfully: ${info.messageId}`);
    } catch (error) {
      console.error("Error sending email:", error);
      reject(error);
    }
  });
}
//to can also take array of valid emails
// async function sendEmail(to, subject, html) {
//   return new Promise(async (resolve, reject) => {
//     let info = await transporter
//       .sendMail({
//         from: "test356sales@gmail.com",
//         to,
//         subject,
//         text: "Text Here!",
//         html,
//       })
//       .catch((e) => {
//         reject(e);
//       });

//     if (info?.messageId) {
//       resolve("email sent");
//     }
//   });
// }

async function sendVerifyEmail(name, email, id) {
  try {
    const mailOptions = {
      from: "test356sales@gmail.com",
      to: email,
      subject: "Verification email",
      html: `<p>Dear ${name},</p>
      <p>Thank you for signing up to host your project on the Amplify Research Virtual Backroom platform. Please click the link below to verify your account information:</p>
      <p><a href="${process.env.FRONTEND_BASE_URL}/verify-account?id=${id}">Verify Your Account</a></p>
      <p>You will not be able to set up project details or conduct any sessions until this step is complete, so we encourage you to do this immediately upon receipt of this email.</p>
      <p>Thank you!</p>
      <p>The Amplify Team</p>`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error(error);
      } else {
        console.log("Email has been sent:-", info.response);
      }
    });
  } catch (error) {
    console.error(error.message);
  }
}

const sendStatusChangeEmail = async (ticket) => {
  try {
    const mailOptions = {
      from: "test356sales@gmail.com",
      to: ticket.email, 
      subject: `Ticket ${ticket._id} status updated to ${ticket.status}`,
      text: `Dear ${ticket.fullName}, 
  
  Your ticket ${ticket._id} has been updated to status ${ticket.status}. Please login to your account to view the updated ticket.
  
  Best regards,
  Your Support Team`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log(`Email sent to ${ticket.email}`);
      }
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = { sendEmail, sendVerifyEmail, sendStatusChangeEmail };
