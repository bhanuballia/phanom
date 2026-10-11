const express = require('express');
const router = express.Router();
const { getWalletBalance, createOrder, verifyPayment, deductWalletBalance } = require('../controllers/walletController');
const { protect } = require('../middleware/auth'); // ensure your auth middleware exposes protect

// All wallet routes should be protected
router.use(protect);

router.get('/balance', getWalletBalance);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/deduct', deductWalletBalance);

module.exports = router;
