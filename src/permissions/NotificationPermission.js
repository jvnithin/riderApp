import { Platform, PermissionsAndroid } from 'react-native';

const requestNotificationPermission = async () => {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.request(
        'android.permission.POST_NOTIFICATIONS',
        {
          title: 'Notification Permission',
          message: 'App needs notification access for ride alerts',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.log("Notification Error:", err);
      return false;
    }
  }
  return true;
};

export default requestNotificationPermission;