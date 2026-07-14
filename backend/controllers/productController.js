const Product = require('../models/Product');
const Category = require('../models/Category');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const os = require('os');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const uploadDir = isProduction
      ? path.join(os.tmpdir(), 'uploads')
      : 'uploads/';

    // Create directory if it doesn't exist
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (err) {
      console.error('Error creating upload dir:', err);
      cb(null, os.tmpdir());
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Export upload middleware for use in routes
exports.uploadProductImage = upload.single('image');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, description, usage, useByHoroscope } = req.body;

    // Validate required fields
    if (!name || !category || !price) {
      return res.status(400).json({
        message: 'Name, category, and price are required'
      });
    }

    // Check if category exists
    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // Prepare product data
    const productData = {
      name,
      category,
      price,
      description,
      usage,
      useByHoroscope
    };

    // Add image path if file was uploaded
    if (req.file) {
      productData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = new Product(productData);

    await product.save();

    // Populate category for response
    await product.populate('category');

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// Get all products with optional filtering
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { usage: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('category')
      .sort({ createdAt: -1 });

    res.json({
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, price, description, usage, useByHoroscope } = req.body;

    // Check if category exists (if provided)
    if (category) {
      const existingCategory = await Category.findById(category);
      if (!existingCategory) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (usage !== undefined) updateData.usage = usage;
    if (useByHoroscope !== undefined) updateData.useByHoroscope = useByHoroscope;

    // Handle image upload if provided
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated image file if it exists
    if (product.imageUrl) {
      const imagePath = path.join(__dirname, '..', '..', 'backend', product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};