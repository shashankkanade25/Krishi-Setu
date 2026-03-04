import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import api from '../../services/api';

export default function FarmerProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [pincode, setPincode] = useState(user?.address?.pincode || '');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/api/mobile/profile', {
        name: name.trim(),
        phone: phone.trim(),
        address: { street: street.trim(), city: city.trim(), state: state.trim(), pincode: pincode.trim() },
      });
      updateUser(res.data.user);
      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => { await logout(); router.replace('/(auth)/landing'); },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'F')}&background=6b9b6d&color=fff&size=128` }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="leaf" size={14} color="#6b9b6d" />
            <Text style={styles.roleText}>Farmer</Text>
          </View>
        </View>

        {/* Profile Form */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Text style={styles.editBtn}>{editing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={name}
            onChangeText={setName}
            editable={editing}
            placeholder="Your name"
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={phone}
            onChangeText={setPhone}
            editable={editing}
            keyboardType="phone-pad"
            placeholder="Phone number"
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.label}>Street Address</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={street}
            onChangeText={setStreet}
            editable={editing}
            placeholder="Street address"
            placeholderTextColor={COLORS.textLight}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={city} onChangeText={setCity}
                editable={editing} placeholder="City"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={state} onChangeText={setState}
                editable={editing} placeholder="State"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          </View>

          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={pincode}
            onChangeText={setPincode}
            editable={editing}
            keyboardType="numeric"
            placeholder="Pincode"
            placeholderTextColor={COLORS.textLight}
          />

          {editing && (
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color={COLORS.white} /> : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#e53935" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5dc' },
  header: {
    alignItems: 'center', paddingVertical: 28,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#6b9b6d' },
  userName: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 12 },
  userEmail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12, marginTop: 8,
  },
  roleText: { color: '#6b9b6d', fontSize: 12, fontWeight: '600' },

  section: { padding: SIZES.md, paddingTop: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  editBtn: { color: '#6b9b6d', fontWeight: '600', fontSize: 14 },

  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border,
    borderRadius: SIZES.radius, paddingHorizontal: 14, height: 48,
    fontSize: 15, color: COLORS.text,
  },
  inputDisabled: { backgroundColor: '#f5f5f0', color: COLORS.textSecondary },

  row: { flexDirection: 'row', gap: 12 },

  saveBtn: {
    backgroundColor: '#6b9b6d', borderRadius: SIZES.radius, height: 48,
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
  },
  saveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: SIZES.md, marginTop: 20, padding: 14,
    borderRadius: SIZES.radius, borderWidth: 1.5, borderColor: '#e53935',
  },
  logoutText: { color: '#e53935', fontWeight: '600', fontSize: 15 },
});
