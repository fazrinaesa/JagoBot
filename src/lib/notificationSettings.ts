export type NotificationSettings = { enabled: boolean; botId: string; limit: 5 | 10 | 20 };
export const notificationSettingsKey = "jagobotNotificationSettings";
export const notificationSettingsEvent = "jagobot-notification-settings-change";
export const defaultNotificationSettings: NotificationSettings = { enabled: true, botId: "active", limit: 5 };

export const readNotificationSettings = (): NotificationSettings => {
  try {
    const saved = JSON.parse(localStorage.getItem(notificationSettingsKey) || "null");
    return {
      enabled: saved?.enabled !== false,
      botId: typeof saved?.botId === "string" ? saved.botId : defaultNotificationSettings.botId,
      limit: [5, 10, 20].includes(saved?.limit) ? saved.limit : defaultNotificationSettings.limit,
    };
  } catch { return defaultNotificationSettings; }
};

export const saveNotificationSettings = (settings: NotificationSettings) => {
  localStorage.setItem(notificationSettingsKey, JSON.stringify(settings));
  window.dispatchEvent(new Event(notificationSettingsEvent));
};
