const { spawn } = require('child_process');
const path = require('path');
const Incident = require('../models/incident.model');
const ScamPattern = require('../models/scamPattern.model');

class AdvancedMLService {
  constructor() {
    // ✅ FIX 1: Correct path to Python script
    this.pythonScriptPath = path.join(__dirname, './pythonMLPipeline.py');
    this.isProcessing = false;
  }

  // Get recent incidents for ML processing
  async getRecentIncidents(days = 7, limit = 100) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const incidents = await Incident.find({
        createdAt: { $gte: cutoffDate },
        status: { $ne: 'fake' }
      })
      .populate('reportedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

      return incidents.map(incident => ({
        _id: incident._id.toString(),
        title: incident.title,
        description: incident.description,
        timestamp: incident.createdAt.toISOString(),
        location: incident.location,
        coordinates: incident.coordinates,
        severity: incident.severity,
        reportedBy: incident.reportedBy
      }));
    } catch (error) {
      console.error('Error fetching recent incidents:', error);
      throw error;
    }
  }

  // ✅ FIX 2: Use stdin instead of command line arguments for large data
  async runPythonPipeline(incidentsData) {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔍 DEBUG: Starting Python ML pipeline...');
        console.log('🔍 DEBUG: Python script path:', this.pythonScriptPath);
        console.log('🔍 DEBUG: Incidents data length:', incidentsData.length);
        
        // Check if Python script exists
        const fs = require('fs');
        if (!fs.existsSync(this.pythonScriptPath)) {
          console.error('❌ Python script not found at:', this.pythonScriptPath);
          reject(new Error(`Python script not found at ${this.pythonScriptPath}`));
          return;
        }

        // Prepare JSON data
        const jsonInput = JSON.stringify(incidentsData);
        console.log('🔍 DEBUG: JSON input size:', jsonInput.length, 'bytes');

        // Try different Python commands (Windows-first order)
        const pythonCommands = ['python', 'py', 'python3'];
        let pythonProcess = null;
        let pythonCommand = null;

        for (const cmd of pythonCommands) {
          try {
            console.log(`🔍 DEBUG: Trying Python command: ${cmd}`);
            // ✅ FIXED: Pass via stdin, not as argument
            pythonProcess = spawn(cmd, [this.pythonScriptPath]);
            pythonCommand = cmd;
            break;
          } catch (error) {
            console.log(`❌ Failed to start with ${cmd}:`, error.message);
            continue;
          }
        }

        if (!pythonProcess) {
          reject(new Error('Failed to start Python process with any available command'));
          return;
        }

        console.log(`✅ Python process started with: ${pythonCommand}`);
        
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
          
          if (code === 0) {
            try {
              if (!output.trim()) {
                console.error('❌ Python process returned empty output');
                reject(new Error('Python pipeline returned empty output'));
                return;
              }
              
              const result = JSON.parse(output);
              console.log('✅ Python pipeline completed successfully');
              console.log('✅ Processed incidents:', result.processed_incidents);
              resolve(result);
            } catch (parseError) {
              console.error('❌ Error parsing Python output:', parseError);
              console.error('❌ Raw output (first 500 chars):', output.substring(0, 500));
              reject(new Error(`Failed to parse Python pipeline output: ${parseError.message}`));
            }
          } else {
            console.error('❌ Python process error code:', code);
            console.error('❌ Error output:', errorOutput);
            reject(new Error(`Python pipeline failed with code ${code}: ${errorOutput}`));
          }
        });

        pythonProcess.on('error', (error) => {
          console.error('❌ Python process error:', error);
          reject(new Error(`Failed to start Python pipeline: ${error.message}`));
        });

        // ✅ FIXED: Write JSON to stdin
        pythonProcess.stdin.write(jsonInput);
        pythonProcess.stdin.end();

        // Add timeout (5 minutes)
        setTimeout(() => {
          if (pythonProcess && !pythonProcess.killed) {
            console.log('⏰ Python process timeout, killing...');
            pythonProcess.kill();
            reject(new Error('Python pipeline timeout (5 minutes)'));
          }
        }, 300000);

      } catch (error) {
        console.error('❌ Error in runPythonPipeline:', error);
        reject(error);
      }
    });
  }

  // Process incidents with advanced ML
  async processIncidentsWithML(days = 7, limit = 100) {
    if (this.isProcessing) {
      throw new Error('ML pipeline is already processing');
    }

    try {
      this.isProcessing = true;
      console.log('🚀 Starting advanced ML pipeline...');
      console.log(`📊 Parameters: days=${days}, limit=${limit}`);

      // Get recent incidents
      const incidents = await this.getRecentIncidents(days, limit);
      
      if (incidents.length === 0) {
        console.log('⚠️ No recent incidents to process');
        return {
          success: true,
          message: 'No recent incidents to process',
          processed_incidents: 0,
          incidents: [],
          trending_topics: [],
          total_patterns: 0
        };
      }

      console.log(`✅ Fetched ${incidents.length} incidents from database`);

      // Run Python ML pipeline
      const mlResult = await this.runPythonPipeline(incidents);

      if (mlResult.error) {
        throw new Error(mlResult.error);
      }

      console.log('💾 Storing ML results in database...');

      // Update incidents with ML analysis
      await this.updateIncidentsWithMLResults(mlResult.incidents);

      // Create/update scam patterns
      await this.createOrUpdatePatterns(mlResult.incidents);

      console.log(`✅ Advanced ML pipeline completed successfully`);
      console.log(`✅ Processed: ${mlResult.processed_incidents} incidents`);
      console.log(`✅ Detected: ${mlResult.total_patterns} patterns`);

      return {
        success: true,
        processed_incidents: mlResult.processed_incidents,
        incidents: mlResult.incidents,
        trending_topics: mlResult.trending_topics,
        total_patterns: mlResult.total_patterns,
        analysis_timestamp: mlResult.analysis_timestamp
      };

    } catch (error) {
      console.error('❌ Advanced ML pipeline error:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  // Update incidents with ML analysis results
  async updateIncidentsWithMLResults(mlIncidents) {
    try {
      const updatePromises = mlIncidents.map(async (mlIncident) => {
        try {
          await Incident.findByIdAndUpdate(mlIncident.id, {
            $set: {
              mlAnalysis: {
                parentCategory: mlIncident.parent_category,
                childLabel: mlIncident.child_label,
                parentConfidence: mlIncident.parent_confidence,
                childConfidence: mlIncident.child_confidence,
                summary: mlIncident.summary,
                topicId: mlIncident.topic_id,
                topicName: mlIncident.topic_name,
                analyzedAt: new Date()
              }
            }
          });
        } catch (err) {
          console.error(`Failed to update incident ${mlIncident.id}:`, err.message);
        }
      });
      
      await Promise.all(updatePromises);
      console.log(`✅ Updated ${mlIncidents.length} incidents with ML analysis`);
    } catch (error) {
      console.error('Error updating incidents with ML results:', error);
      throw error;
    }
  }

  // Create or update scam patterns
  async createOrUpdatePatterns(mlIncidents) {
    try {
      // Group incidents by topic
      const topicGroups = {};
      mlIncidents.forEach(incident => {
        const topicId = incident.topic_id;
        if (!topicGroups[topicId]) {
          topicGroups[topicId] = [];
        }
        topicGroups[topicId].push(incident);
      });

      console.log(`📊 Creating/updating ${Object.keys(topicGroups).length} patterns...`);

      // Create/update patterns for each topic
      const patternPromises = Object.entries(topicGroups).map(async ([topicId, incidents]) => {
        try {
          const topicName = incidents[0].topic_name;
          const parentCategory = incidents[0].parent_category;
          const childLabel = incidents[0].child_label;

          // Check if pattern already exists
          let pattern = await ScamPattern.findOne({
            patternId: `topic_${topicId}`,
            isActive: true
          });

          if (pattern) {
            // Update existing pattern
            pattern.frequency += incidents.length;
            pattern.relatedIncidents.push(...incidents.map(i => i.id));
            pattern.updateTrendScore();
            await pattern.save();
          } else {
            // Create new pattern
            pattern = new ScamPattern({
              patternId: `topic_${topicId}`,
              name: topicName,
              description: incidents[0].summary,
              keywords: this.extractKeywordsFromIncidents(incidents),
              severity: this.determineSeverityFromIncidents(incidents),
              category: this.mapCategoryToSystem(parentCategory),
              confidence: this.calculateAverageConfidence(incidents),
              frequency: incidents.length,
              relatedIncidents: incidents.map(i => i.id),
              geographicDistribution: this.getGeographicDistribution(incidents),
              timeDistribution: this.getTimeDistribution(incidents)
            });
            
            pattern.updateTrendScore();
            await pattern.save();
          }
        } catch (err) {
          console.error(`Failed to create/update pattern for topic ${topicId}:`, err.message);
        }
      });

      await Promise.all(patternPromises);
      console.log(`✅ Created/updated ${Object.keys(topicGroups).length} patterns`);
    } catch (error) {
      console.error('Error creating/updating patterns:', error);
      throw error;
    }
  }

  // Extract keywords from incidents
  extractKeywordsFromIncidents(incidents) {
    const keywordCounts = {};
    incidents.forEach(incident => {
      const text = (incident.text || incident.title || '').toLowerCase();
      const words = text.split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) {
          keywordCounts[word] = (keywordCounts[word] || 0) + 1;
        }
      });
    });

    return Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => ({ word, weight: count / incidents.length }));
  }

  // Determine severity from incidents
  determineSeverityFromIncidents(incidents) {
    const severityCounts = {};
    incidents.forEach(incident => {
      const severity = incident.severity || 'medium';
      severityCounts[severity] = (severityCounts[severity] || 0) + 1;
    });

    const maxSeverity = Object.entries(severityCounts)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    return maxSeverity;
  }

  // Map ML category to system category
  mapCategoryToSystem(parentCategory) {
    const categoryMap = {
      'identity and account scams': 'identity',
      'financial and payment scams': 'financial',
      'commerce and delivery scams': 'commerce',
      'employment and education scams': 'employment',
      'lottery prize and reward scams': 'lottery',
      'investment and trading scams': 'investment',
      'romance and social scams': 'romance',
      'tech support and service scams': 'tech_support',
      'online content and social media scams': 'social_media',
      'banking and institutional scams': 'institutional'
    };
    
    return categoryMap[parentCategory] || 'other';
  }

  // Calculate average confidence
  calculateAverageConfidence(incidents) {
    const totalConfidence = incidents.reduce((sum, incident) => 
      sum + (incident.child_confidence || incident.parent_confidence || 0), 0);
    return totalConfidence / incidents.length;
  }

  // Get geographic distribution
  getGeographicDistribution(incidents) {
    const geoCounts = {};
    incidents.forEach(incident => {
      const region = incident.region || incident.location || 'Unknown';
      geoCounts[region] = (geoCounts[region] || 0) + 1;
    });

    return Object.entries(geoCounts).map(([region, count]) => ({
      region,
      count,
      coordinates: { lat: 0, lng: 0 }
    }));
  }

  // Get time distribution
  getTimeDistribution(incidents) {
    const hourCounts = {};
    incidents.forEach(incident => {
      const hour = new Date(incident.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts).map(([hour, count]) => ({
      hour: parseInt(hour),
      count
    }));
  }

  // Get ML insights
  async getMLInsights() {
    try {
      const totalPatterns = await ScamPattern.countDocuments({ isActive: true });
      const trendingPatterns = await ScamPattern.countDocuments({ 
        isActive: true, 
        trendScore: { $gte: 0.7 } 
      });

      const categoryDistribution = await ScamPattern.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const severityDistribution = await ScamPattern.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return {
        totalPatterns,
        trendingPatterns,
        categoryDistribution,
        severityDistribution,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting ML insights:', error);
      throw error;
    }
  }

  // Get trending patterns
  async getTrendingPatterns(limit = 10) {
    try {
      const patterns = await ScamPattern.find({ isActive: true })
        .sort({ trendScore: -1 })
        .limit(parseInt(limit))
        .populate('relatedIncidents', 'title description severity createdAt');

      return patterns;
    } catch (error) {
      console.error('Error getting trending patterns:', error);
      throw error;
    }
  }

  // Get processing status
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      pythonScriptPath: this.pythonScriptPath
    };
  }
}

module.exports = new AdvancedMLService();
