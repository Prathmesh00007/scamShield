const ScamPattern = require('../models/scamPattern.model');
const Incident = require('../models/incident.model');
const advancedMLService = require('../services/advancedMLService');

// Get trending patterns
exports.getTrendingPatterns = async (req, res) => {
  try {
    const { limit = 10, category, region } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    let patterns = await ScamPattern.find(query)
      .sort({ trendScore: -1 })
      .limit(parseInt(limit))
      .populate('relatedIncidents', 'title description severity createdAt location coordinates');
    
    if (region) {
      patterns = patterns.filter(pattern => 
        pattern.geographicDistribution.some(geo => geo.region === region)
      );
    }
    
    return res.status(200).json({
      success: true,
      data: {
        patterns,
        total: patterns.length
      }
    });
  } catch (error) {
    console.error('Error getting trending patterns:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get pattern insights
exports.getPatternInsights = async (req, res) => {
  try {
    const { patternId } = req.params;
    
    const insights = await patternDetection.getPatternInsights(patternId);
    
    if (!insights) {
      return res.status(404).json({
        success: false,
        message: 'Pattern not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error getting pattern insights:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get hotspot data for map (using advanced ML service)
exports.getHotspotData = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get hotspots from patterns in database
    const patterns = await ScamPattern.find({ isActive: true })
      .sort({ trendScore: -1 })
      .limit(parseInt(limit))
      .populate('relatedIncidents', 'location coordinates');
    
    const hotspots = patterns.map((pattern, index) => ({
      id: pattern._id,
      name: pattern.name,
      center: pattern.geographicDistribution[0]?.coordinates || { lat: 0, lng: 0 },
      size: pattern.relatedIncidents.length,
      riskScore: pattern.trendScore,
      incidents: pattern.relatedIncidents,
      category: pattern.category,
      severity: pattern.severity
    }));
    
    return res.status(200).json({
      success: true,
      data: {
        hotspots,
        total: hotspots.length
      }
    });
  } catch (error) {
    console.error('Error getting hotspot data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get regional statistics (using database aggregation)
exports.getRegionalStatistics = async (req, res) => {
  try {
    const stats = await ScamPattern.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$geographicDistribution' },
      { $group: { 
        _id: '$geographicDistribution.region', 
        count: { $sum: '$geographicDistribution.count' },
        patterns: { $addToSet: '$_id' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        totalClusters: stats.length,
        regionalDistribution: stats,
        totalPatterns: await ScamPattern.countDocuments({ isActive: true })
      }
    });
  } catch (error) {
    console.error('Error getting regional statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get ML insights for dashboard (using advanced ML service)
exports.getMLInsights = async (req, res) => {
  try {
    const insights = await advancedMLService.getMLInsights();
    
    return res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error getting ML insights:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get category distribution
exports.getCategoryDistribution = async (req, res) => {
  try {
    const pipeline = [
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    
    const distribution = await ScamPattern.aggregate(pipeline);
    
    return res.status(200).json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Error getting category distribution:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get severity distribution
exports.getSeverityDistribution = async (req, res) => {
  try {
    const pipeline = [
      { $match: { isActive: true } },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    
    const distribution = await ScamPattern.aggregate(pipeline);
    
    return res.status(200).json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Error getting severity distribution:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get time patterns
exports.getTimePatterns = async (req, res) => {
  try {
    const pipeline = [
      { $match: { isActive: true } },
      { $unwind: '$timeDistribution' },
      { $group: { 
        _id: '$timeDistribution.hour', 
        count: { $sum: '$timeDistribution.count' } 
      }},
      { $sort: { _id: 1 } }
    ];
    
    const patterns = await ScamPattern.aggregate(pipeline);
    
    return res.status(200).json({
      success: true,
      data: patterns
    });
  } catch (error) {
    console.error('Error getting time patterns:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Analyze specific incident (using advanced ML service)
exports.analyzeIncident = async (req, res) => {
  try {
    const { incidentId } = req.params;
    
    // Get incident from database
    const incident = await Incident.findById(incidentId);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }
    
    // Run ML analysis on single incident
    const testData = [{
      _id: incident._id.toString(),
      title: incident.title,
      description: incident.description,
      timestamp: incident.createdAt.toISOString(),
      location: incident.location || 'Unknown'
    }];
    
    const result = await advancedMLService.runPythonPipeline(testData);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error analyzing incident:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get ML pipeline status (using advanced ML service)
exports.getPipelineStatus = async (req, res) => {
  try {
    const status = {
      isRunning: advancedMLService.isProcessing,
      lastRun: advancedMLService.lastRun,
      nextRun: 'On-demand (triggered by Map page)',
      type: 'Advanced Python ML Pipeline'
    };
    
    return res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting pipeline status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Start ML pipeline (trigger advanced ML)
exports.startPipeline = async (req, res) => {
  try {
    const result = await advancedMLService.processIncidentsWithML(7, 100);
    
    return res.status(200).json({
      success: true,
      message: 'Advanced ML Pipeline started successfully',
      data: result
    });
  } catch (error) {
    console.error('Error starting ML pipeline:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Stop ML pipeline
exports.stopPipeline = async (req, res) => {
  try {
    // Advanced ML service doesn't have a stop method, it runs on-demand
    return res.status(200).json({
      success: true,
      message: 'Advanced ML Pipeline runs on-demand only'
    });
  } catch (error) {
    console.error('Error stopping ML pipeline:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Force run ML analysis (trigger advanced ML)
exports.forceRunAnalysis = async (req, res) => {
  try {
    const result = await advancedMLService.processIncidentsWithML(7, 100);
    
    return res.status(200).json({
      success: true,
      message: 'Advanced ML analysis completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error running ML analysis:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Run advanced ML pipeline
exports.runAdvancedMLPipeline = async (req, res) => {
  try {
    const { days = 7, limit = 100 } = req.body;
    
    const result = await advancedMLService.processIncidentsWithML(days, limit);
    
    return res.status(200).json({
      success: true,
      message: 'Advanced ML pipeline completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error running advanced ML pipeline:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Get advanced ML insights
exports.getAdvancedMLInsights = async (req, res) => {
  try {
    const insights = await advancedMLService.getMLInsights();
    
    return res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error getting advanced ML insights:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get advanced trending patterns
exports.getAdvancedTrendingPatterns = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const patterns = await advancedMLService.getTrendingPatterns(limit);
    
    return res.status(200).json({
      success: true,
      data: {
        patterns,
        total: patterns.length
      }
    });
  } catch (error) {
    console.error('Error getting advanced trending patterns:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get pattern by ID
exports.getPatternById = async (req, res) => {
  try {
    const { patternId } = req.params;
    
    const pattern = await ScamPattern.findById(patternId)
      .populate('relatedIncidents', 'title description severity createdAt location coordinates');
    
    if (!pattern) {
      return res.status(404).json({
        success: false,
        message: 'Pattern not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: pattern
    });
  } catch (error) {
    console.error('Error getting pattern:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get patterns by category
exports.getPatternsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;
    
    const patterns = await ScamPattern.find({ 
      category, 
      isActive: true 
    })
    .sort({ trendScore: -1 })
    .limit(parseInt(limit))
    .populate('relatedIncidents', 'title description severity createdAt');
    
    return res.status(200).json({
      success: true,
      data: {
        patterns,
        total: patterns.length
      }
    });
  } catch (error) {
    console.error('Error getting patterns by category:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Test Python pipeline with sample data
exports.testPythonPipeline = async (req, res) => {
  try {
    console.log('🧪 Testing Python pipeline...');
    
    // Create sample test data
    const testData = [
      {
        _id: "test1",
        title: "Fake UPI Payment Request",
        description: "Received a fake UPI payment request asking me to enter my PIN. The link looked suspicious and asked for personal banking details.",
        timestamp: new Date().toISOString(),
        location: "Mumbai",
        severity: "high"
      },
      {
        _id: "test2", 
        title: "Fake Job Offer",
        description: "Got a job offer via WhatsApp asking me to pay training fees upfront. The company name was fake and they asked for money before starting work.",
        timestamp: new Date().toISOString(),
        location: "Delhi",
        severity: "medium"
      }
    ];
    
    console.log('🧪 Test data created:', testData);
    
    const result = await advancedMLService.runPythonPipeline(testData);
    
    return res.status(200).json({
      success: true,
      message: 'Python pipeline test completed',
      data: result
    });
  } catch (error) {
    console.error('❌ Python pipeline test failed:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Python pipeline test failed',
      error: error.toString()
    });
  }
};

// Test simple Python script
exports.testSimplePython = async (req, res) => {
  try {
    console.log('🧪 Testing simple Python script...');
    
    const { spawn } = require('child_process');
    const path = require('path');
    const testScriptPath = path.join(__dirname, '../test_python.py');
    
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [testScriptPath]);
      
      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        const dataStr = data.toString();
        console.log('📤 Python stdout:', dataStr);
        output += dataStr;
      });

      pythonProcess.stderr.on('data', (data) => {
        const dataStr = data.toString();
        console.log('📤 Python stderr:', dataStr);
        errorOutput += dataStr;
      });

      pythonProcess.on('close', (code) => {
        console.log(`🔍 DEBUG: Python process closed with code: ${code}`);
        console.log('🔍 DEBUG: Full output:', output);
        console.log('🔍 DEBUG: Full error output:', errorOutput);
        
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(res.status(200).json({
              success: true,
              message: 'Simple Python test completed',
              data: result
            }));
          } catch (parseError) {
            reject(res.status(500).json({
              success: false,
              message: 'Failed to parse Python output',
              error: parseError.message,
              rawOutput: output
            }));
          }
        } else {
          reject(res.status(500).json({
            success: false,
            message: `Python test failed with code ${code}`,
            errorOutput: errorOutput
          }));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(res.status(500).json({
          success: false,
          message: `Failed to start Python: ${error.message}`
        }));
      });
    });
    
  } catch (error) {
    console.error('❌ Simple Python test failed:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Simple Python test failed',
      error: error.toString()
    });
  }
};
