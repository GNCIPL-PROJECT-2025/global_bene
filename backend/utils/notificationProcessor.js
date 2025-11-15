import sendEmail from "./emailService.js";
import { sendOTP } from "./otpService.js";
import { Notification } from "../models/notification.model.js";
import { NotificationRecipient } from "../models/notificationRecipient.model.js";
import { NotificationLog } from "../models/notificationLog.model.js";
import { NotificationTemplate } from "../models/notificationTemplate.model.js";

export const processNotificationEvent = async (data) => {
  if (!data.tenantId) {
    console.warn(`[Notification-Service] Event has no tenantId. Skipping.`);
    return;
  }

  try {
    // For non-multi-tenant, use models directly
    console.log("template name-----------------")
    console.log(data.template)

    const template = await NotificationTemplate.findOne({ name: data.template });
    if (!template) {
      console.warn(`[Notification-Service] Template '${data.template}' not found. Skipping.`);
      return;
    }

    const notification = await Notification.create({
      notificationCategory: data.notificationCategory,
      channel: data.channel,
      templateId: template._id,
      scheduledAt: data.scheduledAt,
      status: "SENT",
    });

    const recipientRecord = await NotificationRecipient.create({
      notificationId: notification._id,
      userId: data.user?.id || "anonymous",
      recipient: data.recipient,
      deliveryStatus: "PENDING",
      deliveredAt: null,
      isRead: false,
    });

    let responseCode = null;
    let responseBody = null;
    let deliveryStatus = "SENT";
    let errorMessage = null;

    try {
      if (data.channel === 'EMAIL') {
        await sendEmail(data.recipient, template?.content, data.payload);
      } else if (data.channel === 'MOBILE') {
        await sendOTP(data.recipient);
      } else {
        throw new Error(`Unsupported channel: ${data.channel}`);
      }
    } catch (sendError) {
      console.error(`[Notification-Service] Sending failed:`, sendError);
      responseCode = sendError.code || null;
      responseBody = sendError.message || null;
      deliveryStatus = "FAILED";
      errorMessage = sendError.message;
    }

    recipientRecord.deliveryStatus = deliveryStatus;
    recipientRecord.deliveredAt = deliveryStatus === "SENT" ? new Date() : null;
    recipientRecord.errorMessage = errorMessage;
    await recipientRecord.save();

    await NotificationLog.create({
      notificationId: notification._id,
      recipientId: recipientRecord._id,
      attemptNo: 1,
      channel: data.channel,
      responseCode,
      responseBody,
      timestamp: new Date(),
    });

  } catch (err) {
    console.error(`[Notification-Service] Failed to process notification event for tenant '${data.tenantId}':`, err);
    throw err;
  }
};