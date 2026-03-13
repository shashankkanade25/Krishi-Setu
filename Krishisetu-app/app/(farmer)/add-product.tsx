import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES } from '../../constants/theme';
import api from '../../services/api';

const CATEGORIES = ['fruits', 'vegetables', 'dairy', 'pulses', 'grains', 'masala', 'pickles', 'other'];
const UNITS = ['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'bundle'];

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('kg');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll permission is needed to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !category || !price || !originalPrice || !stock) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('productName', name.trim());
      formData.append('category', category);
      formData.append('price', price);
      formData.append('originalPrice', originalPrice);
      formData.append('stock', stock);
      formData.append('unit', unit);
      formData.append('description', description.trim());

      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'product.jpg';
        const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
        const type = ext === 'png' ? 'image/png' : 'image/jpeg';
        formData.append('productImage', { uri: imageUri, name: filename, type } as any);
      }

      await api.post('/api/mobile/farmer/products', formData);

      Alert.alert('Success', 'Product added successfully!');
      // Reset form
      setName(''); setCategory(''); setPrice(''); setOriginalPrice('');
      setStock(''); setUnit('kg'); setDescription(''); setImageUri(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to add product';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add New Product</Text>
            <Text style={styles.headerSubtitle}>List a product for sale</Text>
          </View>

          {/* Image Picker */}
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={36} color={COLORS.textLight} />
                <Text style={styles.imageText}>Tap to add product image</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Product Name */}
          <Text style={styles.label}>Product Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Fresh Tomatoes" placeholderTextColor={COLORS.textLight} />

          {/* Category */}
          <Text style={styles.label}>Category *</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price & Original Price */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Selling Price (₹) *</Text>
              <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="e.g. 40" placeholderTextColor={COLORS.textLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Original Price (₹) *</Text>
              <TextInput style={styles.input} value={originalPrice} onChangeText={setOriginalPrice} keyboardType="numeric" placeholder="e.g. 50" placeholderTextColor={COLORS.textLight} />
            </View>
          </View>

          {/* Stock & Unit */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Stock Quantity *</Text>
              <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="e.g. 100" placeholderTextColor={COLORS.textLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Unit</Text>
              <View style={styles.unitRow}>
                {UNITS.slice(0, 4).map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitChip, unit === u && styles.unitChipActive]}
                    onPress={() => setUnit(u)}
                  >
                    <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your product..."
            placeholderTextColor={COLORS.textLight}
            multiline numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Discount Preview */}
          {price && originalPrice && parseFloat(originalPrice) > parseFloat(price) && (
            <View style={styles.discountPreview}>
              <Ionicons name="pricetag" size={16} color="#6b9b6d" />
              <Text style={styles.discountPreviewText}>
                Discount: {Math.round(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100)}% off
              </Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                <Text style={styles.submitText}>Add Product</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5dc' },
  scroll: { padding: SIZES.md, paddingBottom: 40 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#6b9b6d' },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },

  imagePicker: {
    width: '100%', height: 180, backgroundColor: '#fff',
    borderRadius: SIZES.radius, overflow: 'hidden', marginBottom: 20,
    borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed',
  },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageText: { color: COLORS.textLight, fontSize: 13, marginTop: 8 },

  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border,
    borderRadius: SIZES.radius, paddingHorizontal: 14, height: 48,
    fontSize: 15, color: COLORS.text,
  },
  textArea: { height: 100, paddingTop: 12 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#6b9b6d', borderColor: '#6b9b6d' },
  chipText: { fontSize: 13, color: COLORS.text },
  chipTextActive: { color: COLORS.white, fontWeight: '600' },

  row: { flexDirection: 'row', gap: 12 },

  unitRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  unitChip: {
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff',
  },
  unitChipActive: { backgroundColor: '#6b9b6d', borderColor: '#6b9b6d' },
  unitChipText: { fontSize: 12, color: COLORS.text },
  unitChipTextActive: { color: COLORS.white, fontWeight: '600' },

  discountPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E8F5E9', padding: 12, borderRadius: SIZES.radius, marginTop: 16,
  },
  discountPreviewText: { fontSize: 14, fontWeight: '600', color: '#6b9b6d' },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#6b9b6d', borderRadius: SIZES.radius, height: 52, marginTop: 24,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
