import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendInterviewEmail = async (to, jobTitle, interviewLink) => {

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: to,
        subject: "AI Interview Invitation",
        html: `
     <h2>Congratulations!</h2>
     <p>You passed the MCQ test for ${jobTitle}</p>
     <p>Start your AI Interview here:</p>
     <a href="${interviewLink}">${interviewLink}</a>
   `
    });

};