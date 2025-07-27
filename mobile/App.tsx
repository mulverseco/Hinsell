import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './global.css';

import {
  Home,
  User
} from 'lucide-react-native';

import { store, persistor, RootState } from './src/core/store';
import { queryClient } from './src/core/services/query-client';
import { AuthNavigator } from './src/screens/auth/auth-navigator';
import { ReportsNavigator } from '@/screens/report/reports-navigator';
import { Profile } from '@/screens/profile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabBarIcon = ({ focused, Icon }: { focused: boolean; Icon: React.ElementType }) => (
  <Icon size={24} strokeWidth={2} color={focused ? '#8b5cf6' : '#64748b'} />
);


type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

function renderHomeTabBarIcon({ focused }: TabBarIconProps) {
  return <TabBarIcon focused={focused} Icon={Home} />;
}

function renderUserTabBarIcon({ focused }: TabBarIconProps) {
  return <TabBarIcon focused={focused} Icon={User} />;
}

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        borderTopWidth: 0,
        borderColor: "transparent",
        backgroundColor: "#fff",
      },
      tabBarActiveTintColor: '#8b5cf6',
      tabBarInactiveTintColor: '#64748b',
    }}
  >
    <Tab.Screen
      name="Home"
      component={ReportsNavigator}
      options={{
        tabBarIcon: renderHomeTabBarIcon,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={Profile}
      options={{
        tabBarIcon: renderUserTabBarIcon,
      }}
    />
  </Tab.Navigator>
);

const MainNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <GestureHandlerRootView className='flex-1'>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
              <NavigationContainer>
                  <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#000' : '#fff'} />
                <MainNavigator />
              </NavigationContainer>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}


export default App;