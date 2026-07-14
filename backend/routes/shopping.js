const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Import controllers
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');

// Middleware to check admin role
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Product routes (GET is public)
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);

// Protected Category routes (GET is public)
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/:id', categoryController.getCategoryById);

// All other shopping routes require authentication and admin role
router.use(protect);
router.use(adminAuth);

// Admin-only Product routes
router.post('/products', productController.uploadProductImage, productController.createProduct);
router.put('/products/:id', productController.uploadProductImage, productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Admin-only Category routes
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

module.exports = router;