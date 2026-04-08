require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');
const fs = require('fs');


const authRoutes = require('./routes/auth');
const admissionRoutes = require('./routes/admission');
const galleryRoutes = require('./routes/gallery');
const updateRoutes = require('./routes/updates');

// ✅ MOUNT ROUTES


const app = express();
const PORT = process.env.PORT || 8080;

// ✅ FIX: Use ONE consistent upload path
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Middleware (in correct order)
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ FIX: Removed duplicate static file declarations
// Static files (frontend + uploads) - ONLY ONCE
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admission', admissionRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/updates', updateRoutes);

// SPA fallback
app.get('*', (req, res) => {
  if (!req.originalUrl.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  } else {
    res.status(404).json({ success: false, message: 'API route not found' });
  }
});

app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});


// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');


    // ⚠️ IMPORTANT CHANGE
    // Avoid duplicate constraints issue
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync(); // removed alter:true again for safety
      console.log('✅ Tables synchronized (safe)');
    }


    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );


  } catch (err) {
    console.error('❌ DB Error:', err.message);
    process.exit(1);
  }
}


start();
