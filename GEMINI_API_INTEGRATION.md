# 🤖 Gemini API Integration Guide

## Overview
This document describes the integration of Google's Gemini AI API for ML insights and trending patterns in the Incident Reporting System. The integration provides AI-powered analysis while keeping the existing ML pipeline intact.

## 🚀 Features Added

### Backend Integration
- **Gemini Service** (`services/geminiService.js`) - Core AI analysis service
- **Gemini Controller** (`controllers/gemini.controller.js`) - API endpoints for Gemini AI
- **Gemini Routes** (`routes/gemini.routes.js`) - Route definitions
- **Server Integration** - Added Gemini routes to main server

### Frontend Integration
- **GeminiInsights Component** - React component for displaying AI insights
- **MapPage Integration** - Added new "Gemini AI" tab to the map page
- **Real-time Analysis** - Live AI-powered insights and patterns

## 📋 API Endpoints

### Public Endpoints
```
GET /api/gemini/test
```
- **Purpose**: Test Gemini API connection
- **Auth**: Not required
- **Response**: Connection status and test response

### Protected Endpoints (Require Authentication)
```
GET /api/gemini/insights
```
- **Purpose**: Get AI-powered ML insights
- **Auth**: Required
- **Response**: Comprehensive AI analysis of incident data

```
GET /api/gemini/trending?limit=10
```
- **Purpose**: Get AI-generated trending patterns
- **Auth**: Required
- **Parameters**: `limit` (optional, default: 10)
- **Response**: AI-identified trending scam patterns

```
GET /api/gemini/analysis
```
- **Purpose**: Get comprehensive AI analysis
- **Auth**: Required
- **Response**: Combined insights and trending patterns

## 🛠️ Setup Instructions

### 1. Environment Configuration
Add your Gemini API key to the environment variables:

```bash
# In your .env file
GEMINI_API_KEY=your-actual-gemini-api-key-here
```

### 2. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to your environment variables

### 3. Install Dependencies
The required dependency is already installed:
```json
"@google/generative-ai": "^0.2.1"
```

### 4. Start the Server
```bash
cd Incident-Reporting-System/backend
npm start
```

## 🧪 Testing

### Test Gemini API Connection
```bash
cd Incident-Reporting-System/backend
node test_gemini.js
```

### Manual Testing with curl
```bash
# Test connection (no auth required)
curl http://localhost:5000/api/gemini/test

# Test insights (auth required)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/gemini/insights

# Test trending patterns (auth required)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/gemini/trending?limit=5
```

## 🎯 Frontend Usage

### Accessing Gemini AI Insights
1. Navigate to the Map page
2. Click on the "Gemini AI" tab
3. View AI-generated insights and patterns
4. Use the refresh button to get updated analysis

### Features Available
- **AI Analysis**: Comprehensive analysis of incident data
- **Trending Patterns**: AI-identified scam patterns with confidence scores
- **Risk Assessment**: AI-powered risk level assessment
- **Recommendations**: AI-generated prevention tips
- **Hotspots**: AI-identified high-risk areas
- **Emerging Threats**: AI-detected new scam types

## 🔧 Technical Details

### Gemini Service Architecture
```javascript
class GeminiService {
  // AI-powered ML insights
  async getMLInsights()
  
  // AI-generated trending patterns
  async getTrendingPatterns(limit)
  
  // Helper methods for text processing
  extractPatterns(text)
  extractRecommendations(text)
  // ... more helper methods
}
```

### Data Flow
1. **Data Collection**: Fetches recent incidents and patterns from database
2. **AI Processing**: Sends structured data to Gemini AI for analysis
3. **Response Processing**: Parses AI response and formats for frontend
4. **Display**: Shows AI insights in user-friendly interface

### Error Handling
- Graceful fallback when AI analysis fails
- Structured error responses
- Logging for debugging

## 🚨 Important Notes

### Authentication Required
Most Gemini endpoints require authentication. Make sure to:
1. Log in to the system first
2. Include the JWT token in API requests
3. Handle authentication errors gracefully

### API Rate Limits
- Gemini API has rate limits
- Implement caching for frequently requested data
- Consider implementing request throttling

### Data Privacy
- Incident data is sent to Google's Gemini AI
- Ensure compliance with data privacy regulations
- Consider data anonymization for sensitive information

## 🔄 Integration with Existing System

### Preserved Functionality
- All existing ML pipeline functionality remains intact
- Original trending patterns and insights still available
- No breaking changes to existing APIs

### Parallel Operation
- Gemini AI runs alongside existing ML services
- Users can choose between traditional ML and AI insights
- Both systems can be used simultaneously

## 📊 Performance Considerations

### Response Times
- Gemini API calls may take 2-5 seconds
- Implement loading states in frontend
- Consider caching for better performance

### Cost Management
- Monitor Gemini API usage
- Implement request optimization
- Consider batch processing for multiple requests

## 🐛 Troubleshooting

### Common Issues
1. **API Key Not Set**: Ensure `GEMINI_API_KEY` is properly configured
2. **Authentication Errors**: Check JWT token validity
3. **Rate Limiting**: Implement delays between requests
4. **Network Issues**: Check internet connectivity

### Debug Steps
1. Test connection with `/api/gemini/test`
2. Check server logs for error messages
3. Verify environment variables
4. Test with minimal data first

## 🚀 Future Enhancements

### Potential Improvements
- **Caching Layer**: Implement Redis caching for AI responses
- **Batch Processing**: Process multiple requests together
- **Custom Models**: Fine-tune Gemini for scam detection
- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Analytics**: More sophisticated AI analysis

### Monitoring
- Add metrics for AI response times
- Monitor API usage and costs
- Track accuracy of AI predictions
- Implement alerting for failures

## 📝 Conclusion

The Gemini API integration provides powerful AI-driven insights while maintaining the existing system's functionality. The implementation is designed to be:

- **Non-intrusive**: Doesn't affect existing functionality
- **Scalable**: Can handle increasing data volumes
- **Maintainable**: Clean, well-documented code
- **User-friendly**: Intuitive frontend interface

For support or questions, refer to the main project documentation or contact the development team.
