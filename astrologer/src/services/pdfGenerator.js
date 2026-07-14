import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateAstroPDF = (toolType, data, userDetails) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header styling
    doc.setFillColor(147, 51, 234); // Purple-600
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    let title = 'Professional Astrology Report';
    if (toolType === 'kundli') title = 'Advanced Kundali Report';
    if (toolType === 'matching') title = 'Kundali Matching Report';
    if (toolType === 'sadesati') title = 'Sade Sati Report';
    if (toolType === 'dasha') title = 'Vimshottari Dasha Report';
    if (toolType === 'personal-report') title = 'Personal Astrology Report';
    if (toolType === 'raw-data') title = 'Complete Technical Report';
    if (toolType === 'kaal-sarp') title = 'Kaal Sarp Dosha Report';
    if (toolType === 'mangal-dosha') title = 'Advanced Mangal Dosha Report';
    if (toolType === 'planet-position') title = 'Planet Position Report';
    if (toolType === 'daily-prediction') title = 'Daily Prediction Report';
    if (toolType === 'panchang') title = 'Advanced Panchang Report';

    doc.text(title, pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(243, 232, 255); // Purple-100
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });

    // User Details Section
    doc.setTextColor(0);
    let yPos = 55;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Birth/Input Details:', 14, yPos);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    yPos += 7;

    if (userDetails) {
        if (toolType === 'matching') {
            doc.text(`Groom Date: ${userDetails.boy_datetime || 'N/A'}`, 14, yPos);
            doc.text(`Bride Date: ${userDetails.girl_datetime || 'N/A'}`, pageWidth / 2, yPos);
            yPos += 7;
            doc.text(`Groom Location: ${userDetails.boy_coordinates || 'N/A'}`, 14, yPos);
            doc.text(`Bride Location: ${userDetails.girl_coordinates || 'N/A'}`, pageWidth / 2, yPos);
        } else {
            doc.text(`Date & Time: ${userDetails.datetime || 'N/A'}`, 14, yPos);
            yPos += 7;
            doc.text(`Location (Lat, Lon): ${userDetails.coordinates || 'N/A'}`, 14, yPos);
            if (userDetails.first_name || userDetails.name) {
                yPos += 7;
                doc.text(`Name: ${userDetails.first_name || userDetails.name} ${userDetails.last_name || ''}`, 14, yPos);
            }
        }
    }
    yPos += 15;

    // Content based on tool type
    try {
        if (toolType === 'raw-data' || toolType === 'personal-report') {
            generateExhaustivePDF(doc, data, yPos);
        } else {
            switch (toolType) {
                case 'kundli':
                    generateKundliPDF(doc, data, yPos);
                    break;
                case 'matching':
                    generateMatchingPDF(doc, data, yPos);
                    break;
                case 'sadesati':
                    generateSadesatiPDF(doc, data, yPos);
                    break;
                case 'dasha':
                    generateDashaPDF(doc, data, yPos);
                    break;
                default:
                    generateExhaustivePDF(doc, data, yPos);
            }
        }
    } catch (error) {
        console.error("PDF Generation Error", error);
        doc.text("Error rendering PDF content: " + error.message, 14, yPos);
    }

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 25, doc.internal.pageSize.height - 10);
    }

    doc.save(`Astro_Report_${Date.now()}.pdf`);
};

