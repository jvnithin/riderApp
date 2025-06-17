// import { SafeAreaView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
// import './global.css'
// function App() {
//   return (

//     <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <StatusBar barStyle="dark-content" />
//       <Text>Welcome to MyApp 🚀</Text>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

// export default App;
import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import './global.css';
import { RiderProvider } from './src/context/RiderContext';
const App = () => {
  return (
    <RiderProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <AppNavigator />
    </RiderProvider>
  );
};

export default App;
