import React, { useState, useEffect } from 'react';
import ScamMap from '../../components/ScamMap/ScamMap';
import GeminiInsights from '../../components/GeminiInsights/GeminiInsights';
import { Map, AlertTriangle, MessageCircle, TrendingUp, Brain, Target, BarChart3, Zap } from 'lucide-react';
import { axiosInstance } from '../../stores/axios';
import { toast } from 'react-hot-toast';

const MapPage = () => {
  const [activeTab, setActiveTab] = useState('combined');
  const [mlInsights, setMLInsights] = useState(null);
  const [trendingPatterns, setTrendingPatterns] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'combined', label: 'Combined View', icon: Map },
    { id: 'incidents', label: 'Incidents Only', icon: AlertTriangle },
    { id: 'community', label: 'Community Posts', icon: MessageCircle },
    { id: 'trending', label: 'Trending Patterns', icon: TrendingUp },
    { id: 'hotspots', label: 'Hotspots', icon: Target },
    { id: 'insights', label: 'ML Insights', icon: Brain },
    { id: 'Insights', label: 'ML Insights', icon: Zap }
  ];

  useEffect(() => {
    fetchMLData();
  }, []);

  const fetchMLData = async () => {
    try {
      setLoading(true);
      console.log('🚀 Fetching ML data for Map page...');
      
      // First, trigger the advanced ML pipeline to ensure fresh data
      try {
        console.log('🔄 Triggering advanced ML pipeline...');
        const pipelineResponse = await axiosInstance.post('/trending/advanced/run-pipeline', {
          days: 7,
          limit: 100
        });
        console.log('✅ ML pipeline triggered:', pipelineResponse.data.message);
      } catch (pipelineError) {
        console.warn('⚠️ ML pipeline trigger failed, continuing with cached data:', pipelineError.message);
      }

      // Fetch advanced ML insights
      const insightsResponse = await axiosInstance.get('/trending/advanced/insights');
      if (insightsResponse.data.success) {
        setMLInsights(insightsResponse.data.data);
        console.log('✅ ML insights loaded');
      }

      // Fetch advanced trending patterns
      const patternsResponse = await axiosInstance.get('/trending/advanced/trending?limit=5');
      if (patternsResponse.data.success) {
        setTrendingPatterns(patternsResponse.data.data.patterns);
        console.log('✅ Trending patterns loaded');
      }

      // Fetch hotspots
      const hotspotsResponse = await axiosInstance.get('/trending/hotspots?limit=10');
      if (hotspotsResponse.data.success) {
        setHotspots(hotspotsResponse.data.data.hotspots);
        console.log('✅ Hotspots loaded');
      }

      console.log('🎉 All ML data loaded successfully');

    } catch (error) {
      console.error('❌ Error fetching ML data:', error);
      toast.error('Failed to load ML insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scam Hotspots Map</h1>
          <p className="text-gray-600">
            Interactive map showing scam incidents and community reports across India
          </p>
        </div>

        {/* Map Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'insights' ? (
              <MLInsightsPanel insights={mlInsights} loading={loading} />
            ) : activeTab === 'trending' ? (
              <TrendingPatternsPanel patterns={trendingPatterns} loading={loading} />
            ) : activeTab === 'hotspots' ? (
              <HotspotsPanel hotspots={hotspots} loading={loading} />
            ) : activeTab === 'Insights' ? (
              <GeminiInsights />
            ) : (
              <ScamMap mapType={activeTab} />
            )}
          </div>
        </div>

        {/* Map Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Incident Reports</h3>
            </div>
            <p className="text-gray-600 text-sm">
              View reported scam incidents with severity levels and location details. 
              Red markers indicate critical incidents, while green markers show low-severity cases.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Community Posts</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Explore community discussions and experiences shared by users. 
              Blue markers represent community posts about scam experiences.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Scam Hotspots</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Identify areas with high scam activity. Larger circles indicate 
              more reports in that pincode area, helping you stay alert.
            </p>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Stay Safe Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Before Making Payments:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Verify the person's identity through official channels</li>
                <li>Never share OTP or banking details over phone</li>
                <li>Check if the organization is legitimate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">If You Suspect a Scam:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Report immediately to local authorities</li>
                <li>Block the scammer's contact details</li>
                <li>Share your experience to help others</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ML Insights Panel Component
const MLInsightsPanel = ({ insights, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Brain className="w-8 h-8 animate-pulse text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading ML insights...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No ML Insights Available</h3>
        <p className="text-gray-500">ML analysis is still processing data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Patterns</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{insights.totalPatterns || 0}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Trending</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{insights.trendingPatterns || 0}</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Hotspots</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">{insights.hotspots?.length || 0}</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Clusters</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{insights.regionalStats?.totalClusters || 0}</p>
        </div>
      </div>

      {insights.categoryDistribution && (
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
          <div className="space-y-2">
            {insights.categoryDistribution.map((category, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{category._id}</span>
                <span className="text-sm font-medium text-gray-900">{category.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.severityDistribution && (
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Severity Distribution</h3>
          <div className="space-y-2">
            {insights.severityDistribution.map((severity, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{severity._id}</span>
                <span className="text-sm font-medium text-gray-900">{severity.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Trending Patterns Panel Component
const TrendingPatternsPanel = ({ patterns, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <TrendingUp className="w-8 h-8 animate-pulse text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading trending patterns...</p>
        </div>
      </div>
    );
  }

  if (!patterns || patterns.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Trending Patterns</h3>
        <p className="text-gray-500">No trending scam patterns detected yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {patterns.map((pattern, index) => (
        <div key={pattern._id} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{pattern.name}</h3>
              <p className="text-sm text-gray-600">{pattern.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                pattern.severity === 'critical' ? 'bg-red-100 text-red-800' :
                pattern.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                pattern.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {pattern.severity}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                {pattern.category}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Frequency:</span>
              <span className="ml-2 font-medium">{pattern.frequency}</span>
            </div>
            <div>
              <span className="text-gray-600">Confidence:</span>
              <span className="ml-2 font-medium">{(pattern.confidence * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-600">Trend Score:</span>
              <span className="ml-2 font-medium">{(pattern.trendScore * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-600">Incidents:</span>
              <span className="ml-2 font-medium">{pattern.relatedIncidents?.length || 0}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Hotspots Panel Component
const HotspotsPanel = ({ hotspots, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Target className="w-8 h-8 animate-pulse text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading hotspots...</p>
        </div>
      </div>
    );
  }

  if (!hotspots || hotspots.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Hotspots Detected</h3>
        <p className="text-gray-500">No scam hotspots identified yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hotspots.map((hotspot, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Hotspot #{index + 1}
              </h3>
              <p className="text-sm text-gray-600">
                {hotspot.center ? 
                  `Location: ${hotspot.center.lat.toFixed(4)}, ${hotspot.center.lng.toFixed(4)}` :
                  'Location: Unknown'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                Risk: {(hotspot.riskScore * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Size:</span>
              <span className="ml-2 font-medium">{hotspot.size}</span>
            </div>
            <div>
              <span className="text-gray-600">Density:</span>
              <span className="ml-2 font-medium">{hotspot.density?.toFixed(2) || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">Incidents:</span>
              <span className="ml-2 font-medium">{hotspot.incidents?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="ml-2 font-medium">
                {hotspot.timeRange ? 
                  `${Math.ceil(hotspot.timeRange.duration / (1000 * 60 * 60 * 24))} days` :
                  'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MapPage;