const generateKundliPDF = (doc, data, startY) => {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Planetary Details', 14, startY);
    startY += 10;

    const planetRows = data.planets?.map(p => [
        p.name,
        p.rasi?.name || p.rasi,
        `${Math.floor(p.degree)}° ${Math.floor((p.degree % 1) * 60)}'`,
        p.house,
        p.nakshatra || '',
        p.is_retrograde ? 'Yes' : 'No'
    ]) || [];

    autoTable(doc, {
        startY: startY,
        head: [['Planet', 'Sign', 'Degree', 'House', 'Nakshatra', 'Retro']],
        body: planetRows,
        theme: 'grid',
        headStyles: { fillColor: [147, 51, 234] }
    });

    let finalY = doc.lastAutoTable.finalY + 15;

    if (data.nakshatra_details) {
        doc.text('Nakshatra Analysis', 14, finalY);
        finalY += 10;
        const details = [
            ['Nakshatra', data.nakshatra_details.nakshatra?.name || 'N/A'],
            ['Lord', data.nakshatra_details.nakshatra?.lord?.name || 'N/A'],
            ['Pada', data.nakshatra_details.nakshatra?.pada || 'N/A'],
            ['Moon Sign', data.nakshatra_details.chandra_rasi?.name || 'N/A'],
            ['Sun Sign', data.nakshatra_details.soorya_rasi?.name || 'N/A'],
        ];
        autoTable(doc, {
            startY: finalY,
            body: details,
            theme: 'striped',
            headStyles: { fillColor: [147, 51, 234] }
        });
    }
};

const generateMatchingPDF = (doc, data, startY) => {
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    const score = data.total?.points || 0;
    const color = score > 18 ? [16, 185, 129] : [239, 68, 68];
    doc.setTextColor(...color);
    doc.text(`Total Score: ${score} / 36`, 14, startY);

    if (data.description) {
        doc.setFontSize(10);
        doc.setTextColor(0);
        const splitText = doc.splitTextToSize(data.description, 180);
        doc.text(splitText, 14, startY + 10);
        startY += (splitText.length * 5);
    }
    startY += 25;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Guna Milan Details', 14, startY);
    startY += 10;

    const kutaRows = [];
    if (data.kutas) {
        Object.keys(data.kutas).forEach(key => {
            const kuta = data.kutas[key];
            kutaRows.push([
                key.charAt(0).toUpperCase() + key.slice(1),
                kuta.obtained_points,
                kuta.maximum_points,
                kuta.description || ''
            ]);
        });
    }
    autoTable(doc, {
        startY: startY,
        head: [['Guna/Kuta', 'Obtained', 'Max', 'Description']],
        body: kutaRows,
        theme: 'grid',
        headStyles: { fillColor: [147, 51, 234] }
    });
};

const generateDashaPDF = (doc, data, startY) => {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Vimshottari Dasha Periods', 14, startY);
    startY += 10;

    const rows = [];
    data.vimshottari_dasha?.forEach(d => {
        rows.push([d.lord + ' (Mahadasha)', new Date(d.start).toLocaleDateString(), new Date(d.end).toLocaleDateString()]);
        d.antardasha?.forEach(ad => {
            rows.push([`  - ${ad.lord}`, new Date(ad.start).toLocaleDateString(), new Date(ad.end).toLocaleDateString()]);
        });
    });
    autoTable(doc, {
        startY: startY,
        head: [['Lord', 'Start Date', 'End Date']],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [147, 51, 234] }
    });
};

const generateSadesatiPDF = (doc, data, startY) => {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Sade Sati Status', 14, startY);
    startY += 10;
    const isSadesati = data.sade_sati_status;
    doc.setFontSize(12);
    doc.text(`Active: ${isSadesati ? 'Yes' : 'No'}`, 14, startY);
    startY += 10;
    if (data.description) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const splitText = doc.splitTextToSize(data.description, 180);
        doc.text(splitText, 14, startY);
        startY += (splitText.length * 5) + 10;
    }
    if (data.transit_phase) {
        doc.setFont(undefined, 'bold');
        doc.text('Current Phase:', 14, startY);
        startY += 7;
        doc.setFont(undefined, 'normal');
        doc.text(data.transit_phase.description || 'N/A', 14, startY);
    }
};

