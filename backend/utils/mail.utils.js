import nodeMailer from "nodemailer"
export const sendEmail = async ({ email, subject, message }) => {

    const transporter = nodeMailer.createTransport({
        service: process.env.SMTP_SERVICE,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    })

    const options = {
        from: `"GNCIPL" <${process.env.SMTP_MAIL}>`,
        to: email,
        subject,
        html: message,
        headers: {
            "X-Priority": "3",
            "X-Mailer": "Nodemailer",
            "List-Unsubscribe": `<mailto:gncipl@gmail.com>`, // Helps email providers understand user preferences
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
