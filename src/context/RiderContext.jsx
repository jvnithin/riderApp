// src/context/RiderContext.js
import { createContext, useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const RiderContext = createContext();

export const RiderProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  // const apiUrl="https://ride-74l5.onrender.com"
  const apiUrl="http://192.168.1.80:8001"
  const [rider,setRider]=useState(null)
  
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.warn('Location permission denied');
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        // console.log(latitude,longitude)
      },
      (error) => {
        console.warn('Location error:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };
  const getUserDetails = async () => {
    console.log('getting user details');
    const token = await AsyncStorage.getItem('token');
    console.log(token);
    try {
      const response = await axios.get(`${apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      } 
      )
      setRider(response.data);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(()=>{
    console.log("hellooo2")
    getUserDetails();
    getCurrentLocation();
  },[])
  return (
    <RiderContext.Provider value={{ location, setLocation, getCurrentLocation,apiUrl ,rider,setRider}}>
      {children}
    </RiderContext.Provider>
  );
};

export default RiderContext;
