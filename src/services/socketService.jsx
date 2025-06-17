// src/socket.js
import { useContext } from 'react';
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
  
  async clearSocket(){
    this.socket.disconnect();
    this.socket = null;
  }
  async getSocket(role) {
    // const {apiUrl} = useContext(MapContext);
    if (!this.socket) {
      this.socket = io(`https://ride-74l5.onrender.com`, {
        autoConnect: true,
        // auth: { token: 'your-auth-token' }, // optional
      });
      
      if(role==="rider"){
        const token =await AsyncStorage.getItem("token");
        this.socket.emit('driver-login',token);
      }
    }

    return this.socket;
  }
}

// Export a single shared instance
const socketInstance = new SocketSingleton();
export default socketInstance;
