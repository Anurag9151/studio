/**
 * NOTE: This is a sample Cloud Function to be deployed separately.
 * This code is NOT part of the Next.js application build.
 * You would need to set up a `functions` directory with its own package.json
 * and deploy it using the Firebase CLI.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { AppSettings } from "../lib/types";

// Initialize the Firebase Admin SDK
admin.initializeApp();

// This function will be triggered by Google Cloud Scheduler
// We'll set it to run every 5 minutes for granular control.
export const sendScheduledReminders = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(async (context) => {
    console.log("Checking for reminders to send...");

    const db = admin.firestore();
    const messaging = admin.messaging();

    // Get the current time in HH:mm format for the user's local timezone.
    // For simplicity, we'll assume the server runs in a timezone that's
    // acceptable, or we'd use a timezone library.
    // A more robust solution would store user's timezone.
    const now = new Date();
    // In a real-world scenario, you'd iterate over timezones.
    // For this example, we'll just use the server's time.
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    console.log(`Current time is: ${currentTime}`);

    // Get all user settings
    // In a real app with many users, you would query for specific settings.
    const settingsSnapshot = await db.collection("userSettings").get();

    const remindersToSend: Promise<admin.messaging.MessagingPayload>[] = [];

    for (const doc of settingsSnapshot.docs) {
      const userId = doc.id;
      const settings = doc.data() as AppSettings;

      if (settings.remindersEnabled && settings.reminderTime === currentTime) {
        console.log(`Reminder time matched for user: ${userId}`);

        // Get the user's FCM token
        const tokenDoc = await db.collection("fcmTokens").doc(userId).get();
        if (tokenDoc.exists) {
          const { token } = tokenDoc.data() as { token: string };

          const payload: admin.messaging.MessagingPayload = {
            notification: {
              title: "Attendance Reminder!",
              body: "Don't forget to mark your attendance for today.",
              icon: "/icons/icon-192x192.png", // Optional: path to an icon
            },
          };
          
          console.log(`Sending notification to user ${userId}`);
          remindersToSend.push(messaging.sendToDevice(token, payload));
        }
      }
    }

    if (remindersToSend.length > 0) {
      await Promise.all(remindersToSend);
      console.log(`Successfully sent ${remindersToSend.length} reminders.`);
    } else {
      console.log("No reminders to send at this time.");
    }
  });
