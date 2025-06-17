import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';

const NavigationScreen = ({ route, navigation }) => {
  const { customerName, customerPhone, pickupCoords } = route.params;
  const webViewRef = useRef(null);
  const watchId = useRef(null);

  // Start GPS tracking and inject location updates into WebView
  useEffect(() => {
    watchId.current = Geolocation.watchPosition(
      ({ coords }) => {
        const jsCode = `
          if (window.updateDriverLocation) {
            window.updateDriverLocation(${coords.latitude}, ${coords.longitude});
          }
          true;
        `;
        webViewRef.current?.injectJavaScript(jsCode);
      },
      err => console.error('GPS error', err),
      { enableHighAccuracy: true, distanceFilter: 1, interval: 2000 }
    );
    return () => Geolocation.clearWatch(watchId.current);
  }, []);

  // Header with back nav, title, and call
  const Header = () => (
    <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b">
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text className="text-blue-600 font-semibold">Back</Text>
      </TouchableOpacity>
      <Text className="text-lg font-bold">{customerName}</Text>
      <TouchableOpacity onPress={() => Linking.openURL(`tel:${customerPhone}`)}>
        <Text className="text-blue-600 font-semibold">Call</Text>
      </TouchableOpacity>
    </View>
  );

  // HTML content for WebView: map + blue route + live updates
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
        <style>body,#map{margin:0;padding:0;height:100vh;width:100vw;}</style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          const pickup = [${pickupCoords.lat}, ${pickupCoords.lng}];
          const map = L.map('map').setView(pickup, 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

          // Driver marker setup
          const driverIcon = L.divIcon({
            html: '🚗', iconSize: [24,24]
          });
          const driverMarker = L.marker(pickup, { icon: driverIcon }).addTo(map);

          // Blue polyline from driver to pickup
          const routeLine = L.polyline([pickup, pickup], {
            color: '#3B82F6', weight: 4
          }).addTo(map);

          // Expose update function for live location
          window.updateDriverLocation = (lat, lng) => {
            const pos = [lat, lng];
            driverMarker.setLatLng(pos);
            routeLine.setLatLngs([pos, pickup]);
            map.panTo(pos, { animate: true });
          };
        </script>
      </body>
    </html>
  `;

  return (
    <SafeAreaView className="flex-1">
      <Header />
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        javaScriptEnabled
        domStorageEnabled
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
};

export default NavigationScreen;
