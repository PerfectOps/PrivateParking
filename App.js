import React from 'react';
import { View, ActivityIndicator, ImageBackground, BackHandler, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabBarHeightContext, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import Auth from './components/Auth';
import Home from './components/Home';
import QR from './components/QR';
import Maps from './components/Maps';
import Registration from './components/Registration';
import LosePassword from './components/LosePassword';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// function Bottom Tab Navigator
function HomeStack() {
    return (
        <Tab.Navigator screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveBackgroundColor: 'rgba(255, 255, 255, 0.6)',
            tabBarInactiveBackgroundColor:'white'
          })}>
            <Tab.Screen name="Home" component={Home} options={{tabBarIcon: ({ focused, color, size }) => {
              return <Image source={require('./components/assets/iconTabUser.png')} style={{width:50, height:50}} />;
            },}} />
            <Tab.Screen name="QR" component={QR} options={{tabBarIcon: ({ focused, color, size }) => {
              return <Image source={require('./components/assets/iconTabQr.png')} style={{width:35, height:35}} />;
            },}} />
            <Tab.Screen name="Maps" component={Maps} options={{tabBarIcon: ({ focused, color, size }) => {
              return <Image source={require('./components/assets/iconTabMaps.png')} style={{width:35, height:35}} />;
            },}} />
        </Tab.Navigator>
    );
}

// Main Routing App
export default function App() {
    return (
        <NavigationContainer theme={DarkTheme}>
            <Stack.Navigator>
                <Stack.Screen name="Auth" options={{headerShown: false}} component={Auth} />
                <Stack.Screen name="Registration" options={{headerShown: false}} component={Registration} />
                <Stack.Screen name="LosePassword" options={{headerShown: false}} component={LosePassword} />
                <Stack.Screen name="HomeStack" options={{headerShown: false}} component={HomeStack} />
            </Stack.Navigator>
        </NavigationContainer>
    )
};
