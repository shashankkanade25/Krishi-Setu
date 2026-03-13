import React from 'react';
import { Redirect } from 'expo-router';
import { ADMIN_EMAIL, useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (user) {
    const isAdminAccount = user.email?.trim().toLowerCase() === ADMIN_EMAIL || user.role === 'admin';
    if (isAdminAccount) {
      return <Redirect href="/(admin)/dashboard" />;
    }
    if (user.role === 'farmer') {
      return <Redirect href="/(farmer)/dashboard" />;
    }
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/landing" />;
}
