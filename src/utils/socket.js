// src/utils/socket.js
import { io } from "socket.io-client";

export const createSocket = (baseUrl, token) => {
  if (!baseUrl) throw new Error("Missing baseUrl for socket (VITE_BASE_URL)");

  return io(baseUrl, {
    transports: ["websocket"],
    auth: { token },
    // withCredentials: true, // enable ONLY if your backend uses cookies auth
  });
};