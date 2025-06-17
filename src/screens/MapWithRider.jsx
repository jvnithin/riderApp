// src/components/MapWithRider.jsx

// import React, { useEffect, useRef, useState } from 'react';
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Polyline,
//   useMap
// } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// // Custom Bike Icon
// const bikeIcon = new L.Icon({
//   iconUrl: 'https://cdn-icons-png.flaticon.com/512/3177/3177361.png',
// // iconUrl: 'https://maps.google.com/mapfiles/kml/shapes/motorcycling.png',
//   iconSize: [40, 40],
//   iconAnchor: [20, 20],
// });

// // Component to Fit Map to Route Bounds
// function FitBounds({ bounds }) {
//   const map = useMap();
//   useEffect(() => {
//     if (bounds.length > 0) {
//       map.fitBounds(bounds);
//     }
//   }, [bounds, map]);
//   return null;
// }

// export default function MapWithRider({driverLocation,userLocation}) {
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [riderPos, setRiderPos] = useState(null);
//   const riderIndexRef = useRef(0);

//   // Fetch Route from OSRM
//   useEffect(() => {
//     const fetchRoute = async () => {
//       const res = await fetch(
//         `https://router.project-osrm.org/route/v1/driving/${driverLocation.lng},${driverLocation.lat};${userLocation.lng},${userLocation.lat}?overview=full&geometries=geojson`
//       );
//       const data = await res.json();
//       const coords = data.routes[0].geometry.coordinates.map(
//         ([lng, lat]) => [lat, lng] // convert to Leaflet format
//       );
//       setRouteCoords(coords);
//       // (coords[0]);
//     };

//     fetchRoute();
//   }, []);

//   // Animate Rider
//   useEffect(() => {
//     if (routeCoords.length === 0) return;

//     const interval = setInterval(() => {
//       if (riderIndexRef.current < routeCoords.length - 1) {
//         setRiderPos(routeCoords[riderIndexRef.current]);
//         riderIndexRef.current += 1;
//       } else {
//         clearInterval(interval);
//       }
//     }, 50); // Speed (ms)

//     return () => clearInterval(interval);
//   }, [routeCoords]);

//   return (
//     <MapContainer
//       center={[17.42, 78.455]}
//       zoom={14}
//       style={{ height: '100vh', width: '100%' }}
//     >
//       <TileLayer
//         attribution='&copy; OpenStreetMap contributors'
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />

//       {routeCoords.length > 0 && (
//         <>
//           <Polyline positions={routeCoords} color="blue" weight={5} />
//           <FitBounds bounds={routeCoords} />
//         </>
//       )}

//       {driverLocation && <Marker position={driverLocation} icon={bikeIcon} />}
//     </MapContainer>
//   );
// }
import { View, Text } from 'react-native'
import React from 'react'

const MapWithRider = () => {
  return (
    <View>
      <Text>MapWithRider</Text>
    </View>
  )
}

export default MapWithRider