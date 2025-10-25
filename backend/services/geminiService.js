const { GoogleGenerativeAI } = require('@google/generative-ai');
const Incident = require('../models/incident.model');
const ScamPattern = require('../models/scamPattern.model');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // ✅ FIXED: Remove responseMimeType
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192
      }
    });
  }

  // ✅ Helper to clean and parse JSON from Gemini
  parseGeminiJSON(text) {
    try {
      // Remove markdown code blocks
      let cleanedText = text.replace(/``````\s*/g, '').trim();
      
      // Find JSON object or array
      const jsonStart = cleanedText.indexOf('{');
      const jsonArrayStart = cleanedText.indexOf('[');
      
      if (jsonStart !== -1 && (jsonArrayStart === -1 || jsonStart < jsonArrayStart)) {
        cleanedText = cleanedText.substring(jsonStart);
      } else if (jsonArrayStart !== -1) {
        cleanedText = cleanedText.substring(jsonArrayStart);
      }
      
      // Find last closing bracket
      const lastBrace = cleanedText.lastIndexOf('}');
      const lastBracket = cleanedText.lastIndexOf(']');
      const lastClose = Math.max(lastBrace, lastBracket);
      
      if (lastClose !== -1) {
        cleanedText = cleanedText.substring(0, lastClose + 1);
      }
      
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('❌ Failed to parse JSON:', error.message);
      console.error('Raw text (first 200 chars):', text.substring(0, 200));
      throw new Error('Failed to parse Gemini JSON response');
    }
  }

  // Get ML insights using Gemini AI
  async getMLInsights() {
    try {
      console.log('🤖 Fetching ML insights from Gemini...');
      
      const recentIncidents = await Incident.find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .select('title description category severity location createdAt');

      if (recentIncidents.length === 0) {
        return {
          insights: "No incidents available for analysis",
          patterns: [],
          recommendations: [],
          riskAssessment: "Low",
          hotspots: [],
          emergingThreats: []
        };
      }

      console.log(`📊 Analyzing ${recentIncidents.length} incidents with Gemini...`);

      const incidentData = recentIncidents.map(incident => ({
        title: incident.title,
        description: incident.description,
        category: incident.category,
        severity: incident.severity,
        location: incident.location,
        date: incident.createdAt
      }));

      // ✅ Strong prompt for JSON output
      const prompt = `You are a cybersecurity analyst. Analyze these scam incidents and respond with ONLY valid JSON.

Incident Data (${incidentData.length} incidents):
${JSON.stringify(incidentData.slice(0, 30), null, 2)}

Respond with ONLY this JSON structure (no markdown, no extra text):
{
  "insights": "2-3 sentence summary of key findings about the scam trends",
  "patterns": ["pattern 1 description", "pattern 2 description", "pattern 3 description"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "riskAssessment": "High or Medium or Low",
  "hotspots": ["location 1", "location 2"],
  "emergingThreats": ["threat 1", "threat 2"]
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Gemini response received, parsing...');

      // ✅ Parse JSON response
      const jsonResponse = this.parseGeminiJSON(text);
      
      // ✅ Validate and return structure
      return {
        insights: jsonResponse.insights || "Analysis completed successfully",
        patterns: Array.isArray(jsonResponse.patterns) ? jsonResponse.patterns : [],
        recommendations: Array.isArray(jsonResponse.recommendations) ? jsonResponse.recommendations : [],
        riskAssessment: jsonResponse.riskAssessment || "Medium",
        hotspots: Array.isArray(jsonResponse.hotspots) ? jsonResponse.hotspots : [],
        emergingThreats: Array.isArray(jsonResponse.emergingThreats) ? jsonResponse.emergingThreats : []
      };

    } catch (error) {
      console.error('❌ Error getting ML insights from Gemini:', error);
      throw new Error(`Failed to generate ML insights: ${error.message}`);
    }
  }

  // Get trending patterns using Gemini AI
  async getTrendingPatterns(limit = 5) {
    try {
      console.log('🤖 Fetching trending patterns from Gemini...');
      
      const patterns = await ScamPattern.find({ isActive: true })
        .sort({ trendScore: -1 })
        .limit(20)
        .populate('relatedIncidents');

      const recentIncidents = await Incident.find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .select('title description category severity location createdAt');

      if (patterns.length === 0 && recentIncidents.length === 0) {
        return [];
      }

      console.log(`📊 Analyzing ${patterns.length} patterns and ${recentIncidents.length} incidents...`);

      // ✅ Strong prompt for JSON array output
      const prompt = `You are a cybersecurity analyst. Analyze these scam patterns and incidents, then identify the top ${limit} trending scam patterns.

Existing Patterns:
${JSON.stringify(patterns.slice(0, 10).map(p => ({
  name: p.name,
  description: p.description,
  category: p.category,
  severity: p.severity
})), null, 2)}

Recent Incidents:
${JSON.stringify(recentIncidents.slice(0, 30).map(i => ({
  title: i.title,
  description: i.description,
  category: i.category,
  severity: i.severity,
  location: i.location
})), null, 2)}

Respond with ONLY a JSON array of exactly ${limit} patterns (no markdown, no extra text):
[
  {
    "name": "Short pattern name",
    "description": "2-3 sentence description of the pattern",
    "category": "General or Financial or Identity or Romance etc",
    "severity": "high or medium or low",
    "trendScore": 0.85,
    "frequency": 15,
    "confidence": 0.92,
    "geographicDistribution": ["Mumbai", "Delhi"],
    "timeRange": "Last 7 days",
    "keyIndicators": ["indicator 1", "indicator 2"],
    "preventionTips": ["tip 1", "tip 2"]
  }
]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Gemini pattern response received, parsing...');

      // ✅ Parse JSON response
      const jsonResponse = this.parseGeminiJSON(text);
      
      // ✅ Ensure it's an array
      const patternsArray = Array.isArray(jsonResponse) ? jsonResponse : [jsonResponse];
      
      // ✅ Validate and normalize each pattern
      return patternsArray.slice(0, limit).map((pattern, index) => ({
        name: pattern.name || `Trending Pattern ${index + 1}`,
        description: pattern.description || "No description available",
        category: pattern.category || "General",
        severity: (pattern.severity || "medium").toLowerCase(),
        trendScore: parseFloat(pattern.trendScore) || 0.7,
        frequency: parseInt(pattern.frequency) || 10,
        confidence: parseFloat(pattern.confidence) || 0.8,
        geographicDistribution: Array.isArray(pattern.geographicDistribution) 
          ? pattern.geographicDistribution 
          : ["Multiple locations"],
        timeRange: pattern.timeRange || "Recent",
        keyIndicators: Array.isArray(pattern.keyIndicators) 
          ? pattern.keyIndicators 
          : ["Common indicators"],
        preventionTips: Array.isArray(pattern.preventionTips) 
          ? pattern.preventionTips 
          : ["Stay vigilant", "Verify all communications"]
      }));

    } catch (error) {
      console.error('❌ Error getting trending patterns from Gemini:', error);
      throw new Error(`Failed to generate trending patterns: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();
