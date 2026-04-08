const express = require('express');
const Admission = require('../models/Admission');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();


// ✅ ADMIN: Stats endpoint MUST come FIRST (before /:id route)
// If placed after /:id, requests to /stats/count are caught by /:id handler
router.get('/stats/count', protect, authorize('admin'), async (req, res) => {
  try {
    const total = await Admission.count();
    const pending = await Admission.count({ where: { status: 'pending' } });
    const approved = await Admission.count({ where: { status: 'approved' } });

    res.json({
      success: true,
      data: { total, pending, approved }
    });

  } catch {
    res.status(500).json({ success: false });
  }
});


// ✅ ADMIN: Get all admissions
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const list = await Admission.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: list });
  } catch {
    res.status(500).json({ success: false });
  }
});


// ✅ USER: Get my admission
router.get('/my', protect, async (req, res) => {
  try {
    const admission = await Admission.findOne({
      where: { userId: req.user.id }
    });

    res.json({
      success: true,
      data: admission ? [admission] : []
    });

  } catch {
    res.status(500).json({ success: false });
  }
});


// ✅ CREATE admission (PUBLIC / USER)
router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      fatherName,
      motherName,
      dob,
      mobile,
      grade
    } = req.body;

    if (!fullName || !fatherName || !motherName || !dob || !mobile || !grade) {
      return res.status(400).json({
        success: false,
        message: 'All required fields missing'
      });
    }

    const admission = await Admission.create({
      ...req.body,
      userId: req.user?.id || null,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Admission submitted successfully',
      data: admission
    });

  } catch (err) {
    console.error(err);

    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: err.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ✅ ADMIN: Get single admission
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const admission = await Admission.findByPk(req.params.id);

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    res.json({ success: true, data: admission });

  } catch {
    res.status(500).json({ success: false });
  }
});


// ✅ ADMIN: Update progress
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const admission = await Admission.findByPk(req.params.id);
    if (!admission) return res.status(404).json({ success: false });

    const {
      marathiReading,
      englishReading,
      spiritualEducation,
      tablesKnowledge,
      progressNote
    } = req.body;

    await admission.update({
      marathiReading,
      englishReading,
      spiritualEducation,
      tablesKnowledge,
      progressNote
    });

    res.json({ success: true, data: admission });

  } catch {
    res.status(500).json({ success: false });
  }
});


// ✅ ADMIN: Update status
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    const valid = ['pending', 'reviewed', 'approved', 'rejected'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const admission = await Admission.findByPk(req.params.id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    await admission.update({ status });

    res.json({ success: true, data: admission });

  } catch {
    res.status(500).json({ success: false });
  }
});


// ✅ ADMIN: Delete
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const admission = await Admission.findByPk(req.params.id);
    if (!admission) return res.status(404).json({ success: false });

    await admission.destroy();

    res.json({ success: true, message: 'Deleted successfully' });

  } catch {
    res.status(500).json({ success: false });
  }
});


module.exports = router;
