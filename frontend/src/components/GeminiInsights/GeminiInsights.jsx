import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, BarChart3, RefreshCw, Zap, MapPin, Shield } from 'lucide-react';
import { axiosInstance } from '../../stores/axios';
import { toast } from 'react-hot-toast';

const GeminiInsights = () => {
  const [insights, setInsights] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchGeminiData();
  }, []);

  const fetchGeminiData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🤖 Fetching Gemini AI insights...');
      
      // Fetch both insights and patterns in parallel
      const [insightsResponse, patternsResponse] = await Promise.allSettled([
        axiosInstance.get('/gemini/insights'),
        axiosInstance.get('/gemini/trending?limit=5')
      ]);

      // Handle insights response
      if (insightsResponse.status === 'fulfilled' && insightsResponse.value.data.success) {
        setInsights(insightsResponse.value.data.data);
        console.log('✅ Gemini insights loaded');
      } else if (insightsResponse.status === 'rejected') {
        console.error('Failed to fetch insights:', insightsResponse.reason);
      }

      // Handle patterns response
      if (patternsResponse.status === 'fulfilled' && patternsResponse.value.data.success) {
        const patternsData = patternsResponse.value.data.data.patterns || patternsResponse.value.data.data;
        setPatterns(Array.isArray(patternsData) ? patternsData : []);
        console.log('✅ Gemini patterns loaded');
      } else if (patternsResponse.status === 'rejected') {
        console.error('Failed to fetch patterns:', patternsResponse.reason);
      }

      // Check if both failed
      if (insightsResponse.status === 'rejected' && patternsResponse.status === 'rejected') {
        throw new Error('Failed to load Gemini AI data');
      }

      setLastUpdated(new Date());
      console.log('🎉 Gemini AI data loaded successfully');

    } catch (error) {
      console.error('❌ Error fetching Gemini data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load AI insights');
      toast.error('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGeminiData();
    setRefreshing(false);
    toast.success('AI insights refreshed');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Brain className="w-8 h-8 animate-pulse text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading AI insights...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !insights && patterns.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">Error Loading AI Insights</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No data state
  if (!insights && patterns.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No AI Insights Available</h3>
        <p className="text-gray-500 mb-6">Generate insights by analyzing incident data</p>
        <button
          onClick={handleRefresh}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Generate Insights
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">ML Insights</h2>
            <p className="text-sm text-gray-600">
              Powered by SCAMSHIELD's AI
              {lastUpdated && (
                <span className="ml-2">
                  • Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Main Insights */}
      {insights && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            AI Analysis Overview
          </h3>
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{insights.insights}</p>
          </div>
          
          {insights.riskAssessment && (
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Risk Assessment: </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                insights.riskAssessment.toLowerCase().includes('high') ? 'bg-red-100 text-red-800' :
                insights.riskAssessment.toLowerCase().includes('medium') ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {insights.riskAssessment}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Key Patterns Identified */}
      {insights && insights.patterns && Array.isArray(insights.patterns) && insights.patterns.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Key Patterns Identified
          </h3>
          <ul className="space-y-2">
            {insights.patterns.map((pattern, index) => (
              <li key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{pattern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Trending Patterns (AI Generated) */}
      {patterns && patterns.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Trending Scam Patterns ({patterns.length})
          </h3>
          <div className="space-y-4">
            {patterns.map((pattern, index) => (
              <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{pattern.name}</h4>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{pattern.description}</p>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    {pattern.severity && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-center ${
                        pattern.severity.toLowerCase() === 'high' || pattern.severity.toLowerCase() === 'critical' ? 'bg-red-100 text-red-800' :
                        pattern.severity.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {pattern.severity}
                      </span>
                    )}
                    {pattern.category && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full text-center">
                        {pattern.category}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4 pb-4 border-b border-gray-200">
                  {pattern.frequency !== undefined && (
                    <div className="text-center p-2 bg-white rounded">
                      <span className="block text-gray-600 text-xs mb-1">Frequency</span>
                      <span className="block font-bold text-gray-900">{pattern.frequency}</span>
                    </div>
                  )}
                  {pattern.confidence !== undefined && (
                    <div className="text-center p-2 bg-white rounded">
                      <span className="block text-gray-600 text-xs mb-1">Confidence</span>
                      <span className="block font-bold text-gray-900">{(pattern.confidence * 100).toFixed(0)}%</span>
                    </div>
                  )}
                  {pattern.trendScore !== undefined && (
                    <div className="text-center p-2 bg-white rounded">
                      <span className="block text-gray-600 text-xs mb-1">Trend Score</span>
                      <span className="block font-bold text-gray-900">{(pattern.trendScore * 100).toFixed(0)}%</span>
                    </div>
                  )}
                  {pattern.timeRange && (
                    <div className="text-center p-2 bg-white rounded">
                      <span className="block text-gray-600 text-xs mb-1">Time Range</span>
                      <span className="block font-bold text-gray-900 text-xs">{pattern.timeRange}</span>
                    </div>
                  )}
                </div>

                {/* Geographic Distribution */}
                {pattern.geographicDistribution && Array.isArray(pattern.geographicDistribution) && pattern.geographicDistribution.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-600 flex items-center mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      Geographic Distribution:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {pattern.geographicDistribution.map((location, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Indicators */}
                {pattern.keyIndicators && Array.isArray(pattern.keyIndicators) && pattern.keyIndicators.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-600 mb-2 block">Key Indicators:</span>
                    <div className="flex flex-wrap gap-2">
                      {pattern.keyIndicators.map((indicator, idx) => (
                        <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prevention Tips */}
                {pattern.preventionTips && Array.isArray(pattern.preventionTips) && pattern.preventionTips.length > 0 && (
                  <div className="mt-3 bg-green-50 rounded-lg p-3">
                    <span className="text-sm font-semibold text-green-900 mb-2 block flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Prevention Tips:
                    </span>
                    <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                      {pattern.preventionTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {insights && insights.recommendations && Array.isArray(insights.recommendations) && insights.recommendations.length > 0 && (
        <div className="bg-white rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-600" />
            AI Recommendations ({insights.recommendations.length})
          </h3>
          <ul className="space-y-3">
            {insights.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <span className="text-gray-700 leading-relaxed">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hotspots */}
      {insights && insights.hotspots && Array.isArray(insights.hotspots) && insights.hotspots.length > 0 && (
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            AI Identified Hotspots ({insights.hotspots.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.hotspots.map((hotspot, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <MapPin className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-gray-700">{hotspot}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emerging Threats */}
      {insights && insights.emergingThreats && Array.isArray(insights.emergingThreats) && insights.emergingThreats.length > 0 && (
        <div className="bg-white rounded-lg border border-orange-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
            Emerging Threats ({insights.emergingThreats.length})
          </h3>
          <div className="space-y-3">
            {insights.emergingThreats.map((threat, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">{threat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
        <p>AI-generated insights are based on recent incident data and may require human verification.</p>
      </div>
    </div>
  );
};

export default GeminiInsights;
