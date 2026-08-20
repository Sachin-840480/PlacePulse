import 'expo-router/entry';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { createNewJobsChannel } from './hooks/notificationChannel';

// Ensure the channel exists as early as possible — even if this is the
// very first time the app process has ever run (e.g. woken by a push
// while fully killed, before any screen has mounted).
createNewJobsChannel();

const messaging = getMessaging(getApp());

// Registered outside any component — required so Android can wake the JS
// engine and hand off a push even when the app is fully killed. Since our
// backend sends a combined notification+data payload, Android's FCM SDK
// auto-displays the system tray notification itself; we don't need to call
// notifee here — this handler's job is just to guarantee the channel exists
// and to let RNFB register properly as a background-capable app.
setBackgroundMessageHandler(messaging, async () => {});
