// components/LocationVisitTracker.jsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
/**
 * Props:
 * - label: string (e.g., "PICKUP", "STOP 1", "DESTINATION")
 * - coords: { lat: number, lng: number }
 * - distance: number|null
 * - isNearby: boolean
 * - visited: boolean
 * - visitTime: number|null
 * - threshold: number
 * - onVisit: () => void
 */
const LocationVisitTracker = ({
  label,
  coords,
  distance,
  isNearby,
  visited,
  visitTime,
  threshold,
  onVisit,
}) => {
    console.log(visited,coords)
    return(
  <View style={styles.container}>
    <View style={styles.info}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.coords}>
        {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
      </Text>
      {distance != null && (
        <Text style={styles.distance}>
          Distance: {distance}m
        </Text>
      )}
      {visited && visitTime && (
        <Text style={styles.timestamp}>
          Visited at {new Date(visitTime).toLocaleTimeString()}
        </Text>
      )}
    </View>
    <TouchableOpacity
      style={[
        styles.button,
        visited
          ? styles.buttonVisited
          : isNearby
          ? styles.buttonEnabled
          : styles.buttonDisabled,
      ]}
      onPress={onVisit}
      disabled={!isNearby || visited}
    >
      <Text
        style={[
          styles.buttonText,
          visited || isNearby
            ? styles.buttonTextEnabled
            : styles.buttonTextDisabled,
        ]}
      >
        {coords.visited? '✓ Visited': isNearby? 'Mark Visited': `Within ${threshold}m`}
      </Text>
    </TouchableOpacity>
  </View>
);}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  info: { flex: 1, paddingRight: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  coords: { fontSize: 13, color: '#4B5563', marginVertical: 2 },
  distance: { fontSize: 12, color: '#6B7280' },
  timestamp: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  button: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  buttonEnabled: { backgroundColor: '#2563EB' },
  buttonDisabled: { backgroundColor: '#D1D5DB' },
  buttonVisited: { backgroundColor: '#10B981' },
  buttonText: { fontSize: 13, fontWeight: '500' },
  buttonTextEnabled: { color: '#FFFFFF' },
  buttonTextDisabled: { color: '#6B7280' },
});

export default LocationVisitTracker;
