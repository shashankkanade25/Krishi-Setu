import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  RefreshControl, ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import api from '../../services/api';
import { getCachedImageSource } from '../../utils/image';

const { width } = Dimensions.get('window');

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  stock: number;
  unit: string;
  category: string;
  image: string;
  status: string;
  description?: string;
}

export default function MyProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/api/mobile/farmer/products');
      setProducts(res.data.products || []);
    } catch (err) {
      console.log('Failed to fetch farmer products', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const onRefresh = () => { setRefreshing(true); fetchProducts(); };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Product', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/mobile/farmer/products/${id}`);
            setProducts(prev => prev.filter(p => p._id !== id));
            Alert.alert('Success', 'Product deleted successfully');
          } catch (err) {
            Alert.alert('Error', 'Failed to delete product');
          }
        },
      },
    ]);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Image source={getCachedImageSource(item.image)} style={styles.cardImage} resizeMode="cover" />
      {item.discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}% OFF</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.cardPrice}>₹{item.price}/{item.unit}</Text>
          {item.discount > 0 && (
            <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
          )}
        </View>
        <View style={styles.stockRow}>
          <View style={[
            styles.statusDot,
            { backgroundColor: item.stock > 5 ? '#388E3C' : item.stock > 0 ? '#F57C00' : '#e53935' }
          ]} />
          <Text style={styles.stockText}>
            {item.stock > 0 ? `Stock: ${item.stock}` : 'Out of Stock'}
          </Text>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id, item.name)}>
            <Ionicons name="trash-outline" size={16} color="#e53935" />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Products</Text>
        <Text style={styles.headerSubtitle}>{products.length} products listed</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6b9b6d" style={{ marginTop: 40 }} />
      ) : products.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={60} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No products yet</Text>
          <Text style={styles.emptyDesc}>Add your first product to start selling!</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6b9b6d" />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const CARD_W = (width - SIZES.md * 2 - 12) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5dc' },
  header: {
    paddingHorizontal: SIZES.md, paddingTop: 12, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#6b9b6d' },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  list: { padding: SIZES.md },
  row: { gap: 12 },
  card: {
    width: CARD_W, backgroundColor: '#fff',
    borderRadius: SIZES.radius, overflow: 'hidden', marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  cardImage: { width: '100%', height: 110, backgroundColor: COLORS.border },
  cardBody: { padding: 10 },
  cardName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  cardCategory: { fontSize: 11, color: COLORS.textSecondary, textTransform: 'capitalize', marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  cardPrice: { fontSize: 15, fontWeight: '700', color: '#6b9b6d' },
  originalPrice: { fontSize: 11, color: COLORS.textLight, textDecorationLine: 'line-through' },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 11, color: COLORS.textSecondary },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: COLORS.error, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  discountText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  deleteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    borderWidth: 1, borderColor: '#e53935', borderRadius: 8, paddingVertical: 6,
  },
  deleteBtnText: { color: '#e53935', fontSize: 12, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 12 },
  emptyDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
});
