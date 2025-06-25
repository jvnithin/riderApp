// import React, { useState, useEffect, useRef, useContext } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   RefreshControl,
//   Alert,
//   PermissionsAndroid,
//   Platform,
//   Dimensions,
//   Linking,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { WebView } from 'react-native-webview';
// import Geolocation from 'react-native-geolocation-service';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import AntIcon from 'react-native-vector-icons/AntDesign';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import socketInstance from '../services/socketService';
// import axios from 'axios';
// import RiderContext from '../context/RiderContext';
// import { AppState } from 'react-native';

// const DriverHomePage = ({ navigation }) => {
//   const { apiUrl, rider, location } = useContext(RiderContext);
//   const [driverLocation, setDriverLocation] = useState(null);

//   const [assignedRides, setAssignedRides] = useState([]);
//   const [currentRide, setCurrentRide] = useState(null);

//   const [refreshing, setRefreshing] = useState(false);
//   const [isLocationEnabled, setIsLocationEnabled] = useState(false);
//   const [showNavigationView, setShowNavigationView] = useState(false);
//   const webViewRef = useRef(null);
//   const locationWatchId = useRef(null);
//   // const navigation = useNavigation()
//   const getActiveRides = async () => {
//     const token = await AsyncStorage.getItem('token');
//     try {
//       const response = await axios.get(`${apiUrl}/driver/assigned-rides`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       await setAssignedRides(response.data);
//       // console.log(response.data);
//       setCurrentRide(response.data[0]);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const getSocketInstance = async () => {
//     const socket = await socketInstance.getSocket('rider');
//     console.log("Connection established",socket);
//     await socket.connect();
//     setSocket(socket);
//   };
//   const navigateIfNoToken = async () => {
//     const token = await AsyncStorage.getItem('token');
//     if (!token) {
//       navigation.navigate('SignIn');
//     }
//   };
//   const appState = useRef(AppState.currentState);
//   const [socket, setSocket] = useState(null);
//   useEffect(() => {
//     navigateIfNoToken();
//     // console.log(assignedRides);
//     getSocketInstance();
//     const handleAppStateChange = () => {};
//     socket?.on('new-ride', rideData => {
//       // console.log('Got a ride');
//       // console.log(rideData);
//       setAssignedRides([...assignedRides, rideData]);
//       setCurrentRide(rideData);
//       // console.log('RIde Details:', rideData);
//     });

//     requestLocationPermission();

//     // loadAssignedRides();

//     return () => {
//       if (locationWatchId.current) {
//         Geolocation.clearWatch(locationWatchId.current);
//       }
//       if (socket) {
//         socket.off('new-ride');
//       }
//     };
//   }, [socket]);

//   useEffect(() => {
//   const handleAppStateChange = nextAppState => {
//     console.log('AppState changed:', appState.current, '→', nextAppState);

//     // Only log, don't disconnect socket on background
//     if (
//       appState.current.match(/inactive|background/) &&
//       nextAppState === 'active'
//     ) {
//       // App comes back to foreground
//       if (socket && !socket.connected) {
//         console.log('Reconnecting socket...');
//         getSocketInstance();
//       }
//     }

//     appState.current = nextAppState;
//   };

//   const subscription = AppState.addEventListener(
//     'change',
//     handleAppStateChange,
//   );

//   return () => {
//     if (subscription) subscription.remove();
//   };
// }, []);

//   useEffect(() => {
//     getActiveRides();
//   }, []);
//   const requestLocationPermission = async () => {
//     try {
//       if (Platform.OS === 'android') {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//           {
//             title: 'Location Permission',
//             message: 'Driver app needs access to your location for navigation',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           },
//         );

//         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//           setIsLocationEnabled(true);
//           startLocationTracking();
//         }
//       } else {
//         startLocationTracking();
//       }
//     } catch (err) {
//       console.warn(err);
//     }
//   };

//   const startLocationTracking = () => {
//     locationWatchId.current = Geolocation.watchPosition(
//       async position => {
//         const { latitude, longitude } = position.coords;
//         const newDriverLocation = { lat: latitude, lng: longitude };
//         setDriverLocation(newDriverLocation);

//         setIsLocationEnabled(true);

