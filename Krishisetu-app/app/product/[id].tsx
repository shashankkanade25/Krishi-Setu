import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import api, { BASE_URL } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { STATIC_PRODUCTS } from '../../constants/products';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  unit: string;
  category: string;
  farmerName: string;
  stock: number;
  description?: string;
  status: string;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        // Try fetching from the API first
        const res = await api.get(`/api/products/all`);
        const found = res.data.products?.find((p: Product) => p._id === id);
        if (found) {
          setProduct(found);
        } else {
          // Fall back to static products (covers all locally listed products)
          const staticFound = STATIC_PRODUCTS.find(p => p._id === id);
          if (staticFound) setProduct(staticFound as Product);
        }
      } catch (err) {
        // API unavailable – look in static products
        console.log('API failed, searching static products', err);
        const staticFound = STATIC_PRODUCTS.find(p => p._id === id);
        if (staticFound) setProduct(staticFound as Product);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const getImageUrl = (img: string) => {
    if (!img) return undefined;
    if (img.startsWith('http')) return img;
    return `${BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addItem({
        productId: product._id,
        productName: product.name,
        price: product.price,
        weight: `1 ${product.unit}`,
        image: product.image,
        category: product.category,
      });
    }
    Alert.alert('Added to Cart', `${product.name} × ${qty} added to your cart`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Product not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: getImageUrl(product.image) }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.body}>
          <View style={styles.row}>
            <View style={styles.catBadge}>
              <Text style={styles.catText}>{product.category}</Text>
            </View>
            {product.discount > 0 && (
              <View style={styles.discBadge}>
                <Text style={styles.discText}>{product.discount}% OFF</Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.farmer}>
            <Ionicons name="leaf" size={14} color={COLORS.primary} /> by {product.farmerName}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            <Text style={styles.unit}>per {product.unit}</Text>
            {product.discount > 0 && (
              <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
            )}
          </View>

          {product.description && (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>Description</Text>
              <Text style={styles.descBody}>{product.description}</Text>
            </View>
          )}

          <View style={styles.stockRow}>
            <Ionicons
              name={product.stock > 0 ? 'checkmark-circle' : 'close-circle'}
              size={18}
              color={product.stock > 0 ? COLORS.success : COLORS.error}
            />
            <Text style={[styles.stockText, { color: product.stock > 0 ? COLORS.success : COLORS.error }]}>
              {product.stock > 0 ? `In Stock (${product.stock} ${product.unit})` : 'Out of Stock'}
            </Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.qtySection}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.qtyControls}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(Math.max(1, qty - 1))}
              >
                <Ionicons name="remove" size={20} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(Math.min(product.stock, qty + 1))}
              >
                <Ionicons name="add" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Total</Text>
          <Text style={styles.bottomPrice}>₹{(product.price * qty).toFixed(0)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addCartBtn, product.stock <= 0 && styles.addCartBtnDisabled]}
          onPress={handleAddToCart}
          disabled={product.stock <= 0}
        >
          <Ionicons name="cart-outline" size={20} color={COLORS.white} />
          <Text style={styles.addCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5dc' },
  backBtn: {
    position: 'absolute', top: 50, left: 16, zIndex: 10,
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,
  },
  image: { width: '100%', height: 300, backgroundColor: COLORS.border },
  body: { padding: SIZES.md },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  catBadge: {
    backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  catText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  discBadge: {
    backgroundColor: '#FFEBEE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  discText: { color: COLORS.error, fontSize: 12, fontWeight: '700' },
  name: { ...FONTS.h2, marginTop: 4 },
  farmer: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 12 },
  price: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  unit: { fontSize: 14, color: COLORS.textSecondary },
  originalPrice: { fontSize: 16, color: COLORS.textLight, textDecorationLine: 'line-through' },
  descSection: { marginTop: 20 },
  descTitle: { ...FONTS.bold, marginBottom: 6 },
  descBody: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  stockText: { fontSize: 14, fontWeight: '600' },
  qtySection: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  qtyLabel: { ...FONTS.medium },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyValue: { fontSize: 18, fontWeight: '700', color: COLORS.text, minWidth: 28, textAlign: 'center' },
  bottomBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SIZES.md, paddingBottom: 24,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  bottomLabel: { fontSize: 12, color: COLORS.textSecondary },
  bottomPrice: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  addCartBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: SIZES.radius,
  },
  addCartBtnDisabled: { backgroundColor: COLORS.textLight },
  addCartText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  notFoundText: { ...FONTS.h3, color: COLORS.textSecondary },
  backLink: { color: COLORS.primary, fontWeight: '600' },
});
