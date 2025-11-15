import sendEmail from "./emailService.js";
import { sendOTP } from "./otpService.js";
import Notification from "../models/Notification.js";
import NotificationRecipient from "../models/NotificationRecipient.js";
import NotificationLog from "../models/NotificationLog.js";
import NotificationTemplate from "../models/NotificationTemplate.js";

export const processNotificationEvent = async (data) => {
  if (!data.tenantId) {
    console.warn(`[Notification-Service] Event has no tenantId. Skipping.`);
    return;
  }

  try {
    const TenantNotification = Notification.schema(data.tenantId);
    const TenantNotificationRecipient = NotificationRecipient.schema(data.tenantId);
    const TenantNotificationLog = NotificationLog.schema(data.tenantId);
    const TenantNotificationTemplate = NotificationTemplate.schema(data.tenantId);

    const template = await TenantNotificationTemplate.findOne({ where: { name: data.template } });
    if (!template) {
      console.warn(`[Notification-Service] Template '${data.template}' not found. Skipping.`);
      return;
    }

    // 1. Create Notification record
    const notification = await TenantNotification.create({
      notificationCategory: data.notificationCategory,
      channel: data.channel,
      templateId: template.id,
      scheduledAt: data.scheduledAt,
      status: "SENT",
    });

    // 2. Create Notification Recipient
    const recipientRecord = await TenantNotificationRecipient.create({
      notificationId: notification.id,
      userId: data.user?.id || "anonymous",
      recipient: data.recipient,
      deliveryStatus: "PENDING",
      deliveredAt: null,
      isRead: false,
    });

    // 3. Try to send notification
    let responseCode = null;
    let responseBody = null;
    let deliveryStatus = "SENT";
    let errorMessage = null;
//
//     try {
//       if (data.channel === 'EMAIL') {
//         await sendEmail(data.recipient, template?.content, data.payload);
//       } else if (data.channel === 'MOBILE') {
//         await sendOTP(data.recipient);
//       } else {
//         throw new Error(`Unsupported channel: ${data.channel}`);
//       }
//     } catch (sendError) {
//       console.error(`[Notification-Service] Sending failed:`, sendError);
//       responseCode = sendError.code || null;
//       responseBody = sendError.message || null;
//       deliveryStatus = "FAILED";
//       errorMessage = sendError.message;
//     }
//
//     // 4. Update recipient with delivery status
//     await recipientRecord.update({
//       deliveryStatus,
//       deliveredAt: deliveryStatus === "SENT" ? new Date() : null,
//       errorMessage,
//     });
//
//     // 5. Log the attempt
//     await TenantNotificationLog.create({
//       notificationId: notification.id,
//       recipientId: recipientRecord.id,
//       attemptNo: 1,
//       channel: data.channel,
//       responseCode,
//       responseBody,
//       timestamp: new Date(),
//     });
//
//   } catch (err) {
//     console.error(`[Notification-Service] Failed to process notification event for tenant '${data.tenantId}':`, err);
//   }
// };
//


import sendEmail from "./emailService.js";
import { sendOTP } from "./otpService.js";
import Notification from "../models/Notification.js";
import NotificationRecipient from "../models/NotificationRecipient.js";
import NotificationLog from "../models/NotificationLog.js";
import NotificationTemplate from "../models/NotificationTemplate.js";

export const processNotificationEvent = async (data) => {
  try {
    const TenantNotification = Notification.schema(data.tenantId);
    const TenantNotificationRecipient = NotificationRecipient.schema(data.tenantId);
    const TenantNotificationLog = NotificationLog.schema(data.tenantId);
    const TenantNotificationTemplate = NotificationTemplate.schema(data.tenantId);

    console.log("template name-----------------")
    console.log(data.template)

    const template = await TenantNotificationTemplate.findOne({ where: { name: data.template } });
    if (!template) {
      console.warn(`[Notification-Service] Template '${data.template}' not found. Skipping.`);
      return;
    }

    const notification = await TenantNotification.create({
      notificationCategory: data.notificationCategory,
      channel: data.channel,
      templateId: template.id,
      scheduledAt: data.scheduledAt,
      status: "SENT",
    });

    const recipientRecord = await TenantNotificationRecipient.create({
      notificationId: notification.id,
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

    await recipientRecord.update({
      deliveryStatus,
      deliveredAt: deliveryStatus === "SENT" ? new Date() : null,
      errorMessage,
    });

    await TenantNotificationLog.create({
      notificationId: notification.id,
      recipientId: recipientRecord.id,
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
