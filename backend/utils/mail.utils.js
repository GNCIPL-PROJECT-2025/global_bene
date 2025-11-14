import nodeMailer from "nodemailer"
export const sendEmail = async ({ email, subject, message }) => {

    const transporter = nodeMailer.createTransport({
        service: "gmail",
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APPPASS,
        },
    })


    const options = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject,
        html: message,
        headers: {
            "X-Priority": "3",
            "X-Mailer": "Nodemailer",
            "List-Unsubscribe": `<mailto:${process.env.EMAIL_USER}>`, // Helps email providers understand user preferences
        },
    }

    try {
        const result = await transporter.sendMail(options);
        console.log('Email sent successfully:', result);
        return result;
    } catch (error) {
        console.error('Email send failed:', error.message || error.response || error || "...!?");
        throw new Error(`Failed to send email ${error.message || error.response || error || "...!?"}`);
    }

}
