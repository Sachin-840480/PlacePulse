import { useEffect } from 'react';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

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
      // Android 13+ (API 33+) requires runtime permission for notifications
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Notification permission not granted');
        return;
      }

      // Subscribe to the topic the backend publishes new-job pushes to
      await messaging().subscribeToTopic(NEW_JOBS_TOPIC);
      console.log(`Subscribed to topic: ${NEW_JOBS_TOPIC}`);

      // Foreground messages don't show a system notification automatically —
      // handle them here (e.g. show an in-app banner/toast).
      unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground FCM message:', remoteMessage);
        // TODO: wire to an in-app toast/banner component
      });

      // User tapped a notification while app was backgrounded (not killed)
      unsubscribeNotificationOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('Notification tapped (app was backgrounded):', remoteMessage);
        // TODO: navigate to the relevant job, using remoteMessage.data.job_ids
      });

      // App was launched by tapping a notification (was fully killed)
      const initialNotification = await messaging().getInitialNotification();
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
