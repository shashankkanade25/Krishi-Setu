import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import api, { BASE_URL } from '../../services/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  image: string;
  category: string;
}

interface OrderSummary {
  total: number;
  pending: number;
  completed: number;
  revenue: number;
}

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({ total: 0, pending: 0, completed: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, ordersRes] = await Promise.all([
        api.get('/api/mobile/farmer/products'),
        api.get('/api/mobile/farmer/orders'),
      ]);
      const prods = prodRes.data.products || [];
      setProducts(prods);

      const orders = ordersRes.data.orders || [];
      const pending = orders.filter((o: any) => o.status === 'pending' || o.status === 'processing').length;
      const completed = orders.filter((o: any) => o.status === 'delivered').length;
      const revenue = orders
        .filter((o: any) => o.status === 'delivered')
        .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      setOrderSummary({ total: orders.length, pending, completed, revenue });
    } catch (err) {
      console.log('Failed to fetch farmer data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const getImageUrl = (img: string) => {
    if (!img) return undefined;
    if (img.startsWith('http')) return img;
    return `${BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const activeProducts = products.filter(p => p.status === 'active').length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6b9b6d" />
          <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6b9b6d" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeText}>Welcome, {user?.name || 'Farmer'}! 🌱</Text>
            <Text style={styles.subtitleText}>Manage your farm products easily</Text>
          </View>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'F')}&background=6b9b6d&color=fff` }}
              style={styles.avatar}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: '#6b9b6d' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: 'rgba(107,155,109,0.1)' }]}>
              <Ionicons name="cube" size={22} color="#6b9b6d" />
            </View>
            <Text style={styles.statNum}>{products.length}</Text>
            <Text style={styles.statLabel}>My Products</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#8bb88d' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: 'rgba(139,184,141,0.1)' }]}>
              <Ionicons name="checkmark-circle" size={22} color="#8bb88d" />
            </View>
            <Text style={styles.statNum}>{activeProducts}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#d4af37' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: 'rgba(212,175,55,0.1)' }]}>
              <Ionicons name="warning" size={22} color="#d4af37" />
            </View>
            <Text style={styles.statNum}>{lowStockProducts}</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#e53935' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: 'rgba(229,57,53,0.1)' }]}>
              <Ionicons name="close-circle" size={22} color="#e53935" />
            </View>
            <Text style={styles.statNum}>{outOfStock}</Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </View>
        </View>

        {/* Order Stats */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Order Overview</Text>
        </View>
        <View style={styles.orderRow}>
          <View style={[styles.orderCard, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="receipt" size={24} color="#1976D2" />
            <Text style={[styles.orderNum, { color: '#1976D2' }]}>{orderSummary.total}</Text>
            <Text style={styles.orderLabel}>Total Orders</Text>
          </View>
          <View style={[styles.orderCard, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="time" size={24} color="#F57C00" />
            <Text style={[styles.orderNum, { color: '#F57C00' }]}>{orderSummary.pending}</Text>
            <Text style={styles.orderLabel}>Pending</Text>
          </View>
          <View style={[styles.orderCard, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="checkmark-done" size={24} color="#388E3C" />
            <Text style={[styles.orderNum, { color: '#388E3C' }]}>{orderSummary.completed}</Text>
            <Text style={styles.orderLabel}>Delivered</Text>
          </View>
        </View>

        {/* Revenue */}
        <View style={styles.revenueCard}>
          <Ionicons name="trending-up" size={28} color="#6b9b6d" />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={styles.revenueLabel}>Total Revenue</Text>
            <Text style={styles.revenueAmount}>₹{orderSummary.revenue.toLocaleString()}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(farmer)/add-product')}>
            <View style={[styles.actionIconWrap, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="add-circle" size={24} color="#6b9b6d" />
            </View>
            <Text style={styles.actionText}>Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(farmer)/my-products')}>
            <View style={[styles.actionIconWrap, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="cube" size={24} color="#F57C00" />
            </View>
            <Text style={styles.actionText}>My Products</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(farmer)/farmer-orders')}>
            <View style={[styles.actionIconWrap, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="receipt" size={24} color="#1976D2" />
            </View>
            <Text style={styles.actionText}>Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Products */}
        {products.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Products</Text>
              <TouchableOpacity onPress={() => router.push('/(farmer)/my-products')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {products.slice(0, 4).map((item) => (
              <View key={item._id} style={styles.productItem}>
                <Image source={{ uri: getImageUrl(item.image) }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productCategory}>{item.category}</Text>
                  <Text style={styles.productPrice}>₹{item.price}</Text>
                </View>
                <View style={styles.stockBadge}>
                  <Text style={[
                    styles.stockText,
                    { color: item.stock > 5 ? '#388E3C' : item.stock > 0 ? '#F57C00' : '#e53935' }
                  ]}>
                    {item.stock > 0 ? `Stock: ${item.stock}` : 'Out of Stock'}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/(auth)/landing'); }}>
          <Ionicons name="log-out-outline" size={20} color="#e53935" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5dc' },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: SIZES.md,
    paddingTop: 12, paddingBottom: 8,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  welcomeText: { fontSize: 20, fontWeight: '800', color: '#6b9b6d' },
  subtitleText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  avatarWrap: {
    width: 44, height: 44, borderRadius: 22, overflow: 'hidden',
    borderWidth: 2, borderColor: '#6b9b6d',
  },
  avatar: { width: '100%', height: '100%' },

  // Stats
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    padding: SIZES.md, paddingBottom: 4,
  },
  statCard: {
    width: '47.5%', backgroundColor: '#fff',
    borderRadius: SIZES.radius, padding: 14,
    borderLeftWidth: 4, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  statIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  statNum: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  // Orders
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.md, paddingTop: 20, paddingBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  seeAll: { color: '#6b9b6d', fontWeight: '600', fontSize: 14 },
  orderRow: {
    flexDirection: 'row', gap: 10, paddingHorizontal: SIZES.md,
  },
  orderCard: {
    flex: 1, borderRadius: SIZES.radius, padding: 14, alignItems: 'center',
  },
  orderNum: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  orderLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },

  // Revenue
  revenueCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: SIZES.md, marginTop: 14,
    borderRadius: SIZES.radius, padding: 18,
    borderWidth: 1, borderColor: '#E8F5E9',
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
  },
  revenueLabel: { fontSize: 13, color: COLORS.textSecondary },
  revenueAmount: { fontSize: 24, fontWeight: '800', color: '#6b9b6d', marginTop: 2 },

  // Actions
  actionsRow: {
    flexDirection: 'row', gap: 12, paddingHorizontal: SIZES.md,
  },
  actionBtn: { flex: 1, alignItems: 'center' },
  actionIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  actionText: { fontSize: 12, fontWeight: '600', color: COLORS.text },

  // Products
  productItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: SIZES.md, marginTop: 8,
    borderRadius: SIZES.radius, padding: 12,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,
  },
  productImage: { width: 52, height: 52, borderRadius: 8, backgroundColor: COLORS.border },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  productCategory: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  productPrice: { fontSize: 14, fontWeight: '700', color: '#6b9b6d', marginTop: 2 },
  stockBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#f5f5f0' },
  stockText: { fontSize: 11, fontWeight: '600' },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: SIZES.md, marginTop: 24, padding: 14,
    borderRadius: SIZES.radius, borderWidth: 1.5, borderColor: '#e53935',
  },
  logoutText: { color: '#e53935', fontWeight: '600', fontSize: 15 },
});
