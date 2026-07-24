import { io } from "socket.io-client";
import { resolvePlatformSocketUrl } from "./platformApi";
import { addMonitoringBreadcrumb } from "./monitoring";

let socketInstance = null;
let socketToken = "";

function resolveSocketUrl() {
  return (
    process.env.EXPO_PUBLIC_RIDE_SOCKET_URL ||
    process.env.EXPO_PUBLIC_SOCKET_URL ||
    process.env.RIDE_SOCKET_URL ||
    resolvePlatformSocketUrl()
  );
}

export function getRideSocket() {
  return socketInstance;
}

export function setRideSocketToken(token = "") {
  socketToken = token;

  if (socketInstance) {
    socketInstance.auth = {
      ...(socketInstance.auth || {}),
      token,
    };
  }
}

export function connectRideSocket(options = {}) {
  const { token: optionToken, url: optionUrl, ...socketOptions } = options;
  const nextToken = optionToken || socketToken;

  if (socketInstance) {
    if (nextToken && socketInstance.auth?.token !== nextToken) {
      socketInstance.auth = {
        ...(socketInstance.auth || {}),
        token: nextToken,
      };

      if (socketInstance.connected) {
        socketInstance.disconnect().connect();
      }
    }

    return socketInstance;
  }

  const url = optionUrl || resolveSocketUrl();
  if (!url) {
    return null;
  }

  socketInstance = io(url, {
    autoConnect: false,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 750,
    reconnectionDelayMax: 10000,
    randomizationFactor: 0.35,
    timeout: 15000,
    forceNew: false,
    auth: nextToken ? { token: nextToken } : undefined,
    ...socketOptions,
  });

  socketInstance.on("connect", () => {
    addMonitoringBreadcrumb("realtime", "Socket connected", {}, "info");
  });
  socketInstance.on("disconnect", (reason) => {
    addMonitoringBreadcrumb(
      "realtime",
      "Socket disconnected",
      { reason: String(reason || "unknown") },
      "warning"
    );
  });
  socketInstance.on("connect_error", (error) => {
    addMonitoringBreadcrumb(
      "realtime",
      "Socket connection failed",
      { error: String(error?.message || "connection error") },
      "warning"
    );
  });

  socketInstance.connect();
  return socketInstance;
}

export function disconnectRideSocket() {
  if (!socketInstance) return;
  socketInstance.removeAllListeners();
  socketInstance.disconnect();
  socketInstance = null;
}

export function emitRideEvent(eventName, payload) {
  const socket = socketInstance || connectRideSocket();
  if (!socket) return false;
  socket.emit(eventName, payload);
  return true;
}

export function joinRideOrderRoom(orderType, orderId) {
  if (!orderType || !orderId) return false;
  return emitRideEvent("join_order", { orderType, orderId });
}

export function joinRideUserRoom(userId) {
  if (!userId) return false;
  return emitRideEvent("join_user", { userId });
}
