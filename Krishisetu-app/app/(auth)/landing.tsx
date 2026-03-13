import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Dimensions, Animated, StatusBar, ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { getCachedImageSource, prefetchImages } from '../../utils/image';

const { width } = Dimensions.get('window');

// Farmers data matching web
const FARMERS = [
  { name: 'SURAJ KAILAS MULE', farm: 'Mule Farms', location: 'Pune, Maharashtra', image: '/images/farmer1.jpg' },
  { name: 'WALE KIRAN ARJUN', farm: 'Wale Farms', location: 'Ahilyanagar, Maharashtra', image: '/images/farmer2.jpg' },
  { name: 'SANTOSH SHIVAJI GITE', farm: 'GITE FOODS AND FARMS', location: 'NASHIK, Maharashtra', image: '/images/farmer4.jpg' },
  { name: 'SATISH CHANDRABHAN VIKHE', farm: 'Karevasti Farms', location: 'Pune, Maharashtra', image: '/images/farmer5.jpg' },
  { name: 'PRAVIN KALE', farm: 'Samir Dombe', location: 'Pune, Maharashtra', image: '/images/farmer1.jpg' },
];

// Reviews matching web
const REVIEWS = [
  { name: 'Shashank Sanmukh Kanade', text: 'I was impressed by how smooth the process was and how well they understood our needs. The result exceeded our expectations.', image: '/images/Customer2.jpeg', stars: 5 },
  { name: 'Soham Appasaheb Thopate', text: 'From start to finish, their team was responsive, friendly, and genuinely invested in helping us succeed.', image: '/images/Customer1.jpeg', stars: 5 },
  { name: 'Sarang Pradeep Jadhav', text: 'Professional and reliable service. Easy to work with and highly recommended!', image: '/images/customer4.jpeg', stars: 5 },
  { name: 'Atharv Rajan Mulik', text: 'They delivered exactly what we needed. Great quality and on time!', image: '/images/customer3.png', stars: 4.5 },
  { name: 'Atharva Holsambre', text: 'Handled everything efficiently and met expectations without issues. Solid service, responsive, and easy to coordinate with.', image: '/images/customer7.jpeg', stars: 5 },
  { name: 'Akshada Sangale', text: 'The freshness and quality of the vegetables are unmatched. I love supporting local farmers through this platform!', image: '/images/customer5.jpeg', stars: 4.5 },
  { name: 'Bunty Thalkar', text: 'Best decision I made was joining Krishi Setu. Direct connection with farmers means better prices and fresher produce!', image: '/images/customer10.jpeg', stars: 4.5 },
  { name: 'Akshata Kanade', text: 'Amazing platform! The organic vegetables taste so much better than store-bought ones. Will definitely order again!', image: '/images/customer6.jpeg', stars: 5 },
  { name: 'Parth Kathane', text: 'Krishi Setu has transformed how I shop for vegetables. The quality is exceptional and delivery is always on time.', image: '/images/customer12.png', stars: 4.5 },
  { name: 'Ganesh Kotwade', text: 'Fresh produce delivered right to my doorstep! The farmers are dedicated and the platform makes it so easy to order.', image: '/images/customer9.jpeg', stars: 4.5 },
  { name: 'Om Sherikar', text: "I've tried many online grocery services, but nothing compares to Krishi Setu. The vegetables are incredibly fresh!", image: '/images/customer11.png', stars: 5 },
  { name: 'Rohit Devshatvar', text: 'Outstanding service from farm to home! The transparency in sourcing and commitment to quality is remarkable.', image: '/images/customer8.jpeg', stars: 5 },
];

// How it works steps
const STEPS = [
  { num: '1', title: 'Browse & Select', desc: 'Explore fresh produce from local farmers', icon: 'search-outline' as const },
  { num: '2', title: 'Add to Cart & Pay', desc: 'Secure checkout with multiple payment options', icon: 'cart-outline' as const },
  { num: '3', title: 'Fast Delivery', desc: 'Fresh produce delivered to your doorstep', icon: 'bicycle-outline' as const },
];

