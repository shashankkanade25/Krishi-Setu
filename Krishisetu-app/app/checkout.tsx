import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';

export default function CheckoutScreen() {
  const { items, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState({
    fullName: '', phone: '', address: '', landmark: '',
    city: '', state: '', pincode: '',
  });
  const [instructions, setInstructions] = useState('');

  const subtotal = getTotal();
  const deliveryCharges = subtotal >= 500 ? 0 : 40;
  const total = subtotal + deliveryCharges;

  const paymentOptions = [
    { key: 'cod', label: 'Cash on Delivery', icon: 'cash-outline' as const },
    { key: 'upi', label: 'UPI Payment', icon: 'phone-portrait-outline' as const },
    { key: 'online', label: 'Online Payment', icon: 'card-outline' as const },
  ];

  const handlePlaceOrder = async () => {
    if (!address.fullName.trim() || !address.phone.trim() || !address.address.trim()
      || !address.city.trim() || !address.state.trim() || !address.pincode.trim()) {
      Alert.alert('Error', 'Please fill in all required address fields');
      return;
    }
    if (address.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        productName: i.productName,
        price: i.price,
        weight: i.weight,
        quantity: i.quantity,
        image: i.image,
        category: i.category,
      }));

      const res = await api.post('/api/mobile/place-order', {
        items: orderItems,
        address: {
          ...address,
          type: 'home',
        },
        paymentMethod,
        instructions,
        totalAmount: total,
        subtotal,
        deliveryCharges,
      });

      clearCart();
      Alert.alert(
        'Order Placed! 🎉',
        `Order #${res.data.orderNumber} has been placed successfully.`,
        [{ text: 'View Orders', onPress: () => router.replace('/(tabs)/orders') }]
      );
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Delivery Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="location-outline" size={18} /> Delivery Address
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Full Name *"
                placeholderTextColor={COLORS.textLight}
                value={address.fullName}
                onChangeText={(t) => setAddress({ ...address, fullName: t })}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Phone *"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
                value={address.phone}
                onChangeText={(t) => setAddress({ ...address, phone: t })}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Street Address *"
              placeholderTextColor={COLORS.textLight}
              value={address.address}
              onChangeText={(t) => setAddress({ ...address, address: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Landmark (optional)"
              placeholderTextColor={COLORS.textLight}
              value={address.landmark}
              onChangeText={(t) => setAddress({ ...address, landmark: t })}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="City *"
                placeholderTextColor={COLORS.textLight}
                value={address.city}
                onChangeText={(t) => setAddress({ ...address, city: t })}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="State *"
                placeholderTextColor={COLORS.textLight}
                value={address.state}
                onChangeText={(t) => setAddress({ ...address, state: t })}
              />
            </View>
            <TextInput
              style={[styles.input, { width: '50%' }]}
              placeholder="Pincode *"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              value={address.pincode}
              onChangeText={(t) => setAddress({ ...address, pincode: t })}
            />
          </View>

          {/* Payment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="wallet-outline" size={18} /> Payment Method
            </Text>
            {paymentOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.paymentOption, paymentMethod === opt.key && styles.paymentActive]}
                onPress={() => setPaymentMethod(opt.key)}
              >
                <Ionicons name={opt.icon} size={22} color={paymentMethod === opt.key ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.paymentLabel, paymentMethod === opt.key && { color: COLORS.primary, fontWeight: '700' }]}>
                  {opt.label}
                </Text>
                <View style={[styles.radio, paymentMethod === opt.key && styles.radioActive]}>
                  {paymentMethod === opt.key && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Special Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Any special instructions for delivery..."
              placeholderTextColor={COLORS.textLight}
              multiline
              value={instructions}
              onChangeText={setInstructions}
            />
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {items.map((item, idx) => (
              <View key={idx} style={styles.summaryItem}>
                <Text style={styles.summaryName} numberOfLines={1}>{item.productName} × {item.quantity}</Text>
                <Text style={styles.summaryPrice}>₹{(item.price * item.quantity).toFixed(0)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryPrice}>₹{subtotal.toFixed(0)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={[styles.summaryPrice, deliveryCharges === 0 && { color: COLORS.success }]}>
                {deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges}`}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total.toFixed(0)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Place Order Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.placeOrderBtn, loading && styles.btnDisabled]}
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.placeOrderText}>Place Order</Text>
                <Text style={styles.placeOrderPrice}>₹{total.toFixed(0)}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.md, paddingVertical: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { ...FONTS.h3 },
  scroll: { paddingBottom: 20 },
  section: {
    backgroundColor: COLORS.white, marginTop: 10,
    paddingHorizontal: SIZES.md, paddingVertical: 16,
  },
  sectionTitle: { ...FONTS.bold, marginBottom: 14, fontSize: 15 },
  input: {
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: SIZES.radiusSm, paddingHorizontal: 14, height: 46,
    fontSize: 14, color: COLORS.text, marginBottom: 10,
  },
  inputRow: { flexDirection: 'row', gap: 10 },
  paymentOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.inputBg, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  paymentActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight + '30' },
  paymentLabel: { flex: 1, fontSize: 14, color: COLORS.text },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryName: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  summaryPrice: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  bottomBar: {
    padding: SIZES.md, paddingBottom: 24,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  placeOrderBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius,
    height: 52,
  },
  btnDisabled: { opacity: 0.7 },
  placeOrderText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  placeOrderPrice: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
});
