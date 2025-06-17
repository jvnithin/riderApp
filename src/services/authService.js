import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth'; // Use your computer's IP for physical device

class AuthService {
  async signUp(userData) {
    console.log("Here",userData)
    try {
      const response = await axios.post(`http://localhost:8000/api/auth/signup`, userData);
      console.log(response)
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
        console.log(error)
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async signIn(credentials) {
    try {
      const response = await axios.post(`${API_URL}/signin`, credentials);
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async signOut() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async getCurrentUser() {
    try {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  }

  async getToken() {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService();
