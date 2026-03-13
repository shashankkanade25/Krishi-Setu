import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  RefreshControl, Dimensions, ActivityIndicator, Animated, Modal, Easing,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import api from '../../services/api';
import { STATIC_PRODUCTS, StaticProduct } from '../../constants/products';
import { getCachedImageSource, getImageUrl, prefetchImages } from '../../utils/image';

const { width } = Dimensions.get('window');

// Category cards matching the web
const CATEGORY_CARDS = [
  { key: 'fruits', label: 'FRUITS', desc: 'Freshly picked fruits from our farm!', image: '/images/Fruit.jpg' },
  { key: 'vegetables', label: 'VEGETABLES', desc: 'Discover the true taste of freshness with our farm-fresh vegetables!', image: '/images/organic-vegetables-f.jpg' },
  { key: 'pulses', label: 'PULSES', desc: 'Our farm offers pulses, including lentils, chickpeas, beans, and more!', image: '/images/Pulses.jpg' },
  { key: 'dairy', label: 'DAIRY PRODUCTS', desc: 'Milk, yogurt, cheese, butter and more!', image: '/images/dairy.jpg' },
  { key: 'pickles', label: 'PICKLES', desc: 'The freshest, most delicious pickles you\'ve ever tasted!', image: '/images/pickle.jpg' },
  { key: 'masala', label: 'MASALA BLENDS', desc: 'Authentic spices, grown with care and harvested at their peak!', image: '/images/masale.png' },
];

// How-it-works steps
const STEPS = [
  { num: '1', title: 'Browse & Select', desc: 'Explore fresh produce from local farmers', icon: 'search-outline' as const },
  { num: '2', title: 'Add to Cart & Pay', desc: 'Secure checkout with multiple payment options', icon: 'cart-outline' as const },
  { num: '3', title: 'Fast Delivery', desc: 'Fresh produce delivered to your doorstep', icon: 'bicycle-outline' as const },
];

