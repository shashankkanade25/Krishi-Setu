import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { useCart, CartItem } from '../../contexts/CartContext';
import { BASE_URL } from '../../services/api';

export default function CartScreen() {
  const { items, updateQuantity, removeItem, getTotal, getCount, clearCart } = useCart();

  const getImageUrl = (img: string) => {
    if (!img) return undefined;
    if (img.startsWith('http')) return img;
    return `${BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const handleRemove = (name: string) => {
    Alert.alert('Remove Item', 'Remove this item from cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem(name) },
    ]);
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: getImageUrl(item.image) }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{item.productName}</Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardPrice}>₹{item.price} × {item.quantity}</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.productName, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.productName, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(0)}</Text>
        <TouchableOpacity onPress={() => handleRemove(item.productName)}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>My Cart</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyDesc}>Browse products and add items to your cart</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)/products')}>
            <Text style={styles.shopBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = getTotal();
  const deliveryCharges = subtotal >= 200 ? 0 : 40;
  const total = subtotal + deliveryCharges;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        <Text style={styles.countBadge}>{getCount()} items</Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.productName}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{subtotal.toFixed(0)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <Text style={[styles.summaryValue, deliveryCharges === 0 && { color: COLORS.success }]}>
            {deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges}`}
          </Text>
        </View>
        {deliveryCharges > 0 && (
          <Text style={styles.freeNote}>Add ₹{(200 - subtotal).toFixed(0)} more for free delivery</Text>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{total.toFixed(0)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: SIZES.md, paddingTop: 8, paddingBottom: 8,
  },
  title: { ...FONTS.h2 },
  countBadge: {
    backgroundColor: COLORS.primaryLight, color: COLORS.primaryDark,
    fontSize: 12, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12,
  },
  list: { paddingHorizontal: SIZES.md, paddingBottom: 8 },
  card: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderRadius: SIZES.radius, padding: 12, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  cardImage: { width: 70, height: 70, borderRadius: 10, backgroundColor: COLORS.border },
  cardBody: { flex: 1, marginLeft: 12 },
  cardName: { fontWeight: '600', fontSize: 14, color: COLORS.text },
  cardCategory: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  cardPrice: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyText: { fontSize: 14, fontWeight: '700', color: COLORS.text, minWidth: 20, textAlign: 'center' },
  cardRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  itemTotal: { fontWeight: '700', fontSize: 15, color: COLORS.text },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyTitle: { ...FONTS.h3, marginTop: 8 },
  emptyDesc: { ...FONTS.caption },
  shopBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: SIZES.radius, marginTop: 12,
  },
  shopBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  summaryCard: {
    backgroundColor: COLORS.white, padding: SIZES.md,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  freeNote: { fontSize: 11, color: COLORS.accent, marginBottom: 6 },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, marginTop: 6 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  checkoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius,
    height: 50, marginTop: 14,
  },
  checkoutBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
