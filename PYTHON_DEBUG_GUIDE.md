# 🐍 Python ML Pipeline Debug Guide

## Quick Debug Steps

### 1. Test Python Environment
```bash
# Test if Python is working
curl http://localhost:5000/api/trending/test/simple-python
```

### 2. Test Full ML Pipeline
```bash
# Test the full ML pipeline
curl http://localhost:5000/api/trending/test/python-pipeline
```

### 3. Check Console Logs
Look for these debug messages in your Node.js console:
- `🔍 DEBUG: Starting Python ML pipeline...`
- `🐍 Python ML Pipeline started`
- `📤 Python stdout:`
- `📤 Python stderr:`

## Common Issues & Solutions

### Issue 1: Python Not Found
**Error**: `Failed to start Python process with any available command`

**Solutions**:
```bash
# Check if Python is installed
python3 --version
python --version
py --version

# Install Python if missing
# Ubuntu/Debian:
sudo apt install python3 python3-pip

# macOS:
brew install python3

# Windows: Download from python.org
```

### Issue 2: Python Dependencies Missing
**Error**: `ModuleNotFoundError: No module named 'transformers'`

**Solutions**:
```bash
# Install Python dependencies
cd Incident-Reporting-System/backend
pip install -r requirements.txt

# Or install individually
pip install transformers sentence-transformers bertopic pandas numpy scikit-learn
```

### Issue 3: Permission Denied
**Error**: `Permission denied` or `EACCES`

**Solutions**:
```bash
# Make Python script executable
chmod +x services/pythonMLPipeline.py
chmod +x test_python.py

# Check file permissions
ls -la services/pythonMLPipeline.py
```

### Issue 4: Empty Output
**Symptoms**: No output from Python script

**Debug Steps**:
1. Check if Python script exists:
   ```bash
   ls -la Incident-Reporting-System/backend/services/pythonMLPipeline.py
   ```

2. Test Python script manually:
   ```bash
   cd Incident-Reporting-System/backend
   python3 services/pythonMLPipeline.py '[{"_id":"test","title":"Test","description":"Test description"}]'
   ```

3. Check Node.js logs for debug messages

### Issue 5: JSON Parsing Error
**Error**: `Failed to parse Python pipeline output`

**Solutions**:
1. Check if Python script is outputting valid JSON
2. Look for debug messages in console
3. Verify the Python script is working correctly

## Debug Endpoints

### Test Simple Python
```http
GET /api/trending/test/simple-python
```
This tests basic Python functionality without ML dependencies.

### Test Full ML Pipeline
```http
GET /api/trending/test/python-pipeline
```
This tests the complete ML pipeline with sample data.

## Manual Testing

### 1. Test Python Script Directly
```bash
cd Incident-Reporting-System/backend
python3 services/pythonMLPipeline.py '[{"_id":"test1","title":"UPI Fraud","description":"Fake UPI payment request"}]'
```

### 2. Test Simple Python Script
```bash
cd Incident-Reporting-System/backend
python3 test_python.py
```

### 3. Check Python Dependencies
```bash
python3 -c "import transformers; print('Transformers OK')"
python3 -c "import sentence_transformers; print('Sentence Transformers OK')"
python3 -c "import bertopic; print('BERTopic OK')"
python3 -c "import pandas; print('Pandas OK')"
```

## Environment Variables

Add these to your `.env` file:
```env
# Python Configuration
PYTHON_PATH=python3
ML_PIPELINE_DEBUG=true
ML_PIPELINE_VERBOSE=true
```

## File Structure Check

Ensure these files exist:
```
Incident-Reporting-System/backend/
├── services/
│   ├── pythonMLPipeline.py ✅
│   └── advancedMLService.js ✅
├── test_python.py ✅
├── requirements.txt ✅
└── controllers/
    └── trending.controller.js ✅
```

## Log Analysis

### Successful Run Logs:
```
🔍 DEBUG: Starting Python ML pipeline...
🔍 DEBUG: Python script path: /path/to/pythonMLPipeline.py
🔍 DEBUG: Incidents data length: 2
✅ Python process started with: python3
🐍 Python ML Pipeline started
🐍 Parsing JSON input...
🐍 Received 2 incidents
🐍 Creating ML pipeline...
🐍 Processing incidents...
🐍 Pipeline completed successfully
📤 Python stdout: {"success": true, "processed_incidents": 2, ...}
✅ Python pipeline result: {...}
```

### Error Logs:
```
❌ Python script not found at: /path/to/pythonMLPipeline.py
❌ Python process error: spawn python3 ENOENT
❌ Python process returned empty output
❌ Error parsing Python output: Unexpected token...
```

## Troubleshooting Commands

### Check Python Installation:
```bash
which python3
which python
which py
```

### Check Dependencies:
```bash
pip list | grep transformers
pip list | grep sentence-transformers
pip list | grep bertopic
```

### Test File Permissions:
```bash
ls -la services/pythonMLPipeline.py
chmod +x services/pythonMLPipeline.py
```

### Test JSON Input:
```bash
echo '[{"_id":"test","title":"Test","description":"Test"}]' | python3 services/pythonMLPipeline.py
```

## Common Solutions

### 1. Install Missing Dependencies:
```bash
pip install transformers sentence-transformers bertopic pandas numpy scikit-learn python-dateutil
```

### 2. Fix Python Path:
```bash
# Find Python executable
which python3
# Update the path in advancedMLService.js if needed
```

### 3. Fix File Permissions:
```bash
chmod +x services/pythonMLPipeline.py
chmod +x test_python.py
```

### 4. Test with Simple Data:
Start with the simple Python test first, then move to the full ML pipeline.

## Still Having Issues?

1. **Check the console logs** - Look for debug messages
2. **Test the simple Python script first** - Use `/api/trending/test/simple-python`
3. **Verify Python installation** - Run `python3 --version`
4. **Check file permissions** - Ensure scripts are executable
5. **Install dependencies** - Run `pip install -r requirements.txt`

The debug messages will show exactly where the process is failing!