//         // Send updated location to WebView
//         if (webViewRef.current) {
//           webViewRef.current.postMessage(
//             JSON.stringify({
//               type: 'updateDriverLocation',
//               location: newDriverLocation,
//             }),
//           );
//         }

//         // Update backend with driver location
//         updateDriverLocationOnServer(newDriverLocation);
//       },
//       error => {
//         // console.log('Location error:', error);
//         Alert.alert('Error', 'Unable to get your location. Please enable GPS.');
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 15000,
//         maximumAge: 10000,
//         distanceFilter: 1, // Update every 10 meters
//       },
//     );
//   };
//   //   let lastSentLocation = null;
//   //   const minDistanceThreshold = 5; // meters

//   //   locationWatchId.current = Geolocation.watchPosition(
//   //     async position => {
//   //       const { latitude, longitude } = position.coords;
//   //       const newDriverLocation = { lat: latitude, lng: longitude };

//   //       // Only update if moved significantly to reduce refresh frequency
//   //       if (lastSentLocation) {
//   //         const distance = calculateDistance(
//   //           lastSentLocation.lat, lastSentLocation.lng,
//   //           latitude, longitude
//   //         );
//   //         if (distance < minDistanceThreshold) return;
//   //       }

//   //       setDriverLocation(newDriverLocation);
//   //       lastSentLocation = newDriverLocation;

//   //       // Send optimized update to WebView
//   //       if (webViewRef.current) {
//   //         webViewRef.current.postMessage(
//   //           JSON.stringify({
//   //             type: 'updateDriverLocation',
//   //             location: newDriverLocation,
//   //             timestamp: Date.now()
//   //           })
//   //         );
//   //       }

//   //       updateDriverLocationOnServer(newDriverLocation);
//   //     },
//   //     error => {
//   //       console.log('Location error:', error);
//   //       Alert.alert('Error', 'Unable to get your location. Please enable GPS.');
//   //     },
//   //     {
//   //       enableHighAccuracy: true,
//   //       timeout: 15000,
//   //       maximumAge: 5000, // Increased cache time
//   //       distanceFilter: 3, // Reduced sensitivity for smoother updates
//   //     }
//   //   );
//   // };

//   // Helper function to calculate distance between two points

//   const updateDriverLocationOnServer = async location => {
//     // console.log('=== Starting location update ===');
//     // console.log('Location:', location);
//     // console.log('Current ride exists:', !!currentRide);
//     // console.log('Rider exists:', !!rider);
//     // console.log('Socket exists:', !!socket);
//     // console.log(currentRide);
//     if (!currentRide) {
//       // console.log(currentRide);
//       // console.log('Early return: no current ride');
//       console.log('here tooo ', currentRide);
//       return;
//     }

//     try {
//       // console.log('Current ride data:', JSON.stringify(currentRide, null, 2));
//       // console.log('Rider data:', JSON.stringify(rider, null, 2));

//       // // Check each property before accessing
//       // console.log('Checking currentRide._id:', currentRide._id);
//       // console.log('Checking currentRide.user:', currentRide.user);
//       // console.log('Checking rider._id:', rider._id);
//       console.log('here ', currentRide);
//       const payload = {
//         location,
//         riderId: rider._id,
//         rideId: currentRide._id,
//         userId: currentRide.user,
//       };

//       // console.log('Payload to emit:', payload);
//       socket?.emit('driver-location', payload);
//       // console.log('=== Location update completed ===');
//     } catch (error) {
//       console.error('=== Error in location update ===');
//       console.error('Error details:', error);
//       console.error('Error stack:', error.stack);
//     }
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     // await loadAssignedRides();
//     setRefreshing(false);
//   };
//   const startNavigation = () => {
//     if (currentRide && driverLocation) {
//       setShowNavigationView(true);
//     }
//     // navigation.navigate("Navigation",{
//     //   userLocation:currentRide.pickupLocation.coordinates,
//     //   driverLocation:driverLocation,
//     // })
//   };

//   const callCustomer = phoneNumber => {
//     Linking.openURL(`tel:${phoneNumber}`);
//   };
//   // current working one
//   //   const generateNavigationHTML = () => {
//   //   const driverLat = driverLocation?.lat || 40.7128;
//   //   const driverLng = driverLocation?.lng || -74.006;
//   //   const customerLat = currentRide?.locations[0]?.lat || 41.72;
//   //   const customerLng = currentRide?.locations[0]?.lng || -74.01;

