import { sendEmail as sendMail } from "./mail.utils.js";

export const sendEmail = async (recipient, content, payload) => {
    // Assuming content is HTML, and payload might have subject
    const subject = payload?.subject || "Notification";
    await sendMail({ email: recipient, subject, message: content });
};