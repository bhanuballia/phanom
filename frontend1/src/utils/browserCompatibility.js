// Browser compatibility utilities for Firefox and other browsers

export const BrowserDetector = {
  isFirefox: () => navigator.userAgent.toLowerCase().includes('firefox'),
  isChrome: () => navigator.userAgent.toLowerCase().includes('chrome'),
  isEdge: () => navigator.userAgent.toLowerCase().includes('edge'),
  isSafari: () => navigator.userAgent.toLowerCase().includes('safari') && !navigator.userAgent.toLowerCase().includes('chrome'),
  
  getBrowserInfo: () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('firefox')) return { name: 'Firefox', prefix: 'moz' };
    if (userAgent.includes('chrome')) return { name: 'Chrome', prefix: 'webkit' };
    if (userAgent.includes('edge')) return { name: 'Edge', prefix: 'webkit' };
    if (userAgent.includes('safari')) return { name: 'Safari', prefix: 'webkit' };
    return { name: 'Unknown', prefix: '' };
  }
};

export const FeatureDetector = {
  supportsBackdropFilter: () => {
    const testEl = document.createElement('div');
    const prefixes = ['', '-webkit-', '-moz-', '-ms-'];
    
    for (const prefix of prefixes) {
      try {
        testEl.style.setProperty(`${prefix}backdrop-filter`, 'blur(10px)');
        if (testEl.style.getPropertyValue(`${prefix}backdrop-filter`)) {
          return true;
        }
      } catch (e) {
        // Ignore errors
      }
    }
    return false;
  },
  
  supportsSpeechRecognition: () => {
    return !!(
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition
    );
  },
  
  supportsSpeechSynthesis: () => {
    return 'speechSynthesis' in window;
  },
  
  supportsUserMedia: () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },
  
  isSecureContext: () => {
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1' ||
           window.isSecureContext;
  }
};

export const FirefoxCompatibility = {
  // Apply Firefox-specific CSS fixes
  applyFirefoxStyles: () => {
    if (!BrowserDetector.isFirefox()) return;
    
    const style = document.createElement('style');
    style.textContent = `
      /* Firefox-specific glass morphism fallback */
      @supports not (backdrop-filter: blur(10px)) {
        .glass-card {
          background: rgba(255, 255, 255, 0.12) !important;
        }
        .glass-navbar {
          background: rgba(255, 255, 255, 0.1) !important;
        }
      }
      
      /* Firefox text gradient fallback */
      @supports not (-webkit-background-clip: text) {
        .divine-text {
          color: #D4AF37 !important;
        }
        .text-gradient {
          color: #a855f7 !important;
        }
      }
      
      /* Firefox animation performance */
      .floating-element {
        will-change: transform;
      }
      
      /* Firefox scrollbar improvements */
      * {
        scrollbar-width: thin;
        scrollbar-color: #D4AF37 rgba(31, 41, 55, 0.5);
      }
    `;
    document.head.appendChild(style);
  },
  
  // Initialize Firefox-specific features
  initializeFirefoxFeatures: () => {
    if (!BrowserDetector.isFirefox()) return;
    
    console.log('Initializing Firefox compatibility features...');
    
    // Apply styles
    FirefoxCompatibility.applyFirefoxStyles();
    
    // Add Firefox-specific event listeners
    document.addEventListener('DOMContentLoaded', () => {
      // Optimize performance for Firefox
      const firefoxOptimizations = {
        // Reduce animation complexity for better performance
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        
        // Check for specific Firefox version issues
        version: navigator.userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown'
      };
      
      console.log('Firefox optimizations applied:', firefoxOptimizations);
      
      // Store Firefox info for components to use
      window.firefoxInfo = firefoxOptimizations;
    });
  },
  
  // Get Firefox-compatible speech recognition options
  getSpeechRecognitionOptions: () => {
    if (!BrowserDetector.isFirefox()) return {};
    
    return {
      continuous: false,
      interimResults: false,
      maxAlternatives: 3, // Reduced for Firefox stability
      lang: 'en-US', // More reliable in Firefox
      grammars: null // Firefox may not support custom grammars
    };
  },
  
  // Get Firefox-compatible speech synthesis options
  getSpeechSynthesisOptions: () => {
    if (!BrowserDetector.isFirefox()) return {};
    
    return {
      rate: 0.8, // Slightly slower for Firefox
      pitch: 1.0,
      volume: 0.9,
      lang: 'en-US' // More reliable fallback
    };
  }
};

export const CrossBrowserUtils = {
  // Add vendor prefixes to CSS properties
  addVendorPrefix: (element, property, value) => {
    const prefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-'];
    
    prefixes.forEach(prefix => {
      try {
        element.style.setProperty(`${prefix}${property}`, value);
      } catch (e) {
        // Ignore errors for unsupported properties
      }
    });
  },
  
  // Get the best available API with fallbacks
  getCompatibleAPI: (apiName) => {
    const apis = {
      SpeechRecognition: [
        'SpeechRecognition',
        'webkitSpeechRecognition',
        'mozSpeechRecognition',
        'msSpeechRecognition'
      ]
    };
    
    if (apis[apiName]) {
      for (const api of apis[apiName]) {
        if (window[api]) {
          return window[api];
        }
      }
    }
    
    return null;
  },
  
  // Show browser-specific messages
  getBrowserSpecificMessage: (feature) => {
    const browser = BrowserDetector.getBrowserInfo();
    const messages = {
      speechRecognition: {
        Firefox: 'Voice input works best in Firefox with microphone permissions enabled. Please allow microphone access when prompted.',
        Chrome: 'Voice input is optimized for Chrome. Make sure you have a secure HTTPS connection.',
        Safari: 'Voice input support in Safari is limited. Consider using Chrome or Firefox for better experience.',
        Edge: 'Voice input works well in Edge. Ensure microphone permissions are granted.',
        Unknown: 'Voice input may have limited support in this browser. Try Chrome or Firefox for best results.'
      },
      speechSynthesis: {
        Firefox: 'Voice output works in Firefox. Audio may take a moment to start.',
        Chrome: 'Voice output is fully supported in Chrome.',
        Safari: 'Voice output works in Safari with some limitations.',
        Edge: 'Voice output is fully supported in Edge.',
        Unknown: 'Voice output support varies by browser.'
      }
    };
    
    return messages[feature]?.[browser.name] || messages[feature]?.Unknown || '';
  }
};

// Initialize compatibility features when module loads
if (typeof window !== 'undefined') {
  // Only run in browser environment
  document.addEventListener('DOMContentLoaded', () => {
    FirefoxCompatibility.initializeFirefoxFeatures();
  });
}

export default {
  BrowserDetector,
  FeatureDetector,
  FirefoxCompatibility,
  CrossBrowserUtils
};