/**
 * CrisesMesh AI — Root Navigation (Updated Day 4)
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors, Typography } from '../constants/theme';
import type { RootStackParamList } from '../constants/types';

// Screens — Day 1
import LandingScreen from '../screens/LandingScreen';
import CitizenOnboardingScreen from '../screens/CitizenOnboardingScreen';
import CitizenHomeScreen from '../screens/CitizenHomeScreen';
import CitizenReportScreen from '../screens/CitizenReportScreen';
import CitizenAlertsScreen from '../screens/CitizenAlertsScreen';
import CitizenMapScreen from '../screens/CitizenMapScreen';
import GovernmentPinScreen from '../screens/GovernmentPinScreen';
import GovernmentHomeScreen from '../screens/GovernmentHomeScreen';
import GovernmentIncidentScreen from '../screens/GovernmentIncidentScreen';
// Day 3
import AgentTracePanelScreen from '../screens/AgentTracePanelScreen';
import SignalFusionScreen from '../screens/SignalFusionScreen';
// Day 4
import ResourceAllocationScreen from '../screens/ResourceAllocationScreen';
import RedZoneMapScreen from '../screens/RedZoneMapScreen';
import AlertApprovalScreen from '../screens/AlertApprovalScreen';
import CitizenAlertLiveScreen from '../screens/CitizenAlertLiveScreen';
import RecoveryScreen from '../screens/RecoveryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Landing */}
        <Stack.Screen name="Landing" component={LandingScreen} />

        {/* Citizen Flow */}
        <Stack.Screen
          name="CitizenOnboarding"
          component={CitizenOnboardingScreen}
          options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: 'Back',
            headerStyle: { backgroundColor: Colors.citizenBg },
            headerTintColor: Colors.citizenText,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="CitizenHome"
          component={CitizenHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CitizenReport"
          component={CitizenReportScreen}
          options={{
            headerShown: true,
            headerTitle: 'Report Emergency',
            headerStyle: { backgroundColor: Colors.citizenBg },
            headerTintColor: Colors.citizenText,
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: '700', fontSize: Typography.sizes.lg },
          }}
        />
        <Stack.Screen
          name="CitizenAlerts"
          component={CitizenAlertsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Alerts',
            headerStyle: { backgroundColor: Colors.citizenBg },
            headerTintColor: Colors.citizenText,
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: '700', fontSize: Typography.sizes.lg },
          }}
        />
        <Stack.Screen
          name="CitizenAlertLive"
          component={CitizenAlertLiveScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CitizenMap"
          component={CitizenMapScreen}
          options={{
            headerShown: true,
            headerTitle: 'Safety Map',
            headerStyle: { backgroundColor: Colors.citizenBg },
            headerTintColor: Colors.citizenText,
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: '700', fontSize: Typography.sizes.lg },
          }}
        />

        {/* Government Flow */}
        <Stack.Screen
          name="GovernmentPin"
          component={GovernmentPinScreen}
          options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: 'Back',
            headerStyle: { backgroundColor: Colors.govBg },
            headerTintColor: Colors.govText,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="GovernmentHome"
          component={GovernmentHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GovernmentIncident"
          component={GovernmentIncidentScreen}
          options={{
            headerShown: true,
            headerTitle: 'Incident Detail',
            headerStyle: { backgroundColor: Colors.govBg },
            headerTintColor: Colors.govText,
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: '700', fontSize: Typography.sizes.lg, color: Colors.govText },
          }}
        />
        <Stack.Screen
          name="AgentTracePanel"
          component={AgentTracePanelScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignalFusion"
          component={SignalFusionScreen}
          options={{ headerShown: false }}
        />

        {/* Day 4 Screens */}
        <Stack.Screen
          name="ResourceAllocation"
          component={ResourceAllocationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RedZoneMap"
          component={RedZoneMapScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AlertApproval"
          component={AlertApprovalScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Recovery"
          component={RecoveryScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
