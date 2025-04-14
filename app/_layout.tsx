import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabNavigator from '../src/navigators/TabNavigator';
import DetailsScreen from '../src/screens/DetailsScreen';
import PaymentScreen from '../src/screens/PaymentScreen';
import * as SplashScreen from 'expo-splash-screen';
import LoginScreen from './login';
import SignUpScreen from './Sign-up';
import ProductDetail from './ProductDetail';
const Stack = createNativeStackNavigator();

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (

      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen
          name="Tab"
          component={TabNavigator}
          options={{animation: 'slide_from_bottom'}}></Stack.Screen>
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{animation: 'slide_from_bottom'}}></Stack.Screen>
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{animation: 'slide_from_bottom'}}></Stack.Screen>
        <Stack.Screen 
        name="Login" 
        component={LoginScreen} />
        <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen} /> 
       <Stack.Screen name="ProductDetail" component={ProductDetail} />
      </Stack.Navigator>
  
  );
};

export default App;
