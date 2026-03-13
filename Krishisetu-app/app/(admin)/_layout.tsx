import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../../constants/theme';
import { ADMIN_EMAIL, useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/landing" />;
  }

  const isAdminAccount = user.email?.trim().toLowerCase() === ADMIN_EMAIL || user.role === 'admin';

  if (isAdminAccount) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
      </Stack>
    );
  }

  if (user.role === 'farmer') {
    return <Redirect href="/(farmer)/dashboard" />;
  }

  if (user.role === 'customer') {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
