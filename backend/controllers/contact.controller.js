import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { sendEmail } from "../utils/mail.utils.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Send contact form message
export const sendContactMessage = asyncHandler(async (req, res) => {
    const { name, email, subject, category, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
        throw new ApiError(400, "All fields are required");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    if (message.length < 10) {
        throw new ApiError(400, "Message must be at least 10 characters long");
    }

    // Prepare email content
    const emailSubject = `Contact Form: ${subject}`;
    const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Contact Form Message</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Category:</strong> ${category || 'General'}</p>
                <p><strong>Subject:</strong> ${subject}</p>
            </div>
            <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h3>Message:</h3>
                <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
                This message was sent from the Global Bene contact form.
            </p>
        </div>
    `;

    try {
        // Send email to admin
        await sendEmail({
            email: process.env.ADMIN_EMAIL || process.env.EMAIL_TO,
            subject: emailSubject,
            message: emailBody
        });

        // Optional: Send confirmation email to user
        const confirmationSubject = "Thank you for contacting Global Bene";
        const confirmationBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Thank you for contacting us!</h2>
                <p>Dear ${name},</p>
                <p>We have received your message and will get back to you within 24 hours.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Your message:</strong></p>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
                <p>Best regards,<br>The Global Bene Team</p>
            </div>
        `;

        await sendEmail({
            email: email,
            subject: confirmationSubject,
            message: confirmationBody
        });

        res.status(200).json(new ApiResponse(200, null, "Message sent successfully"));
    } catch (error) {
        console.error("Error sending contact email:", error);
        throw new ApiError(500, "Failed to send message. Please try again later.");
    }
});

// Get admin contact information
export const getAdminContactInfo = asyncHandler(async (req, res) => {
    const adminContactInfo = {
        email: process.env.ADMIN_EMAIL || process.env.EMAIL_TO,
        supportEmail: process.env.EMAIL_TO,
        phone: process.env.ADMIN_PHONE || null,
        address: process.env.ADMIN_ADDRESS || null
    };

    res.status(200).json(new ApiResponse(200, adminContactInfo, "Admin contact info retrieved successfully"));
});