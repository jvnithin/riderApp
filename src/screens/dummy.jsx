const buildMapsUrl = () => {
    const locs = currentRide?.locations || [];
    if (locs.length < 2) return '';
    const fmt = loc => `${loc.lat},${loc.lng}`;
    const origin = fmt(locs[0]);
    const destination = fmt(locs[locs.length - 1]);
    const waypoints = locs.slice(1, -1).map(fmt).join('|');
    return `https://www.google.com/maps/dir/?api=1`
      + `&origin=${encodeURIComponent(origin)}`
      + `&destination=${encodeURIComponent(destination)}`
      + (waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : '')
      + `&travelmode=driving`;
  };

  // Open Google Maps for navigation
  const handleNavigate = () => {
    const url = buildMapsUrl();
    if (!url) {
      Alert.alert('Route Error', 'Not enough locations to navigate');
      return;
    }
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Cannot open Google Maps')
    );
  };