// Customer reviews matching the web
const REVIEWS = [
  { name: 'Shashank Sanmukh Kanade', text: 'I was impressed by how smooth the process was and how well they understood our needs. The result exceeded our expectations.', image: '/images/Customer2.jpeg' },
  { name: 'Soham Appasaheb Thopate', text: 'From start to finish, their team was responsive, friendly, and genuinely invested in helping us succeed.', image: '/images/Customer1.jpeg' },
  { name: 'Sarang Pradeep Jadhav', text: 'Professional and reliable service. Easy to work with and highly recommended!', image: '/images/customer4.jpeg' },
  { name: 'Atharv Rajan Mulik', text: 'They delivered exactly what we needed. Great quality and on time!', image: '/images/customer3.png' },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, icon: 'checkmark-circle', color: '#4CAF50', title: 'Order Confirmed', msg: 'Your order #1234 has been confirmed!', time: '2 min ago' },
  { id: 2, icon: 'bicycle', color: '#2196F3', title: 'Out for Delivery', msg: 'Your order is on the way!', time: '1 hr ago' },
  { id: 3, icon: 'pricetag', color: '#FF9800', title: 'Special Offer', msg: '20% off on vegetables today!', time: '3 hrs ago' },
  { id: 4, icon: 'star', color: '#9C27B0', title: 'New Arrivals', msg: 'Fresh mangoes just arrived from farms!', time: 'Yesterday' },
];

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
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { addItem, items, updateQuantity } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const autoScrollAnim = useRef(new Animated.Value(0)).current;

  const HERO_IMAGES = [
    getImageUrl('/images/Fruit.jpg'),
    getImageUrl('/images/organic-vegetables-f.jpg'),
    getImageUrl('/images/dairy-productsNew.jpeg'),
  ].filter((uri): uri is string => Boolean(uri));

  // Auto-rotate hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    prefetchImages([
      ...HERO_IMAGES,
      ...CATEGORY_CARDS.map((card) => card.image),
      ...REVIEWS.map((review) => review.image),
      '/images/farmer1.jpg',
      '/images/farmer2.jpg',
      '/images/farmer4.jpg',
      '/images/farmer5.jpg',
    ]);
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/api/products/all');
      const apiProducts = res.data.products || [];
      // Merge static + API products (deduplicate by name)
      const seen = new Set<string>();
      const merged: Product[] = [];
      for (const p of apiProducts) {
        const key = p.name.toLowerCase().trim();
        if (!seen.has(key)) { seen.add(key); merged.push(p); }
      }
      for (const sp of STATIC_PRODUCTS) {
        const key = sp.name.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          merged.push({
            _id: sp._id,
            name: sp.name,
            price: sp.price,
            originalPrice: sp.originalPrice,
            discount: sp.discount,
            image: sp.image,
            unit: sp.unit,
            category: sp.category,
            farmerName: sp.farmerName,
            stock: sp.stock,
          });
        }
      }
      setAllProducts(merged);
    } catch (err) {
      console.log('Failed to fetch products, using static data', err);
      // Fallback: use static products only
      setAllProducts(STATIC_PRODUCTS.map(sp => ({
        _id: sp._id,
        name: sp.name,
        price: sp.price,
        originalPrice: sp.originalPrice,
        discount: sp.discount,
        image: sp.image,
        unit: sp.unit,
        category: sp.category,
        farmerName: sp.farmerName,
        stock: sp.stock,
      })));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const onRefresh = () => { setRefreshing(true); fetchProducts(); };

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

  // Web-matching deal product names (from customer_home.ejs)
  const dealProducts = useMemo(() => {
    const WEB_DEAL_NAMES = ['banana', 'bhendi', 'buffalo milk', 'toor daal', 'amul cheese', 'mango pickle', 'garam masala'];
    const deals = WEB_DEAL_NAMES
      .map(name => allProducts.find(p => p.name.toLowerCase() === name))
      .filter(Boolean) as Product[];
    if (deals.length < 7) {
      const existing = new Set(deals.map(p => p._id));
      const extra = [...allProducts].sort((a, b) => b.discount - a.discount).filter(p => !existing.has(p._id));
      deals.push(...extra.slice(0, 7 - deals.length));
    }
    return deals;
  }, [allProducts]);

  // Auto-scroll animation for Today's Farm Deals (matching web's CSS scroll-left animation)
  useEffect(() => {
    if (dealProducts.length === 0) return;
    const ITEM_W = width * 0.44 + 12;
    const totalW = ITEM_W * dealProducts.length;
    autoScrollAnim.setValue(0);
    const anim = Animated.loop(
      Animated.timing(autoScrollAnim, {
        toValue: -totalW,
        duration: dealProducts.length * 3000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [dealProducts.length]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* ===== Header ===== */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'User'} 👋</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => setShowNotifs(true)}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
            <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>4</Text></View>
          </TouchableOpacity>
        </View>

        {/* ===== Search Bar ===== */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/products')}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search for fresh produce...</Text>
        </TouchableOpacity>

        {/* ===== Hero Carousel (matches web) ===== */}
        <Animated.View style={[styles.heroBanner, { opacity: fadeAnim }]}>
          <Image source={getCachedImageSource(HERO_IMAGES[heroIndex])} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTagline}>🌿 Farm Fresh, Direct to You</Text>
            <Text style={styles.heroTitle}>Welcome, {user?.name?.split(' ')[0] || 'User'}!</Text>
            <Text style={styles.heroDesc}>
              We connect you directly with local farmers, bringing fresh produce to your table.
            </Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity style={styles.heroBtn} onPress={() => router.push('/(tabs)/products')}>
                <Text style={styles.heroBtnText}>Shop Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroBtnSecondary}>
                <Text style={styles.heroBtnSecondaryText}>How It Works</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroDots}>
              {HERO_IMAGES.map((_, i) => (
                <View key={i} style={[styles.dot, heroIndex === i && styles.dotActive]} />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ===== How It Works ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsRow}>
            {STEPS.map((step, i) => (
              <React.Fragment key={step.num}>
                <View style={styles.stepCard}>
                  <View style={styles.stepIconWrap}>
                    <Text style={styles.stepNum}>{step.num}</Text>
                    <Ionicons name={step.icon} size={28} color={COLORS.primary} />
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View style={styles.stepArrow}>
                    <Ionicons name="arrow-forward" size={18} color={COLORS.textLight} />
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ===== Product Categories (matches web grid) ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORY_CARDS.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={styles.categoryCard}
                onPress={() => router.push({ pathname: '/(tabs)/products', params: { category: cat.key } })}
                activeOpacity={0.8}
              >
                <Image source={getCachedImageSource(cat.image)} style={styles.categoryImage} resizeMode="cover" />
                <View style={styles.categoryOverlay} />
                <View style={styles.categoryContent}>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                  <Text style={styles.categoryDesc} numberOfLines={2}>{cat.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ===== Today's Farm Deals ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Today's Farm Deals!!</Text>
              <Text style={styles.sectionSubtitle}>Fresh fruits, vegetables, and dairy products</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ paddingVertical: 40 }} />
          ) : (
            <View style={{ overflow: 'hidden' }}>
              <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: autoScrollAnim }] }}>
                {[...dealProducts, ...dealProducts, ...dealProducts].map((item, index) => {
                  const dealQty = items.find(i => i.productName === item.name)?.quantity ?? 0;
                  return (
                    <TouchableOpacity
                      key={`${item._id}-${index}`}
                      style={styles.dealCard}
                      onPress={() => router.push(`/product/${item._id}`)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.dealImageWrap}>
                        <Image source={getCachedImageSource(item.image)} style={styles.dealImage} resizeMode="contain" />
                      </View>
                      <View style={styles.dealInfo}>
                        <Text style={styles.dealName} numberOfLines={1}>{item.name}</Text>
                        <View style={styles.dealFooter}>
                          <View style={styles.dealPriceBadge}>
                            <Text style={styles.dealPriceText}>₹{item.price}/{item.unit}</Text>
                          </View>
                          {dealQty > 0 ? (
                            <View style={styles.dealQtyControls}>
                              <TouchableOpacity style={styles.dealQtyBtn} onPress={() => updateQuantity(item.name, dealQty - 1)}>
                                <Text style={styles.dealQtyBtnText}>−</Text>
                              </TouchableOpacity>
                              <Text style={styles.dealQtyNum}>{dealQty}</Text>
                              <TouchableOpacity style={styles.dealQtyBtn} onPress={() => updateQuantity(item.name, dealQty + 1)}>
                                <Text style={styles.dealQtyBtnText}>+</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <TouchableOpacity style={styles.dealAddBtn} onPress={() => handleAddToCart(item)}>
                              <Text style={styles.dealAddBtnText}>Add</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </Animated.View>
            </View>
          )}
        </View>

        {/* ===== Impact Section ===== */}
        <View style={styles.impactSection}>
          <Text style={styles.impactTitle}>कृषी-सेतू IMPACT</Text>
          <Text style={styles.impactText}>
            Our platform connects farmers directly with consumers, allowing them to earn fair prices and eliminate middlemen.
            Customers enjoy fresh, local produce at competitive prices while supporting sustainable farming.
          </Text>
        </View>

        {/* ===== Meet the Farmers ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meet the Farmers</Text>
          <Text style={styles.farmersText}>
            We focus on sustainable farming that benefits the land and your family. Our farmers grow fresh, chemical-free produce using methods that support soil health and biodiversity.
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.farmersRow}>
            {['/images/farmer1.jpg', '/images/farmer2.jpg', '/images/farmer4.jpg', '/images/farmer5.jpg'].map((img, i) => (
              <Image key={i} source={getCachedImageSource(img)} style={styles.farmerImg} resizeMode="cover" />
            ))}
          </ScrollView>
        </View>

        {/* ===== Customer Reviews ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Our Customers Say</Text>
          <Text style={styles.sectionSubtitle}>Real stories from people who love farm-fresh produce</Text>
          {REVIEWS.map((review, i) => (
            <View key={i} style={styles.reviewCard}>
              <Image source={getCachedImageSource(review.image)} style={styles.reviewAvatar} />
              <View style={styles.reviewContent}>
                <Text style={styles.reviewText}>"{review.text}"</Text>
                <Text style={styles.reviewAuthor}>{review.name}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ===== Footer ===== */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>कृषी-सेतू</Text>
          <View style={styles.footerInfo}>
            <Text style={styles.footerLabel}>CONTACTS</Text>
            <Text style={styles.footerText}>MIDC, Udgir, Latur, Maharashtra - 413517</Text>
            <Text style={styles.footerText}>+91 9087654321</Text>
            <Text style={styles.footerText}>info@krishisetu.com</Text>
          </View>
          <Text style={styles.footerCopy}>© 2026 KrishiSetu | Privacy | Terms</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ===== Notifications Modal ===== */}
      <Modal
        visible={showNotifs}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifs(false)}
      >
        <TouchableOpacity style={styles.notifOverlay} activeOpacity={1} onPress={() => setShowNotifs(false)}>
          <View style={styles.notifPanel} onStartShouldSetResponder={() => true}>
            <View style={styles.notifHeader}>
              <Text style={styles.notifHeaderTitle}>🔔 Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifs(false)} style={styles.notifCloseBtn}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            {MOCK_NOTIFICATIONS.map(n => (
              <View key={n.id} style={styles.notifItem}>
                <View style={[styles.notifIconWrap, { backgroundColor: n.color + '22' }]}>
                  <Ionicons name={n.icon as any} size={22} color={n.color} />
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  <Text style={styles.notifMsg}>{n.msg}</Text>
                  <Text style={styles.notifTime}>{n.time}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.notifClearBtn} onPress={() => setShowNotifs(false)}>
              <Text style={styles.notifClearText}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const CARD_W = (width - SIZES.md * 2 - 12) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5dc' },
  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.md, paddingTop: 8, paddingBottom: 4,
  },
  greeting: { fontSize: 13, color: COLORS.textSecondary },
  userName: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  notifBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.white, marginHorizontal: SIZES.md,
    marginVertical: 12, padding: 14, borderRadius: SIZES.radius,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchPlaceholder: { color: COLORS.textLight, fontSize: 14 },
  // Hero Carousel
  heroBanner: {
    marginHorizontal: SIZES.md, borderRadius: SIZES.radiusLg,
    overflow: 'hidden', height: 280,
  },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  heroContent: { flex: 1, justifyContent: 'center', padding: 24 },
  heroTagline: { color: '#C8E6C9', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  heroTitle: { color: COLORS.white, fontSize: 26, fontWeight: '900', marginBottom: 8 },
  heroDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 19, marginBottom: 16 },
  heroButtons: { flexDirection: 'row', gap: 12 },
  heroBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 22, paddingVertical: 11, borderRadius: 25,
  },
  heroBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  heroBtnSecondary: {
    borderWidth: 1.5, borderColor: COLORS.white,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25,
  },
  heroBtnSecondaryText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  heroDots: { flexDirection: 'row', gap: 8, marginTop: 18 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: COLORS.white, width: 22 },
  // Sections
  section: { marginTop: 28, paddingHorizontal: SIZES.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  sectionSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, marginBottom: 10 },
  seeAll: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  countBadge: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  // How it works
  stepsRow: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center', marginTop: 12 },
  stepCard: {
    flex: 1, alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: SIZES.radius, padding: 14,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  stepIconWrap: { alignItems: 'center', marginBottom: 8 },
  stepNum: {
    fontSize: 11, fontWeight: '800', color: COLORS.white,
    backgroundColor: COLORS.primary, width: 20, height: 20, borderRadius: 10,
    textAlign: 'center', lineHeight: 20, marginBottom: 6, overflow: 'hidden',
  },
  stepTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  stepDesc: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4 },
  stepArrow: { paddingHorizontal: 4, justifyContent: 'center' },
  // Category Grid
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  categoryCard: {
    width: CARD_W, height: 140, borderRadius: SIZES.radius,
    overflow: 'hidden', position: 'relative',
  },
  categoryImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  categoryOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  categoryContent: { flex: 1, justifyContent: 'flex-end', padding: 12 },
  categoryLabel: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
  categoryDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 3 },
  // Deal cards - matching web's product-card style
  dealCard: {
    width: width * 0.44, backgroundColor: COLORS.white,
    borderRadius: 10, marginRight: 12, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  dealImageWrap: {
    width: '100%', aspectRatio: 1, backgroundColor: '#fff', padding: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  dealImage: { width: '100%', height: '100%' },
  dealInfo: { padding: 10 },
  dealName: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 8 },
  dealFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dealPriceBadge: {
    backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4,
  },
  dealPriceText: { color: '#fff', fontSize: 12, fontWeight: '700', fontFamily: 'serif' },
  dealAddBtn: {
    borderWidth: 2, borderColor: '#000', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 4,
  },
  dealAddBtnText: { color: '#000', fontSize: 12, fontWeight: '600' },
  // Shared
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 7, marginTop: 8,
  },
  addBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: COLORS.error, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  discountText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  // Impact
  impactSection: {
    marginTop: 28, marginHorizontal: SIZES.md,
    backgroundColor: '#2e7d32', borderRadius: SIZES.radiusLg,
    padding: 28, alignItems: 'center',
  },
  impactTitle: { color: COLORS.white, fontSize: 22, fontWeight: '900', marginBottom: 10 },
  impactText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 20, textAlign: 'center' },
  // Farmers
  farmersText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginTop: 4, marginBottom: 16 },
  farmersRow: { gap: 12 },
  farmerImg: { width: 130, height: 130, borderRadius: SIZES.radius },
  // Reviews
  reviewCard: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderRadius: SIZES.radius, padding: 14, marginTop: 12,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  reviewAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 14 },
  reviewContent: { flex: 1 },
  reviewText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, fontStyle: 'italic' },
  reviewAuthor: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginTop: 8 },
  // Footer
  footer: {
    marginTop: 32, backgroundColor: '#2e7d32', padding: 28, alignItems: 'center',
  },
  footerLogo: { fontSize: 28, fontWeight: '900', color: COLORS.white, marginBottom: 16 },
  footerInfo: { alignItems: 'center', marginBottom: 16 },
  footerLabel: { fontSize: 13, fontWeight: '700', color: COLORS.white, marginBottom: 6 },
  footerText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 3 },
  footerCopy: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  // Notification badge on bell
  notifBadge: {
    position: 'absolute', top: 0, right: 0,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.error, justifyContent: 'center', alignItems: 'center',
  },
  notifBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  // Notification Modal
  notifOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  notifPanel: {
    backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
  },
  notifHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  notifHeaderTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  notifCloseBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center',
  },
  notifItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0efe6',
  },
  notifIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  notifMsg: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, lineHeight: 18 },
  notifTime: { fontSize: 11, color: COLORS.textLight, marginTop: 4 },
  notifClearBtn: {
    marginTop: 16, backgroundColor: COLORS.primary,
    paddingVertical: 12, borderRadius: 12, alignItems: 'center',
  },
  notifClearText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  // Deal card qty controls
  dealQtyControls: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f0f0f0', borderRadius: 4, padding: 2,
  },
  dealQtyBtn: {
    width: 24, height: 24, borderRadius: 4,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  dealQtyBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700', lineHeight: 16 },
  dealQtyNum: { fontSize: 12, fontWeight: '700', color: COLORS.text, minWidth: 16, textAlign: 'center' },
});
