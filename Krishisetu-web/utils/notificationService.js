const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

class NotificationService {
    constructor() {
        // Email transporter (configure with your email service)
        this.emailTransporter = nodemailer.createTransporter({
            service: 'gmail', // or your email service
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASS || 'your-app-password'
            }
        });
    }

    // Create in-app notification
    async createNotification(data) {
        try {
            const notification = await Notification.create({
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                link: data.link,
                orderId: data.orderId,
                productId: data.productId,
                channel: 'in_app',
                status: 'sent',
                sentAt: new Date()
            });
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            return null;
        }
    }

    // Send email notification
    async sendEmail(to, subject, html) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'Krishi-Setu <noreply@krishisetu.com>',
                to: to,
                subject: subject,
                html: html
            };

            await this.emailTransporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }

    // Order placed notification
    async notifyOrderPlaced(order, user) {
        // Create in-app notification
        await this.createNotification({
            userId: order.userId,
            type: 'order',
            title: 'Order Placed Successfully',
            message: `Your order #${order.orderNumber} has been placed successfully. Total: ₹${order.totalAmount}`,
            link: `/orders/${order._id}`,
            orderId: order._id
        });

        // Send email if enabled
        if (user.notifications && user.notifications.email) {
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">Order Confirmation</h2>
                    <p>Dear ${user.name},</p>
                    <p>Thank you for your order! Your order has been successfully placed.</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Order Details</h3>
                        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
                        <p><strong>Estimated Delivery:</strong> ${order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN') : '5-7 business days'}</p>
                    </div>
                    <p>You can track your order status in your account.</p>
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated message from Krishi-Setu</p>
                </div>
            `;
            await this.sendEmail(user.email, 'Order Confirmation - Krishi-Setu', emailHtml);
        }
    }

    // Order status update notification
    async notifyOrderStatusUpdate(order, user, newStatus) {
        const statusMessages = {
            confirmed: 'Your order has been confirmed and is being prepared.',
            processing: 'Your order is being processed.',
            shipped: 'Your order has been shipped and is on its way!',
            out_for_delivery: 'Your order is out for delivery.',
            delivered: 'Your order has been delivered successfully.',
            cancelled: 'Your order has been cancelled.'
        };

        // Create in-app notification
        await this.createNotification({
            userId: order.userId,
            type: 'order',
            title: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
            message: `Order #${order.orderNumber}: ${statusMessages[newStatus] || 'Status updated'}`,
            link: `/orders/${order._id}`,
            orderId: order._id
        });

        // Send email if enabled
        if (user.notifications && user.notifications.email) {
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">Order Status Update</h2>
                    <p>Dear ${user.name},</p>
                    <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                        <p><strong>Status:</strong> <span style="color: #10b981; text-transform: capitalize;">${newStatus.replace('_', ' ')}</span></p>
                        ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
                    </div>
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated message from Krishi-Setu</p>
                </div>
            `;
            await this.sendEmail(user.email, `Order Update - ${order.orderNumber}`, emailHtml);
        }
    }

    // Notify farmer about new order
    async notifyFarmerNewOrder(order, farmer) {
        // Create in-app notification
        await this.createNotification({
            userId: farmer._id,
            type: 'order',
            title: 'New Order Received',
            message: `You have received a new order #${order.orderNumber} worth ₹${order.totalAmount}`,
            link: `/farmer-dashboard?tab=orders`,
            orderId: order._id
        });

        // Send email if enabled
        if (farmer.notifications && farmer.notifications.email) {
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">New Order Received!</h2>
                    <p>Dear ${farmer.name},</p>
                    <p>Great news! You have received a new order.</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Order Details</h3>
                        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
                        <p><strong>Items:</strong> ${order.items.length}</p>
                    </div>
                    <p>Please log in to your dashboard to view order details and confirm the order.</p>
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated message from Krishi-Setu</p>
                </div>
            `;
            await this.sendEmail(farmer.email, 'New Order - Krishi-Setu', emailHtml);
        }
    }

    // Notify farmer about low stock
    async notifyLowStock(product, farmer) {
        // Create in-app notification
        await this.createNotification({
            userId: farmer._id,
            type: 'low_stock',
            title: 'Low Stock Alert',
            message: `${product.name} is running low on stock. Current stock: ${product.stock} ${product.unit}`,
            link: `/farmer-dashboard?tab=myProducts`,
            productId: product._id
        });
    }

    // Get unread notifications
    async getUnreadNotifications(userId) {
        try {
            const notifications = await Notification.find({
                userId: userId,
                read: false
            }).sort({ createdAt: -1 }).limit(10);
            return notifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    // Mark notification as read
    async markAsRead(notificationId) {
        try {
            await Notification.findByIdAndUpdate(notificationId, {
                read: true,
                readAt: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    // Mark all notifications as read
    async markAllAsRead(userId) {
        try {
            await Notification.updateMany(
                { userId: userId, read: false },
                { read: true, readAt: new Date() }
            );
            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }
}

module.exports = new NotificationService();
