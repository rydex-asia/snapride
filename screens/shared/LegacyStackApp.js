import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { RideProvider } from "./RideContext";

import HomeScreen from "../home/HomeScreen";
import ChooseRideScreen from "../ride/ChooseRideScreen";
import NavigationScreen from "../ride/NavigationScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <RideProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ChooseRide" component={ChooseRideScreen} />
          <Stack.Screen name="NavigationScreen" component={NavigationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </RideProvider>
  );
}