//   //   return `
//   // <!DOCTYPE html>
//   // <html>
//   // <head>
//   //   <meta charset="utf-8" />
//   //   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   //   <title>Driver Navigation</title>
//   //   <link
//   //     rel="stylesheet"
//   //     href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
//   //   />
//   //   <link
//   //     rel="stylesheet"
//   //     href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css"
//   //   />

//   //   <style>
//   //     body { margin: 0; padding: 0; }
//   //     #map { height: 100vh; width: 100vw; }
//   //   </style>
//   // </head>
//   // <body>
//   //   <div id="map"></div>

//   //   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
//   //   <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
//   //   <script src="https://unpkg.com/lrm-openrouteservice/dist/lrm-openrouteservice.min.js"></script>
//   //   <script>
//   //     // Initialize map centered on driver
//   //     const map = L.map('map').setView([${driverLat}, ${driverLng}], 17);

//   //     // Add OpenStreetMap tiles
//   //     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

//   //     // Custom driver icon
//   //     const driverIcon = L.divIcon({
//   //       html: '<div style="background-color:#3B82F6;width:16px;height:16px;border-radius:50%;border:2px solid white;position:relative;"><div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:12px;">🚗</div></div>',
//   //       iconSize: [20, 20],
//   //       className: 'custom-div-icon'
//   //     });

//   //     // Custom customer icon
//   //     const customerIcon = L.divIcon({
//   //       html: '<div style="background-color:#EF4444;width:16px;height:16px;border-radius:50%;border:2px solid white;position:relative;"><div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:12px;">📍</div></div>',
//   //       iconSize: [20, 20],
//   //       className: 'custom-div-icon'
//   //     });

//   //     // Place markers
//   //     const driverMarker = L.marker([${driverLat}, ${driverLng}], { icon: driverIcon })
//   //       .addTo(map)
//   //       .bindPopup('Driver Location');
//   //     const customerMarker = L.marker([${customerLat}, ${customerLng}], { icon: customerIcon })
//   //       .addTo(map)
//   //       .bindPopup('Customer Location');

//   //     // Routing control using OpenRouteService
//   //     const routingControl = L.Routing.control({
//   //       waypoints: [
//   //         L.latLng(${driverLat}, ${driverLng}),
//   //         L.latLng(${customerLat}, ${customerLng})
//   //       ],
//   //       routeWhileDragging: false,
//   //       createMarker: () => null,
//   //       lineOptions: {
//   //         styles: [{ color: '#3B82F6', weight: 6, opacity: 0.9 }]
//   //       },
//   //       show: false
//   //     }).addTo(map);

//   //     // Live driver updates
//   //     window.updateDriverLocation = (lat, lng) => {
//   //       driverMarker.setLatLng([lat, lng]);
//   //       routingControl.setWaypoints([
//   //         L.latLng(lat, lng),
//   //         L.latLng(${customerLat}, ${customerLng})
//   //       ]);
//   //       map.panTo([lat, lng]);
//   //     };

//   //     // Listen for React Native messages
//   //     window.addEventListener('message', (event) => {
//   //       try {
//   //         const data = JSON.parse(event.data);
//   //         if (data.type === 'updateDriverLocation') {
//   //           window.updateDriverLocation(data.location.lat, data.location.lng);
//   //         }
//   //       } catch (e) {
//   //         console.error('Invalid message:', e);
//   //       }
//   //     });
//   //   </script>
//   // </body>
//   // </html>
//   // `;
//   // };

//   //map with multiple markers
// //   const generateNavigationHTML = () => {
// //   const driverLat = driverLocation?.lat || 40.7128;
// //   const driverLng = driverLocation?.lng || -74.006;
// //   const locations = currentRide?.locations || [];

// //   // Prepare waypoints including driver's location
// //   const waypoints = [
// //     [driverLng, driverLat], // Driver position
// //     ...locations.map(loc => [loc.lng, loc.lat]) // All locations
// //   ];

