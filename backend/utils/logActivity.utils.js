// utils/logActivity.utils.js

import { UserInteractionLog } from "../models/activityLog.model.js";

// Simple function to parse user agent
const parseUserAgent = (userAgent) => {
    if (!userAgent) return { device: '', browser: '', platform: '' };
    const ua = userAgent.toLowerCase();
    let browser = '';
    let platform = '';
    let device = '';

    if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('edg')) browser = 'Edge';
    else browser = 'Unknown';

    if (ua.includes('windows')) platform = 'Windows';
    else if (ua.includes('mac')) platform = 'MacOS';
    else if (ua.includes('linux')) platform = 'Linux';
    else if (ua.includes('android')) platform = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) platform = 'iOS';
    else platform = 'Unknown';

    device = ua.includes('mobile') ? 'Mobile' : 'Desktop';

    return { device, browser, platform };
};

export const logActivity = async (userId, event_type, description, req, entity_type = null, entity_id = null, session_id = null, additionalProps = {}) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.cookies?.accessToken || session_id;
        const { device, browser, platform } = parseUserAgent(req.headers['user-agent']);

        const activity = {
            event_type,
            description,
            entity_type,
            entity_id,
            session_id: token,
            props: {
                geo_location: additionalProps.geo_location || '',
                ip_address: req.ip || req.connection.remoteAddress,
                device,
                browser,
                platform,
                ...additionalProps
            },
        };

        await UserInteractionLog.findOneAndUpdate(
            { user_id: userId },
            {
                $push: { activities: activity },
            },
            { upsert: true, new: true }
        );
    } catch (err) {
        console.error("Error logging activity:", err.message);
    }
};
