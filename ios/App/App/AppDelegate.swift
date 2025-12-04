import UIKit
import Capacitor
import FirebaseCore
import FirebaseMessaging
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, MessagingDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?

    // -----------------------------
    // APP LAUNCH
    // -----------------------------
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        // Firebase Init
        FirebaseApp.configure()

        // Delegates
        Messaging.messaging().delegate = self
        UNUserNotificationCenter.current().delegate = self

        // REQUIRED for FCM token to generate in TestFlight
        Messaging.messaging().isAutoInitEnabled = true

        // Request permission
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    application.registerForRemoteNotifications()
                }
            } else {
                print("❌ Notification permission not granted")
            }
        }

        return true
    }

    // ---------------------------------
    // APNs SUCCESS — Device Token
    // ---------------------------------
    func application(_ application: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {

        // Important: Link APNs → Firebase FCM
        Messaging.messaging().apnsToken = deviceToken

        print("📌 APNs Device Token received.")

        // Send to Capacitor so plugins work
        NotificationCenter.default.post(
            name: .capacitorDidRegisterForRemoteNotifications,
            object: deviceToken
        )
    }

    // ---------------------------------
    // APNs FAILURE
    // ---------------------------------
    func application(_ application: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError error: Error) {

        print("❌ Failed to register APNs:", error)

        NotificationCenter.default.post(
            name: .capacitorDidFailToRegisterForRemoteNotifications,
            object: error
        )
    }

    // ---------------------------------
    // FCM TOKEN from Firebase
    // ---------------------------------
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {

        print("🔥 FCM Token:", fcmToken ?? "nil")

        NotificationCenter.default.post(
            name: Notification.Name("FCMToken"),
            object: fcmToken
        )
    }

    // ---------------------------------
    // BACKGROUND NOTIFICATION HANDLING
    // ---------------------------------
    func application(_ application: UIApplication,
                     didReceiveRemoteNotification userInfo: [AnyHashable: Any],
                     fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {

        print("📩 Background Notification Received:", userInfo)

        NotificationCenter.default.post(
            name: Notification.Name("didReceiveRemoteNotification"),
            object: completionHandler,
            userInfo: userInfo
        )
    }

    // ---------------------------------
    // Capacitor required methods
    // ---------------------------------
    func application(_ app: UIApplication,
                     open url: URL,
                     options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication,
                     continue userActivity: NSUserActivity,
                     restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
