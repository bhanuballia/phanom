const PDFDocument = require('pdfkit');
const fs = require('fs');

// Mock Dasha Data (matches structure expected by kundaliController.js)
const mockDashaData = {
    "Sun": {
        "Lord": "Sun",
        "Start": "12:00 01/01/1990",
        "End": "12:00 01/01/1996",
        "DurationText": "6 Years",
        "SubDasas": {
            "Sun": { "Lord": "Sun", "Start": "01/01/1990", "End": "04/01/1990", "DurationText": "3 Months" },
            "Moon": { "Lord": "Moon", "Start": "04/01/1990", "End": "10/01/1990", "DurationText": "6 Months" }
        }
    },
    "Moon": {
        "Lord": "Moon",
        "Start": "12:00 01/01/1996",
        "End": "12:00 01/01/2006",
        "DurationText": "10 Years"
    },
    "Mars": {
        "Lord": "Mars",
        "Start": "12:00 01/01/2006",
        "End": "12:00 01/01/2013",
        "DurationText": "7 Years"
    }
};

function generateTestPDF() {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(fs.createWriteStream('dasha_verification.pdf'));

    doc.fontSize(20).text('Dasha Verification Test', { align: 'center' });
    doc.moveDown();

    // Logic copied from kundaliController.js (processDasha)
    const dashaHeaders = ['Planet', 'Start Date', 'End Date', 'Duration'];

    const processDasha = (dasas, level = 0) => {
        if (!dasas || level > 4) return [];

        const parseDate = (dStr) => {
            if (!dStr) return null;
            const parts = dStr.split(' ');
            if (parts.length >= 2) {
                const [day, month, year] = parts[1].split('/');
                return new Date(`${year}-${month}-${day}T${parts[0]}`);
            }
            return new Date(dStr);
        };

        let dasaArray;
        if (Array.isArray(dasas)) {
            dasaArray = dasas;
        } else if (dasas.Dasas) {
            dasaArray = dasas.Dasas;
        } else {
            dasaArray = Object.values(dasas);
        }

        let rows = [];
        dasaArray.forEach(d => {
            if (!d) return;
            const planet = d.Lord || d.Planet || d.Name;
            if (!planet) return;

            const indent = "  ".repeat(level);
            const start = d.Start || d.StartTime;
            const end = d.End || d.EndTime;
            const duration = d.DurationText || `${d.DurationYears || 0}y ${d.DurationMonths || 0}m`;

            const startDate = parseDate(start);
            const endDate = parseDate(end);

            rows.push([
                `${indent}${planet}`,
                startDate && !isNaN(startDate) ? startDate.toLocaleDateString() : (start || 'N/A'),
                endDate && !isNaN(endDate) ? endDate.toLocaleDateString() : (end || 'N/A'),
                duration
            ]);

            if (d.SubDasas) {
                rows = rows.concat(processDasha(d.SubDasas, level + 1));
            }
        });
        return rows;
    };

    const allDashaRows = processDasha(mockDashaData);

    // Simple table drawing for verification
    allDashaRows.forEach(row => {
        doc.fontSize(12).text(row.join(' | '), { indent: 20 });
    });

    doc.end();
    console.log('✅ PDF Generated: dasha_verification.pdf');
    console.log('✅ Dasha Rows Processed:', allDashaRows.length);
}

generateTestPDF();
