// utils/notifications.js — Day 11
// Thin wrapper around expo-notifications for task due-date reminders.
// Local/scheduled notifications work in Expo Go (SDK 56 docs) — only push notifications need a dev build.

import * as Notifications from 'expo-notifications';

export const configureNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

export const requestNotificationPermission = async () => {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) { return false; }
};

// task: { title, dueDate: Date }
export const scheduleTaskReminder = async (task) => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌾 AgriAI Reminder',
        body: task.title,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(task.dueDate),
      },
    });
    return id;
  } catch (e) { return null; }
};

export const cancelTaskReminder = async (notifId) => {
  if (!notifId) return;
  try { await Notifications.cancelScheduledNotificationAsync(notifId); } catch (e) {}
};
