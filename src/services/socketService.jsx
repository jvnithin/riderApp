// src/socket.js
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketSingleton {
  constructor() {
    if (!SocketSingleton.instance) {
      this.socket = null;
      SocketSingleton.instance = this;
    }
    return SocketSingleton.instance;
  }

  async clearSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async getSocket(role) {
    if (!this.socket) {
      console.log('Creating socket connection');

      this.socket = io("http://192.168.1.80:8001", {
        transports: ['websocket', 'polling'], 
        autoConnect: true,
      });

      // Handle connection success
      this.socket.on("connect", async () => {
        console.log("✅ Socket connected!", this.socket.id);
        console.log(role)
        if (role === 'rider') {
          console.log("Emitting 'rider-login' event");
          try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
              this.socket?.emit('rider-login', token);
              console.log("Emitted socket login")
            } else {
              console.error('Token not found');
            }
          } catch (error) {
            console.error('Failed to retrieve token:', error);
          }
        }
      });

      // Handle connection errors
      this.socket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
      });
    }

    return this.socket;
  }
}

const socketInstance = new SocketSingleton();
export default socketInstance;
