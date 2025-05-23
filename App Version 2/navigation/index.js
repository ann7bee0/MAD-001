// If you are not familiar with React Navigation, check out the "Fundamentals" guide:
// https://reactnavigation.org/docs/getting-started
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import NotFoundScreen from "../screens/NotFoundScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import LinkingConfiguration from "./LinkingConfiguration";
import SigninScreen from "../screens/SigninScreen";
import SignUpScreen from "../screens/SignupScreen";
// import CameraScreen from "../screens/CameraScreen";
import QuizPlayScreen from "../components/Quiz/QuizPlayScreen";
import Profile from "../screens/userProfile";

export default function Navigation({ colorScheme }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator();

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TVET Connect Sign In" component={SigninScreen}/>
      <Stack.Screen name="TVET Connect Sign Up" component={SignUpScreen}/>
      <Stack.Screen name="Root" component={BottomTabNavigator} /> 
      <Stack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: "Oops!" }}
      />
            {/* <Stack.Screen name="CameraScreen" component={CameraScreen} /> */}
        <Stack.Screen name="QuizPlayScreen" component={QuizPlayScreen} />
        <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
}
