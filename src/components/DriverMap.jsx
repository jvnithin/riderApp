import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';

const ORS_API_KEY = '5b3ce3597851110001cf62484eece1b29db34a13972389d9f81b3d9a'; // 🎯 Replace with your actual ORS key

const DriverMap = ({ driverLocation, locations = [], height = '100%' }) => {
  const webRef = useRef(null);
  const [orsRoute, setOrsRoute] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // 1️⃣ Fetch ORS route in React Native
  useEffect(() => {
    async function fetchRoute() {
      if (driverLocation && locations.length > 0) {
        const coords = [
          [driverLocation.lng, driverLocation.lat],
          ...locations.map(l => [l.lng, l.lat]),
        ];

        try {
          const res = await axios.post(
            'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
            { coordinates: coords },
            { headers: { Authorization: ORS_API_KEY } }
          );
          setOrsRoute(res.data);
        } catch (e) {
          console.error('ORS routing error:', e);
        }
      }
    }
    fetchRoute();
    
  }, [driverLocation, locations]);

  // 2️⃣ Build HTML for WebView
  const buildHtml = () => {
    const routeGeom = orsRoute
      ? JSON.stringify(orsRoute.features[0].geometry.coordinates)
      : '[]';
    const driverLng = driverLocation?.lng || 0;
    const driverLat = driverLocation?.lat || 0;

    return `
      <!DOCTYPE html><html><head><meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ORS Driver Map</title>
      <link href="https://cdn.jsdelivr.net/npm/ol@v8.2.0/ol.css" rel="stylesheet" />
      <style>html, body, #map { margin:0;padding:0;height:100%;width:100% }</style>
      </head><body><div id="map"></div>
      <script src="https://cdn.jsdelivr.net/npm/ol@v8.2.0/dist/ol.js"></script>
      <script>
        const map = new ol.Map({
          target: 'map',
          layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
          view: new ol.View({ center: ol.proj.fromLonLat([${driverLng},${driverLat}]), zoom: 13 })
        });
        const vectorSource = new ol.source.Vector();
        const vectorLayer = new ol.layer.Vector({ source: vectorSource });
        map.addLayer(vectorLayer);

        // Driver marker
        const driverFeature = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([${driverLng}, ${driverLat}])),
          name: 'driver'
        });
        driverFeature.setStyle(new ol.style.Style({
          image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({ color: '#3B82F6' }),
            stroke: new ol.style.Stroke({ color: 'white', width: 2 })
          }),
          text: new ol.style.Text({ text: '🚗', font: '16px Arial', offsetY: -20 })
        }));
        vectorSource.addFeature(driverFeature);

        // Stops
        ${locations
          .map(
            (l, i) => `
          const f${i} = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([${l.lng},${l.lat}])),
            name: 'stop${i}'
          });
          f${i}.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
              radius: 6, fill: new ol.style.Fill({ color: '#EF4444' }),
              stroke: new ol.style.Stroke({ color: 'white', width: 2 })
            }),
            text: new ol.style.Text({ text: '📍', font: '14px Arial', offsetY: -15 })
          }));
          vectorSource.addFeature(f${i});
        `,
          )
          .join('')}

        // ORS route line
        const routeCoords = ${routeGeom}.map(c => ol.proj.fromLonLat(c));
        if (routeCoords.length > 1) {
          const routeFeature = new ol.Feature({
            geometry: new ol.geom.LineString(routeCoords)
          });
          routeFeature.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({ color: '#3B82F6', width: 5 })
          }));
          vectorSource.addFeature(routeFeature);
          map.getView().fit(vectorSource.getExtent(), { padding: [50,50,50,50] });
        }

        // Animate driver updates
        window.updateDriver = (lat, lng) => {
          driverFeature.getGeometry().setCoordinates(ol.proj.fromLonLat([lng, lat]));
        };

        window.addEventListener('message', e => {
          const m = JSON.parse(e.data);
          if (m.type === 'updateDriver') {
            window.updateDriver(m.lat, m.lng);
          }
        });

        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage('mapReady');
        }
      </script></body></html>`;
  };

  // 3️⃣ Send location updates to WebView
  useEffect(() => {
    if (mapReady && driverLocation && webRef.current) {
      webRef.current.postMessage(
        JSON.stringify({
          type: 'updateDriver',
          lat: driverLocation.lat,
          lng: driverLocation.lng,
        }),
      );
    }
  }, [driverLocation, mapReady]);

  return (
    <View
      style={[
        styles.container,
        { height: typeof height === 'number' ? height : '100%' },
      ]}
    >
      {!mapReady && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html: buildHtml() }}
        onMessage={e => {
          if (e.nativeEvent.data === 'mapReady') setMapReady(true);
        }}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        style={styles.webView}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  webView: { backgroundColor: '#fff' },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default DriverMap;