// //   return `
// // <!DOCTYPE html>
// // <html>
// // <head>
// //   <meta charset="utf-8" />
// //   <meta name="viewport" content="width=device-width, initial-scale=1.0">
// //   <title>Driver Navigation</title>
// //   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
// //   <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
// //   <style>
// //     body { margin: 0; padding: 0; }
// //     #map { height: 100vh; width: 100vw; }
// //   </style>
// // </head>
// // <body>
// //   <div id="map"></div>

// //   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
// //   <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
// //   <script src="https://unpkg.com/lrm-openrouteservice/dist/lrm-openrouteservice.min.js"></script>
// //   <script>
// //     // Initialize map
// //     const map = L.map('map').setView([${driverLat}, ${driverLng}], 13);
// //     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// //     // Custom icons
// //     const driverIcon = L.divIcon({
// //       html: '<div style="background-color:#3B82F6;width:16px;height:16px;border-radius:50%;border:2px solid white;position:relative;"><div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:12px;">🚗</div></div>',
// //       iconSize: [20, 20],
// //       className: 'custom-div-icon'
// //     });

// //     const locationIcon = L.divIcon({
// //       html: '<div style="background-color:#EF4444;width:16px;height:16px;border-radius:50%;border:2px solid white;position:relative;"><div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:12px;">📍</div></div>',
// //       iconSize: [20, 20],
// //       className: 'custom-div-icon'
// //     });

// //     // Add driver marker
// //     const driverMarker = L.marker([${driverLat}, ${driverLng}], { icon: driverIcon })
// //       .addTo(map)
// //       .bindPopup('Driver Location');

// //     // Add location markers
// //     const locationMarkers = [];
// //     ${locations.map((loc, i) => `
// //       locationMarkers.push(L.marker([${loc.lat}, ${loc.lng}], { icon: locationIcon })
// //         .addTo(map)
// //         .bindPopup('Location ${i+1}'));
// //     `).join('')}

// //     // ORS router with optimization
// //     const orsRouter = new L.Routing.OpenRouteService(
// //       '5b3ce3597851110001cf62484eece1b29db34a13972389d9f81b3d9a', // Replace with your API key
// //       {
// //         profile: 'driving-car',
// //         optimize_waypoints: true, // Enable optimization
// //         api_version: 'v2'
// //       }
// //     );

// //     // Routing control
// //     const routingControl = L.Routing.control({

// //       waypoints: [
// //         L.latLng(${driverLat}, ${driverLng}),
// //         ${locations.map(loc => `L.latLng(${loc.lat}, ${loc.lng})`).join(',\n')}
// //       ],
// //       routeWhileDragging: false,
// //       createMarker: () => null,
// //       lineOptions: { styles: [{ color: '#3B82F6', weight: 6, opacity: 0.9 }] },
// //       show: true
// //     }).addTo(map);

// //     // Live driver updates
// //     window.updateDriverLocation = (lat, lng) => {
// //       driverMarker.setLatLng([lat, lng]);
// //       routingControl.setWaypoints([
// //         L.latLng(lat, lng),
// //         ...routingControl.getWaypoints().slice(1)
// //       ]);
// //       map.panTo([lat, lng]);
// //     };

// //     // Message listener
// //     window.addEventListener('message', (event) => {
// //       try {
// //         const data = JSON.parse(event.data);
// //         if (data.type === 'updateDriverLocation') {
// //           window.updateDriverLocation(data.location.lat, data.location.lng);
// //         }
// //       } catch (e) {
// //         console.error('Invalid message:', e);
// //       }
// //     });
// //   </script>
// // </body>
// // </html>
// //   `;
// // };

// // ors key usage
// // const generateNavigationHTML = () => {
// //   const driverLat = driverLocation?.lat || 40.7128;
// //   const driverLng = driverLocation?.lng || -74.006;
// //   const customerLat = currentRide?.pickupLocation?.coordinates?.lat || 41.72;
// //   const customerLng = currentRide?.pickupLocation?.coordinates?.lng || -74.01;

// //   return `
// // <!DOCTYPE html>
// // <html>
// // <head>
// //   <meta charset="utf-8" />
// //   <meta name="viewport" content="width=device-width, initial-scale=1.0">
// //   <title>Driver Navigation</title>
// //   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
// //   <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
// //   <style>
// //     body { margin: 0; padding: 0; }
// //     #map { height: 100vh; width: 100vw; }
// //   </style>
// // </head>
// // <body>
// //   <div id="map"></div>

