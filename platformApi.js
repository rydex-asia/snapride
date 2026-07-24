import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import {
  addMonitoringBreadcrumb,
  captureOperationalError,
} from "./monitoring";

const SESSION_STORAGE_KEY = "@rydex/platform-session";
const API_PREFIX = "/api/v1";

function trimTrailingSlash(value = "") {
  return value.replace(/\/+$/, "");
}

function withApiPrefix(value = "") {
  if (!value) return "";
  const normalized = trimTrailingSlash(value);
  if (normalized.endsWith(API_PREFIX)) {
    return normalized;
  }
  if (normalized.endsWith("/api")) {
    return `${normalized}/v1`;
  }
  return `${normalized}${API_PREFIX}`;
}

function resolveExpoDevelopmentApiUrl() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost ||
    "";
  const host = String(hostUri).split(":")[0];
  return host ? `http://${host}:4000` : "";
}

export function resolvePlatformApiUrl() {
  return withApiPrefix(
    process.env.EXPO_PUBLIC_API_BASE_URL ||
      process.env.EXPO_PUBLIC_BACKEND_URL ||
      process.env.API_BASE_URL ||
      resolveExpoDevelopmentApiUrl() ||
      "http://localhost:4000"
  );
}

export function resolvePlatformSocketUrl() {
  const explicit =
    process.env.EXPO_PUBLIC_RIDE_SOCKET_URL ||
    process.env.EXPO_PUBLIC_SOCKET_URL ||
    process.env.RIDE_SOCKET_URL;

  if (explicit) {
    return trimTrailingSlash(explicit);
  }

  return trimTrailingSlash(resolvePlatformApiUrl().replace(/\/api\/v1$/, ""));
}

export class PlatformApiError extends Error {
  constructor(message, { status = 0, code = "API_ERROR" } = {}) {
    super(message);
    this.name = "PlatformApiError";
    this.status = status;
    this.code = code;
  }
}

async function requestJson(path, { method = "GET", token, body, timeoutMs = 12000 } = {}) {
  const baseUrl = resolvePlatformApiUrl();
  if (!baseUrl) {
    throw new Error("Missing backend API URL");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : null),
      },
      ...(body ? { body: JSON.stringify(body) } : null),
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    const apiError = new PlatformApiError(
      timedOut ? "The service took too long to respond" : "Unable to reach the Rydex service",
      { code: timedOut ? "TIMEOUT" : "NETWORK_UNAVAILABLE" }
    );
    captureOperationalError(apiError, {
      feature: "api",
      operation: `${method} ${path}`,
      code: apiError.code,
    });
    throw apiError;
  } finally {
    clearTimeout(timer);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const apiError = new PlatformApiError(data?.message || `Backend request failed: ${response.status}`, {
      status: response.status,
      code: response.status === 429 ? "RATE_LIMITED" : response.status >= 500 ? "SERVICE_UNAVAILABLE" : "REQUEST_FAILED",
    });
    const context = {
      feature: "api",
      operation: `${method} ${path}`,
      status: response.status,
      code: apiError.code,
    };
    if (response.status === 429 || response.status >= 500) {
      captureOperationalError(apiError, context);
    } else {
      addMonitoringBreadcrumb("api", "API request rejected", context, "warning");
    }
    throw apiError;
  }

  return data;
}

export async function fetchBackendRoute(origin, destination, { travelMode = "DRIVE" } = {}) {
  return requestJson("/routing/route", {
    method: "POST",
    timeoutMs: 10000,
    body: {
      originLatitude: origin.latitude,
      originLongitude: origin.longitude,
      destinationLatitude: destination.latitude,
      destinationLongitude: destination.longitude,
      travelMode: travelMode === "TWO_WHEELER" ? "TWO_WHEELER" : "DRIVE",
    },
  });
}

