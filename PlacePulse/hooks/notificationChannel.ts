import notifee, { AndroidImportance } from '@notifee/react-native';

export const NEW_JOBS_CHANNEL_ID = 'new-jobs-high';

/**
 * Creates (or updates) a high-importance Android notification channel.
 * High importance is what makes a notification "heads-up" — it pops over
 * whatever screen is open, plays a sound, and shows briefly at the top,
 * instead of landing silently in the tray.
 *
 * Must be called once before any notification using this channel is shown —
 * call it early in app startup (e.g. alongside useFcmSetup).
 */
export async function createNewJobsChannel() {
  await notifee.createChannel({
    id: NEW_JOBS_CHANNEL_ID,
    name: 'New Job Postings',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}

/**
 * Manually displays a notification for foreground FCM messages.
 * Foreground messages never auto-display on Android — the OS assumes
 * the app will handle showing something itself, since the user is
 * already looking at it. This is what makes foreground notifications
 * behave the same as background ones (heads-up popup).
 *
 * `data` is passed through so a tap on this notification can still
 * carry job_ids for navigation, same as background/killed-state taps.
 */
export async function displayForegroundNotification(
  title: string,
  body: string,
  data?: Record<string, string>
) {
  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId: NEW_JOBS_CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'default',
      },
    },
  });
}
