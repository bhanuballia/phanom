const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const VEDASTRO_API = process.env.VEDASTRO_API_URL || 'http://localhost:7071';

// Ashtakoota system constants
const ASHTAKOOTA_MAX_POINTS = {
  varna: 1,
  vasya: 2,
  tara: 3,
  yoni: 4,
  maitri: 5,
  gan: 6,
  bhakoot: 7,
  nadi: 8
};

// Helper to get timezone offset
const getTimezoneOffset = (tz) => {
  const timezoneMap = {
    'Asia/Kolkata': '+05:30',
    'Asia/Calcutta': '+05:30',
    'America/New_York': '-05:00',
    'America/Los_Angeles': '-08:00',
    'Europe/London': '+00:00',
    'Asia/Dubai': '+04:00',
    'Asia/Singapore': '+08:00',
    'Australia/Sydney': '+10:00',
  };

  if (timezoneMap[tz]) return timezoneMap[tz];
  if (/^[+-]\d{2}:\d{2}$/.test(tz)) return tz;
  return '+05:30'; // Default to IST
};

// Helper function to check Manglik Dosha (Keep simplified or move to VedAstro later if available)
const checkManglikDosha = (dateOfBirth, timeOfBirth) => {
  // TODO: Use VedAstro for Manglik Dosha in future
  return false;
};

// Main matching function using VedAstro API
const performAshtakootaMatching = async (brideData, groomData) => {
  try {
    // Format Times
    // Time format: HH:MM/DD/MM/YYYY/OFF
    // Location format: Lat,Lon

    // Bride
    const bDate = new Date(brideData.dateOfBirth);
    const bTime = brideData.timeOfBirth || "12:00";
    const bTz = getTimezoneOffset(brideData.timezone || 'Asia/Kolkata');
    const bDateStr = `${String(bDate.getDate()).padStart(2, '0')}/${String(bDate.getMonth() + 1).padStart(2, '0')}/${bDate.getFullYear()}`;
    const bTimeString = `${bTime}/${bDateStr}/${bTz}`;
    const bLoc = brideData.coordinates || "0,0"; // Expect coordinates or fetch from place? Assuming coord passed or name

    // Groom
    const gDate = new Date(groomData.dateOfBirth);
    const gTime = groomData.timeOfBirth || "12:00";
    const gTz = getTimezoneOffset(groomData.timezone || 'Asia/Kolkata');
    const gDateStr = `${String(gDate.getDate()).padStart(2, '0')}/${String(gDate.getMonth() + 1).padStart(2, '0')}/${gDate.getFullYear()}`;
    const gTimeString = `${gTime}/${gDateStr}/${gTz}`;
    const gLoc = groomData.coordinates || "0,0";

    // Call VedAstro API
    // URL: /Calculate/Match/Location/X/Time/T/Location/Y/Time/Z
    const apiUrl = `${VEDASTRO_API}/api/Calculate/Match/Location/${gLoc}/Time/${gTimeString}/Location/${bLoc}/Time/${bTimeString}`;

    console.log(`Calling VedAstro Match API: ${apiUrl}`);
    const response = await axios.get(apiUrl);

    if (response.data && response.data.Status === "Success" && response.data.Payload) {
      const payload = response.data.Payload;
      const embeddings = payload.Embeddings || [];

      // Map Embeddings to Ashtakoota
      // Order from VedAstro logic (deduced): 
      // 0: Dina (Tara)
      // 1: Gana
      // 2: Nadi
      // 3: Rasi (Bhakoot)
      // 4: Maitri
      // 5: Vasya
      // 6: Varna
      // 7: Yoni

      const details = {
        tara: { points: embeddings[0] || 0, max: 3 },
        gan: { points: embeddings[1] || 0, max: 6 },
        nadi: { points: embeddings[2] || 0, max: 8 },
        bhakoot: { points: embeddings[3] || 0, max: 7 },
        maitri: { points: embeddings[4] || 0, max: 5 },
        vasya: { points: embeddings[5] || 0, max: 2 },
        varna: { points: embeddings[6] || 0, max: 1 },
        yoni: { points: embeddings[7] || 0, max: 4 }
      };

      const totalPoints = embeddings.reduce((a, b) => a + b, 0);

      return {
        totalPoints: totalPoints,
        maxPoints: 36,
        compatibility: totalPoints >= 18 ? 'Compatible' : 'Not Compatible',
        details: details,
        kutaScore: payload.KutaScore
      };
    } else {
      throw new Error("VedAstro Match API Failed");
    }

  } catch (error) {
    console.error("VedAstro Match Error:", error.message);
    throw error;
  }
};