// //   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
// //   <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
// //   <script src="https://unpkg.com/lrm-openrouteservice/dist/lrm-openrouteservice.min.js"></script>

// //   <script>
// //     // Initialize map
// //     const map = L.map('map').setView([${driverLat}, ${driverLng}], 17);
// //     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// //     // Custom icons
// //     const driverIcon = L.divIcon({
// //       html: '<div style="background-color:#3B82F6;width:16px;height:16px;border-radius:50%;border:2px solid white;position:relative;"><div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:12px;">🚗</div></div>',
// //       iconSize: [20, 20],
// //       className: 'custom-div-icon'
// //     });

// //     const customerIcon = L.divIcon({
// //       html: '<div style="background-color:#EF4444;width:16px;height:16px;border-radius:50%;border:2px solid white;position:relative;"><div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:12px;">📍</div></div>',
// //       iconSize: [20, 20],
// //       className: 'custom-div-icon'
// //     });

// //     // Add markers
// //     const driverMarker = L.marker([${driverLat}, ${driverLng}], { icon: driverIcon })
// //       .addTo(map)
// //       .bindPopup('Driver Location');

// //     const customerMarker = L.marker([${customerLat}, ${customerLng}], { icon: customerIcon })
// //       .addTo(map)
// //       .bindPopup('Customer Location');

// //     // ALTERNATIVE APPROACH: Directly use OpenRouteService router
// //     const orsRouter = new L.Routing.OpenRouteService(
// //       '5b3ce3597851110001cf62484eece1b29db34a13972389d9f81b3d9a', // Your API key
// //       {
// //         profile: 'driving-car',
// //         host: 'https://api.openrouteservice.org',
// //         service: 'directions',
// //         api_version: 'v2'
// //       }
// //     );

// //     // Routing control with error handling
// //     const routingControl = L.Routing.control({
// //       router: orsRouter,
// //       waypoints: [
// //         L.latLng(${driverLat}, ${driverLng}),
// //         L.latLng(${customerLat}, ${customerLng})
// //       ],
// //       routeWhileDragging: false,
// //       createMarker: () => null,
// //       lineOptions: { styles: [{ color: '#3B82F6', weight: 6, opacity: 0.9 }] },
// //       show: true, // Show the route control panel temporarily for debugging
// //       collapsible: true,
// //       addWaypoints: false
// //     }).addTo(map);

// //     // Add event listeners for debugging
// //     routingControl.on('routesfound', (e) => {
// //       console.log('Routes found:', e.routes);
// //     });

// //     routingControl.on('routingerror', (e) => {
// //       console.error('Routing error:', e.error);
// //       alert('Routing failed: ' + e.error.message);
// //     });

// //     // Update driver location function
// //     window.updateDriverLocation = (lat, lng) => {
// //       driverMarker.setLatLng([lat, lng]);
// //       routingControl.setWaypoints([
// //         L.latLng(lat, lng),
// //         L.latLng(${customerLat}, ${customerLng})
// //       ]);
// //       map.panTo([lat, lng]);
// //     };

// //     // React Native message listener
// //     window.addEventListener('message', (event) => {
// //       try {
// //         const data = JSON.parse(event.data);
// //         if (data.type === 'updateDriverLocation') {
// //           window.updateDriverLocation(data.location.lat, data.location.lng);
// //         }
// //       } catch (e) {
// //         console.error('Invalid message:', e);
// //       }
// //     });

// //     // Debug: Print Leaflet Routing Machine version
// //     console.log('LRM version:', L.Routing.version);
// //     console.log('ORS plugin version:', L.Routing.OpenRouteService ? 'loaded' : 'missing');
// //   </script>
// // </body>
// // </html>
// // `;
// // };
//   const handleLogout = async () => {
//     Alert.alert('Logout', 'Are you sure you want to logout?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Logout',
//         style: 'destructive',
//         onPress: async () => {
//           try {
//             // Clear stored authentication data
//             await AsyncStorage.removeItem('token');
//             // await AsyncStorage.removeItem('user');

//             // Disconnect socket if connected
//             if (socket) {
//               socketInstance.clearSocket();
//             }

