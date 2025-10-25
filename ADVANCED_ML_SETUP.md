# 🤖 Advanced ML Pipeline Setup Guide

## Overview
This guide will help you set up the advanced ML pipeline that uses Python-based machine learning models for scam detection and trend analysis.

## Prerequisites

### System Requirements
- **Python 3.8+** (required for ML models)
- **Node.js 16+** (for the backend API)
- **MongoDB** (for data storage)
- **8GB+ RAM** (recommended for ML models)
- **5GB+ free disk space** (for model downloads)

### Python Dependencies
The ML pipeline requires several Python packages:
- `transformers` - Hugging Face transformers for NLP
- `sentence-transformers` - For text embeddings
- `bertopic` - For topic modeling
- `pandas` - Data manipulation
- `numpy` - Numerical computing
- `scikit-learn` - Machine learning utilities

## Installation Steps

### 1. Install Python Dependencies

```bash
# Navigate to backend directory
cd Incident-Reporting-System/backend

# Install Python dependencies
pip install -r requirements.txt

# Or use the setup script (Linux/Mac)
chmod +x setup_ml_pipeline.sh
./setup_ml_pipeline.sh
```

### 2. Install Node.js Dependencies

```bash
# Install Node.js dependencies
npm install
```

### 3. Environment Variables

Add these to your `.env` file:

```env
# ML Pipeline Configuration
ML_PIPELINE_ENABLED=true
PYTHON_PATH=python3
ML_MODELS_CACHE_DIR=./ml_models_cache
```

### 4. Start the Services

```bash
# Start MongoDB (if not running)
mongod

# Start the Node.js backend
npm start
```

## API Endpoints

### Advanced ML Pipeline Endpoints

#### Run Advanced ML Pipeline
```http
POST /api/trending/advanced/run-pipeline
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "days": 7,
  "limit": 100
}
```

#### Get Advanced ML Insights
```http
GET /api/trending/advanced/insights
Authorization: Bearer <user_token>
```

#### Get Advanced Trending Patterns
```http
GET /api/trending/advanced/trending?limit=10
Authorization: Bearer <user_token>
```

## How It Works

### 1. Data Processing Flow
```
Recent Incidents → Python ML Pipeline → Pattern Detection → Database Update
```

### 2. ML Pipeline Components

#### Text Analysis
- **Hierarchical Classification**: Parent categories → Child labels
- **Sentiment Analysis**: Emotional tone detection
- **Entity Extraction**: Names, phones, emails, amounts
- **Keyword Extraction**: Important terms and phrases

#### Pattern Detection
- **Topic Modeling**: BERTopic clustering
- **Similarity Analysis**: Text similarity scoring
- **Trend Detection**: Week-over-week analysis
- **Geographic Clustering**: Location-based patterns

#### Advanced Features
- **Zero-shot Classification**: No training data required
- **Hierarchical Taxonomy**: 10 parent categories, 100+ child labels
- **Real-time Processing**: Batch processing of recent incidents
- **Confidence Scoring**: ML confidence in predictions

### 3. Taxonomy Structure

#### Parent Categories
1. **Identity and Account Scams**
2. **Financial and Payment Scams**
3. **Commerce and Delivery Scams**
4. **Employment and Education Scams**
5. **Lottery Prize and Reward Scams**
6. **Investment and Trading Scams**
7. **Romance and Social Scams**
8. **Tech Support and Service Scams**
9. **Online Content and Social Media Scams**
10. **Banking and Institutional Scams**

#### Child Labels (Examples)
- **Identity Scams**: KYC update, Aadhaar verification, account suspension
- **Financial Scams**: UPI fraud, loan approval, credit score improvement
- **Commerce Scams**: Fake courier delivery, e-commerce refund, QR code payment

## Usage Examples

### 1. Run ML Analysis on Recent Incidents

```javascript
// Frontend code
const runMLAnalysis = async () => {
  try {
    const response = await axiosInstance.post('/trending/advanced/run-pipeline', {
      days: 7,
      limit: 100
    });
    
    if (response.data.success) {
      console.log('ML Analysis completed:', response.data.data);
      // Update UI with results
    }
  } catch (error) {
    console.error('ML Analysis failed:', error);
  }
};
```

### 2. Get Trending Patterns

```javascript
// Frontend code
const getTrendingPatterns = async () => {
  try {
    const response = await axiosInstance.get('/trending/advanced/trending?limit=10');
    
    if (response.data.success) {
      const patterns = response.data.data.patterns;
      // Display patterns in UI
    }
  } catch (error) {
    console.error('Failed to get trending patterns:', error);
  }
};
```

## Performance Optimization

### 1. Model Caching
- Models are cached after first load
- Subsequent runs are faster
- Cache directory: `./ml_models_cache`

### 2. Batch Processing
- Processes incidents in batches
- Configurable batch size (default: 100)
- Memory efficient processing

### 3. Error Handling
- Graceful error recovery
- Detailed error logging
- Fallback to basic analysis

## Troubleshooting

### Common Issues

#### 1. Python Not Found
```bash
# Check Python installation
python3 --version

# If not installed, install Python 3.8+
# Ubuntu/Debian: sudo apt install python3 python3-pip
# macOS: brew install python3
# Windows: Download from python.org
```

#### 2. Model Download Issues
```bash
# Clear model cache
rm -rf ml_models_cache

# Reinstall transformers
pip install --upgrade transformers
```

#### 3. Memory Issues
```bash
# Reduce batch size in API call
{
  "days": 3,
  "limit": 50
}
```

#### 4. Permission Issues
```bash
# Make Python script executable
chmod +x services/pythonMLPipeline.py
```

### Debug Mode

Enable debug logging:

```env
DEBUG_ML_PIPELINE=true
ML_PIPELINE_VERBOSE=true
```

## Monitoring

### 1. Pipeline Status
```http
GET /api/trending/pipeline/status
```

### 2. Processing Logs
Check console output for:
- Model loading progress
- Processing statistics
- Error messages

### 3. Performance Metrics
- Processing time per batch
- Memory usage
- Model accuracy scores

## Security Considerations

### 1. API Authentication
- All ML endpoints require authentication
- Admin endpoints require admin role
- Rate limiting recommended

### 2. Data Privacy
- Incident data is processed locally
- No external API calls for ML
- Models run on your infrastructure

### 3. Resource Limits
- Set memory limits for Python processes
- Monitor disk usage for model cache
- Implement request timeouts

## Future Enhancements

### 1. Model Improvements
- Fine-tuned models for Indian scams
- Custom taxonomy for regional patterns
- Real-time model updates

### 2. Performance Optimizations
- GPU acceleration
- Model quantization
- Distributed processing

### 3. Advanced Features
- Predictive analytics
- Anomaly detection
- Automated alerts

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs
3. Check Python and Node.js versions
4. Verify all dependencies are installed

## License

This ML pipeline is part of the Incident Reporting System and follows the same license terms.
