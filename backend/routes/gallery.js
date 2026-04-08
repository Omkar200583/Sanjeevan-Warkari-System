const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Gallery = require('../models/Gallery');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ✅ Upload folder
const uploadDir = path.join(__dirname, '../uploads/gallery');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`✅ Created upload directory: ${uploadDir}`);
}

// ✅ Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`📁 Saving file to: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = unique + path.extname(file.originalname);
    console.log(`📝 Generated filename: ${filename}`);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    console.log(`🖼️ File extension: ${ext}`);

    if (allowed.includes(ext)) {
      console.log(`✅ File type accepted`);
      cb(null, true);
    } else {
      console.log(`❌ File type rejected: ${ext}`);
      cb(new Error('Only images allowed (jpg, jpeg, png, webp)'));
    }
  },
});

// ✅ GET all images with category filter
router.get('/', async (req, res) => {
  try {
    console.log("📌 GET /api/gallery called");
    const { category } = req.query;
    const whereCondition = category ? { category } : {};

    const list = await Gallery.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Found ${list.length} images`);
    res.json({ success: true, data: list });

  } catch (err) {
    console.error("❌ GET /api/gallery ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ POST add image (with/without auth)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log("\n🚀 POST /api/gallery called");
    console.log("📦 BODY:", req.body);
    console.log("📁 FILE:", req.file ? `${req.file.filename} (${req.file.size} bytes)` : 'NO FILE');
    console.log("👤 USER:", req.user ? `ID: ${req.user.id}` : 'NOT AUTHENTICATED');

    // ✅ Check if file exists
    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const { titleMr, titleEn, category } = req.body;

    // ✅ Get user ID (from auth or default to NULL)
    let userId = null;
    if (req.user && req.user.id) {
      // Verify user exists
      const user = await User.findByPk(req.user.id);
      if (user) {
        userId = req.user.id;
        console.log(`✅ User verified: ID ${userId}`);
      } else {
        console.warn(`⚠️ User ID ${req.user.id} not found in database`);
      }
    } else {
      console.warn("⚠️ No authenticated user, using NULL for addedBy");
    }

    const imageUrl = `/uploads/gallery/${req.file.filename}`;

    // ✅ Create gallery item
    console.log(`📝 Creating gallery item with:`, {
      titleMr: titleMr || 'छायाचित्र',
      titleEn: titleEn || 'Photo',
      imageUrl,
      category: category || 'general',
      addedBy: userId
    });

    const item = await Gallery.create({
      titleMr: titleMr || 'छायाचित्र',
      titleEn: titleEn || 'Photo',
      imageUrl,
      category: category || 'general',
      addedBy: userId  // ✅ Can be NULL now
    });

    console.log(`✅ Gallery item created with ID: ${item.id}`);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully 📸',
      data: item
    });

  } catch (err) {
    console.error("🔥 POST /api/gallery ERROR:", {
      name: err.name,
      message: err.message,
      code: err.code,
      detail: err.detail
    });

    // ✅ Delete file if database insert fails
    if (req.file) {
      const filePath = path.join(uploadDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Cleaned up file: ${filePath}`);
      }
    }

    res.status(500).json({
      success: false,
      message: `Error: ${err.message}`
    });
  }
});

// ✅ DELETE image (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    console.log(`🗑️ DELETE /api/gallery/${req.params.id} called`);

    const item = await Gallery.findByPk(req.params.id);

    if (!item) {
      console.log(`❌ Image not found: ID ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // ✅ Extract filename and delete file
    const filename = path.basename(item.imageUrl);
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted file: ${filePath}`);
      } catch (fileErr) {
        console.error(`⚠️ Could not delete file: ${filePath}`, fileErr.message);
      }
    } else {
      console.warn(`⚠️ File not found: ${filePath}`);
    }

    // Delete database record
    await item.destroy();
    console.log(`✅ Deleted image from database`);

    res.json({
      success: true,
      message: 'Image deleted successfully 🗑️'
    });

  } catch (err) {
    console.error("❌ DELETE /api/gallery ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ UPDATE image info (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    console.log(`✏️ PUT /api/gallery/${req.params.id} called`);

    const item = await Gallery.findByPk(req.params.id);

    if (!item) {
      console.log(`❌ Image not found: ID ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const { titleMr, titleEn, category } = req.body;

    await item.update({
      ...(titleMr && { titleMr }),
      ...(titleEn && { titleEn }),
      ...(category && { category })
    });

    console.log(`✅ Updated image ID: ${item.id}`);

    res.json({
      success: true,
      message: 'Image updated successfully ✏️',
      data: item
    });

  } catch (err) {
    console.error("❌ PUT /api/gallery ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;