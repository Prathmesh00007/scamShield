const express = require('express');
const router = express.Router();
const protectRoute = require('../middleware/auth.middleware.js');
const {
  getGeminiMLInsights,
  getGeminiTrendingPatterns,
  getGeminiAnalysis,
  testGeminiConnection
} = require('../controllers/gemini.controller.js');

// Public routes (no authentication required for testing)
router.get('/test', testGeminiConnection);

// Protected routes (authentication required)
router.get('/insights', protectRoute, getGeminiMLInsights);
router.get('/trending', protectRoute, getGeminiTrendingPatterns);
router.get('/analysis', protectRoute, getGeminiAnalysis);

module.exports = router;
