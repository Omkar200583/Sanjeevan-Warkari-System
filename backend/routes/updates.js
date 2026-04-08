const express = require('express');
const router = express.Router();

const Update = require('../models/Update');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// ✅ GET all updates (public)
router.get('/', async (req, res) => {
  try {
    console.log("📌 GET /api/updates called");
    
    const list = await Update.findAll({
      include: {
        model: User,
        attributes: ['id', 'fullName'],
        required: false  // LEFT JOIN - include updates even if user doesn't exist
      },
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Found ${list.length} updates`);
    res.json({ success: true, data: list });

  } catch (err) {
    console.error("❌ GET /api/updates ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ CREATE update (public for testing, add auth later)
router.post('/', async (req, res) => {
  try {
    console.log("\n🚀 POST /api/updates called");
    console.log("📦 BODY:", req.body);
    console.log("👤 USER:", req.user ? `ID: ${req.user.id}` : 'NOT AUTHENTICATED');

    const { dateLabel, titleMr, titleEn, bodyMr, bodyEn } = req.body;

    // ✅ Validation
    if (!titleMr || !titleEn || !bodyMr || !bodyEn) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: 'All fields are required: titleMr, titleEn, bodyMr, bodyEn'
      });
    }

    console.log("✅ All fields present");

    // ✅ Get user ID (from auth or use NULL)
    let userId = null;
    if (req.user && req.user.id) {
      try {
        const user = await User.findByPk(req.user.id);
        if (user) {
          userId = req.user.id;
          console.log(`✅ User verified: ID ${userId}`);
        } else {
          console.warn(`⚠️ User ID ${req.user.id} not found in database`);
        }
      } catch (userErr) {
        console.warn(`⚠️ Error finding user:`, userErr.message);
      }
    } else {
      console.warn("⚠️ No authenticated user, using NULL for addedBy");
    }

    // ✅ Create new update
    const newUpdate = {
      dateLabel: dateLabel || new Date().toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      }).toUpperCase(),
      titleMr,
      titleEn,
      bodyMr,
      bodyEn,
      addedBy: userId  // ✅ Can be NULL now
    };

    console.log("📝 Creating update with:", newUpdate);

    let item;
    try {
      item = await Update.create(newUpdate);
      console.log(`✅ Update created with ID: ${item.id}`);
    } catch (err) {
      console.error("🔥 SEQUELIZE ERROR:", {
        name: err.name,
        message: err.message,
        code: err.code,
        detail: err.detail,
        table: err.table
      });
      return res.status(500).json({
        success: false,
        message: `Database error: ${err.message}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Update created successfully ✅',
      data: item
    });

  } catch (err) {
    console.error("🔥 POST /api/updates ERROR:", err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ✅ DELETE update (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    console.log(`🗑️ DELETE /api/updates/${req.params.id} called`);

    const item = await Update.findByPk(req.params.id);

    if (!item) {
      console.log(`❌ Update not found: ID ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    await item.destroy();
    console.log(`✅ Update deleted`);

    res.json({
      success: true,
      message: 'Update deleted successfully 🗑️'
    });

  } catch (err) {
    console.error("❌ DELETE /api/updates ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ UPDATE (edit update) - admin only
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    console.log(`✏️ PUT /api/updates/${req.params.id} called`);
    console.log("📦 BODY:", req.body);

    const item = await Update.findByPk(req.params.id);

    if (!item) {
      console.log(`❌ Update not found: ID ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    const { dateLabel, titleMr, titleEn, bodyMr, bodyEn } = req.body;

    await item.update({
      ...(dateLabel && { dateLabel }),
      ...(titleMr && { titleMr }),
      ...(titleEn && { titleEn }),
      ...(bodyMr && { bodyMr }),
      ...(bodyEn && { bodyEn })
    });

    console.log(`✅ Updated update ID: ${item.id}`);

    res.json({
      success: true,
      message: 'Update edited successfully ✏️',
      data: item
    });

  } catch (err) {
    console.error("❌ PUT /api/updates ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;