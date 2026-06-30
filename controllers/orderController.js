// controllers/orderController.js
const Order = require('../models/orderModel');
const User = require('../models/userModel');

// controllers/orderController.js - Update createOrder

// controllers/orderController.js - Updated createOrder

exports.createOrder = async (req, res) => {
  try {
    const { items, customer, payment, totals, notes } = req.body;

    console.log('📦 Creating order...');
    console.log('👤 User from request:', req.user);

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!customer || !customer.firstName || !customer.lastName || !customer.email || 
        !customer.phone || !customer.address || !customer.address.street) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required customer fields'
      });
    }

    // Get user ID if authenticated
    let userId = null;
    if (req.user) {
      userId = req.user.id || req.user._id;
      console.log(`✅ User authenticated - ID: ${userId}`);
    } else {
      console.log('⚠️ No user authenticated - guest order');
    }

    // Generate order ID
    const orderId = Order.generateOrderId();

    // Prepare order data
    const orderData = {
      orderId: orderId,
      user: userId,
      items: items.map(item => ({
        productId: item._id || item.productId,
        name: item.name,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity),
        image: item.image || '',
        discount: parseFloat(item.discount) || 0
      })),
      customer: {
        firstName: customer.firstName.trim(),
        lastName: customer.lastName.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
        address: {
          street: customer.address.street.trim(),
          city: customer.address.city?.trim() || '',
          state: customer.address.state?.trim() || '',
          pincode: customer.address.pincode?.trim() || '',
          country: customer.address.country?.trim() || 'India'
        }
      },
      payment: {
        method: payment.method || 'cod',
        status: payment.method === 'cod' ? 'pending' : 'completed'
      },
      totals: {
        subtotal: parseFloat(totals.subtotal) || 0,
        discount: parseFloat(totals.discount) || 0,
        shipping: parseFloat(totals.shipping) || 0,
        total: parseFloat(totals.total) || (parseFloat(totals.subtotal) - (parseFloat(totals.discount) || 0))
      },
      notes: notes || '',
      orderDate: new Date()
    };

    console.log('📦 Order data:', JSON.stringify(orderData, null, 2));

    // Create order
    const order = await Order.create(orderData);

    console.log(`✅ Order created: ${order.orderId} for user: ${userId || 'guest'}`);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      orderId: order.orderId,
      data: order
    });

  } catch (error) {
    console.error('❌ Create Order Error:', error);
    
    if (error.code === 11000) {
      try {
        const newOrderId = Order.generateOrderId();
        req.body.orderId = newOrderId;
        return exports.createOrder(req, res);
      } catch (retryError) {
        console.error('Retry Create Order Error:', retryError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create order. Please try again.',
          error: retryError.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private (Admin only)
exports.getAdminOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sortBy = 'orderDate', sortOrder = 'desc' } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customer.firstName': { $regex: search, $options: 'i' } },
        { 'customer.lastName': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');

    const total = await Order.countDocuments(filter);

    // Get order statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {};
    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      stats: {
        total,
        pending: statusCounts.pending || 0,
        processing: statusCounts.processing || 0,
        shipped: statusCounts.shipped || 0,
        delivered: statusCounts.delivered || 0,
        cancelled: statusCounts.cancelled || 0
      }
    });

  } catch (error) {
    console.error('Get Admin Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// @desc    Get single order (Admin)
// @route   GET /api/admin/orders/:id
// @access  Private (Admin only)
exports.getAdminOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get Admin Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });

  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// controllers/orderController.js - Update getUserOrders

// @desc    Get user orders
// @route   GET /api/orders/user
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    console.log('👤 Fetching orders for user:', req.user.id);
    
    // Find orders by user ID
    const orders = await Order.find({ user: req.user.id })
      .sort({ orderDate: -1 });
    
    console.log(`✅ Found ${orders.length} orders for user`);
    
    res.status(200).json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get User Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// @desc    Get order by ID (User)
// @route   GET /api/orders/:id
// @access  Private
exports.getUserOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get User Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// @desc    Cancel order (User)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelUserOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel delivered order'
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order already cancelled'
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    console.error('Cancel Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};