//             // Clear location tracking
//             if (locationWatchId.current) {
//               Geolocation.clearWatch(locationWatchId.current);
//             }

//             // Navigate to login screen
//             navigation.reset({
//               index: 0,
//               routes: [{ name: 'SignIn' }],
//             });
//           } catch (error) {
//             console.error('Logout error:', error);
//             Alert.alert('Error', 'Failed to logout. Please try again.');
//           }
//         },
//       },
//     ]);
//   };

//   // console.log(rider)
//   if (showNavigationView && currentRide) {
//     return (
//       <SafeAreaView className="flex-1 bg-gray-900">
//         {/* Navigation Header */}
//         <View className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
//           <View className="flex-row items-center justify-between">
//             <TouchableOpacity
//               onPress={() => setShowNavigationView(false)}
//               className="p-2"
//             >
//               <Text>
//                 <AntIcon name="arrowleft" size={24} color="#374151" />
//               </Text>
//             </TouchableOpacity>

//             <View className="flex-1 mx-4">
//               <Text className="text-lg font-bold text-gray-900">
//                 {currentRide.userName}
//               </Text>
//               <Text className="text-sm text-gray-600">
//                 Navigating to Customer
//               </Text>
//             </View>

//             <TouchableOpacity
//               onPress={() => callCustomer(currentRide.userPhone)}
//               className="bg-green-600 p-2 rounded-lg"
//             >
//               <Icon name="call" size={20} color="white" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Navigation WebView */}
//         <View className="flex-1">
//           <WebView
//             ref={webViewRef}
//             source={{ html: generateNavigationHTML() }}
//             style={{ flex: 1 }}
//             javaScriptEnabled={true}
//             domStorageEnabled={true}
//             startInLoadingState={true}
//             scalesPageToFit={true}
//             onMessage={event => {
//               console.log('Message from WebView:', event.nativeEvent.data);
//             }}
//           />
//         </View>

//         {/* Bottom Action Bar */}
//         <View className="bg-white border-t border-gray-200 p-1">
//           <View className="flex-row items-center justify-between">
//             <View className="flex-1">
//               {/* <Text className="text-lg font-bold text-gray-900">
//                 {currentRide.pickupLocation.address}
//               </Text>
//               <Text className="text-sm text-gray-600">
//                 {currentRide.distance} • ${currentRide.fare}
//               </Text> */}
//             </View>

//             <TouchableOpacity
//               className="bg-blue-600 w-full px-6 py-3 rounded-lg"
//               onPress={async () => {
//                 try {
//                   const token = await AsyncStorage.getItem('token');
//                   // console.log(currentRide);
//                   const response = await axios.put(
//                     `${apiUrl}/driver/change-ride-status/${currentRide._id}`,
//                     { status: 'completed' },
//                     { headers: { Authorization: `Bearer ${token}` } },
//                   );
//                   // console.log(response.data);
//                   // console.log(currentRide._id);
//                   socket?.emit('ride-complete', {
//                     rideId: currentRide._id,
//                     userId: currentRide.user,
//                   });

//                   const updatedRides = assignedRides.filter(ride => {
//                     //  console.log(ride._id,currentRide._id)
//                     return ride._id.toString() !== currentRide._id.toString();
//                   });
//                   // console.log(updatedRides);
//                   setAssignedRides(updatedRides);
//                   if (updatedRides.length === 0) setCurrentRide(null);
//                   navigation.navigate('Home');
//                   setShowNavigationView(false);
//                   // setCurrentRide(null)
//                 } catch (error) {
//                   console.log('Arrived Status updation', error);
//                 }
//               }}
//             >
//               <Text className="text-white text-center font-semibold">
//                 Ride Completed
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-gray-50">
//       {/* Header */}
//       <View className="bg-white shadow-sm border-b border-gray-100 px-4 py-3">
//         <View className="flex-row items-center justify-between">
//           <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
//             <View className="flex-row items-center space-x-4 gap-3">
//               <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center">
//                 <Text className="text-white text-lg font-bold">
//                   {rider?.username.charAt(0)}
//                 </Text>
//               </View>
//               <View>
//                 <Text className="text-xl font-bold text-gray-900">
//                   {rider?.username}
//                 </Text>
//                 <Text className="text-xs text-gray-600">
//                   RideEasy Driver App
//                 </Text>
//               </View>
//             </View>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={handleLogout}
//             className="px-4 py-2 rounded-lg bg-red-100 border border-red-200"
//           >
//             <View className="flex-row items-center space-x-2">
//               <Icon name="logout" size={16} color="#DC2626" />
//               <Text className="font-medium text-red-700">Logout</Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <ScrollView
//         className="flex-1"
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         {/* Location Status */}
//         <View className="bg-white mx-4 mt-4 rounded-xl shadow-sm border border-gray-100 p-4">
//           <View className="flex-row items-center justify-between">
//             <View className="flex-row items-center space-x-3">
//               <View
//                 className={`w-3 h-3 rounded-full ${
//                   isLocationEnabled ? 'bg-green-500' : 'bg-red-500'
//                 }`}
//               />
//               <Text className="text-gray-700 font-medium">
//                 {isLocationEnabled
//                   ? 'Location Tracking Active'
//                   : 'Location Tracking Disabled'}
//               </Text>
//             </View>

