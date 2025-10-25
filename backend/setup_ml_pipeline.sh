#!/bin/bash

# Setup script for Advanced ML Pipeline
echo "Setting up Advanced ML Pipeline..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip3 is required but not installed. Please install pip3 first."
    exit 1
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv ml_env

# Activate virtual environment
echo "Activating virtual environment..."
source ml_env/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Make Python script executable
chmod +x services/pythonMLPipeline.py

echo "Advanced ML Pipeline setup completed!"
echo "To activate the environment, run: source ml_env/bin/activate"
echo "To run the pipeline, use the Node.js API endpoints."
