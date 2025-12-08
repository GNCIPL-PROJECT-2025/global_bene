// utils/logActivity.utils.js

import mongoose from "mongoose";
import { ActivityLog } from "../models/activityLog.model.js";
import { sendActivityEvent } from "./kafka.utils.js";

const parseUserAgent = (userAgent) => {
  if (!userAgent) return { device: "", browser: "", platform: "" };
  const ua = userAgent.toLowerCase();
  let browser = "";
  let platform = "";
  let device = "";

  if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("edg")) browser = "Edge";
  else browser = "Unknown";

  if (ua.includes("windows")) platform = "Windows";
  else if (ua.includes("mac")) platform = "MacOS";
  else if (ua.includes("linux")) platform = "Linux";
  else if (ua.includes("android")) platform = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) platform = "iOS";
  else platform = "Unknown";

  device = ua.includes("mobile") ? "Mobile" : "Desktop";
  return { device, browser, platform };
};

const extractRequestContext = (req, fallbackSessionId) => {
  if (!req) {
    return {
      token: fallbackSessionId || null,
      userAgent: "",
      ipAddress: "",
      method: "",
      path: "",
    };
  }

  const authHeader = req.headers?.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : req.cookies?.accessToken || fallbackSessionId;

  let ipAddress =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    "";

  if (ipAddress.includes(",")) ipAddress = ipAddress.split(",")[0].trim();
  if (ipAddress === "::1" || ipAddress === "127.0.0.1") ipAddress = "localhost";

  return {
    token: token || null,
    userAgent: req.headers?.["user-agent"] || "",
    ipAddress,
    method: req.method || "",
    path: req.originalUrl || req.url || "",
  };
};

export const logActivity = async (
  userId,
  event_type,
  description,
  req,
  entity_type = null,
  entity_id = null,
  session_id = null,
  additionalProps = {}
) => {
  try {
    const { token, userAgent, ipAddress } = extractRequestContext(req, session_id);
    const { device, browser, platform } = parseUserAgent(userAgent);

    const occurredAt = new Date();

    // RAW GEO FROM HEADERS
    let rawGeo = {
      latitude: req.headers["x-user-latitude"],
      longitude: req.headers["x-user-longitude"],
    };

    // FIX: CONVERT OBJECT → STRING
    let geo_location = "";
    if (rawGeo.latitude && rawGeo.longitude) {
      geo_location = `${rawGeo.latitude},${rawGeo.longitude}`;
    }

    // DEFAULT PROPS
    const baseProps = {
      geo_location,
      ip_address: ipAddress,
      device,
      browser,
      platform,
    };

    let props = { ...baseProps, ...additionalProps };

    // FIX: PREVENT CAST ERRORS — force all props fields to strings or JSON
    Object.keys(props).forEach((key) => {
      if (typeof props[key] === "object") {
        props[key] = JSON.stringify(props[key]); // safe
      }
      if (props[key] === undefined || props[key] === null) {
        props[key] = "";
      }
    });

    const activity = {
      event_type,
      description,
      entity_type,
      entity_id: entity_id
        ? mongoose.Types.ObjectId.isValid(entity_id)
          ? new mongoose.Types.ObjectId(entity_id)
          : null
        : null,
      session_id: token,
      props,
      createdAt: occurredAt,
      updatedAt: occurredAt,
    };

    await ActivityLog.findOneAndUpdate(
      { user_id: userId },
      { $push: { activities: activity } },
      { upsert: true, new: true }
    );

    const kafkaEvent = {
      user_id: userId?.toString?.() || String(userId),
      event_type,
      description,
      entity_type,
      entity_id: entity_id ? String(entity_id) : null,
      session_id: token,
      props,
      occurred_at: occurredAt.toISOString(),
    };

    sendActivityEvent(kafkaEvent).catch((err) =>
      console.error("Kafka publish error:", err.message)
    );
  } catch (err) {
    console.error("Error logging activity:", err.message);
  }
};