//             {!isLocationEnabled && (
//               <TouchableOpacity
//                 onPress={requestLocationPermission}
//                 className="bg-blue-600 px-3 py-1 rounded-lg"
//               >
//                 <Text className="text-white text-sm font-medium">Enable</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//         {/* Current Ride */}
//         {currentRide && (
//           <View className="bg-white mx-4 mt-4 rounded-2xl shadow-md border border-gray-200 overflow-hidden">
//             {/* Header Section */}
//             <View className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
//               <View className="flex-row items-center justify-between">
//                 <Text className="text-xl font-bold text-gray-900">
//                   Active Ride
//                 </Text>
//                 <View className="bg-blue-600 px-4 py-2 rounded-full shadow-sm">
//                   <Text className="text-white text-sm font-semibold uppercase tracking-wide">
//                     {currentRide.status}
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             {/* Main Content */}
//             <View className="px-6 py-5">
//               {/* Driver/User Info Section */}
//               <View className="bg-gray-50 rounded-xl p-4 mb-5">
//                 <View className="flex-row items-center">
//                   <View className="bg-blue-100 p-3 rounded-full mr-4">
//                     <FontAwesome name="user" size={20} color="#2563EB" />
//                   </View>
//                   <View className="flex-1">
//                     <Text className="text-lg font-semibold text-gray-900 mb-1">
//                       {currentRide.userName}
//                     </Text>
//                     <Text className="text-gray-600 text-base">
//                       {currentRide.userPhone}
//                     </Text>
//                   </View>
//                 </View>
//               </View>

//               {/* Route Information */}
//               <View className="mb-5">
//                 <Text className="text-lg font-semibold text-gray-900 mb-4">
//                   Route Details
//                 </Text>

//                 {/* Pickup Location */}
//                 <View className="flex-row items-start mb-4">
//                   <View className="bg-green-100 p-2 rounded-full mr-4 mt-1">
//                     <FontAwesome name="map-marker" size={16} color="#059669" />
//                   </View>
//                   <View className="flex-1">
//                     <Text className="text-sm font-medium text-green-700 mb-1">
//                       PICKUP
//                     </Text>
//                     <Text className="text-gray-800 text-base leading-relaxed">
//                       {currentRide?.locations[0]?.lat} - {currentRide?.locations[0]?.lng}
//                     </Text>
//                   </View>
//                 </View>
//                 {/* Destination */}
//                 <View className="flex-row items-start">
//                   <View className="bg-red-100 p-2 rounded-full mr-4 mt-1">
//                     <FontAwesome
//                       name="flag-checkered"
//                       size={16}
//                       color="#DC2626"
//                     />
//                   </View>
//                   <View className="flex-1">
//                     <Text className="text-sm font-medium text-red-700 mb-1">
//                       DESTINATION
//                     </Text>
//                     <Text className="text-gray-800 text-base leading-relaxed">
//                       {currentRide?.locations[currentRide.locations.length - 1]?.lat} - {currentRide?.locations[currentRide.locations.length - 1]?.lng }
//                     </Text>
//                   </View>
//                 </View>
//               </View>

