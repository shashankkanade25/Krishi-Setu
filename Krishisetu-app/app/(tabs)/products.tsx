import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  TextInput, RefreshControl, ActivityIndicator, Dimensions, Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { STATIC_PRODUCTS, PRODUCT_CATEGORIES, SORT_OPTIONS, StaticProduct } from '../../constants/products';
import api, { BASE_URL } from '../../services/api';
import { useCart } from '../../contexts/CartContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SIZES.md * 2 - 12) / 2;

interface Product extends StaticProduct {}

export default function ProductsScreen() {
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const { addItem, items, updateQuantity } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState(params.search || '');
  const [category, setCategory] = useState(params.category || 'all');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSort, setShowSort] = useState(false);

  // Merge static + API products
  const mergeProducts = useCallback((apiProducts: Product[]) => {
    const merged = [...STATIC_PRODUCTS];
    const staticNames = new Set(STATIC_PRODUCTS.map(p => p.name.toLowerCase()));
    apiProducts.forEach(p => {
      if (!staticNames.has(p.name.toLowerCase())) {
        merged.push(p);
      }
    });
    return merged;
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/api/products/all');
      const apiProducts = res.data.products || [];
      setAllProducts(mergeProducts(apiProducts));
    } catch (err) {
      console.log('API failed, using static products');
      setAllProducts([...STATIC_PRODUCTS]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mergeProducts]);

  useEffect(() => { setLoading(true); fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (params.category) setCategory(params.category);
  }, [params.category]);

  // Filter & sort
  useEffect(() => {
    let result = [...allProducts];
    if (category && category !== 'all') {
      result = result.filter(p => p.category === category);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.farmerName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'discount': result.sort((a, b) => b.discount - a.discount); break;
    }
    setFilteredProducts(result);
  }, [allProducts, category, search, sortBy]);

  const onRefresh = () => { setRefreshing(true); fetchProducts(); };

  const getImageUrl = (img: string) => {
    if (!img) return undefined;
    if (img.startsWith('http')) return img;
    return `${BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const getCategoryTitle = () => {
    const cat = PRODUCT_CATEGORIES.find(c => c.key === category);
    return cat ? cat.label : 'All Products';
  };

  const handleAddToCart = (item: Product) => {
    addItem({
      productId: item._id,
      productName: item.name,
      price: item.price,
      weight: `1 ${item.unit}`,
      image: item.image,
      category: item.category,
    });
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const qty = items.find(i => i.productName === item.name)?.quantity ?? 0;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/product/${item._id}`)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: getImageUrl(item.image) }} style={styles.cardImage} resizeMode="cover" />
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}% Off</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          {/* Farmer info bar - matching web's yellow bar */}
          <View style={styles.farmerBar}>
            <Text style={styles.weightText}>1 {item.unit}</Text>
            <View style={styles.farmerInfo}>
              <Text style={styles.farmerEmoji}>🌾</Text>
              <Text style={styles.farmerNameText} numberOfLines={1}>By: {item.farmerName}</Text>
            </View>
          </View>
          {/* Pricing */}
          <View style={styles.cardPriceRow}>
            {item.discount > 0 && (
              <Text style={styles.cardOriginal}>₹{item.originalPrice}</Text>
            )}
            <Text style={styles.cardPrice}>₹{item.price}</Text>
          </View>
          {qty > 0 ? (
            <View style={styles.qtyControls}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.name, qty - 1)}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.name, qty + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{getCategoryTitle()}</Text>
          <Text style={styles.subtitle}>{filteredProducts.length} products available</Text>
        </View>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)}>
          <Ionicons name="swap-vertical" size={18} color={COLORS.primary} />
          <Text style={styles.sortBtnText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for products..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filters */}
      <FlatList
        data={PRODUCT_CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.categoryRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, category === item.key && styles.catChipActive]}
            onPress={() => setCategory(item.key)}
          >
            <Ionicons name={item.icon as any} size={14} color={category === item.key ? COLORS.white : COLORS.primary} />
            <Text style={[styles.catLabel, category === item.key && styles.catLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Product Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading farm-fresh products...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="leaf-outline" size={56} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyText}>Try a different search or category</Text>
              <TouchableOpacity style={styles.resetBtn} onPress={() => { setSearch(''); setCategory('all'); }}>
                <Text style={styles.resetBtnText}>Show All Products</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Sort Modal */}
      <Modal visible={showSort} transparent animationType="fade" onRequestClose={() => setShowSort(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSort(false)}>
          <View style={styles.sortModal}>
            <Text style={styles.sortModalTitle}>Sort Products</Text>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.sortOption, sortBy === opt.key && styles.sortOptionActive]}
                onPress={() => { setSortBy(opt.key); setShowSort(false); }}
              >
                <Text style={[styles.sortOptionText, sortBy === opt.key && styles.sortOptionTextActive]}>{opt.label}</Text>
                {sortBy === opt.key && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5dc' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.md, paddingTop: 8, paddingBottom: 4,
  },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  sortBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.white, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary,
  },
  sortBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.white, marginHorizontal: SIZES.md,
    marginVertical: 10, paddingHorizontal: 14, height: 46,
    borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  categoryRow: { paddingHorizontal: SIZES.md, gap: 8, paddingBottom: 10 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.border,
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  catLabelActive: { color: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.textSecondary },
  grid: { paddingHorizontal: SIZES.md, paddingBottom: 20, paddingTop: 4 },
  gridRow: { gap: 12, marginBottom: 12 },
  card: {
    width: CARD_WIDTH, backgroundColor: COLORS.white,
    borderRadius: SIZES.radius, overflow: 'hidden',
    elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  cardImage: { width: '100%', height: 140, backgroundColor: '#f0f0f0' },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#e53935', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  discountText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  cardBody: { padding: 10 },
  cardName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  farmerBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 6,
    borderRadius: 6, marginTop: 6,
  },
  weightText: { fontSize: 11, color: COLORS.text, fontWeight: '500' },
  farmerInfo: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1, justifyContent: 'flex-end' },
  farmerEmoji: { fontSize: 12 },
  farmerNameText: { fontSize: 9, color: '#10b981', fontWeight: '500', maxWidth: 80 },
  cardPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 },
  cardOriginal: { fontSize: 12, color: COLORS.textLight, textDecorationLine: 'line-through' },
  cardPrice: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 8, marginTop: 8,
  },
  addBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  qtyControls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f0f0f0', borderRadius: 8, padding: 4, marginTop: 8,
  },
  qtyBtn: {
    width: 34, height: 34, borderRadius: 6,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: { color: COLORS.white, fontSize: 20, fontWeight: '700', lineHeight: 22 },
  qtyNum: { fontSize: 15, fontWeight: '700', color: COLORS.text, minWidth: 24, textAlign: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: 13, color: COLORS.textSecondary },
  resetBtn: {
    marginTop: 16, backgroundColor: COLORS.primary,
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20,
  },
  resetBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sortModal: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36,
  },
  sortModalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  sortOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4,
  },
  sortOptionActive: { backgroundColor: '#E8F5E9' },
  sortOptionText: { fontSize: 15, color: COLORS.text },
  sortOptionTextActive: { color: COLORS.primary, fontWeight: '600' },
});
