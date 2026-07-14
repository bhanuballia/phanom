import React, { useEffect, useRef } from 'react';

const KundaliChart = ({ kundaliData }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    // Dynamically load the libraries
    const loadLibraries = async () => {
      try {
        // Load Snap.svg
        if (typeof Snap === 'undefined') {
          await new Promise((resolve, reject) => {
            const snapScript = document.createElement('script');
            snapScript.src = '/src/libs/snap.svg.js';
            snapScript.onload = resolve;
            snapScript.onerror = reject;
            document.head.appendChild(snapScript);
          });
        }

        // Load AstroChart
        if (typeof astrochart === 'undefined') {
          await new Promise((resolve, reject) => {
            const astroScript = document.createElement('script');
            astroScript.src = '/src/libs/astrochart.js';
            astroScript.onload = resolve;
            astroScript.onerror = reject;
            document.head.appendChild(astroScript);
          });
        }

        // Now create the chart
        createChart();
      } catch (error) {
        console.error('Error loading libraries:', error);
      }
    };

    const createChart = () => {
      if (kundaliData && chartContainerRef.current && typeof astrochart !== 'undefined') {
        // Clear previous chart
        chartContainerRef.current.innerHTML = '';
        
        // Parse the kundali text data to extract planetary positions
        const chartData = parseKundaliData(kundaliData);
        
        // Create the chart
        if (chartData) {
          try {
            // Initialize the chart
            chartRef.current = new astrochart.Chart(chartContainerRef.current, 500, 500);
            chartRef.current.radix(chartData).aspects();
          } catch (error) {
            console.error('Error creating Kundali chart:', error);
          }
        }
      }
    };

    if (kundaliData) {
      // Check if libraries are already loaded
      if (typeof Snap !== 'undefined' && typeof astrochart !== 'undefined') {
        createChart();
      } else {
        loadLibraries();
      }
    }
    
    // Cleanup function
    return () => {
      if (chartRef.current) {
        // Clean up chart if needed
      }
    };
  }, [kundaliData]);

  // Function to parse kundali text data and extract planetary positions
  // This is a placeholder implementation - you would need to adjust this based on your actual data structure
  const parseKundaliData = (kundaliText) => {
    // In a real implementation, you would parse the kundali text to extract:
    // 1. Planetary positions (Sun, Moon, Mars, etc.)
    // 2. House cusps (the boundaries of the 12 houses)
    
    // For now, we'll return sample data to demonstrate the chart
    return {
      "planets": {
        "Sun": [281], 
        "Moon": [268], 
        "Mercury": [312], 
        "Venus": [330], 
        "Mars": [210], 
        "Jupiter": [192], 
        "Saturn": [201], 
        "Uranus": [318], 
        "Neptune": [110], 
        "Pluto": [63], 
        "Lilith": [18], 
        "NNode": [2], 
        "Chiron": [18]
      },
      "cusps": [296, 350, 30, 56, 75, 94, 116, 170, 210, 236, 255, 274]
    };
  };

  return (
    <div className="kundali-chart-container">
      <div 
        ref={chartContainerRef} 
        id="kundali-chart"
        className="w-full h-[500px] flex items-center justify-center bg-astro-dark/30 rounded-xl border border-astro-gold/20"
      >
        {!kundaliData ? (
          <p className="text-gray-400">कुंडली चार्ट यहाँ प्रदर्शित होगा (Kundali chart will be displayed here)</p>
        ) : (
          <p className="text-gray-400">Loading chart...</p>
        )}
      </div>
    </div>
  );
};

export default KundaliChart;