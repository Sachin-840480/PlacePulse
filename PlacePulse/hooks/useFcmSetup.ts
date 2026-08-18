import { useEffect } from 'react';
import {
  getMessaging,
  requestPermission,
  AuthorizationStatus,
  subscribeToTopic,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
} from '@react-native-firebase/messaging';
import { createNewJobsChannel, displayForegroundNotification } from './notificationChannel';

const NEW_JOBS_TOPIC = 'new-jobs';

/**
 * Call this once, near the root of the app (e.g. in the root layout).
 * Handles:
 *  - Requesting notification permission (Android 13+ requires this explicitly)
 *  - Subscribing the device to the 'new-jobs' FCM topic
 *  - Listening for foreground messages (app open) and background taps
 */
export function useFcmSetup() {
  useEffect(() => {
    let unsubscribeForeground: () => void;
    let unsubscribeNotificationOpened: () => void;

    async function setup() {
      const messagingInstance = getMessaging();

      // Create the high-importance channel before any notification needs it
      await createNewJobsChannel();

      // Android 13+ (API 33+) requires runtime permission for notifications
      const authStatus = await requestPermission(messagingInstance);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Notification permission not granted');
        return;
      }

      // Subscribe to the topic the backend publishes new-job pushes to
      await subscribeToTopic(messagingInstance, NEW_JOBS_TOPIC);
      console.log(`Subscribed to topic: ${NEW_JOBS_TOPIC}`);

      // Foreground messages don't show a system notification automatically —
      // handle them here (e.g. show an in-app banner/toast).
      unsubscribeForeground = onMessage(messagingInstance, async (remoteMessage) => {
        console.log('Foreground FCM message:', remoteMessage);
        const title = remoteMessage.notification?.title ?? 'New update';
        const body = remoteMessage.notification?.body ?? '';
        await displayForegroundNotification(title, body);
      });

      // User tapped a notification while app was backgrounded (not killed)
      unsubscribeNotificationOpened = onNotificationOpenedApp(messagingInstance, (remoteMessage) => {
        console.log('Notification tapped (app was backgrounded):', remoteMessage);
        // TODO: navigate to the relevant job, using remoteMessage.data.job_ids
      });

      // App was launched by tapping a notification (was fully killed)
      const initialNotification = await getInitialNotification(messagingInstance);
      if (initialNotification) {
        console.log('App opened from killed state via notification:', initialNotification);
        // TODO: navigate to the relevant job
      }
    }

    setup();

    return () => {
      unsubscribeForeground?.();
      unsubscribeNotificationOpened?.();
    };
  }, []);
}
