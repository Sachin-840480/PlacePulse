import { useEffect } from 'react';
import { router } from 'expo-router';
import {
  getMessaging,
  requestPermission,
  AuthorizationStatus,
  subscribeToTopic,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
} from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { createNewJobsChannel, displayForegroundNotification } from './notificationChannel';

const NEW_JOBS_TOPIC = 'new-jobs';

function firstJobId(data: Record<string, string> | undefined): string | undefined {
  const jobIds = data?.job_ids;
  return jobIds ? jobIds.split(',')[0] : undefined;
}

function navigateToJob(jobId: string | undefined) {
  if (!jobId) return;
  router.push({ pathname: '/jobs', params: { highlight: jobId } });
}

/**
 * Call this once, near the root of the app (e.g. in the root layout).
 * Handles:
 *  - Requesting notification permission (Android 13+ requires this explicitly)
 *  - Creating the high-importance notification channel
 *  - Subscribing the device to the 'new-jobs' FCM topic
 *  - Listening for foreground messages and displaying them via notifee
 *  - Navigating to the tapped job (on the /jobs screen) in every app state
 */
export function useFcmSetup() {
  useEffect(() => {
    let unsubscribeForeground: () => void;
    let unsubscribeNotificationOpened: () => void;
    let unsubscribeNotifeeForeground: () => void;

    async function setup() {
      try {
        const messagingInstance = getMessaging();

        await createNewJobsChannel();

        const authStatus = await requestPermission(messagingInstance);
        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('Notification permission not granted');
          return;
        }

        await subscribeToTopic(messagingInstance, NEW_JOBS_TOPIC);
        // console.log(`Subscribed to topic: ${NEW_JOBS_TOPIC}`);   // To Check if the Data is being fetched from FireStore.

        // App is open (foreground) — Android won't auto-show anything, so we
        // display it ourselves via notifee.
        unsubscribeForeground = onMessage(messagingInstance, async (remoteMessage) => {
          const title = remoteMessage.notification?.title ?? 'New update';
          const body = remoteMessage.notification?.body ?? '';
          await displayForegroundNotification(title, body, remoteMessage.data as Record<string, string>);
        });

        // Tap on a notifee-displayed notification (our own foreground popup)
        unsubscribeNotifeeForeground = notifee.onForegroundEvent(({ type, detail }) => {
          if (type === EventType.PRESS) {
            navigateToJob(firstJobId(detail.notification?.data as Record<string, string> | undefined));
          }
        });

        // Tap on a system-tray notification (app was backgrounded, not killed) —
        // these are shown natively by FCM itself, using the channel_id the backend sent.
        unsubscribeNotificationOpened = onNotificationOpenedApp(messagingInstance, (remoteMessage) => {
          navigateToJob(firstJobId(remoteMessage.data as Record<string, string>));
        });

        // App was launched by tapping a notification (was fully killed)
        const initialNotification = await getInitialNotification(messagingInstance);
        if (initialNotification) {
          navigateToJob(firstJobId(initialNotification.data as Record<string, string>));
        }
      } catch (error) {
        console.error('FCM setup error:', error);
      }
    }

    setup();

    return () => {
      unsubscribeForeground?.();
      unsubscribeNotificationOpened?.();
      unsubscribeNotifeeForeground?.();
    };
  }, []);
}
