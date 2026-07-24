jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: { hostUri: "192.168.1.20:8081" },
  },
}));

jest.mock("../monitoring", () => ({
  addMonitoringBreadcrumb: jest.fn(),
  captureOperationalError: jest.fn(),
}));

import {
  PlatformApiError,
  fetchBackendRoute,
  readPlatformSession,
  resolvePlatformApiUrl,
  resolvePlatformSocketUrl,
  writePlatformSession,
} from "../platformApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { captureOperationalError } from "../monitoring";

describe("platform API boundary", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    delete process.env.EXPO_PUBLIC_BACKEND_URL;
    delete process.env.API_BASE_URL;
    delete process.env.EXPO_PUBLIC_RIDE_SOCKET_URL;
    delete process.env.EXPO_PUBLIC_SOCKET_URL;
    delete process.env.RIDE_SOCKET_URL;
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("normalizes configured API and Socket.IO base URLs", () => {
    process.env.API_BASE_URL = "https://api.rydex.example/";
    process.env.RIDE_SOCKET_URL = "https://socket.rydex.example/";

    expect(resolvePlatformApiUrl()).toBe("https://api.rydex.example/api/v1");
    expect(resolvePlatformSocketUrl()).toBe("https://socket.rydex.example");
  });

  test("derives a development backend URL from the Expo host", () => {
    expect(resolvePlatformApiUrl()).toBe("http://192.168.1.20:4000/api/v1");
    expect(resolvePlatformSocketUrl()).toBe("http://192.168.1.20:4000");
  });

  test("sends a normalized backend route request", async () => {
    process.env.API_BASE_URL = "https://api.rydex.example";
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ encodedPolyline: "encoded-route" }),
    });

    const origin = { latitude: 17.4, longitude: 78.5 };
    const destination = { latitude: 17.42, longitude: 78.53 };
    await expect(
      fetchBackendRoute(origin, destination, { travelMode: "TWO_WHEELER" })
    ).resolves.toEqual({ encodedPolyline: "encoded-route" });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.rydex.example/api/v1/routing/route",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originLatitude: 17.4,
          originLongitude: 78.5,
          destinationLatitude: 17.42,
          destinationLongitude: 78.53,
          travelMode: "TWO_WHEELER",
        }),
        signal: expect.any(Object),
      })
    );
  });

  test("maps backend throttling and network failures to stable app errors", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ message: "Too many routing requests" }),
    });

    const request = fetchBackendRoute(
      { latitude: 17.4, longitude: 78.5 },
      { latitude: 17.42, longitude: 78.53 }
    );
    await expect(request).rejects.toMatchObject({
      name: "PlatformApiError",
      status: 429,
      code: "RATE_LIMITED",
      message: "Too many routing requests",
    });
    expect(captureOperationalError).toHaveBeenCalledWith(
      expect.objectContaining({ code: "RATE_LIMITED", status: 429 }),
      expect.objectContaining({
        feature: "api",
        operation: "POST /routing/route",
        status: 429,
      })
    );

    global.fetch.mockRejectedValueOnce(new Error("offline"));
    await expect(
      fetchBackendRoute(
        { latitude: 17.4, longitude: 78.5 },
        { latitude: 17.42, longitude: 78.53 }
      )
    ).rejects.toEqual(
      expect.objectContaining({
        name: "PlatformApiError",
        code: "NETWORK_UNAVAILABLE",
      })
    );
    expect(captureOperationalError).toHaveBeenLastCalledWith(
      expect.objectContaining({ code: "NETWORK_UNAVAILABLE" }),
      expect.objectContaining({
        feature: "api",
        operation: "POST /routing/route",
      })
    );
  });

  test("persists, reads, and clears authenticated sessions", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('{"accessToken":"access-1"}');
    await expect(readPlatformSession()).resolves.toEqual({ accessToken: "access-1" });

    await writePlatformSession({ accessToken: "access-2" });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "@rydex/platform-session",
      '{"accessToken":"access-2"}'
    );

    await writePlatformSession(null);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@rydex/platform-session");
  });

  test("exposes typed API errors for recovery flows", () => {
    const error = new PlatformApiError("Unavailable", {
      status: 503,
      code: "SERVICE_UNAVAILABLE",
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      name: "PlatformApiError",
      status: 503,
      code: "SERVICE_UNAVAILABLE",
    });
  });
});
