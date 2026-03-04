import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/landing');
        },
      },
    ]);
  };

  const menuItems = [
    { icon: 'person-outline' as const, label: 'Edit Profile', desc: 'Update your personal information', screen: '/edit-profile' },
    { icon: 'location-outline' as const, label: 'Delivery Address', desc: 'Manage your addresses', screen: '/address' },
    { icon: 'receipt-outline' as const, label: 'My Orders', desc: 'Track your order history', screen: '/(tabs)/orders' },
    { icon: 'notifications-outline' as const, label: 'Notifications', desc: 'Manage notification preferences', screen: '/notifications' },
    { icon: 'help-circle-outline' as const, label: 'Help & Support', desc: 'Get help with your orders', screen: '/support' },
    { icon: 'information-circle-outline' as const, label: 'About', desc: 'Learn more about KrishiSetu', screen: '/about' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <Ionicons
              name={user?.role === 'farmer' ? 'leaf' : 'cart'}
              size={14}
              color={COLORS.primary}
            />
            <Text style={styles.roleText}>{user?.role || 'customer'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.menuItem}
              onPress={() => {
                if (item.screen.startsWith('/(tabs)')) {
                  router.push(item.screen as any);
                }
                // Other screens can be added later
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={22} color={COLORS.primary} />
              </View>
              <View style={styles.menuBody}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>KrishiSetu v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  profileCard: {
    alignItems: 'center', backgroundColor: COLORS.white,
    paddingVertical: 28, paddingHorizontal: SIZES.md,
    marginBottom: 12,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: COLORS.primaryDark },
  name: { ...FONTS.h3, marginTop: 12 },
  email: { ...FONTS.caption, marginTop: 2 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 15, marginTop: 10,
  },
  roleText: { fontSize: 12, fontWeight: '600', color: COLORS.primaryDark, textTransform: 'capitalize' },
  menuSection: {
    backgroundColor: COLORS.white, marginHorizontal: SIZES.md,
    borderRadius: SIZES.radius, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primaryLight + '40', justifyContent: 'center', alignItems: 'center',
  },
  menuBody: { flex: 1, marginLeft: 14 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  menuDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: SIZES.md, marginTop: 20,
    backgroundColor: COLORS.white, padding: 16,
    borderRadius: SIZES.radius, borderWidth: 1, borderColor: '#FFCDD2',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.error },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.textLight, marginTop: 16, marginBottom: 30 },
});
