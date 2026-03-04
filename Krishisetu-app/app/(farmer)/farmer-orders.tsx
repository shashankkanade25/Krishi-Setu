import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import api from '../../services/api';

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  weight: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  orderDate: string;
  deliveryAddress?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  customerName?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#F57C00',
  processing: '#1976D2',
  shipped: '#7B1FA2',
  delivered: '#388E3C',
  cancelled: '#e53935',
};

export default function FarmerOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/api/mobile/farmer/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.log('Failed to fetch farmer orders', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/api/mobile/farmer/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const getNextStatus = (current: string): string | null => {
    const flow: Record<string, string> = {
      pending: 'processing',
      processing: 'shipped',
      shipped: 'delivered',
    };
    return flow[current] || null;
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const nextStatus = getNextStatus(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || '#999' }]}>
            <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
          </View>
        </View>
        <Text style={styles.orderDate}>
          {new Date(item.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>

        {item.items.map((it, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>{it.productName}</Text>
            <Text style={styles.itemQty}>x{it.quantity}</Text>
            <Text style={styles.itemPrice}>₹{it.price * it.quantity}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{item.totalAmount}</Text>
        </View>

        {item.deliveryAddress && (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.addressText}>
              {[item.deliveryAddress.street, item.deliveryAddress.city, item.deliveryAddress.state, item.deliveryAddress.pincode].filter(Boolean).join(', ')}
            </Text>
          </View>
        )}

        {nextStatus && (
          <TouchableOpacity
            style={styles.updateBtn}
            onPress={() => {
              Alert.alert('Update Status', `Mark as "${nextStatus}"?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Update', onPress: () => updateStatus(item._id, nextStatus) },
              ]);
            }}
          >
            <Text style={styles.updateBtnText}>Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
        <Text style={styles.headerSubtitle}>Manage orders for your products</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6b9b6d" style={{ marginTop: 40 }} />
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={60} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyDesc}>Orders for your products will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6b9b6d" />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5dc' },
  header: {
    paddingHorizontal: SIZES.md, paddingTop: 12, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#6b9b6d' },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  list: { padding: SIZES.md },
  card: {
    backgroundColor: '#fff', borderRadius: SIZES.radius, padding: 16, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  orderDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, marginBottom: 10 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: '#f0f0e8',
  },
  itemName: { flex: 1, fontSize: 13, color: COLORS.text },
  itemQty: { fontSize: 13, color: COLORS.textSecondary, marginHorizontal: 10 },
  itemPrice: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 10, marginTop: 4,
  },
  totalLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  totalAmount: { fontSize: 16, fontWeight: '800', color: '#6b9b6d' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  addressText: { fontSize: 11, color: COLORS.textSecondary, flex: 1 },
  updateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#6b9b6d', borderRadius: 10, paddingVertical: 10, marginTop: 12,
  },
  updateBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 12 },
  emptyDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
});
