// // services/OneService.js

import OneSignal from 'react-native-onesignal'          // OneSignal React Native SDK import[1]
import AsyncStorage from '@react-native-async-storage/async-storage'  // AsyncStorage for local data storage[2]
import { Platform } from 'react-native'                 // Platform API for OS detection[3]
import axios from 'axios'                               // Axios for HTTP requests[4]

class OneService {
  constructor() {
    this.isInitialized = false
    this.deviceState = null
  }

  /**
   * Initialize OneSignal with handlers
   * @param {string} appId - Your OneSignal App ID
   */
  initialize(appId) {
    if (this.isInitialized) return
    OneSignal.setAppId(appId)                             // Set the OneSignal App ID[1]
    OneSignal.setLogLevel(6, 0)                           // Enable verbose logging[1]

    // Handle notifications received while app is in foreground
    OneSignal.setNotificationWillShowInForegroundHandler(event => {
      const notification = event.getNotification()        // Extract the notification payload[1]
      this._storeNotification(notification)               // Store payload locally
      event.complete(notification)                        // Display notification
    })

    // Handle notification opened action (foreground, background, killed)
    OneSignal.setNotificationOpenedHandler(openResult => {
      const { notification } = openResult
      const data = notification.additionalData            // Custom data sent with notification[1]
      this._onNotificationOpened(data)
    })

    this.isInitialized = true
    this._registerDevice()                                // Fetch device state and register backend
  }

  /** 
   * Fetch device state from OneSignal and register with backend 
   */
  async _registerDevice() {
    try {
      const state = await OneSignal.getDeviceState()      // Get pushToken & userId[1]
      if (!state?.userId) return
      this.deviceState = state
      await AsyncStorage.setItem('onesignal_device_info', JSON.stringify(state))  // Persist state locally[2]
      await this._registerDeviceWithBackend(state)        // Send state to your backend
    } catch (error) {
      console.error('OneSignal device registration error:', error)
    }
  }

  /**
   * Send device info to MongoDB backend
   * @param {object} state - OneSignal device state object
   */
  async _registerDeviceWithBackend(state) {
    try {
      const token = await AsyncStorage.getItem('token')   // Auth token from storage[2]
      const userId = await AsyncStorage.getItem('userId') // User ID from storage[2]
      if (!token || !userId) return

      await axios.post(
        'http://192.168.1.80:8001/api/register-device',     // Replace with your backend URL[4]
        {
          userId: userId,
          playerId: state.userId,
          pushToken: state.pushToken,
          deviceType: Platform.OS,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
    } catch (error) {
      console.error('Backend device registration error:', error)
    }
  }

  /**
   * Handle notification opened event
   * @param {object} data - Custom additionalData payload
   */
  _onNotificationOpened(data) {
    console.log('Notification opened with data:', data)   // Log for debugging
    // TODO: Insert React Navigation logic, e.g.:
    // if (data.screen) navigation.navigate(data.screen, data)
  }

  /**
   * Store notification payload locally
   * @param {object} notification - OneSignal notification object
   */
  async _storeNotification(notification) {
    try {
      const raw = await AsyncStorage.getItem('app_notifications')
      const list = raw ? JSON.parse(raw) : []
      list.unshift({
        id: notification.notificationId || Date.now().toString(),
        title: notification.title,
        body: notification.body,
        additionalData: notification.additionalData,
        timestamp: new Date().toISOString(),
        read: false
      })
      // Keep only latest 50 notifications
      await AsyncStorage.setItem('app_notifications', JSON.stringify(list.slice(0, 50)))
    } catch (error) {
      console.error('Error storing notification:', error)
    }
  }

  /**
   * Send user-specific tags to OneSignal for segmentation
   * @param {object} tags - Key/value pairs for segmentation
   */
  sendTags(tags) {
    OneSignal.sendTags(tags)                              // Tag API for OneSignal segmentation[1]
  }

  /**
   * Prompt for push notification permissions (iOS only)
   */
  requestPermissions() {
    OneSignal.promptForPushNotificationsWithUserResponse(response => {
      console.log('iOS permission response:', response)
    })
  }
}

export default new OneService()