//               {/* Trip Details & Action */}
//               <View className="bg-gray-50 rounded-xl p-4">
//                 <View className="flex-row items-center justify-between">
//                   <View className="flex-col items-center space-x-6">
//                     <View className="items-center ">
//                       <Text className="text-sm text-gray-500 mb-1">
//                         Distance Fare
//                       </Text>
//                       {/* <Text className="text-base font-semibold text-gray-900">
//                         {currentRide.distance}
//                       </Text> */}
//                     </View>
//                     <View className="items-center">
//                       <Text className="text-2xl font-bold text-green-600">
//                         ₹{currentRide.fare}
//                       </Text>
//                     </View>
//                   </View>

//                   <TouchableOpacity
//                     onPress={startNavigation}
//                     className="bg-blue-600 px-6 py-3 rounded-xl shadow-sm active:bg-blue-700"
//                   >
//                     <View className="flex-row items-center">
//                       {/* <FontAwesome name="navigation" size={16} color="white" /> */}
//                       <Text className="text-white font-semibold ml-2">
//                         Navigate
//                       </Text>
//                     </View>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>
//           </View>
//         )}
//         {!currentRide && (
//           <View className="bg-white mx-4 mt-4 mb-6 rounded-xl shadow-sm border border-gray-100 p-6">
//             <View className="items-center">
//               <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
//                 <Icon name="directions-car" size={32} color="#6B7280" />
//               </View>
//               <Text className="text-lg font-bold text-gray-900 mb-2">
//                 No Active Rides
//               </Text>
//               <Text className="text-gray-600 text-center">
//                 You're ready to receive ride requests. Make sure your status is
//                 set to "Available".
//               </Text>
//             </View>
//           </View>
//         )}

//         {/* Map Overview */}
//         {isLocationEnabled && driverLocation && (
//           <View className="bg-white mx-4 mt-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//             <View className="p-4 border-b border-gray-100">
//               <Text className="text-lg font-bold text-gray-900">
//                 Your Location
//               </Text>
//               <Text className="text-sm text-gray-600">
//                 Lat: {driverLocation.lat.toFixed(4)}, Lng:{' '}
//                 {driverLocation.lng.toFixed(4)}
//               </Text>
//             </View>

//             <View style={{ height: 200 }}>
//               <WebView
//                 source={{
//                   html: `
//                     <!DOCTYPE html>
//                     <html>
//                     <head>
//                         <meta charset="utf-8" />
//                         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                         <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
//                         <style>
//                             body { margin: 0; padding: 0; }
//                             #map { height: 200px; width: 100vw; }
//                         </style>
//                     </head>
//                     <body>
//                         <div id="map"></div>
//                         <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
//                         <script>
//                             var map = L.map('map').setView([${driverLocation.lat}, ${driverLocation.lng}], 15);
//                             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

//                             var driverIcon = L.divIcon({
//                                 html: '<div style="background-color: #3B82F6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;">🚗</div>',
//                                 iconSize: [20, 20],
//                                 className: 'custom-div-icon'
//                             });

//                             L.marker([${driverLocation.lat}, ${driverLocation.lng}], {icon: driverIcon})
//                                 .addTo(map)
//                                 .bindPopup('Your Location');
//                         </script>
//                     </body>
//                     </html>
//                   `,
//                 }}
//                 style={{ flex: 1 }}
//                 javaScriptEnabled={true}
//                 domStorageEnabled={true}
//               />
//             </View>
//           </View>
//         )}
//         {/* Driver Stats */}
//         <View className="bg-white mx-4 mt-4 mb-6 rounded-xl shadow-sm border border-gray-100 p-4">
//           <Text className="text-lg font-bold text-gray-900 mb-4">
//             Today's Stats
//           </Text>

//           <View className="flex-row justify-between">
//             <View className="items-center flex-1">
//               <Text className="text-2xl font-bold text-blue-600">0</Text>
//               <Text className="text-sm text-gray-600">Rides</Text>
//             </View>

//             <View className="items-center flex-1">
//               <Text className="text-2xl font-bold text-green-600">₹0</Text>
//               <Text className="text-sm text-gray-600">Earnings</Text>
//             </View>

//             <View className="items-center flex-1">
//               <Text className="text-2xl font-bold text-purple-600">5</Text>
//               <Text className="text-sm text-gray-600">Rating</Text>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default DriverHomePage;