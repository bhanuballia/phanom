const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay (Use test keys if env vars are missing)
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummyKey12345',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummySecret1234567890',
});

// @desc    Get user's wallet balance and transaction history
// @route   GET /api/wallet/balance
// @access  Private
exports.getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const transactions = await WalletTransaction.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      balance: user.walletBalance,
      transactions
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create Razorpay Order for Wallet Recharge
// @route   POST /api/wallet/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Please provide a valid amount' });
  }

  try {
    const options = {
      amount: amount * 100, // Amount is in currency subunits (paise)
      currency: "INR",
      receipt: `receipt_wallet_${req.user._id}_${Date.now()}`,
    };
    
    let order;
    // Check if using dummy keys
    if ((process.env.RAZORPAY_KEY_ID || 'rzp_test_dummyKey12345') === 'rzp_test_dummyKey12345') {
      console.log('Using dummy Razorpay keys. Mocking order creation.');
      order = {
        id: `order_mock_${Date.now()}`,
        entity: "order",
        amount: options.amount,
        currency: "INR",
        receipt: options.receipt,
        status: "created"
      };
    } else {
      order = await razorpayInstance.orders.create(options);
    }
    
    if (!order) {
      return res.status(500).json({ success: false, message: 'Some error occurred while creating order' });
    }
    
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error creating razorpay order:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + (error.message || 'Unknown') });
  }
};

// @desc    Verify Razorpay Payment and Add to Wallet
// @route   POST /api/wallet/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMockOrder = razorpay_order_id && razorpay_order_id.startsWith('order_mock_');

    let isAuthentic = false;
    if (isMockOrder) {
      isAuthentic = true;
    } else {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummySecret1234567890')
        .update(body.toString())
        .digest("hex");
      isAuthentic = expectedSignature === razorpay_signature;
    }

    if (isAuthentic) {
      // If authentic or testing without keys, add amount to current balance
      user.walletBalance += Number(amount);
      await user.save();

      // Create a transaction record
      const transaction = await WalletTransaction.create({
        user: user._id,
        type: 'credit',
        amount: Number(amount),
        balanceAfter: user.walletBalance,
        description: `Recharged wallet via Razorpay with ₹${amount}`,
        paymentGatewayOrderId: razorpay_order_id,
        paymentGatewayTransactionId: razorpay_payment_id,
        status: 'success'
      });

      res.status(200).json({
        success: true,
        message: 'Wallet recharged successfully',
        balance: user.walletBalance,
        transaction
      });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Error verifying wallet payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Deduct money from wallet (For service purchase)
// @route   POST /api/wallet/deduct
// @access  Private
exports.deductWalletBalance = async (req, res) => {
  const { amount, description, relatedServiceId } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Please provide a valid amount' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if they have enough balance
    if (user.walletBalance < Number(amount)) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance. Please recharge.' });
    }

    // Deduct amount
    user.walletBalance -= Number(amount);
    await user.save();

    // Create a transaction record
    const transaction = await WalletTransaction.create({
      user: user._id,
      type: 'debit',
      amount: Number(amount),
      balanceAfter: user.walletBalance,
      description: description || 'Payment for service',
      relatedServiceId: relatedServiceId || null,
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Payment successful',
      balance: user.walletBalance,
      transaction
    });
  } catch (error) {
    console.error('Error deducting wallet balance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
