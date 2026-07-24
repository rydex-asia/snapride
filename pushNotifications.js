import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { registerPushToken } from "./platformApi";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export async function registerOrderPushNotifications(accessToken) {
  if (!accessToken) return null;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("orders", { name: "Order updates", importance: Notifications.AndroidImportance.HIGH, sound: "default" });
  }
  const existing = await Notifications.getPermissionsAsync();
  const permission = existing.granted ? existing : await Notifications.requestPermissionsAsync();
  if (!permission.granted) return null;
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  const result = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  await registerPushToken(accessToken, result.data, Platform.OS);
  return result.data;
}
