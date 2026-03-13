import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
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
    if (user.role === 'farmer') {
      return <Redirect href="/(farmer)/dashboard" />;
    }
    if (user.role === 'admin') {
      return <Redirect href="/(admin)/dashboard" />;
    }
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/landing" />;
}
