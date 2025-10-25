const mongoose = require('mongoose');

const scamPatternSchema = new mongoose.Schema({
  patternId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  keywords: [{
    word: String,
    weight: Number
  }],
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['financial', 'identity', 'phishing', 'social_engineering', 'tech_support', 'romance', 'investment', 'other'],
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  frequency: {
    type: Number,
    default: 0
  },
  trendScore: {
    type: Number,
    default: 0
  },
  geographicDistribution: [{
    region: String,
    count: Number,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }],
  timeDistribution: [{
    hour: Number,
    count: Number
  }],
  demographics: {
    ageGroups: [{
      range: String,
      count: Number
    }],
    genders: [{
      gender: String,
      count: Number
    }]
  },
  relatedIncidents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
scamPatternSchema.index({ patternId: 1 });
scamPatternSchema.index({ category: 1 });
scamPatternSchema.index({ trendScore: -1 });
scamPatternSchema.index({ confidence: -1 });
scamPatternSchema.index({ isActive: 1 });

// Methods
scamPatternSchema.methods.updateTrendScore = function() {
  // Calculate trend score based on recent frequency and confidence
  const recentWeight = 0.7;
  const confidenceWeight = 0.3;
  this.trendScore = (this.frequency * recentWeight) + (this.confidence * confidenceWeight);
  this.lastUpdated = new Date();
};

scamPatternSchema.methods.addIncident = function(incidentId) {
  if (!this.relatedIncidents.includes(incidentId)) {
    this.relatedIncidents.push(incidentId);
    this.frequency += 1;
    this.updateTrendScore();
  }
};

scamPatternSchema.methods.updateGeographicDistribution = function(region, coordinates) {
  const existingRegion = this.geographicDistribution.find(geo => geo.region === region);
  if (existingRegion) {
    existingRegion.count += 1;
  } else {
    this.geographicDistribution.push({
      region,
      count: 1,
      coordinates
    });
  }
};

scamPatternSchema.methods.updateTimeDistribution = function(hour) {
  const existingHour = this.timeDistribution.find(time => time.hour === hour);
  if (existingHour) {
    existingHour.count += 1;
  } else {
    this.timeDistribution.push({
      hour,
      count: 1
    });
  }
};

// Static methods
scamPatternSchema.statics.getTrendingPatterns = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ trendScore: -1 })
    .limit(limit)
    .populate('relatedIncidents', 'title description severity createdAt');
};

scamPatternSchema.statics.getPatternsByCategory = function(category) {
  return this.find({ category, isActive: true })
    .sort({ trendScore: -1 });
};

scamPatternSchema.statics.getPatternsByRegion = function(region) {
  return this.find({ 
    isActive: true,
    'geographicDistribution.region': region 
  })
    .sort({ trendScore: -1 });
};

const ScamPattern = mongoose.model('ScamPattern', scamPatternSchema);

module.exports = ScamPattern;
