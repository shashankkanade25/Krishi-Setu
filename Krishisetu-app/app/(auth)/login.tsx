import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
  Image, Dimensions, StatusBar, Animated, Keyboard,
} from 'react-native';
import * as Linking from 'expo-linking';
import { Link, router } from 'expo-router';
import { ADMIN_EMAIL, useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../services/api';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'farmer' | 'admin'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSensitiveFieldFocused, setIsSensitiveFieldFocused] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const formLiftAnim = useRef(new Animated.Value(0)).current;
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatRole = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const shouldLift = isKeyboardVisible && isSensitiveFieldFocused;
    Animated.timing(formLiftAnim, {
      toValue: shouldLift ? (Platform.OS === 'ios' ? -48 : -72) : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [formLiftAnim, isKeyboardVisible, isSensitiveFieldFocused]);

  useEffect(() => () => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
    }
  }, []);

  const handleSensitiveFocus = () => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setIsSensitiveFieldFocused(true);
  };

  const handleSensitiveBlur = () => {
    blurTimerRef.current = setTimeout(() => {
      setIsSensitiveFieldFocused(false);
      blurTimerRef.current = null;
    }, 80);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const authenticatedUser = await login(email.trim().toLowerCase(), password, role);
      const isAdminAccount = authenticatedUser.email?.trim().toLowerCase() === ADMIN_EMAIL || authenticatedUser.role === 'admin';

      if (isAdminAccount) {
        const adminUrl = `${BASE_URL}/admin`;
        try {
          await Linking.openURL(adminUrl);
        } catch {
          Alert.alert('Admin Access', `Open admin dashboard here: ${adminUrl}`);
        }
        router.replace('/(admin)/dashboard');
      } else if (authenticatedUser.role === 'farmer') {
        router.replace('/(farmer)/dashboard');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (err: any) {
      const backendMessage = err.response?.data?.message;
      const correctRole = err.response?.data?.correctRole;
      const msg = correctRole
        ? `This account is registered as ${formatRole(correctRole)}. Please select ${formatRole(correctRole)} and try again.`
        : backendMessage ||
        (err.message?.includes('Network') || err.code === 'ECONNABORTED'
          ? 'Cannot reach server. Make sure the app backend is running.'
          : 'Login failed. Please check your credentials.');
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Cart Image Banner - matching web's left panel */}
        <View style={styles.imageBanner}>
          <Image
            source={require('../../assets/cart.jpg')}
            style={styles.cartImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </View>

        {/* Form Section - matching web's right panel */}
        <Animated.View style={[styles.formSection, { transform: [{ translateY: formLiftAnim }] }]}>
          {/* Brand Logo */}
          <View style={styles.brandLogo}>
            <Image
              source={require('../../assets/krishi-setu-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandTagline}>A BRIDGE BETWEEN FARMERS AND CUSTOMERS</Text>
          </View>

          {/* Role Selector - matching web */}
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'admin' && styles.roleBtnActive]}
              onPress={() => setRole('admin')}
            >
              <Ionicons name="shield-checkmark" size={18} color={role === 'admin' ? COLORS.white : '#555'} />
              <Text style={[styles.roleBtnText, role === 'admin' && styles.roleBtnTextActive]}>Admin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'farmer' && styles.roleBtnActive]}
              onPress={() => setRole('farmer')}
            >
              <Ionicons name="leaf" size={18} color={role === 'farmer' ? COLORS.white : '#555'} />
              <Text style={[styles.roleBtnText, role === 'farmer' && styles.roleBtnTextActive]}>Farmer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'customer' && styles.roleBtnActive]}
              onPress={() => setRole('customer')}
            >
              <Ionicons name="cart" size={18} color={role === 'customer' ? COLORS.white : '#555'} />
              <Text style={[styles.roleBtnText, role === 'customer' && styles.roleBtnTextActive]}>Customer</Text>
            </TouchableOpacity>
          </View>

          {/* Welcome Text - matching web */}
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Welcome Back! 🌳</Text>
            <Text style={styles.welcomeDesc}>Sign in to continue your journey</Text>
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor="#bbb"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={handleSensitiveFocus}
                onBlur={handleSensitiveBlur}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#bbb"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={handleSensitiveFocus}
                onBlur={handleSensitiveBlur}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button - matching web's brown gradient */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitBtnText}>Sign In →</Text>
            )}
          </TouchableOpacity>

          {/* Switch to Register */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>New to कृषी-सेतू? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.switchLink}>Create Account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1 },

  // Cart Image Banner
  imageBanner: {
    height: height * 0.28,
    width: '100%',
    backgroundColor: '#FDB813',
    position: 'relative',
    overflow: 'hidden',
  },
  cartImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253, 184, 19, 0.15)',
  },

  // Form Section
  formSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },

  // Brand logo
  brandLogo: { alignItems: 'center', marginBottom: 16 },
  logoImage: { width: 180, height: 60 },
  brandTagline: {
    fontSize: 10, fontWeight: '600', color: '#888',
    letterSpacing: 1, marginTop: 4, textAlign: 'center',
  },

  // Role selector - matching web
  roleSelector: {
    flexDirection: 'row', gap: 8,
    justifyContent: 'space-between', marginBottom: 18,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 12, paddingVertical: 12,
    borderWidth: 2, borderColor: '#e0e0e0',
    borderRadius: 12, backgroundColor: '#fff',
  },
  roleBtnActive: {
    borderColor: COLORS.primary, backgroundColor: COLORS.primary,
  },
  roleBtnText: { fontSize: 13, fontWeight: '600', color: '#555' },
  roleBtnTextActive: { color: COLORS.white },

  // Welcome text
  welcomeText: { marginBottom: 20 },
  welcomeTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  welcomeDesc: { fontSize: 13, color: '#888', marginTop: 4 },

  // Input group - matching web
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8f8f8', borderWidth: 1.5, borderColor: '#e4e4e4',
    borderRadius: 10, paddingHorizontal: 14, height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#333' },
  eyeBtn: { padding: 4 },

  // Submit button - gradient-like brown matching web
  submitBtn: {
    backgroundColor: '#8B6914',
    borderRadius: 10, height: 52,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 8,
    shadowColor: '#8B6914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  // Switch row
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  switchText: { fontSize: 14, color: '#666' },
  switchLink: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});
