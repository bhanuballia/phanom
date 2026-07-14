import React, { useState, useEffect } from 'react';
import { BrowserDetector, FeatureDetector } from '../utils/browserCompatibility';
import { AlertTriangle, X, CheckCircle, Info } from 'lucide-react';

const FirefoxCompatibilityNotice = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [browserInfo, setBrowserInfo] = useState(null);
  const [features, setFeatures] = useState(null);

  useEffect(() => {
    const browser = BrowserDetector.getBrowserInfo();
    const featureSupport = {
      backdropFilter: FeatureDetector.supportsBackdropFilter(),
      speechRecognition: FeatureDetector.supportsSpeechRecognition(),
      speechSynthesis: FeatureDetector.supportsSpeechSynthesis(),
      userMedia: FeatureDetector.supportsUserMedia(),
      secureContext: FeatureDetector.isSecureContext()
    };

    setBrowserInfo(browser);
    setFeatures(featureSupport);

    // Show notice for Firefox users or when there are compatibility issues
    const shouldShow = BrowserDetector.isFirefox() || 
                      !featureSupport.secureContext || 
                      !featureSupport.speechRecognition;
    
    if (shouldShow) {
      // Show notice after a delay
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  if (!isVisible || !browserInfo || !features) {
    return null;
  }

  const getStatusIcon = (supported) => {
    return supported ? 
      <CheckCircle className="h-4 w-4 text-green-400" /> : 
      <AlertTriangle className="h-4 w-4 text-yellow-400" />;
  };

  const getRecommendations = () => {
    const recommendations = [];

    if (!features.secureContext) {
      recommendations.push({
        icon: <AlertTriangle className="h-4 w-4 text-red-400" />,
        text: 'कृपया HTTPS connection का उपयोग करें (Please use HTTPS connection)',
        priority: 'high'
      });
    }

    if (!features.speechRecognition) {
      recommendations.push({
        icon: <Info className="h-4 w-4 text-blue-400" />,
        text: 'वॉइस इनपुट के लिए माइक्रोफोन की अनुमति दें (Allow microphone for voice input)',
        priority: 'medium'
      });
    }

    if (BrowserDetector.isFirefox() && !features.backdropFilter) {
      recommendations.push({
        icon: <Info className="h-4 w-4 text-yellow-400" />,
        text: 'कुछ visual effects Firefox में सीमित हो सकते हैं (Some visual effects may be limited in Firefox)',
        priority: 'low'
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="fixed top-4 left-4 z-50 max-w-md">
      <div className="bg-gradient-to-r from-purple-900/95 to-indigo-900/95 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
              <Info className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{browserInfo.name} Compatibility</h3>
              <p className="text-gray-300 text-sm">ब्राउज़र संगतता सूचना</p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        /* Feature Status */
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Feature Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Secure Connection</span>
              {getStatusIcon(features.secureContext)}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Voice Input</span>
              {getStatusIcon(features.speechRecognition)}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Voice Output</span>
              {getStatusIcon(features.speechSynthesis)}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Visual Effects</span>
              {getStatusIcon(features.backdropFilter)}
            </div>
          </div>
        </div>

        /* Recommendations */
        {recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Recommendations</h4>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  {rec.icon}
                  <p className="text-sm text-gray-300 leading-relaxed">{rec.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        /* Footer */
        <div className="mt-4 pt-4 border-t border-purple-500/20">
          <p className="text-xs text-gray-400 text-center">
            सभी features के लिए Chrome या Edge का उपयोग करें
            <br />
            (Use Chrome or Edge for all features)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirefoxCompatibilityNotice;