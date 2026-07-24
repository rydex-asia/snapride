import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN || "";
const environment =
  process.env.EXPO_PUBLIC_APP_ENV || (__DEV__ ? "development" : "production");
const configuredTraceRate = Number(
  process.env.EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE
);
const tracesSampleRate = Number.isFinite(configuredTraceRate)
  ? Math.min(Math.max(configuredTraceRate, 0), 1)
  : environment === "production"
    ? 0.15
    : 1;

function stripQuery(value = "") {
  const text = String(value || "");
  const queryIndex = text.indexOf("?");
  return queryIndex >= 0 ? text.slice(0, queryIndex) : text;
}

function sanitizeEvent(event) {
  if (event.user) {
    event.user = event.user.id ? { id: String(event.user.id) } : undefined;
  }

  if (event.request) {
    event.request.url = stripQuery(event.request.url);
    delete event.request.data;
    delete event.request.cookies;

    if (event.request.headers) {
      const safeHeaders = { ...event.request.headers };
      delete safeHeaders.Authorization;
      delete safeHeaders.authorization;
      delete safeHeaders.Cookie;
      delete safeHeaders.cookie;
      event.request.headers = safeHeaders;
    }
  }

  if (Array.isArray(event.breadcrumbs)) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
      if (!breadcrumb?.data) return breadcrumb;
      const data = { ...breadcrumb.data };
      delete data.latitude;
      delete data.longitude;
      delete data.pickup;
      delete data.drop;
      delete data.address;
      delete data.email;
      delete data.phone;
      delete data.token;
      delete data.authorization;
      if (data.url) data.url = stripQuery(data.url);
      return { ...breadcrumb, data };
    });
  }

  return event;
}

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment,
  debug: false,
  sendDefaultPii: false,
  attachScreenshot: false,
  enableAutoSessionTracking: true,
  tracesSampleRate,
  beforeSend: sanitizeEvent,
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb?.data?.url) {
      return {
        ...breadcrumb,
        data: {
          ...breadcrumb.data,
          url: stripQuery(breadcrumb.data.url),
        },
      };
    }
    return breadcrumb;
  },
});

Sentry.setTags({
  app: "rydex-rider",
  app_environment: environment,
  expo_project: Constants.expoConfig?.slug || "rider-native",
  app_version:
    Constants.nativeAppVersion || Constants.expoConfig?.version || "unknown",
});

export function setMonitoringScreen(screen) {
  const name = String(screen || "unknown");
  Sentry.setTag("screen", name);
  Sentry.addBreadcrumb({
    category: "navigation",
    type: "navigation",
    level: "info",
    message: `Screen: ${name}`,
    data: { screen: name },
  });
}

export function setMonitoringUser(user) {
  const id = user?.id || user?.userId;
  Sentry.setUser(id ? { id: String(id) } : null);
}

export function addMonitoringBreadcrumb(category, message, data = {}, level = "info") {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data,
  });
}

export function captureOperationalError(error, context = {}) {
  if (!error) return;

  Sentry.withScope((scope) => {
    const { feature, operation, severity = "error", ...extra } = context;
    if (feature) scope.setTag("feature", String(feature));
    if (operation) scope.setTag("operation", String(operation));
    scope.setLevel(severity);
    scope.setExtras(extra);
    Sentry.captureException(error);
  });
}

export function captureMonitoringMessage(message, context = {}, level = "warning") {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    scope.setExtras(context);
    Sentry.captureMessage(message);
  });
}

export { Sentry };
