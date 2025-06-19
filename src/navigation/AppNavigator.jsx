import { React, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignIn from "../screens/auth/SignIn";
import SignUp from "../screens/auth/SignUp";
import RiderHomePage from "../screens/Home";
import MapWithRider from "../screens/MapWithRider";
import RiderContext from "../context/RiderContext";
import Profile from "../screens/Profile";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { rider } = useContext(RiderContext);
  console.log(rider);
 
  // const token = AsyncStorage.getItem("token");
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="Home" component={RiderHomePage} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Navigation" component={MapWithRider} />
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
