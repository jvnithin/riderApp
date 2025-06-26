// // components/BackgroundLocationTracker.jsx
// import React, { useEffect, useContext, useRef } from 'react';
// import BackgroundGeolocation from 'react-native-background-geolocation';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import RiderContext from '../context/RiderContext';

// const BackgroundLocationTracker = ({ currentRide, socket }) => {
//   const { rider } = useContext(RiderContext);
//   const isInitializedRef = useRef(false);

//   const initLocationTracking = async () => {
//     console.log('🚀 Initializing BackgroundGeolocation...');

//     try {
//       BackgroundGeolocation.ready({
//         desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
//         distanceFilter: 10,
//         stopOnTerminate: false,
//         startOnBoot: true,
//         foregroundService: true,
//         notificationTitle: 'Location Tracking Active',
//         notificationText: 'Your location is being tracked for ride service',
//         debug: false,
//         logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
//         locationUpdateInterval: 5000,
//         fastestLocationUpdateInterval: 2000,
//         enableHighAccuracy: true,
//         autoSync: false,
//         maxRecordsToPersist: 50,
//       }, (state) => {
//         console.log('✅ BackgroundGeolocation ready! Enabled:', state.enabled);

//         if (!state.enabled) {
//           BackgroundGeolocation.start().then(() => {
//             console.log('✅ BackgroundGeolocation started successfully');
//           }).catch(error => {
//             console.error('❌ Failed to start BackgroundGeolocation:', error);
//           });
//         }
//       });

//       BackgroundGeolocation.onLocation(async (location) => {
//         const { latitude, longitude } = location.coords;

//         const payload = {
//           lat: latitude,
//           lng: longitude,
//           riderId: rider?._id,
//           rideId: currentRide?._id,
//           userId: currentRide?.user,
//           timestamp: location.timestamp,
//           accuracy: location.coords.accuracy,
//           speed: location.coords.speed || 0,
//         };

//         if (socket && socket.connected && currentRide) {
//           try {
//             socket.emit('driver-location', payload);
//             console.log('🚀 Location sent via socket:', payload);
//           } catch (socketError) {
//             console.error('❌ Socket emit error:', socketError);
//           }
//         } else {
//           console.log('⚠️ Socket not connected or no active ride. Skipping location emit.');
//         }

//         try {
//           await AsyncStorage.setItem('last_location', JSON.stringify(payload));
//         } catch (storageError) {
//           console.error('❌ Failed to save location to storage:', storageError);
//         }
//       });

//       BackgroundGeolocation.onError((error) => {
//         console.error('❌ BackgroundGeolocation error:', error);
//       });

//       BackgroundGeolocation.onMotionChange((event) => {
//         console.log('🏃 Motion change detected:', event);
//       });

//       BackgroundGeolocation.onProviderChange((provider) => {
//         console.log('🛰️ Provider change:', provider);
//       });

//       isInitializedRef.current = true;

//     } catch (error) {
//       console.error('❌ Failed to initialize BackgroundGeolocation:', error);
//     }
//   };

//   const stopLocationTracking = async () => {
//     try {
//       console.log('🛑 Stopping BackgroundGeolocation...');
//       await BackgroundGeolocation.stop();
//       console.log('✅ BackgroundGeolocation stopped');
//     } catch (error) {
//       console.error('❌ Failed to stop BackgroundGeolocation:', error);
//     }
//   };

//   useEffect(() => {
//     if (!isInitializedRef.current) {
//       initLocationTracking();
//     }
//     return () => {
//       if (isInitializedRef.current) {
//         BackgroundGeolocation.removeListeners();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (currentRide) {
//       BackgroundGeolocation.getState().then((state) => {
//         if (!state.enabled) {
//           BackgroundGeolocation.start();
//         }
//       });
//     }
//   }, [currentRide]);

//   useEffect(() => {
//     if (socket) {
//       console.log('🔌 Socket connection updated');
//     }
//   }, [socket]);

//   return null;
// };

// export default BackgroundLocationTracker;


// components/BackgroundLocationTracker.jsx
import React, { useEffect, useContext, useRef } from 'react';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RiderContext from '../context/RiderContext';

const BackgroundLocationTracker = ({ currentRide, socket }) => {
  const { rider } = useContext(RiderContext);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 10,
      notificationTitle: 'RideEasy Tracking Active',
      notificationText: 'We are tracking your location',
      debug: false,
      startOnBoot: true,
      stopOnTerminate: false,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 5000,
      fastestInterval: 2000,
      activitiesInterval: 10000,
      stopOnStillActivity: false,
      // no URL for auto syncing; we'll handle via socket
      autoSync: false,
      maxLocations: 100,
    });

    BackgroundGeolocation.on('location', async location => {
      const payload = {
        lat: location.latitude || location.coords.latitude,
        lng: location.longitude || location.coords.longitude,
        riderId: rider?._id,
        rideId: currentRide?._id,
        userId: currentRide?.user,
        timestamp: location.time || location.timestamp,
        accuracy: location.accuracy || location.coords.accuracy,
        speed: location.speed || location.coords.speed || 0,
      };

      if (socket?.connected && currentRide) {
        socket.emit('driver-location', payload);
      }

      await AsyncStorage.setItem('last_location', JSON.stringify(payload));
    });

    BackgroundGeolocation.on('error', error => console.error('[BGGeo error]', error));
    BackgroundGeolocation.on('providerchange', provider => console.log('[BGGeo provider]', provider));

    BackgroundGeolocation.checkStatus(status => {
      if (!status.isRunning) BackgroundGeolocation.start();
    });

    return () => {
      BackgroundGeolocation.removeAllListeners();
    };
  }, []);

  // Ensure tracking remains active when ride changes
  useEffect(() => {
    if (currentRide) {
      BackgroundGeolocation.checkStatus(status => {
        if (!status.isRunning) BackgroundGeolocation.start();
      });
    }
  }, [currentRide]);

  return null;
};

export default BackgroundLocationTracker;
