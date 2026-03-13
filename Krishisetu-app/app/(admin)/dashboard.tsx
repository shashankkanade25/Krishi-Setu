import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { COLORS, SIZES } from '../../constants/theme';
import { BASE_URL } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();

  const openWebAdmin = async () => {
    const adminUrl = `${BASE_URL}/admin`;
    try {
      await Linking.openURL(adminUrl);
    } catch {
      Alert.alert('Unable to Open', `Open this URL in a browser: ${adminUrl}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/landing');
  };

  useEffect(() => {
    openWebAdmin();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.white} />
          <Text style={styles.badgeText}>ADMIN ACCESS</Text>
        </View>
        <Text style={styles.title}>Welcome, {user?.name || 'Admin'}</Text>
        <Text style={styles.subtitle}>Mobile admin login is active for your account.</Text>
      </View>

      <View style={styles.card}>
        <Ionicons name="desktop-outline" size={28} color={COLORS.primary} />
        <Text style={styles.cardTitle}>Open Full Admin Dashboard</Text>
        <Text style={styles.cardDesc}>Opening web admin dashboard automatically for complete controls and analytics.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={openWebAdmin}>
          <Text style={styles.primaryBtnText}>Open Web Admin</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.md,
    paddingTop: 8,
  },
  header: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    marginBottom: 10,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  card: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '700',
  },
});
