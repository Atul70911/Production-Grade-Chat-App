export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const AVATAR_PLACEHOLDER = "https://res.cloudinary.com/demo/image/upload/default-avatar.png";

export const MESSAGE_STATUS = {
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
} as const;

export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: "connection",
  DISCONNECT: "disconnect",

  // User
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  USER_TYPING: "user:typing",
  USER_STOP_TYPING: "user:stopTyping",

  // Message
  MESSAGE_NEW: "message:new",
  MESSAGE_RECEIVED: "message:received",
  MESSAGE_READ: "message:read",
  MESSAGE_DELETED: "message:deleted",

  // Chat
  CHAT_CREATED: "chat:created",
  CHAT_UPDATED: "chat:updated",

  // Notification
  NOTIFICATION_NEW: "notification:new",

  // Room
  JOIN_ROOM: "room:join",
  LEAVE_ROOM: "room:leave",
} as const; 