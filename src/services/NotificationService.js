import PushNotification from 'react-native-push-notification';

class NotificationService {
  configure = () => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log("TOKEN:", token);
      },
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
        // notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    PushNotification.createChannel(
      {
        channelId: "ride-channel",
        channelName: "Ride Notifications",
        channelDescription: "Notifications for new ride bookings",
        playSound: true,
        soundName: "default",
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`createChannel returned '${created}'`)
    );
  };

  showNotification = (title, message, data = {}) => {
    PushNotification.localNotification({
      channelId: "ride-channel",
      title: title,
      message: message,
      playSound: true,
      soundName: 'default',
      actions: ['Accept', 'Decline'],
      userInfo: data,
    });
  };
}

export default new NotificationService();
