const geminiService = require('../services/geminiService');

// Get ML insights using Gemini AI
exports.getGeminiMLInsights = async (req, res) => {
  try {
    console.log('🤖 Fetching ML insights from Gemini AI...');
    
    const insights = await geminiService.getMLInsights();
    
    return res.status(200).json({
      success: true,
      data: insights,
      source: 'gemini-ai'
    });
  } catch (error) {
    console.error('Error getting Gemini ML insights:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate ML insights from Gemini AI'
    });
  }
};

// Get trending patterns using Gemini AI
exports.getGeminiTrendingPatterns = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    console.log(`🤖 Fetching trending patterns from Gemini AI (limit: ${limit})...`);
    
    const patterns = await geminiService.getTrendingPatterns(parseInt(limit));
    
    return res.status(200).json({
      success: true,
      data: {
        patterns,
        total: patterns.length,
        source: 'gemini-ai'
      }
    });
  } catch (error) {
    console.error('Error getting Gemini trending patterns:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate trending patterns from Gemini AI'
    });
  }
};

// Get comprehensive analysis using Gemini AI
exports.getGeminiAnalysis = async (req, res) => {
  try {
    console.log('🤖 Running comprehensive Gemini AI analysis...');
    
    const [insights, patterns] = await Promise.all([
      geminiService.getMLInsights(),
      geminiService.getTrendingPatterns(10)
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        insights,
        patterns,
        analysis: {
          timestamp: new Date(),
          source: 'gemini-ai',
          version: '1.0'
        }
      }
    });
  } catch (error) {
    console.error('Error getting Gemini analysis:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate comprehensive analysis from Gemini AI'
    });
  }
};

// Test Gemini API connection
exports.testGeminiConnection = async (req, res) => {
  try {
    console.log('🧪 Testing Gemini API connection...');
    
    const testPrompt = "Hello, this is a test. Please respond with 'Gemini API is working correctly' and nothing else.";
    const result = await geminiService.model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();
    
    return res.status(200).json({
      success: true,
      message: 'Gemini API connection successful',
      response: text,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error testing Gemini connection:', error);
    return res.status(500).json({
      success: false,
      message: 'Gemini API connection failed',
      error: error.message
    });
  }
};
