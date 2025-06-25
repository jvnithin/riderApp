// import ReactNativeForegroundService, {
//   setupServiceErrorListener,
// } from '@supersami/rn-foreground-service';  // Foreground service bridge[1]
// import NotificationService from './NotificationService';            // Push-notification helper[2]

// let serviceRunning = false;

// // 1. Headless task runner: invoked repeatedly by the native service
// const taskRunner = async () => {
//   // Example: dispatch a local notification on each tick
//   NotificationService.showNotification(
//     'Background Alert',
//     'Your app is alive in the foreground service!',
//     { timestamp: Date.now() }
//   );  // Uses localNotification from react-native-push-notification[2]
// };

// // 2. Register the foreground task exactly once
// export const registerService = (options = {}) => {
//   if (serviceRunning) return;

//   // Setup optional error callbacks for service startup failures
//   const alert = options.config?.alert;
//   const onServiceErrorCallBack = options.config?.onServiceErrorCallBack;
//   setupServiceErrorListener({ alert, onServiceFailToStart: onServiceErrorCallBack });  // Listener stub[1]

//   // Kick off the native foreground service with our task runner
//   ReactNativeForegroundService.registerForegroundTask(
//     'rideForegroundTask',  // Unique task identifier[1]
//     taskRunner
//   );

//   serviceRunning = true;
// };

// // 3. Helpers to control service lifecycle from JS (optional)
// export const startService = () => registerService();
// export const stopService = () => {
//   if (!serviceRunning) return;
//   ReactNativeForegroundService.stopForegroundService();
//   serviceRunning = false;
// };
// src/services/foregroundService.js

import ReactNativeForegroundService from '@supersami/rn-foreground-service';  // v2 default export[1]
import NotificationService from './NotificationService';                     // Your push-notification helper[2]

// Prevents multiple registrations
let serviceInitialized = false;

/**
 * Registers the headless JS task once at app startup.
 * @param {Object} config
 * @param {Function} config.alert           - called on service errors
 * @param {Function} config.onServiceErrorCallBack - callback on startup failure
 */
export const registerService = (config = {}) => {
  if (serviceInitialized) return;

  // Optional error listener (v2 supports setupServiceErrorListener)[2]
  if (typeof ReactNativeForegroundService.setupServiceErrorListener === 'function') {
    ReactNativeForegroundService.setupServiceErrorListener({
      alert: config.alert,
      onServiceFailToStart: config.onServiceErrorCallBack,
    });
  }

  // Register headless JS listener
  ReactNativeForegroundService.register();  // Must be called before AppRegistry.registerComponent[2]
  serviceInitialized = true;
};

/**
 * Starts the Android foreground service and schedules a repeating task.
 * @param {Object} options
 * @param {number} options.id       - Unique notification ID (default: 1)
 * @param {string} options.title    - Notification title
 * @param {string} options.message  - Notification message
 * @param {string} [options.serviceType] - Android FGS type (e.g., 'location')
 */
export const startService = ({
  id      = 1,
  title   = 'Background Service',
  message = 'Service is running...',
  serviceType,
} = {}) => {
  // Begin the native foreground service
  ReactNativeForegroundService.start({
    id,
    title,
    message,
    ...(serviceType && { serviceType }),  // only set if provided
  });  // Start displays a persistent notification[2]

  // Schedule the headless task to run in a loop
  ReactNativeForegroundService.add_task(taskRunner, {
    delay:   1000 * 60 * 5,  // every 5 minutes
    onLoop:  true,
    taskId:  'notificationTask',
    onError: e => console.error('[FGService] task error:', e),
  });  // add_task attaches your JS function to FGS loop[2]
};

/** Stops the foreground service and clears tasks */
export const stopService = () => {
  ReactNativeForegroundService.stop();  // Stops service and removes notification[2]
};

/** The function executed by the foreground service on each loop */
const taskRunner = async () => {
  // Dispatch a local notification even if the app is closed
  NotificationService.showNotification(
    'Background Alert',
    'Your app is alive in the foreground service!',
    { timestamp: Date.now() }
  );  // Uses react-native-push-notification localNotification API[2]
};


{/* Background Service Status 
        {Platform.OS === 'android' && (
          <View className="bg-white mx-4 mt-4 rounded-xl shadow-sm border border-gray-100 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-3">
                <View
                  className={`w-3 h-3 rounded-full ${
                    foregroundServiceActive ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                />
                <Text className="text-gray-700 font-medium">
                  {foregroundServiceActive
                    ? 'Background Service Active'
                    : 'Background Service Inactive'}
                </Text>f
              </View>

              {currentRide && !foregroundServiceActive && (
                <TouchableOpacity
                  onPress={startBackgroundService}
                  className="bg-blue-600 px-3 py-1 rounded-lg"
                >
                  <Text className="text-white text-sm font-medium">Start</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}*/}


         // const addLocationTask = () => {
  //   ReactNativeForegroundService.add_task(
  //     () => {
  //       // Update location and send to server
  //       if (driverLocation && currentRide) {
  //         updateDriverLocationOnServer(driverLocation);
  //         console.log('Background location update:', driverLocation);
  //       }
  //     },
  //     console.log("Iam being tested"),
  //     {
  //       delay: 10000, // Update every 10 seconds
  //       onLoop: true,
  //       taskId: 'location_tracking',
  //       onError: e => console.log('Background task error:', e),
  //     },
  //   );
  //   ReactNativeForegroundService.add_task(
  //     () => {
  //       if (socket && !socket.connected) {
  //         getSocketInstance(); // Reconnect if needed
  //       }
  //     },
  //     {
  //       delay: 30000,
  //       onLoop: true,
  //       taskId: 'socket_monitor',
  //     },
  //   );
  // };

  // const startForegroundService = () => {
  //   addLocationTask();

  //   ReactNativeForegroundService.start({
  //     id: 144,
  //     title: 'RideEasy Driver',
  //     message: 'Tracking location for active rides',
  //     icon: 'ic_launcher',
  //     button: true,
  //     button2: true,
  //     buttonText: 'Complete Ride',
  //     button2Text: 'Emergency',
  //     buttonOnPress: 'complete_ride',
  //     button2OnPress: 'emergency_call',
  //   });

  //   setForegroundServiceActive(true);
  // };

  // const stopForegroundService = () => {
  //   ReactNativeForegroundService.stop();
  //   setForegroundServiceActive(false);
  // };

  // const startBackgroundService = () => {
  //   if (Platform.OS === 'android') {
  //     startForegroundService();
  //   } else {
  //     // iOS background processing alternatives
  //     // Consider using background app refresh or silent push notifications
  //     console.log('iOS background processing - implement alternative methods');
  //     // For now, we'll just log this. You can implement iOS-specific background tasks here
  //   }
  // };

  // Auto-start service when ride is assigned
  // useEffect(() => {
  //   if (currentRide && !foregroundServiceActive) {
  //     // startForegroundService();
  //     console.log('Starting background service for active ride');
  //     startBackgroundService(); // Use the platform-specific function instead of startForegroundService()
  //   } else if (!currentRide && foregroundServiceActive) {
  //     stopForegroundService();
  //   }
  // }, [currentRide]);