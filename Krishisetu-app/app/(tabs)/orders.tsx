import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import api from '../../services/api';

interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  items: { productName: string; quantity: number; price: number }[];
  orderDate: string;
  estimatedDeliveryDate?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#FFA726',
  confirmed: '#42A5F5',
  processing: '#AB47BC',
  shipped: '#26C6DA',
  out_for_delivery: '#66BB6A',
  delivered: '#4CAF50',
  cancelled: '#EF5350',
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/api/mobile/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.log('Failed to fetch orders', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const statusColor = STATUS_COLORS[item.status] || COLORS.textSecondary;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/order/${item._id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        <Text style={styles.dateText}>{formatDate(item.orderDate)}</Text>

        <View style={styles.itemsList}>
          {item.items.slice(0, 2).map((it, idx) => (
            <Text key={idx} style={styles.itemText} numberOfLines={1}>
              {it.productName} × {it.quantity}
            </Text>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreText}>+{item.items.length - 2} more items</Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.totalAmount}>₹{item.totalAmount}</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={56} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptyDesc}>Your orders will appear here</Text>
              <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)/products')}>
                <Text style={styles.shopBtnText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SIZES.md, paddingTop: 8, paddingBottom: 8 },
  title: { ...FONTS.h2 },
  list: { paddingHorizontal: SIZES.md, paddingBottom: 20 },
  card: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: 16, marginBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { ...FONTS.bold, fontSize: 15 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  dateText: { ...FONTS.caption, marginTop: 4 },
  itemsList: { marginTop: 10, gap: 2 },
  itemText: { fontSize: 13, color: COLORS.textSecondary },
  moreText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  totalAmount: { fontSize: 17, fontWeight: '700', color: COLORS.primary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { ...FONTS.h3, marginTop: 8 },
  emptyDesc: { ...FONTS.caption },
  shopBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: SIZES.radius, marginTop: 12,
  },
  shopBtnText: { color: COLORS.white, fontWeight: '700' },
});
