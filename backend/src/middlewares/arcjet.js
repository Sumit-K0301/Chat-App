import { isSpoofedBot } from "@arcjet/inspect";
import aj from "../utilities/aj.js";

const arcjet = async function (req,res,next) {
    try {
        const decision = await aj.protect(req, { requested: 1 }); 

        if(decision.isDenied()) 
        {
            if (decision.reason.isRateLimit()) {
            res.status(429).json({ error: "Too many requests, please try again later." });
            } else if (decision.reason.isBot()) {
            res.status(403).json({ error: "Access denied for bots." });
            } else {
            res.status(403).json({ error: "Access denied." });
            }
        } 
        
        else if (decision.ip.isHosting()) 
        {
            res.status(403).json({ error: "Access denied from hosting providers." });
        } 
        
        else if (decision.results.some(isSpoofedBot)) 
        {
            res.status(403).json({ error: "Access denied for suspected spoofed bots." });
        } 
        
        else 
        {
            console.log("Request allowed");
            next();
        }

    } catch (error) {
        console.error("Arcjet error", error);
        next();
    }
};

export default arcjet;