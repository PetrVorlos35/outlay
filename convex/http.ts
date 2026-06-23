import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Registers /api/auth/* routes (OAuth callbacks, token exchange, etc.).
auth.addHttpRoutes(http);

export default http;
