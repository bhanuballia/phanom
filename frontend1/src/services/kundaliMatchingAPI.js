// API service for Kundali Matching
const API_BASE_URL = '/api/kundali-matching';

export const kundaliMatchingAPI = {
  // Match two kundalis using Ashtakoota system
  matchKundalis: async (brideData, groomData) => {
    const response = await fetch(`${API_BASE_URL}/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brideData,
        groomData
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to match kundalis');
    }

    return await response.json();
  },

  // Generate PDF report
  generatePDF: async (brideData, groomData, matchResult) => {
    const response = await fetch(`${API_BASE_URL}/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brideData,
        groomData,
        matchResult
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate PDF');
    }

    return await response.json();
  }
};

export default kundaliMatchingAPI;