export async function readPlatformSession() {
  const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function writePlatformSession(session) {
  if (!session) {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function loginCustomer(credentials) {
  const session = await requestJson("/auth/login", {
    method: "POST",
    body: credentials,
  });
  await writePlatformSession(session);
  return session;
}

export async function registerCustomer(account) {
  const session = await requestJson("/auth/register", {
    method: "POST",
    body: account,
  });
  await writePlatformSession(session);
  return session;
}

export async function refreshPlatformSession(refreshToken) {
  const session = await requestJson("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
  await writePlatformSession(session);
  return session;
}

export async function bootstrapCustomerSession() {
  const existing = await readPlatformSession();

  if (existing?.refreshToken) {
    try {
      return await refreshPlatformSession(existing.refreshToken);
    } catch {
      await writePlatformSession(null);
      return null;
    }
  }

  if (existing?.accessToken) {
    return existing;
  }

  return null;
}

export async function createBackendRide(accessToken, payload) {
  return requestJson("/rides", {
    method: "POST",
    token: accessToken,
    body: payload,
  });
}

export async function completeBackendRide(accessToken, rideId) {
  return requestJson(`/rides/${rideId}/complete`, {
    method: "POST",
    token: accessToken,
  });
}

export async function createPaymentOrder(accessToken, payload) {
  return requestJson("/payments/orders", {
    method: "POST",
    token: accessToken,
    body: payload,
  });
}

export async function verifyPayment(accessToken, payload) {
  return requestJson("/payments/verify", {
    method: "POST",
    token: accessToken,
    body: payload,
  });
}

export async function fetchPaymentStatus(accessToken, paymentId) {
  return requestJson(`/payments/${paymentId}`, { token: accessToken });
}

export async function fetchGroceryCatalog(storeId) {
  const query = storeId ? `?storeId=${encodeURIComponent(storeId)}` : "";
  return requestJson(`/grocery/catalog${query}`);
}

export async function fetchGroceryOrders(accessToken) {
  return requestJson("/grocery/orders", { token: accessToken });
}

export async function fetchGroceryOrder(accessToken, orderId) {
  return requestJson(`/grocery/orders/${orderId}`, { token: accessToken });
}

export async function createGrocerySupportRequest(accessToken, orderId, payload) {
  return requestJson(`/grocery/orders/${orderId}/support`, { method: "POST", token: accessToken, body: payload });
}

export async function registerPushToken(accessToken, token, platform) {
  return requestJson("/notifications/push-tokens", { method: "POST", token: accessToken, body: { token, platform } });
}

export async function createGroceryOrder(accessToken, payload) {
  return requestJson("/grocery/orders", {
    method: "POST",
    token: accessToken,
    body: payload,
  });
}

export async function cancelUnpaidGroceryOrder(accessToken, orderId) {
  return requestJson(`/grocery/orders/${orderId}/cancel-unpaid`, {
    method: "POST",
    token: accessToken,
  });
}

export async function fetchGroceryCart(accessToken) {
  return requestJson("/grocery/cart", { token: accessToken });
}

export async function setGroceryCartItem(accessToken, productId, quantity) {
  return requestJson(`/grocery/cart/items/${productId}`, {
    method: "PUT",
    token: accessToken,
    body: { quantity },
  });
}

export async function validateGroceryCart(accessToken) {
  return requestJson("/grocery/cart/validate", {
    method: "POST",
    token: accessToken,
  });
}

export async function clearGroceryCart(accessToken) {
  return requestJson("/grocery/cart", {
    method: "DELETE",
    token: accessToken,
  });
}

export async function checkGroceryServiceability(latitude, longitude) {
  return requestJson("/grocery/serviceability", {
    method: "POST",
    body: { latitude, longitude },
  });
}

export async function fetchDeliveryAddresses(accessToken) {
  return requestJson("/grocery/addresses", { token: accessToken });
}

export async function saveDeliveryAddress(accessToken, address, addressId) {
  return requestJson(addressId ? `/grocery/addresses/${addressId}` : "/grocery/addresses", {
    method: addressId ? "PUT" : "POST",
    token: accessToken,
    body: address,
  });
}

export async function deleteDeliveryAddress(accessToken, addressId) {
  return requestJson(`/grocery/addresses/${addressId}`, {
    method: "DELETE",
    token: accessToken,
  });
}
