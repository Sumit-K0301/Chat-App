import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY, 
  rules: [
    shield({ mode: "LIVE" }),           // Shield protects your app from common attacks e.g. SQL injection
    detectBot({
      mode: "LIVE",                     // Blocks requests. Use "DRY_RUN" to log only
      allow: [                          
        "CATEGORY:SEARCH_ENGINE",       // Google, Bing, etc
        "CATEGORY:MONITOR",             // Uptime monitoring services
        "CATEGORY:PREVIEW",             // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",               // Use "LIVE" to enforce the rate limit
      // Tracked by IP address by default, but this can be customized
      characteristics: ["ip.src"],
      refillRate: 1,                     // Refill 1 tokens per interval
      interval: 1,                       // Refill every 1 seconds
      capacity: 10,                      // Bucket capacity of 10 tokens
    }),
  ],
});

export default aj
