import jwt from "jsonwebtoken"
import User from "../models/user.model.js";

const socketAuthMiddleware = async (socket, next) => {
  try {

    // Extract token from http-only cookies (safe parsing)
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      return next(new Error("Unauthorized - No Token Provided"));
    }

    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const idx = c.indexOf("=");
        return [c.substring(0, idx), c.substring(idx + 1)];
      })
    );

    const token = cookies.authToken;
    if (!token) {
      return next(new Error("Unauthorized - No Token Provided"));
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new Error("Unauthorized - Invalid Token"));
    }

    // Find the user from db
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new Error("User not found"));
    }

    // Attach user info to socket
    socket.user = user;
    socket.userId = user._id.toString();

    next();

  } catch (error) {
    console.error("Error in socket authentication:", error.message);
    next(new Error("Unauthorized - Authentication failed"));
  }
};

export default socketAuthMiddleware;