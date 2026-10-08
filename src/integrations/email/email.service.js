import nodemailer from "nodemailer";

//create transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

//send email using nodemailer

export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
            html
        });
        console.log(`Email sent: ${info.messageId}`);
        console.log(` Preview URL: ${nodemailer.getTestMessageUrl(info)}\n`);

        return info;
    }catch(error){
        console.error(`Error sending email: ${error}`);
        throw error;
    }
};