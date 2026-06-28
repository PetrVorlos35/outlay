import { defineApp } from "convex/server";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";

const app = defineApp();
// Transactional rate limiting (token-bucket / fixed-window) used to throttle
// outgoing OTP emails and abuse-prone mutations. See convex/rateLimits.ts.
app.use(rateLimiter);

export default app;
