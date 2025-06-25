import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntIcon from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import socketInstance from '../services/socketService';
import axios from 'axios';
import RiderContext from '../context/RiderContext';
import { AppState } from 'react-native';
import DriverMap from '../components/DriverMap';
import requestNotificationPermission from '../permissions/NotificationPermission';
import NotificationService from '../services/NotificationService';
import LocationVisitTracker from '../components/LocationVisitTracker';

const PROXIMITY_THRESHOLD = 50; // meters

const DriverHomePage = ({ navigation }) => {
  const { apiUrl, rider, location } = useContext(RiderContext);
  const [driverLocation, setDriverLocation] = useState(null);
  const [assignedRides, setAssignedRides] = useState([]);
  const [currentRide, setCurrentRide] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [showNavigationView, setShowNavigationView] = useState(false);
  const locationWatchId = useRef(null);
  const [socket, setSocket] = useState(null);
  const appState = useRef(AppState.currentState);
  const [visitedLocations, setVisitedLocations] = useState({});
  const [proximityStatus, setProximityStatus] = useState({});
  const prevRideId = useRef(null);

  // Haversine formula for distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180,
      φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180,
      Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  // Check proximity
  const checkProximity = (locs, current) => {
    const status = {};
    locs.forEach((loc, i) => {
      const dist = calculateDistance(
        current.lat,
        current.lng,
        loc.lat,
        loc.lng,
      );
      status[i] = {
        isNearby: dist <= PROXIMITY_THRESHOLD,
        distance: Math.round(dist),
        visited: Boolean(visitedLocations[i]),
        visitTime: visitedLocations[i] || null,
      };
    });
    setProximityStatus(status);
  };

  useEffect(() => {
    if (driverLocation && currentRide) {
      checkProximity(currentRide.locations, driverLocation);
    }
  }, [driverLocation, visitedLocations]);

  const markVisited = async index => {
    if (!proximityStatus[index]?.isNearby) {
      Alert.alert('Too Far', `Move within ${PROXIMITY_THRESHOLD}m`);
      return;
    }
    const timestamp = Date.now();

    setVisitedLocations(prev => {
      const updated = { ...prev, [index]: timestamp };
      AsyncStorage.setItem('visited_locations', JSON.stringify(updated));
      return updated;
    });

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${apiUrl}/bookings/status/${currentRide._id}`,
        { status: true, locationIndex: index, timestamp },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err) {
      console.error('Backend update failed', err);
    }
  };
  const handleMarkVisited = index => {
    markVisited(index);
  };

  const getActiveRides = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await axios.get(`${apiUrl}/driver/assigned-rides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignedRides(response.data);
      setCurrentRide(response.data[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const getSocketInstance = async () => {
    const socket = await socketInstance.getSocket('rider');
    console.log('Connection established', socket);
    await socket.connect();
    setSocket(socket);
  };

  const navigateIfNoToken = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      navigation.navigate('SignIn');
    }
  };

  useEffect(() => {
    console.log('hellooo');
    navigateIfNoToken();
    getSocketInstance();
    requestNotificationPermission();
    NotificationService.configure();
    const handleAppStateChange = () => {};
    socket?.on('new-ride', rideData => {
      setAssignedRides([...assignedRides, rideData]);
      setCurrentRide(rideData);
      NotificationService.showNotification(
        'New Ride Request!',
        `Pickup from ${rideData.locations[0].lat.toFixed(
          4,
        )}, ${rideData.locations[0].lng.toFixed(4)}`,
        { rideId: rideData._id, userId: rideData.user },
      );
    });
    requestLocationPermission();
    return () => {
      if (locationWatchId.current) {
        Geolocation.clearWatch(locationWatchId.current);
      }
      if (socket) {
        socket.off('new-ride');
      }
    };
  }, [socket]);
  useEffect(() => {
    const rideId = currentRide?._id;
    if (rideId && rideId !== prevRideId.current) {
      // Clear old data only on a truly new ride
      AsyncStorage.removeItem('visited_locations').catch(console.error);
      setVisitedLocations({});

      // Load persisted visits for the new ride
      AsyncStorage.getItem('visited_locations')
        .then(json => {
          if (json) setVisitedLocations(JSON.parse(json));
        })
        .catch(console.error);

      // Update ref for next comparison
      prevRideId.current = rideId;
    }
  }, [currentRide]);

  //appstate
  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      console.log('AppState changed:', appState.current, '→', nextAppState);

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (socket && !socket.connected) {
          console.log('Reconnecting socket...');
          getSocketInstance();
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

 useEffect(() => {
  // Define and immediately invoke an async initialization function
  const init = async () => {
    getActiveRides();

    try {
      const json = await AsyncStorage.getItem('visited_locations');
      if (json) {
        setVisitedLocations(JSON.parse(json));
      }
    } catch (error) {
      console.error(error);
    }
  };

  init();
}, []);


  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Driver app needs access to your location for navigation',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setIsLocationEnabled(true);
          startLocationTracking();
        }
      } else {
        startLocationTracking();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const startLocationTracking = () => {
    locationWatchId.current = Geolocation.watchPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        const newDriverLocation = { lat: latitude, lng: longitude };
        setDriverLocation(newDriverLocation);
        setIsLocationEnabled(true);

        // Update backend with driver location
        updateDriverLocationOnServer(newDriverLocation);
      },
      error => {
        Alert.alert('Error', 'Unable to get your location. Please enable GPS.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 5, // Update every 5 meters
      },
    );
  };

  const updateDriverLocationOnServer = async location => {
    if (!currentRide || !location) {
      return;
    }

    try {
      const payload = {
        location,
        riderId: rider._id,
        rideId: currentRide._id,
        userId: currentRide.user,
      };
      if (socket && socket.connected) {
        socket?.emit('driver-location', payload);
      }

      // socket?.emit('driver-location', payload);

      // Also store locally as backup
      await AsyncStorage.setItem('last_location', JSON.stringify(payload));
    } catch (error) {
      console.error('Error in location update:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getActiveRides();
    setRefreshing(false);
  };

  const startNavigation = () => {
    if (currentRide && driverLocation) {
      setShowNavigationView(true);
    }
  };

  const callCustomer = phoneNumber => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            // Stop background service before logout
            if (foregroundServiceActive) {
              stopForegroundService();
            }
            await AsyncStorage.removeItem('token');

            if (socket) {
              socketInstance.clearSocket();
            }

            if (locationWatchId.current) {
              Geolocation.clearWatch(locationWatchId.current);
            }

            navigation.reset({
              index: 0,
              routes: [{ name: 'SignIn' }],
            });
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  const completeRide = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(
        `${apiUrl}/driver/change-ride-status/${currentRide._id}`,
        { status: 'completed' },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      socket?.emit('ride-complete', {
        rideId: currentRide._id,
        userId: currentRide.user,
      });

      const updatedRides = assignedRides.filter(
        ride => ride._id.toString() !== currentRide._id.toString(),
      );

      setAssignedRides(updatedRides);
      if (updatedRides.length === 0) setCurrentRide(null);
      setShowNavigationView(false);
    } catch (error) {
      console.log('Ride completion error:', error);
    }
  };

  const buildMapsUrl = () => {
    const locs = currentRide?.locations || [];
    if (locs.length < 2) return '';

    const fmt = loc => `${loc.lat},${loc.lng}`;
    const origin = fmt(driverLocation);
    const destination = fmt(locs[locs.length - 1]);

    // Encode each waypoint separately, but preserve '|'
    const waypoints = locs
      .slice(0, locs.length - 1)
      .map(fmt)
      .map(encodeURIComponent) // encode coordinates individually
      .join('|'); // join with plain '|'

    return (
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${encodeURIComponent(origin)}` +
      `&destination=${encodeURIComponent(destination)}` +
      (waypoints ? `&waypoints=${waypoints}` : '') +
      `&travelmode=driving`
    );
  };

  const handleGoogle = async () => {
    const url = buildMapsUrl();
    console.log(url);
    if (!url) {
      Alert.alert('Route Error', 'Not enough locations to navigate');
      return;
    }

    try {
      const supported = await Linking.openURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Not Supported',
          'This URL cannot be opened on your device.',
        );
      }
    } catch (err) {
      console.error('Error opening URL:', err);
      Alert.alert('Error', 'Cannot open Google Maps or browser.');
    }
  };

  // Navigation View with integrated DriverMap
  if (showNavigationView && currentRide) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        {/* Navigation Header */}
        <View className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setShowNavigationView(false)}
              className="p-2"
            >
              <AntIcon name="arrowleft" size={24} color="#374151" />
            </TouchableOpacity>

            <View className="flex-1 mx-4">
              <Text className="text-lg font-bold text-gray-900">
                {currentRide.userName}
              </Text>
              <Text className="text-sm text-gray-600">
                Navigating to {currentRide.locations?.length || 0} locations
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => callCustomer(currentRide.userPhone)}
              className="bg-green-600 p-2 rounded-lg"
            >
              <Icon name="call" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Integrated DriverMap */}
        {/* <View className="flex-1">
          {driverLocation && (
            <DriverMap
              driverLocation={driverLocation}
              locations={currentRide.locations || []}
              height="100%"
            />
          )}
        </View> */}

        {/* Bottom Action Bar */}
        <View className="bg-white border-t border-gray-200 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-lg font-bold text-gray-900">
                Route Optimized
              </Text>
              <Text className="text-sm text-gray-600">
                {currentRide.locations?.length || 0} stops • ₹{currentRide.fare}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-lg"
              onPress={completeRide}
            >
              <Text className="text-white text-center font-semibold">
                Complete Ride
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Main Driver Home View
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm border-b border-gray-100 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View className="flex-row items-center space-x-4 gap-3">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center">
                <Text className="text-white text-lg font-bold">
                  {rider?.username?.charAt(0) || 'D'}
                </Text>
              </View>
              <View>
                <Text className="text-xl font-bold text-gray-900">
                  {rider?.username || 'Driver'}
                </Text>
                <Text className="text-xs text-gray-600">
                  RideEasy Driver App
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-100 border border-red-200"
          >
            <View className="flex-row items-center space-x-2">
              <Icon name="logout" size={16} color="#DC2626" />
              <Text className="font-medium text-red-700">Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Location Status */}
        <View className="bg-white mx-4 mt-4 rounded-xl shadow-sm border border-gray-100 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-3">
              <View
                className={`w-3 h-3 rounded-full ${
                  isLocationEnabled ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <Text className="text-gray-700 font-medium">
                {isLocationEnabled
                  ? 'Location Tracking Active'
                  : 'Location Tracking Disabled'}
              </Text>
            </View>

            {!isLocationEnabled && (
              <TouchableOpacity
                onPress={requestLocationPermission}
                className="bg-blue-600 px-3 py-1 rounded-lg"
              >
                <Text className="text-white text-sm font-medium">Enable</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Current Ride */}
        {currentRide && (
          <View className="bg-white mx-4 mt-4 rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <View className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-900">
                  Active Ride
                </Text>
                <View className="bg-blue-600 px-4 py-2 rounded-full shadow-sm">
                  <Text className="text-white text-sm font-semibold uppercase tracking-wide">
                    {currentRide.status}
                  </Text>
                </View>
              </View>
            </View>

            {/* Main Content */}
            <View className="px-6 py-5">
              {/* Driver/User Info Section */}
              <View className="bg-gray-50 rounded-xl p-4 mb-5">
                <View className="flex-row items-center">
                  <View className="bg-blue-100 p-3 rounded-full mr-4">
                    <FontAwesome name="user" size={20} color="#2563EB" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-1">
                      {currentRide.userName}
                    </Text>
                    <Text className="text-gray-600 text-base">
                      {currentRide.userPhone}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Route Information */}
              <View className="mb-5">
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  Route Details ({currentRide.locations?.length || 0} stops)
                </Text>

                {/* Show all locations */}
                {/* {currentRide.locations?.map((loc, index) => (
                  <View key={index} className="flex-row items-start mb-4">
                    <View
                      className={`${
                        index === 0
                          ? 'bg-green-100'
                          : index === currentRide.locations.length - 1
                          ? 'bg-red-100'
                          : 'bg-blue-100'
                      } p-2 rounded-full mr-4 mt-1`}
                    >
                      <FontAwesome
                        name={
                          index === 0
                            ? 'map-marker'
                            : index === currentRide.locations.length - 1
                            ? 'flag-checkered'
                            : 'circle'
                        }
                        size={16}
                        color={d
                          index === 0
                            ? '#059669'
                            : index === currentRide.locations.length - 1
                            ? '#DC2626'
                            : '#2563EB'
                        }
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-sm font-medium mb-1 ${
                          index === 0
                            ? 'text-green-700'
                            : index === currentRide.locations.length - 1
                            ? 'text-red-700'
                            : 'text-blue-700'
                        }`}
                      >
                        {index === 0
                          ? 'PICKUP'
                          : index === currentRide.locations.length - 1
                          ? 'DESTINATION'
                          : `STOP ${index}`}
                      </Text>
                      <Text className="text-gray-800 text-base leading-relaxed">
                        {loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}
                      </Text>
                    </View>
                  </View>
                ))} */}

                {/* Route Details */}
                {currentRide.locations?.map((loc, index) => (
                  <LocationVisitTracker
                    key={index}
                    label={
                      index === 0
                        ? 'PICKUP'
                        : index === currentRide.locations.length - 1
                        ? 'DESTINATION'
                        : `STOP ${index}`
                    }
                    coords={loc}
                    distance={proximityStatus[index]?.distance ?? null}
                    isNearby={proximityStatus[index]?.isNearby}
                    threshold={PROXIMITY_THRESHOLD}
                    visited={!!visitedLocations[index]}
                    visitTime={visitedLocations[index] || null}
                    onVisit={() => handleMarkVisited(index)}
                  />
                ))}
              </View>

              {/* Trip Details & Action */}
              <View className="bg-gray-50 rounded-xl p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-col items-center space-x-6">
                    <View className="items-center">
                      <Text className="text-sm text-gray-500 mb-1">
                        Total Fare
                      </Text>
                      <Text className="text-2xl font-bold text-green-600">
                        ₹{currentRide.fare}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleGoogle}
                    className="bg-blue-600 px-6 py-3 rounded-xl shadow-sm active:bg-blue-700"
                  >
                    <View className="flex-row items-center">
                      <FontAwesome name="navigation" size={16} color="white" />
                      <Text className="text-white font-semibold ml-2">
                        Navigatee
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* No Active Rides */}
        {!currentRide && (
          <View className="bg-white mx-4 mt-4 mb-6 rounded-xl shadow-sm border border-gray-100 p-6">
            <View className="items-center">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Icon name="directions-car" size={32} color="#6B7280" />
              </View>
              <Text className="text-lg font-bold text-gray-900 mb-2">
                No Active Rides
              </Text>
              <Text className="text-gray-600 text-center">
                You're ready to receive ride requests. Make sure your status is
                set to "Available".
              </Text>
            </View>
          </View>
        )}

        {/* Map Overview */}
        {isLocationEnabled && driverLocation && (
          <View className="bg-white mx-4 mt-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-bold text-gray-900">
                Your Location
              </Text>
              <Text className="text-sm text-gray-600">
                Lat: {driverLocation.lat.toFixed(4)}, Lng:{' '}
                {driverLocation.lng.toFixed(4)}
              </Text>
            </View>

            {/* <View style={{ height: 250 }}>
              <DriverMap
                driverLocation={driverLocation}
                locations={currentRide?.locations || []}
                height={250}
              />
            </View> */}
          </View>
        )}

        {/* Driver Stats */}
        <View className="bg-white mx-4 mt-4 mb-6 rounded-xl shadow-sm border border-gray-100 p-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Today's Stats
          </Text>

          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-blue-600">
                {assignedRides.length}
              </Text>
              <Text className="text-sm text-gray-600">Rides</Text>
            </View>

            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-green-600">
                ₹
                {assignedRides.reduce((sum, ride) => sum + (ride.fare || 0), 0)}
              </Text>
              <Text className="text-sm text-gray-600">Earnings</Text>
            </View>

            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-purple-600">5.0</Text>
              <Text className="text-sm text-gray-600">Rating</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverHomePage;
