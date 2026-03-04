// All products matching website's products page - serves as fallback + complete catalog
// These are the same products shown on the KrishiSetu website

export interface StaticProduct {
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
}

export const STATIC_PRODUCTS: StaticProduct[] = [
  // ========== FRUITS (9) ==========
  { _id: 'static-fruit-1', name: 'Banana', price: 32, originalPrice: 40, discount: 20, image: '/Product_images/banana.jpg', unit: 'kg', category: 'fruits', farmerName: 'Shashank Kanade', stock: 50, description: 'Fresh, naturally ripened bananas from local farms. Rich in potassium and perfect for a healthy snack.' },
  { _id: 'static-fruit-2', name: 'Strawberry', price: 120, originalPrice: 150, discount: 20, image: '/Product_images/straberry.jpg', unit: 'kg', category: 'fruits', farmerName: 'Bunty Thalkar', stock: 30, description: 'Sweet, juicy strawberries freshly picked from the farm. Perfect for desserts and smoothies.' },
  { _id: 'static-fruit-3', name: 'Guava', price: 40, originalPrice: 50, discount: 20, image: '/Product_images/guava.jpg', unit: 'kg', category: 'fruits', farmerName: 'Shashank Kanade', stock: 40, description: 'Fresh guavas with a crisp texture and sweet flavor. Loaded with vitamin C.' },
  { _id: 'static-fruit-4', name: 'Orange', price: 56, originalPrice: 70, discount: 20, image: '/Product_images/orange.jpg', unit: 'kg', category: 'fruits', farmerName: 'Bunty Thalkar', stock: 45, description: 'Juicy Nagpur oranges, bursting with citrus freshness and natural sweetness.' },
  { _id: 'static-fruit-5', name: 'Dates', price: 240, originalPrice: 300, discount: 20, image: '/Product_images/dates.png', unit: 'kg', category: 'fruits', farmerName: 'Shashank Kanade', stock: 25, description: 'Premium quality dates, naturally sweet and rich in fiber and nutrients.' },
  { _id: 'static-fruit-6', name: 'Apple', price: 96, originalPrice: 120, discount: 20, image: '/Product_images/apple.jpg', unit: 'kg', category: 'fruits', farmerName: 'Bunty Thalkar', stock: 35, description: 'Crisp and delicious apples from the hills. A nutritious daily snack.' },
  { _id: 'static-fruit-7', name: 'Pomegranate', price: 80, originalPrice: 100, discount: 20, image: '/Product_images/pomegranate.png', unit: 'kg', category: 'fruits', farmerName: 'Shashank Kanade', stock: 30, description: 'Ruby-red pomegranate seeds, packed with antioxidants and natural sweetness.' },
  { _id: 'static-fruit-8', name: 'Papaya', price: 20, originalPrice: 25, discount: 20, image: '/Product_images/papaya.jpg', unit: 'kg', category: 'fruits', farmerName: 'Bunty Thalkar', stock: 40, description: 'Ripe, golden papaya – great for digestion and a refreshing tropical taste.' },
  { _id: 'static-fruit-9', name: 'Grapes', price: 56, originalPrice: 70, discount: 20, image: '/Product_images/grapes.jpg', unit: 'kg', category: 'fruits', farmerName: 'Shashank Kanade', stock: 35, description: 'Fresh seedless grapes, sweet and juicy. Perfect for snacking or making juice.' },

  // ========== VEGETABLES (10) ==========
  { _id: 'static-veg-1', name: 'Bhendi (Okra)', price: 32, originalPrice: 40, discount: 20, image: '/images/bhendi.jpg', unit: 'kg', category: 'vegetables', farmerName: 'Bunty Thalkar', stock: 50, description: 'Tender, farm-fresh bhendi/okra. Perfect for sabzi and stir-fry dishes.' },
  { _id: 'static-veg-2', name: 'Tomato', price: 24, originalPrice: 30, discount: 20, image: '/Product_images/tomato.jpg', unit: 'kg', category: 'vegetables', farmerName: 'Shashank Kanade', stock: 60, description: 'Ripe, red tomatoes harvested fresh. Essential for every Indian kitchen.' },
  { _id: 'static-veg-3', name: 'Onion', price: 16, originalPrice: 20, discount: 20, image: '/Product_images/onion.jpg', unit: 'kg', category: 'vegetables', farmerName: 'Bunty Thalkar', stock: 80, description: 'Fresh onions with a strong, aromatic flavor. A staple in Indian cooking.' },
  { _id: 'static-veg-4', name: 'Potato', price: 16, originalPrice: 20, discount: 20, image: '/Product_images/potato.jpg', unit: 'kg', category: 'vegetables', farmerName: 'Shashank Kanade', stock: 70, description: 'Clean, firm potatoes from the farm. Versatile and delicious in any dish.' },
  { _id: 'static-veg-5', name: 'Capsicum (Green)', price: 40, originalPrice: 50, discount: 20, image: '/Product_images/capcicum.png', unit: 'kg', category: 'vegetables', farmerName: 'Bunty Thalkar', stock: 35, description: 'Crisp green capsicum, ideal for salads, stir-fries, and stuffed recipes.' },
  { _id: 'static-veg-6', name: 'Cauliflower', price: 28, originalPrice: 35, discount: 20, image: '/Product_images/cauliflower.jpg', unit: 'kg', category: 'vegetables', farmerName: 'Shashank Kanade', stock: 40, description: 'Fresh white cauliflower heads, perfect for gobi sabzi and parathas.' },
  { _id: 'static-veg-7', name: 'Carrot (Orange)', price: 28, originalPrice: 35, discount: 20, image: '/Product_images/carrot(orange).jpg', unit: 'kg', category: 'vegetables', farmerName: 'Bunty Thalkar', stock: 45, description: 'Sweet orange carrots, great for salads, juices, and halwa.' },
  { _id: 'static-veg-8', name: 'Spinach (Palak)', price: 20, originalPrice: 25, discount: 20, image: '/Product_images/Spinach-Palak.jpg', unit: 'kg', category: 'vegetables', farmerName: 'Shashank Kanade', stock: 55, description: 'Fresh, leafy spinach – iron-rich and perfect for palak paneer.' },
  { _id: 'static-veg-9', name: 'Brinjal (Vangi)', price: 24, originalPrice: 30, discount: 20, image: '/Product_images/brinjal.jpg', unit: 'kg', category: 'vegetables', farmerName: 'Bunty Thalkar', stock: 40, description: 'Purple brinjal, ideal for bharit, bagara baingan, and curries.' },
  { _id: 'static-veg-10', name: 'Cabbage', price: 20, originalPrice: 25, discount: 20, image: '/Product_images/cabbage.png', unit: 'kg', category: 'vegetables', farmerName: 'Shashank Kanade', stock: 50, description: 'Fresh green cabbage, crunchy and nutritious for salads and stir-fries.' },

  // ========== DAIRY (8) ==========
  { _id: 'static-dairy-1', name: 'Buffalo Milk', price: 65, originalPrice: 65, discount: 0, image: '/images/amul-buffalo (1).png', unit: 'liter', category: 'dairy', farmerName: 'Bunty Thalkar', stock: 100, description: 'Thick, creamy buffalo milk – fresh from the farm daily.' },
  { _id: 'static-dairy-2', name: 'Amul Cheese', price: 69, originalPrice: 77, discount: 10, image: '/images/cheese pack.jpg', unit: '100g', category: 'dairy', farmerName: 'Shashank Kanade', stock: 60, description: 'Processed cheese slices, perfect for sandwiches and cooking.' },
  { _id: 'static-dairy-3', name: 'Fresh Cow Milk', price: 52, originalPrice: 52, discount: 0, image: '/Product_images/milk.jpg', unit: 'liter', category: 'dairy', farmerName: 'Bunty Thalkar', stock: 90, description: 'Pure cow milk, delivered fresh from the farm every morning.' },
  { _id: 'static-dairy-4', name: 'Fresh Curd (Dahi)', price: 35, originalPrice: 40, discount: 12, image: '/Product_images/curd.jpg', unit: '500g', category: 'dairy', farmerName: 'Shashank Kanade', stock: 70, description: 'Creamy homemade curd made from fresh farm milk.' },
  { _id: 'static-dairy-5', name: 'Pure Cow Ghee', price: 450, originalPrice: 500, discount: 10, image: '/Product_images/ghee.jpg', unit: 'kg', category: 'dairy', farmerName: 'Bunty Thalkar', stock: 30, description: 'Pure desi cow ghee, made traditionally for rich aroma and taste.' },
  { _id: 'static-dairy-6', name: 'Fresh Paneer', price: 120, originalPrice: 130, discount: 8, image: '/Product_images/panner.jpg', unit: '200g', category: 'dairy', farmerName: 'Shashank Kanade', stock: 45, description: 'Soft, fresh paneer from farm milk. Perfect for curries and tikka.' },
  { _id: 'static-dairy-7', name: 'Fresh Butter', price: 45, originalPrice: 50, discount: 10, image: '/Product_images/butter.jpg', unit: '100g', category: 'dairy', farmerName: 'Bunty Thalkar', stock: 55, description: 'Farm-churned white butter, creamy and full of flavor.' },
  { _id: 'static-dairy-8', name: 'Fresh Buttermilk', price: 25, originalPrice: 25, discount: 0, image: '/Product_images/Buttermilk.jpg', unit: '500ml', category: 'dairy', farmerName: 'Shashank Kanade', stock: 80, description: 'Cool, refreshing buttermilk – perfect for summers. Made from fresh curd.' },

  // ========== PULSES (8) ==========
  { _id: 'static-pulse-1', name: 'Toor Dal', price: 249, originalPrice: 249, discount: 0, image: '/images/toor_dal.jpg', unit: 'kg', category: 'pulses', farmerName: 'Bunty Thalkar', stock: 40, description: 'Premium toor dal, perfect for everyday dal and sambar recipes.' },
  { _id: 'static-pulse-2', name: 'Moong Dal', price: 80, originalPrice: 100, discount: 20, image: '/Product_images/moong dal.jpg', unit: 'kg', category: 'pulses', farmerName: 'Shashank Kanade', stock: 50, description: 'Yellow moong dal, easy to cook and highly nutritious.' },
  { _id: 'static-pulse-3', name: 'Chana Dal', price: 64, originalPrice: 80, discount: 20, image: '/Product_images/chana dal.avif', unit: 'kg', category: 'pulses', farmerName: 'Bunty Thalkar', stock: 45, description: 'Split chickpea dal, great for dal tadka and sweets.' },
  { _id: 'static-pulse-4', name: 'Urad Dal (Black)', price: 72, originalPrice: 90, discount: 20, image: '/Product_images/urad dal.jpg', unit: 'kg', category: 'pulses', farmerName: 'Shashank Kanade', stock: 35, description: 'Black urad dal, essential for dal makhani and vadas.' },
  { _id: 'static-pulse-5', name: 'Masoor Dal', price: 68, originalPrice: 85, discount: 20, image: '/Product_images/masoor-dal-face-pack.jpg', unit: 'kg', category: 'pulses', farmerName: 'Bunty Thalkar', stock: 40, description: 'Red masoor dal, cooks quickly and tastes delicious in everyday meals.' },
  { _id: 'static-pulse-6', name: 'Rajma', price: 88, originalPrice: 110, discount: 20, image: '/Product_images/benefits-of-rajma.jpg', unit: 'kg', category: 'pulses', farmerName: 'Shashank Kanade', stock: 30, description: 'Premium kidney beans, perfect for Rajma Chawal – a North Indian classic.' },
  { _id: 'static-pulse-7', name: 'Kabuli Chana', price: 85, originalPrice: 100, discount: 15, image: '/Product_images/kabuli chana.jpg', unit: 'kg', category: 'pulses', farmerName: 'Bunty Thalkar', stock: 35, description: 'White chickpeas, ideal for chole bhature and salads.' },
  { _id: 'static-pulse-8', name: 'Kala Chana', price: 75, originalPrice: 89, discount: 16, image: '/Product_images/kala chana.jpg', unit: 'kg', category: 'pulses', farmerName: 'Shashank Kanade', stock: 40, description: 'Black chickpeas, packed with protein and fiber. Great for curries.' },

  // ========== PICKLES (6) ==========
  { _id: 'static-pickle-1', name: 'Mango Pickle', price: 319, originalPrice: 319, discount: 0, image: '/images/pickel-1kg.jpg', unit: 'kg', category: 'pickles', farmerName: 'Bunty Thalkar', stock: 25, description: 'Homemade mango pickle with traditional spices. Tangy and flavorful.' },
  { _id: 'static-pickle-2', name: 'Lemon Pickle', price: 280, originalPrice: 318, discount: 12, image: '/Product_images/lemon pickle.png', unit: '500g', category: 'pickles', farmerName: 'Shashank Kanade', stock: 30, description: 'Tangy lemon pickle prepared with mustard oil and Indian spices.' },
  { _id: 'static-pickle-3', name: 'Garlic Pickle (Lehsun)', price: 265, originalPrice: 294, discount: 10, image: '/Product_images/garlic.jpg', unit: '500g', category: 'pickles', farmerName: 'Bunty Thalkar', stock: 20, description: 'Spicy garlic pickle, a perfect accompaniment for your meals.' },
  { _id: 'static-pickle-4', name: 'Green Chilli Pickle', price: 240, originalPrice: 282, discount: 15, image: '/Product_images/green-chilli-pickle-1.jpg', unit: '500g', category: 'pickles', farmerName: 'Shashank Kanade', stock: 25, description: 'Hot and tangy green chilli pickle for spice lovers.' },
  { _id: 'static-pickle-5', name: 'Amla Pickle', price: 275, originalPrice: 309, discount: 11, image: '/Product_images/Amla-pickle.jpg', unit: '500g', category: 'pickles', farmerName: 'Bunty Thalkar', stock: 20, description: 'Nutritious amla pickle, rich in vitamin C and perfectly spiced.' },
  { _id: 'static-pickle-6', name: 'Carrot Pickle (Gajar)', price: 290, originalPrice: 319, discount: 9, image: '/Product_images/gajar pickle.jpg', unit: '500g', category: 'pickles', farmerName: 'Shashank Kanade', stock: 22, description: 'Crunchy carrot pickle made with traditional homemade recipe.' },

  // ========== MASALA BLENDS (5) ==========
  { _id: 'static-masala-1', name: 'Garam Masala', price: 59, originalPrice: 59, discount: 0, image: '/images/Garam-Masala-Powder.jpg', unit: '100g', category: 'masala', farmerName: 'Bunty Thalkar', stock: 60, description: 'Aromatic garam masala blend, freshly ground for maximum flavor.' },
  { _id: 'static-masala-2', name: 'Haldi (Turmeric Powder)', price: 45, originalPrice: 50, discount: 10, image: '/Product_images/turmeric powder.png', unit: '100g', category: 'masala', farmerName: 'Shashank Kanade', stock: 70, description: 'Pure turmeric powder with high curcumin content. Essential spice.' },
  { _id: 'static-masala-3', name: 'Red Chilli Powder', price: 65, originalPrice: 71, discount: 8, image: '/Product_images/red-chilli-powde.jpg', unit: '100g', category: 'masala', farmerName: 'Bunty Thalkar', stock: 55, description: 'Hot red chilli powder, stone-ground for authentic taste.' },
  { _id: 'static-masala-4', name: 'Dhania (Coriander Powder)', price: 55, originalPrice: 62, discount: 12, image: '/Product_images/corri.jpg', unit: '100g', category: 'masala', farmerName: 'Shashank Kanade', stock: 50, description: 'Freshly ground coriander powder, adds earthy flavor to curries.' },
  { _id: 'static-masala-5', name: 'Jeera (Cumin Powder)', price: 48, originalPrice: 54, discount: 11, image: '/Product_images/CuminPowder_1_1024x1024.jpg', unit: '100g', category: 'masala', farmerName: 'Bunty Thalkar', stock: 45, description: 'Aromatic cumin powder, essential for tempering and seasoning.' },

  // ========== GRAINS & CEREALS (8) ==========
  { _id: 'static-grain-1', name: 'Basmati Rice', price: 55, originalPrice: 60, discount: 8, image: '/Product_images/basmati-rice-png.png', unit: 'kg', category: 'grains', farmerName: 'Shashank Kanade', stock: 60, description: 'Long-grain basmati rice, fragrant and fluffy when cooked.' },
  { _id: 'static-grain-2', name: 'Atta (Wheat Flour)', price: 42, originalPrice: 45, discount: 7, image: '/Product_images/wheat-flour.jpg', unit: 'kg', category: 'grains', farmerName: 'Bunty Thalkar', stock: 70, description: 'Whole wheat flour, stone-ground for soft and fluffy chapatis.' },
  { _id: 'static-grain-3', name: 'Indrayani Rice', price: 38, originalPrice: 40, discount: 5, image: '/Product_images/indrayani rice.jpg', unit: 'kg', category: 'grains', farmerName: 'Shashank Kanade', stock: 50, description: 'Fragrant Indrayani rice from Maharashtra, perfect for everyday meals.' },
  { _id: 'static-grain-4', name: 'Jowar (Jwari)', price: 65, originalPrice: 72, discount: 10, image: '/Product_images/jwari.jpg', unit: 'kg', category: 'grains', farmerName: 'Bunty Thalkar', stock: 40, description: 'Nutritious jowar grain, gluten-free and great for bhakri.' },
  { _id: 'static-grain-5', name: 'Bajra', price: 58, originalPrice: 66, discount: 12, image: '/Product_images/bajra.jpg', unit: 'kg', category: 'grains', farmerName: 'Shashank Kanade', stock: 45, description: 'Pearl millet (bajra), rich in iron and perfect for winter rotis.' },
  { _id: 'static-grain-6', name: 'Ragi', price: 48, originalPrice: 53, discount: 9, image: '/Product_images/Ragi.jpg', unit: 'kg', category: 'grains', farmerName: 'Bunty Thalkar', stock: 35, description: 'Finger millet, a superfood rich in calcium. Great for mudde and porridge.' },
  { _id: 'static-grain-7', name: 'Sweetcorn', price: 52, originalPrice: 58, discount: 11, image: '/Product_images/sweet corn.jpg', unit: 'kg', category: 'grains', farmerName: 'Shashank Kanade', stock: 40, description: 'Fresh sweet corn kernels, perfect for soups, snacks, and salads.' },
  { _id: 'static-grain-8', name: 'Besan', price: 68, originalPrice: 74, discount: 8, image: '/Product_images/besan.jpg', unit: 'kg', category: 'grains', farmerName: 'Bunty Thalkar', stock: 50, description: 'Gram flour (besan), essential for pakoras, ladoos, and cheela.' },
];

// Category labels matching web sidebar
export const PRODUCT_CATEGORIES = [
  { key: 'all', label: 'All Products', icon: 'grid-outline' },
  { key: 'fruits', label: 'Fruits', icon: 'nutrition-outline' },
  { key: 'vegetables', label: 'Vegetables', icon: 'leaf-outline' },
  { key: 'dairy', label: 'Dairy Products', icon: 'water-outline' },
  { key: 'pulses', label: 'Pulses', icon: 'ellipse-outline' },
  { key: 'pickles', label: 'Pickles', icon: 'flask-outline' },
  { key: 'masala', label: 'Masala Blends', icon: 'flame-outline' },
  { key: 'grains', label: 'Grains & Cereals', icon: 'restaurant-outline' },
];

// Sort options matching web
export const SORT_OPTIONS = [
  { key: 'default', label: 'Sort by: Default' },
  { key: 'price-low', label: 'Price: Low to High' },
  { key: 'price-high', label: 'Price: High to Low' },
  { key: 'discount', label: 'Discount: High to Low' },
];
