export const sendOTP = async (recipient) => {
    // Mock OTP sending for mobile notifications
    // In a real implementation, integrate with SMS service like Twilio
    console.log(`Sending OTP to ${recipient}`);
    // Simulate success
    return { success: true, message: "OTP sent successfully" };
};