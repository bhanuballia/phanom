const PDFDocument = require('pdfkit');
const fs = require('fs');
const SVGtoPDF = require('svg-to-pdfkit');

// Test if basic PDF generation works
console.log('🧪 Testing PDF Generation...\n');

const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
const outputPath = 'c:/Users/User/Desktop/Astrology - run/test-output.pdf';
const stream = fs.createWriteStream(outputPath);

doc.pipe(stream);

// Test 1: Basic text
console.log('Test 1: Adding basic text...');
doc.fontSize(20).text('Test PDF Document', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text('This is a test to verify PDF generation works.');
doc.moveDown();

// Test 2: Add a page
console.log('Test 2: Adding new page...');
doc.addPage();
doc.fontSize(16).text('Page 2 - Testing Multiple Pages');
doc.moveDown();

// Test 3: Try to add a simple SVG
console.log('Test 3: Testing SVG rendering...');
const simpleSVG = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" style="fill:rgb(0,0,255);stroke-width:3;stroke:rgb(0,0,0)" />
</svg>`;

try {
    SVGtoPDF(doc, simpleSVG, 100, 200, { width: 100, height: 100 });
    console.log('✅ SVG rendering successful');
    doc.y = 320;
} catch (err) {
    console.error('❌ SVG rendering failed:', err.message);
    doc.text('SVG rendering failed: ' + err.message);
}

// Finalize
doc.end();

stream.on('finish', () => {
    console.log('\n✅ PDF generated successfully at:', outputPath);
    console.log('📄 File size:', fs.statSync(outputPath).size, 'bytes');

    if (fs.statSync(outputPath).size < 1000) {
        console.log('⚠️ WARNING: PDF file is very small, might be empty!');
    }
});

stream.on('error', (err) => {
    console.error('❌ Error writing PDF:', err);
});