// Why Choose Us features
const FEATURES = [
  { title: 'No Middlemen', desc: 'Buy directly from farmers and get the freshest produce at the best prices.', icon: 'people-outline' as const },
  { title: 'Fair Pricing', desc: 'Farmers set their own prices, ensuring fair profits and affordable rates for you.', icon: 'cash-outline' as const },
  { title: 'Direct Communication', desc: 'Chat directly with farmers about their produce and growing practices.', icon: 'chatbubbles-outline' as const },
];

export default function LandingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  // Auto-rotate reviews
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % REVIEWS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    prefetchImages([
      ...FARMERS.map((farmer) => farmer.image),
      ...REVIEWS.map((review) => review.image),
    ]);
  }, []);

  const renderStars = (count: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(count)) {
        stars.push(<Ionicons key={i} name="star" size={14} color="#FFD700" />);
      } else if (i - 0.5 <= count) {
        stars.push(<Ionicons key={i} name="star-half" size={14} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={14} color="#FFD700" />);
      }
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ===== Hero Section with Background Image (matching web) ===== */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <ImageBackground
            source={require('../../assets/farm-hero.jpg')}
            style={styles.heroImageBg}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Ionicons name="ribbon-outline" size={14} color="#FFD700" />
              <Text style={styles.heroBadgeText}>100% Organic & Fresh</Text>
            </View>
            <Text style={styles.heroTitle}>
              Fresh from <Text style={styles.highlight}>Farm</Text> to Your <Text style={styles.highlight}>Table</Text>
            </Text>
            <Text style={styles.heroDesc}>
              कृषी-सेतू connects you directly with local farmers. Get fresh, organic produce at fair prices while supporting sustainable farming communities.
            </Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/register')}>
                <Ionicons name="rocket-outline" size={16} color={COLORS.white} />
                <Text style={styles.primaryBtnText}>Get Started</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(auth)/login')}>
                <Ionicons name="log-in-outline" size={16} color={COLORS.white} />
                <Text style={styles.secondaryBtnText}>Login</Text>
              </TouchableOpacity>
            </View>
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={18} color="#C8E6C9" />
                <Text style={styles.statNum}>500+</Text>
                <Text style={styles.statLabel}>Farmers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="basket" size={18} color="#C8E6C9" />
                <Text style={styles.statNum}>10000+</Text>
                <Text style={styles.statLabel}>Customers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="leaf" size={18} color="#C8E6C9" />
                <Text style={styles.statNum}>50+</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
            </View>
          </View>
          </ImageBackground>
        </Animated.View>

        {/* ===== How It Works ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsContainer}>
            {STEPS.map((step, i) => (
              <React.Fragment key={step.num}>
                <View style={styles.stepCard}>
                  <View style={styles.stepIconWrap}>
                    <View style={styles.stepNumBadge}>
                      <Text style={styles.stepNumText}>{step.num}</Text>
                    </View>
                    <Ionicons name={step.icon} size={30} color={COLORS.primary} />
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View style={styles.stepArrow}>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.textLight} />
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ===== Why Choose Us ===== */}
        <View style={[styles.section, { backgroundColor: COLORS.background }]}>
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
          <Text style={styles.sectionSubtitle}>Experience the difference of farm-fresh quality</Text>
          {FEATURES.map((feat, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={styles.featureIconWrap}>
                <Ionicons name={feat.icon} size={28} color={COLORS.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ===== Impact Section ===== */}
        <View style={styles.impactSection}>
          <Text style={styles.impactTitle}>कृषी-सेतू IMPACT</Text>
          <Text style={styles.impactText}>
            Our website connects farmers directly with consumers, allowing them to earn fair prices and eliminate middlemen. Customers enjoy fresh, local produce at competitive prices while supporting sustainable farming.
          </Text>
          <View style={styles.impactStats}>
            <View style={styles.impactStat}>
              <Ionicons name="people" size={24} color="#C8E6C9" />
              <Text style={styles.impactStatNum}>500+</Text>
              <Text style={styles.impactStatLabel}>Farmers Connected</Text>
            </View>
            <View style={styles.impactStat}>
              <Ionicons name="happy" size={24} color="#C8E6C9" />
              <Text style={styles.impactStatNum}>10000+</Text>
              <Text style={styles.impactStatLabel}>Happy Customers</Text>
            </View>
            <View style={styles.impactStat}>
              <Ionicons name="cube" size={24} color="#C8E6C9" />
              <Text style={styles.impactStatNum}>50+</Text>
              <Text style={styles.impactStatLabel}>Products Available</Text>
            </View>
          </View>
        </View>

        {/* ===== Farmers Community ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farmers Community</Text>
          <Text style={styles.sectionSubtitle}>Meet our dedicated farmers bringing fresh produce directly to you</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.farmersScroll}>
            {FARMERS.map((farmer, i) => (
              <View key={i} style={styles.farmerCard}>
                <Image source={getCachedImageSource(farmer.image)} style={styles.farmerAvatar} />
                <Text style={styles.farmerName}>{farmer.name}</Text>
                <Text style={styles.farmName}>{farmer.farm}</Text>
                <Text style={styles.farmerLocation}>({farmer.location})</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ===== Customer Reviews ===== */}
        <View style={[styles.section, { backgroundColor: COLORS.background }]}>
          <Text style={styles.sectionTitle}>What Our Customers Say</Text>
          <Text style={styles.sectionSubtitle}>Trusted by thousands of happy customers across India</Text>

          {/* Nav row: prev button + review card + next button */}
          <View style={styles.reviewNavRow}>
            <TouchableOpacity
              style={styles.reviewNavBtn}
              onPress={() => setCurrentReview((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length)}
            >
              <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
            </TouchableOpacity>

            {/* Review card */}
            <View style={styles.reviewCardLarge}>
              <Ionicons name="chatbox-ellipses" size={24} color={COLORS.primaryLight} style={{ marginBottom: 8 }} />
              <Image source={getCachedImageSource(REVIEWS[currentReview].image)} style={styles.reviewAvatarLarge} />
              <Text style={styles.reviewTextLarge}>"{REVIEWS[currentReview].text}"</Text>
              <Text style={styles.reviewAuthorLarge}>{REVIEWS[currentReview].name}</Text>
              <Text style={styles.reviewRole}>Customer</Text>
              <View style={styles.starsRow}>{renderStars(REVIEWS[currentReview].stars)}</View>
              {/* Dots indicator */}
              <View style={styles.dotsRow}>
                {REVIEWS.map((_, i) => (
                  <TouchableOpacity key={i} onPress={() => setCurrentReview(i)}>
                    <View style={[styles.reviewDot, currentReview === i && styles.reviewDotActive]} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.reviewNavBtn}
              onPress={() => setCurrentReview((prev) => (prev + 1) % REVIEWS.length)}
            >
              <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Review counter */}
          <Text style={styles.reviewCounter}>{currentReview + 1} / {REVIEWS.length}</Text>
        </View>

        {/* ===== CTA Section ===== */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to taste the difference?</Text>
          <Text style={styles.ctaDesc}>Join thousands of happy customers getting farm-fresh produce delivered to their doorstep.</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.ctaBtnText}>Get Started Now</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* ===== Footer ===== */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>कृषी-सेतू</Text>
          <Text style={styles.footerTagline}>Connecting Farmers Directly With You</Text>
          <View style={styles.footerDivider} />

          {/* Social Media Icons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-instagram" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-facebook" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-twitter" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-youtube" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-whatsapp" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.footerDivider} />
          <View style={styles.footerInfo}>
            <Text style={styles.footerLabel}>CONTACTS</Text>
            <Text style={styles.footerText}>MIDC, Udgir, Latur, Maharashtra - 413517</Text>
            <Text style={styles.footerText}>+91 9087654321</Text>
            <Text style={styles.footerText}>info@krishisetu.com</Text>
          </View>
          <Text style={styles.footerCopy}>© 2026 KrishiSetu | Privacy | Terms</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5dc' },

  // Hero
  hero: { minHeight: 540, position: 'relative' },
  heroImageBg: {
    flex: 1,
    minHeight: 540,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  heroContent: {
    flex: 1, justifyContent: 'center', padding: 28, paddingTop: 60,
    position: 'relative', zIndex: 2,
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, marginBottom: 16,
  },
  heroBadgeText: { color: '#FFD700', fontSize: 12, fontWeight: '600' },
  heroTitle: { color: COLORS.white, fontSize: 30, fontWeight: '900', lineHeight: 40, marginBottom: 14 },
  highlight: { color: '#FFD700' },
  heroDesc: { color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 22, marginBottom: 24 },
  heroButtons: { flexDirection: 'row', gap: 14, marginBottom: 24 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FF6B35', paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 28, elevation: 4,
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 20, paddingVertical: 13, borderRadius: 28,
  },
  secondaryBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 15 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNum: { color: COLORS.white, fontSize: 18, fontWeight: '800', marginTop: 4 },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Sections
  section: { paddingVertical: 28, paddingHorizontal: SIZES.md },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  sectionSubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 16 },

  // Steps
  stepsContainer: { flexDirection: 'row', alignItems: 'stretch', marginTop: 20 },
  stepCard: {
    flex: 1, alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: SIZES.radius, padding: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6,
  },
  stepIconWrap: { alignItems: 'center', marginBottom: 10 },
  stepNumBadge: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  stepNumText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  stepTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  stepDesc: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4 },
  stepArrow: { paddingHorizontal: 6, justifyContent: 'center' },

  // Features
  featureCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0f8f0', borderRadius: SIZES.radius,
    padding: 18, marginTop: 14,
  },
  featureIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  featureDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },

  // Impact
  impactSection: {
    backgroundColor: '#2e7d32', paddingVertical: 36, paddingHorizontal: SIZES.md, alignItems: 'center',
  },
  impactTitle: { color: COLORS.white, fontSize: 24, fontWeight: '900', marginBottom: 12 },
  impactText: { color: 'rgba(255,255,255,0.88)', fontSize: 13, lineHeight: 21, textAlign: 'center', marginBottom: 24 },
  impactStats: { flexDirection: 'row', gap: 16, width: '100%' },
  impactStat: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: SIZES.radius, padding: 14 },
  impactStatNum: { color: COLORS.white, fontSize: 20, fontWeight: '800', marginTop: 6 },
  impactStatLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, textAlign: 'center', marginTop: 4 },

  // Farmers
  farmersScroll: { gap: 16, paddingVertical: 4 },
  farmerCard: {
    width: 150, alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: SIZES.radius, padding: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  farmerAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10, backgroundColor: COLORS.border },
  farmerName: { fontSize: 11, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  farmName: { fontSize: 10, color: COLORS.primary, textAlign: 'center', marginTop: 2 },
  farmerLocation: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', marginTop: 1 },

  // Reviews
  reviewNavRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12,
  },
  reviewNavBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#f0f8f0', borderWidth: 1.5, borderColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
  },
  reviewCardLarge: {
    flex: 1, backgroundColor: '#f9f9f4', borderRadius: SIZES.radiusLg, padding: 20,
    alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  reviewCounter: {
    textAlign: 'center', fontSize: 12, color: COLORS.textSecondary, marginTop: 10,
  },
  reviewAvatarLarge: { width: 64, height: 64, borderRadius: 32, marginBottom: 14, backgroundColor: COLORS.border },
  reviewTextLarge: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, fontStyle: 'italic' },
  reviewAuthorLarge: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 12 },
  reviewRole: { fontSize: 12, color: COLORS.primary, marginTop: 2 },
  starsRow: { flexDirection: 'row', gap: 3, marginTop: 8 },
  dotsRow: { flexDirection: 'row', gap: 6, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' },
  reviewDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  reviewDotActive: { backgroundColor: COLORS.primary, width: 18 },

  // CTA
  ctaSection: {
    backgroundColor: '#FFF8E1', paddingVertical: 36, paddingHorizontal: SIZES.md, alignItems: 'center',
  },
  ctaTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  ctaDesc: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20, marginBottom: 20 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 28,
  },
  ctaBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },

  // Social media
  socialRow: {
    flexDirection: 'row', gap: 14, marginBottom: 4,
  },
  socialBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },

  // Footer
  footer: {
    backgroundColor: '#2e7d32', padding: 28, alignItems: 'center',
  },
  footerLogo: { fontSize: 28, fontWeight: '900', color: COLORS.white },
  footerTagline: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  footerDivider: { width: 60, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 16 },
  footerInfo: { alignItems: 'center', marginBottom: 16 },
  footerLabel: { fontSize: 13, fontWeight: '700', color: COLORS.white, marginBottom: 8 },
  footerText: { fontSize: 12, color: 'rgba(255,255,255,0.78)', marginBottom: 3 },
  footerCopy: { fontSize: 11, color: 'rgba(255,255,255,0.55)' },
});
