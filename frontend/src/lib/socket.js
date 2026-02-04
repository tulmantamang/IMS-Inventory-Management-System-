import { io } from "socket.io-client";

// Use REACT_APP_BACKEND_URL when available, otherwise fallback to localhost
const backend = process.env.REACT_APP_BACKEND_URL || "http://localhost:3003";

const socket = io(backend.replace(/\/$/, '') , {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export default socket;
