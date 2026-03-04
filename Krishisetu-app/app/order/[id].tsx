import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import api from '../../services/api';

interface OrderDetail {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  subtotal: number;
  deliveryCharges: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  items: { productName: string; quantity: number; price: number; weight?: string }[];
  deliveryAddress?: {
    fullName: string; phone: string; address: string; city: string; state: string; pincode: string;
  };
  shippingAddress?: {
    fullName: string; phone: string; address: string; city: string; state: string; pincode: string;
  };
  orderDate: string;
  estimatedDeliveryDate?: string;
  statusHistory?: { status: string; timestamp: string; note?: string }[];
}

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
const STATUS_COLORS: Record<string, string> = {
  pending: '#FFA726', confirmed: '#42A5F5', processing: '#AB47BC',
  shipped: '#26C6DA', out_for_delivery: '#66BB6A', delivered: '#4CAF50', cancelled: '#EF5350',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/mobile/orders/${id}`);
        setOrder(res.data.order || res.data);
      } catch (err) {
        console.log('Failed to fetch order', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={FONTS.h3}>Order not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const addr = order.deliveryAddress || order.shippingAddress;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.orderNumber}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Status */}
        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <Text style={FONTS.bold}>Order Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[order.status] || COLORS.textSecondary) + '20' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] || COLORS.textSecondary }]}>
                {order.status.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>

          {order.status !== 'cancelled' && (
            <View style={styles.timeline}>
              {STATUS_STEPS.map((step, idx) => (
                <View key={step} style={styles.timelineItem}>
                  <View style={[
                    styles.timelineDot,
                    idx <= currentStep && { backgroundColor: COLORS.primary },
                  ]}>
                    {idx <= currentStep && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
                  </View>
                  {idx < STATUS_STEPS.length - 1 && (
                    <View style={[styles.timelineLine, idx < currentStep && { backgroundColor: COLORS.primary }]} />
                  )}
                  <Text style={[styles.timelineLabel, idx <= currentStep && { color: COLORS.primary, fontWeight: '600' }]}>
                    {step.replace(/_/g, ' ')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={FONTS.bold}>Items</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(0)}</Text>
            </View>
          ))}
        </View>

        {/* Address */}
        {addr && (
          <View style={styles.card}>
            <Text style={FONTS.bold}>Delivery Address</Text>
            <Text style={styles.addrText}>{addr.fullName}</Text>
            <Text style={styles.addrText}>{addr.address}</Text>
            <Text style={styles.addrText}>{addr.city}, {addr.state} - {addr.pincode}</Text>
            {addr.phone && <Text style={styles.addrText}>📞 {addr.phone}</Text>}
          </View>
        )}

        {/* Payment & Summary */}
        <View style={styles.card}>
          <Text style={FONTS.bold}>Payment</Text>
          <View style={styles.summRow}>
            <Text style={styles.summLabel}>Method</Text>
            <Text style={styles.summValue}>{order.paymentMethod?.toUpperCase()}</Text>
          </View>
          <View style={styles.summRow}>
            <Text style={styles.summLabel}>Status</Text>
            <Text style={[styles.summValue, { color: order.paymentStatus === 'paid' ? COLORS.success : COLORS.warning }]}>
              {order.paymentStatus}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summRow}>
            <Text style={styles.summLabel}>Subtotal</Text>
            <Text style={styles.summValue}>₹{order.subtotal || order.totalAmount}</Text>
          </View>
          <View style={styles.summRow}>
            <Text style={styles.summLabel}>Delivery</Text>
            <Text style={styles.summValue}>₹{order.deliveryCharges || 0}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.card}>
          <View style={styles.summRow}>
            <Text style={styles.summLabel}>Ordered</Text>
            <Text style={styles.summValue}>{formatDate(order.orderDate)}</Text>
          </View>
          {order.estimatedDeliveryDate && (
            <View style={styles.summRow}>
              <Text style={styles.summLabel}>Expected delivery</Text>
              <Text style={styles.summValue}>{formatDate(order.estimatedDeliveryDate)}</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  headerTitle: { ...FONTS.h3, fontSize: 16 },
  scroll: { padding: SIZES.md, paddingBottom: 30 },
  card: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    padding: 16, marginBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  timeline: { marginTop: 4 },
  timelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  timelineDot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center',
  },
  timelineLine: {
    position: 'absolute', left: 10, top: 22, width: 2, height: 12,
    backgroundColor: COLORS.border,
  },
  timelineLabel: {
    marginLeft: 12, fontSize: 13, color: COLORS.textSecondary, textTransform: 'capitalize',
  },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  itemName: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  itemQty: { fontSize: 12, color: COLORS.textSecondary },
  itemPrice: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  addrText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  summRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  summLabel: { fontSize: 13, color: COLORS.textSecondary },
  summValue: { fontSize: 13, fontWeight: '600', color: COLORS.text, textTransform: 'capitalize' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
});