const generateExhaustivePDF = (doc, data, startY) => {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    let cursorY = startY;

    const checkPageBreak = (requiredSpace = 15) => {
        if (cursorY > pageHeight - requiredSpace) {
            doc.addPage();
            cursorY = 20;
            return true;
        }
        return false;
    };

    const formatPropertyName = (key) => {
        if (!key) return '';
        return key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const addSectionHeading = (text, level = 1) => {
        checkPageBreak(level === 1 ? 25 : 15);
        if (level === 1) {
            doc.setFillColor(147, 51, 234);
            doc.rect(10, cursorY - 5, pageWidth - 20, 10, 'F');
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(text, 14, cursorY + 2);
            doc.setTextColor(0, 0, 0);
            cursorY += 12;
        } else if (level === 2) {
            doc.setFillColor(243, 232, 255);
            doc.rect(10, cursorY - 5, pageWidth - 20, 8, 'F');
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(88, 28, 135);
            doc.text(text, 14, cursorY + 1);
            doc.setTextColor(0, 0, 0);
            cursorY += 10;
        } else {
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(100, 100, 100);
            doc.text(text, 14, cursorY);
            doc.setTextColor(0, 0, 0);
            cursorY += 7;
        }
    };

    const addKeyValue = (key, value, indent = 0) => {
        const actualIndent = Math.min(indent, 40);
        checkPageBreak(8);
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text(key + ':', 14 + actualIndent, cursorY);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        const valueStr = String(value);
        const maxWidth = pageWidth - (30 + actualIndent + 35);
        const lines = doc.splitTextToSize(valueStr, maxWidth);
        doc.text(lines, 14 + actualIndent + 35, cursorY);
        cursorY += Math.max(lines.length * 4.5, 6);
    };

    const renderDataRecursive = (obj, parentKey = '', level = 1, indent = 0) => {
        if (obj === null || obj === undefined) {
            if (parentKey) addKeyValue(formatPropertyName(parentKey), 'N/A', indent);
            return;
        }
        if (typeof obj !== 'object') {
            if (parentKey) addKeyValue(formatPropertyName(parentKey), obj, indent);
            return;
        }
        if (Array.isArray(obj)) {
            if (obj.length === 0) {
                if (parentKey) addKeyValue(formatPropertyName(parentKey), '[Empty List]', indent);
                return;
            }
            const firstItem = obj[0];
            const isListOfSimpleObjects = typeof firstItem === 'object' && firstItem !== null && Object.values(firstItem).every(v => typeof v !== 'object' || v === null);
            const keys = isListOfSimpleObjects ? Object.keys(firstItem) : [];

            if (isListOfSimpleObjects && keys.length > 0 && keys.length <= 6) {
                if (parentKey) addSectionHeading(formatPropertyName(parentKey), level + 1);
                checkPageBreak(20);
                const tableData = obj.map(item => keys.map(k => String(item[k] || '')));
                autoTable(doc, {
                    startY: cursorY,
                    head: [keys.map(formatPropertyName)],
                    body: tableData,
                    theme: 'striped',
                    headStyles: { fillColor: [147, 51, 234], fontSize: 8 },
                    bodyStyles: { fontSize: 7.5 },
                    margin: { left: 14 + indent },
                    tableWidth: 'auto'
                });
                cursorY = doc.lastAutoTable.finalY + 8;
            } else {
                if (parentKey) addSectionHeading(formatPropertyName(parentKey), level + 1);
                obj.forEach((item, index) => {
                    if (typeof item === 'object' && item !== null) {
                        addSectionHeading(`Entry ${index + 1}`, level + 2);
                        renderDataRecursive(item, '', level + 2, indent + 5);
                    } else {
                        addKeyValue(`Item ${index + 1}`, item, indent + 5);
                    }
                });
            }
            return;
        }
        if (parentKey) addSectionHeading(formatPropertyName(parentKey), level + 1);
        const entries = Object.entries(obj);
        entries.forEach(([key, val]) => {
            if (typeof val === 'object' && val !== null) {
                renderDataRecursive(val, key, level + 1, indent + 5);
            } else {
                addKeyValue(formatPropertyName(key), val, indent + 5);
            }
        });
    };

    renderDataRecursive(data, '', 0, 0);
};
