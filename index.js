/**
 * @format
 */
// import 'react-native-reanimated/plugin';


// import { LogBox, Platform, AppRegistry } from 'react-native';
// import ReactNativeForegroundService from '@supersami/rn-foreground-service';
// import App from './App';
// import { name as appName } from './app.json';

// LogBox.ignoreLogs(['new NativeEventEmitter()']);
// if (Platform.OS === 'android') {
//   ReactNativeForegroundService.register();
// }
// AppRegistry.registerComponent(appName, () => App);

// index.js
// import { AppRegistry, Platform, LogBox } from 'react-native';
// import App from './App';
// import { name as appName } from './app.json';


// // Suppress NativeEventEmitter warnings
// LogBox.ignoreLogs([
//   'new NativeEventEmitter',
//   'was called with a non-null argument without the required',
// ]);

// // Register foreground task on Android only


// // Register the root component
// AppRegistry.registerComponent(appName, () => App);

// index.js or App.js
// import { AppRegistry } from 'react-native';
// import App from './App';
// Initialize OneSignal
// OneSignal.initialize('b1bc24f2-cac7-4677-9f0d-42b0e8f3de2e');

// // Set up handlers
// OneSignal.setNotificationWillShowInForegroundHandler(event => {
//   event.complete(event.getNotification());
// });
// OneSignal.setNotificationOpenedHandler(notification => {
//   console.log('Opened:', notification);
// });

// Register your root component
// AppRegistry.registerComponent('YourAppName', () => App);



import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
