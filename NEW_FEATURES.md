# Krishi-Setu - New Features Documentation

## 🎉 What's New

This update includes essential features for a complete e-commerce platform:

### 1. **Order Status Management** ✅
- **Comprehensive Order Tracking**: Orders now go through multiple stages:
  - Pending → Confirmed → Processing → Shipped → Out for Delivery → Delivered
- **Status History**: Complete timeline of order status changes
- **Estimated Delivery Dates**: Automatically calculated (7 days from order)
- **Tracking Numbers**: Support for courier tracking numbers
- **Visual Timeline**: Beautiful order tracking UI for customers

### 2. **Notification System** 📧
- **Email Notifications**: 
  - Order confirmation emails
  - Order status update emails
  - New order alerts for farmers
  - Low stock alerts for farmers
- **In-App Notifications**: 
  - Real-time notifications in the dashboard
  - Notification badge with unread count
  - Mark as read functionality
- **Notification Preferences**: Users can control their notification settings
- **Multi-Channel Support**: Email, SMS (ready), and in-app notifications

### 3. **Enhanced Search & Filters** 🔍
- **Advanced Product Search**:
  - Search by product name or description
  - Filter by farmer name
  - Filter by location
  - Price range filters (min/max)
  - Stock availability filter
- **Smart Sorting**:
  - Price: Low to High
  - Price: High to Low
  - Newest First
  - By Discount
  - By Name

### 4. **Admin Dashboard** 👨‍💼
- **Comprehensive Admin Panel**: Full-featured admin dashboard at `/admin`
- **User Management**:
  - View all users (farmers, customers, admins)
  - Filter by role
  - Search users
  - Toggle user verification status
  - Delete users
- **Order Management**:
  - View all orders
  - Filter by status
  - Update order status
  - View order details
  - Track delivery
- **Product Management**:
  - View all products
  - Filter by category
  - Activate/deactivate products
  - View farmer products
- **Analytics & Reports**:
  - Dashboard statistics
  - Revenue trends
  - User distribution
  - Order analytics
  - Interactive charts

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI`: Your MongoDB connection string
- `SESSION_SECRET`: Random secret key for sessions
- `EMAIL_USER`: Your email address for sending notifications
- `EMAIL_PASS`: Your email app password (for Gmail)
- `PORT`: Server port (default: 5000)

### 3. Setup Admin Account
Run the admin setup script:
```bash
node setup-admin.js
```

This will create an admin account with the credentials specified in `.env` or defaults to:
- Email: `admin@krishisetu.com`
- Password: `admin123`

**⚠️ Important: Change the password after first login!**

### 4. Start the Server
```bash
npm start
```

The server will run on `http://localhost:5000`

## 📧 Email Configuration (Gmail)

To enable email notifications with Gmail:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to your Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Update `.env` file**:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

For other email providers, update the transporter configuration in `utils/notificationService.js`

## 🎯 Feature Usage

### For Customers:

1. **View Order Tracking**:
   - Go to "My Orders"
   - Click "View Details" on any order
   - See complete order timeline with status updates

2. **Receive Notifications**:
   - Get email confirmations when placing orders
   - Receive status update emails
   - View in-app notifications in the navbar
   - Click the bell icon to see recent notifications

3. **Advanced Product Search**:
   - Use the search bar to find products
   - Apply filters (price range, farmer, availability)
   - Sort products by various criteria

### For Farmers:

1. **Receive Order Notifications**:
   - Get instant email alerts for new orders
   - See in-app notifications in dashboard
   - View all orders in the Orders section

2. **Update Order Status**:
   - Navigate to Orders in farmer dashboard
   - Select order status from dropdown
   - Add tracking number when shipped
   - Customers automatically receive status update emails

3. **Low Stock Alerts**:
   - Automatic notifications when products run low (< 10 units)
   - Update stock in "My Products" section

### For Admins:

1. **Access Admin Dashboard**:
   - Navigate to `/admin`
   - Login with admin credentials

2. **Manage Users**:
   - View all users in the Users section
   - Verify farmer accounts
   - Manage user roles
   - Search and filter users

3. **Monitor Orders**:
   - View all platform orders
   - Update order status
   - Track delivery progress
   - Filter by status

4. **Manage Products**:
   - View all products from all farmers
   - Activate/deactivate products
   - Filter and search products

5. **View Analytics**:
   - Check dashboard statistics
   - View revenue trends
   - Analyze order patterns
   - Download reports

## 🔐 Security Features

- **Role-Based Access Control**: Separate permissions for customers, farmers, and admins
- **Session Management**: Secure session handling
- **Password Hashing**: Bcrypt encryption for passwords
- **Admin-Only Routes**: Protected admin endpoints
- **Data Validation**: Input validation on all forms

## 📱 API Endpoints

### Notification Endpoints:
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read

### Order Endpoints:
- `PUT /api/orders/:orderId/status` - Update order status (farmers/admins)

### Admin Endpoints:
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/products` - Get all products
- `PUT /api/admin/users/:userId` - Update user
- `DELETE /api/admin/users/:userId` - Delete user
- `PUT /api/admin/products/:productId` - Update product
- `GET /api/admin/analytics/revenue` - Revenue analytics

### Enhanced Product Search:
- `GET /api/products/all?category=&search=&minPrice=&maxPrice=&sortBy=&farmerName=&inStock=`

## 🎨 UI Enhancements

- **Order Timeline**: Visual progress indicator for order status
- **Notification Bell**: Real-time notification badge in navbar
- **Admin Dashboard**: Modern, responsive admin interface
- **Modal Dialogs**: Enhanced order details modal with tracking
- **Status Badges**: Color-coded order status indicators
- **Responsive Design**: Mobile-friendly on all pages

## 🐛 Troubleshooting

**Email not sending:**
- Check EMAIL_USER and EMAIL_PASS in `.env`
- Verify app password is correct (not your regular password)
- Check Gmail security settings

**Admin can't login:**
- Run `node setup-admin.js` to create/verify admin account
- Check MongoDB connection
- Verify role is set to 'admin' in database

**Notifications not showing:**
- Check MongoDB for Notification collection
- Verify notificationService is properly required
- Check browser console for errors

## 📊 Database Models

### Enhanced Order Model:
- Added `statusHistory` array
- Added `estimatedDeliveryDate`
- Added `trackingNumber`
- Added `farmerId` and `farmerName`
- Added `notifications` object
- Added `rating` object

### Enhanced User Model:
- Added `notifications` preferences
- Added `isVerified` flag
- Added `verificationDocuments`
- Added `lastLogin`
- Added `address` with location coordinates

### New Notification Model:
- Track all notifications
- Support for multiple channels
- Read/unread status
- Link to related orders/products

## 🚀 Future Enhancements

Ready for implementation:
- Payment gateway integration (Razorpay/Stripe)
- SMS notifications via Twilio
- Real-time chat between farmers and customers
- Product rating and review system
- Wishlist functionality
- Subscription orders
- Multi-language support
- Mobile app (PWA)

## 📝 License

This project is part of Krishi-Setu platform.

## 👥 Support

For issues or questions, contact the development team.