// Generate PDF report
const generatePDFReport = (brideData, groomData, matchResult) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const os = require('os');
      const filename = `kundali_matching_${Date.now()}.pdf`;

      const reportsDir = process.env.NODE_ENV === 'production'
        ? path.join(os.tmpdir(), 'reports')
        : path.join(__dirname, '../reports');

      const filePath = path.join(reportsDir, filename);

      // Ensure reports directory exists
      try {
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }
      } catch (err) {
        console.warn('Failed to create reports dir:', err.message);
      }

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Add content to PDF
      doc.fontSize(20).text('कुंडली मिलान रिपोर्ट', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text(`Bride: ${brideData.name}`, { align: 'center' });
      doc.fontSize(16).text(`Groom: ${groomData.name}`, { align: 'center' });
      doc.moveDown();

      doc.fontSize(14).text(`Total Points: ${matchResult.totalPoints}/36`, { align: 'center' });
      doc.fontSize(14).text(`Compatibility: ${matchResult.compatibility}`, { align: 'center' });
      doc.moveDown();

      // Add Ashtakoota details
      doc.fontSize(16).text('Ashtakoota Analysis:');
      doc.moveDown();

      if (matchResult.details) {
        Object.entries(matchResult.details).forEach(([koot, data]) => {
          doc.fontSize(12).text(`${koot}: ${data.points}/${data.max}`);
        });
      }

      doc.moveDown();
      doc.fontSize(16).text('Manglik Dosha Analysis:');
      doc.moveDown();

      // Manglik info might be missing if using Basic API
      const brideManglik = matchResult.manglikDosha?.bride === 'Yes';
      const groomManglik = matchResult.manglikDosha?.groom === 'Yes';

      doc.fontSize(12).text(`Bride Manglik Dosha: ${brideManglik ? 'Yes' : 'No'}`);
      doc.fontSize(12).text(`Groom Manglik Dosha: ${groomManglik ? 'Yes' : 'No'}`);

      if (brideManglik || groomManglik) {
        doc.moveDown();
        doc.fontSize(16).text('Remedies:');
        doc.fontSize(12).text('• Perform Kumbh Vivah or Ghat Vivah before the main wedding');
      }

      doc.end();

      writeStream.on('finish', () => {
        resolve({
          success: true,
          filePath: filePath,
          filename: filename
        });
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Main controller function
exports.matchKundalis = async (req, res) => {
  try {
    const { brideData, groomData } = req.body;

    // Validate required fields
    if (!brideData.name || !brideData.dateOfBirth ||
      !groomData.name || !groomData.dateOfBirth) {
      return res.status(400).json({
        message: 'कृपया दोनों पक्षों के आवश्यक फील्ड भरें (Please fill all mandatory fields by bride and groom)'
      });
    }

    // Perform Ashtakoota matching via VedAstro
    const matchResult = await performAshtakootaMatching(brideData, groomData);

    // Check Manglik Dosha (Simplified for now)
    const brideManglik = checkManglikDosha(brideData.dateOfBirth, brideData.timeOfBirth);
    const groomManglik = checkManglikDosha(groomData.dateOfBirth, groomData.timeOfBirth);

    // Add Manglik Dosha information to result
    matchResult.manglikDosha = {
      bride: brideManglik ? 'Yes' : 'No',
      groom: groomManglik ? 'Yes' : 'No'
    };

    // Add remedies if Manglik Dosha is present
    matchResult.remedies = [];
    if (brideManglik || groomManglik) {
      matchResult.remedies.push('Perform Kumbh Vivah or Ghat Vivah before the main wedding');
      matchResult.remedies.push('Regular Hanuman Chalisa recitation recommended');
      matchResult.remedies.push('Donate red cloth and sindoor on Tuesdays');
    }

    // Generate PDF report (optional)
    // const pdfResult = await generatePDFReport(brideData, groomData, matchResult);

    res.status(200).json({
      message: 'कुंडली मिलान सफलतापूर्वक पूरा हुआ (Kundali matching completed successfully)',
      success: true,
      result: matchResult
      // pdf: pdfResult
    });

  } catch (error) {
    console.error('Error in Kundali matching:', error);
    res.status(500).json({
      message: 'कुंडली मिलान में त्रुटि हुई (Error in Kundali matching)',
      error: error.message
    });
  }
};

// Controller function to generate PDF
exports.generatePDF = async (req, res) => {
  try {
    const { brideData, groomData, matchResult } = req.body;

    const pdfResult = await generatePDFReport(brideData, groomData, matchResult);

    res.status(200).json({
      message: 'PDF generated successfully',
      success: true,
      pdf: pdfResult
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      message: 'Error generating PDF report',
      error: error.message
    });
  }
};



