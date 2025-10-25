const express = require('express');
const router = express.Router();
const protectRoute = require('../middleware/auth.middleware.js');
const adminProtect = require('../middleware/admin.middleware.js');
const {
  getTrendingPatterns,
  getPatternInsights,
  getHotspotData,
  getRegionalStatistics,
  getMLInsights,
  getCategoryDistribution,
  getSeverityDistribution,
  getTimePatterns,
  analyzeIncident,
  getPipelineStatus,
  startPipeline,
  stopPipeline,
  forceRunAnalysis,
  getPatternById,
  getPatternsByCategory,
  runAdvancedMLPipeline,
  getAdvancedMLInsights,
  getAdvancedTrendingPatterns,
  testPythonPipeline,
  testSimplePython
} = require('../controllers/trending.controller.js');

// Public routes (no authentication required)
router.get('/hotspots', getHotspotData);
router.get('/regional-stats', getRegionalStatistics);
router.get('/category-distribution', getCategoryDistribution);
router.get('/severity-distribution', getSeverityDistribution);
router.get('/time-patterns', getTimePatterns);

// Protected routes (authentication required)
router.get('/trending', protectRoute, getTrendingPatterns);
router.get('/insights', protectRoute, getMLInsights);
router.get('/pattern/:patternId', protectRoute, getPatternInsights);
router.get('/pattern-details/:patternId', protectRoute, getPatternById);
router.get('/category/:category', protectRoute, getPatternsByCategory);
router.post('/analyze/:incidentId', protectRoute, analyzeIncident);

// Admin routes (admin authentication required)
router.get('/pipeline/status', protectRoute, adminProtect, getPipelineStatus);
router.post('/pipeline/start', protectRoute, adminProtect, startPipeline);
router.post('/pipeline/stop', protectRoute, adminProtect, stopPipeline);
router.post('/pipeline/force-run', protectRoute, adminProtect, forceRunAnalysis);

// Advanced ML routes
router.post('/advanced/run-pipeline', runAdvancedMLPipeline);
router.get('/advanced/insights', getAdvancedMLInsights);
router.get('/advanced/trending',  getAdvancedTrendingPatterns);

// Test routes
router.get('/test/python-pipeline', testPythonPipeline);
router.get('/test/simple-python', testSimplePython);

module.exports = router;
