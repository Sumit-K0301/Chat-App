import { isSpoofedBot } from "@arcjet/inspect";
import aj from "../config/arcjet.js";

const arcjet = async function (req, res, next) {
    try {
        const decision = await aj.protect(req, { requested: 1 });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ error: "Too many requests, please try again later." });
            } else if (decision.reason.isBot()) {
                return res.status(403).json({ error: "Access denied for bots." });
            } else {
                return res.status(403).json({ error: "Access denied." });
            }
        } else if (decision.ip.isHosting()) {
            return res.status(403).json({ error: "Access denied from hosting providers." });
        } else if (decision.results.some(isSpoofedBot)) {
            return res.status(403).json({ error: "Access denied for suspected spoofed bots." });
        } else {
            next();
        }

    } catch (error) {
        console.error("Arcjet error", error);
        next();
    }
};

export default arcjet;