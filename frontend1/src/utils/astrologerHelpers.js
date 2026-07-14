// Enhanced AIAstrologer with VedAstro Features
// This file contains helper functions and components for the AIAstrologer page

// Month names for dropdown
export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Countries list (top countries)
export const COUNTRIES = [
    'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
    'Singapore', 'Malaysia', 'UAE', 'Saudi Arabia', 'Nepal',
    'Sri Lanka', 'Pakistan', 'Bangladesh', 'South Africa', 'Other'
];

// Generate hour options (1-12)
export const generateHours = () => {
    return Array.from({ length: 12 }, (_, i) => {
        const hour = i + 1;
        return hour.toString().padStart(2, '0');
    });
};

// Generate minute options (00-59)
export const generateMinutes = () => {
    return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
};

// Generate day options (1-31)
export const generateDays = () => {
    return Array.from({ length: 31 }, (_, i) => (i + 1).toString());
};

// Generate year options (1900-current year)
export const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
        years.push(year.toString());
    }
    return years;
};

// Convert birth details from multi-step format to standard format
export const convertBirthDetails = (data) => {
    const { hour, minute, ampm, day, month, year, country, pob } = data;

    // Convert to 24-hour format
    let hour24 = parseInt(hour);
    if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
    if (ampm === 'AM' && hour24 === 12) hour24 = 0;

    // Format date as YYYY-MM-DD
    const monthIndex = MONTHS.indexOf(month) + 1;
    const dob = `${year}-${monthIndex.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;

    // Format time as HH:MM
    const tob = `${hour24.toString().padStart(2, '0')}:${minute}`;

    return {
        dob,
        tob,
        pob: pob || country
    };
};

// Action button configurations
export const ACTION_BUTTONS = [
    { id: 'why', label: 'Why? 🤔', prompt: 'Why is that? Please explain in detail.' },
    { id: 'summarize', label: 'Summarize', prompt: 'Can you summarize this in a few key points?' },
    { id: 'more', label: 'Tell me more', prompt: 'Please tell me more about this.' },
    { id: 'remedy', label: 'Remedies? 🙏', prompt: 'What remedies do you suggest for this?' }
];

// Color coding for response text
export const applyColorCoding = (text) => {
    if (!text) return text;

    // Apply color coding for specific keywords
    let coloredText = text;

    // Positive traits - green
    const positiveWords = ['virtuous', 'respected', 'success', 'fortunate', 'blessed', 'lucky', 'good', 'excellent', 'favorable'];
    positiveWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        coloredText = coloredText.replace(regex, `<span class="text-green-400 font-semibold">${word}</span>`);
    });

    // Wealth/prosperity - gold
    const wealthWords = ['wealth', 'money', 'prosperity', 'rich', 'fortune', 'abundance'];
    wealthWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        coloredText = coloredText.replace(regex, `<span class="text-yellow-400 font-semibold">${word}</span>`);
    });

    // Challenges - orange
    const challengeWords = ['challenge', 'difficult', 'obstacle', 'struggle', 'caution'];
    challengeWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        coloredText = coloredText.replace(regex, `<span class="text-orange-400 font-semibold">${word}</span>`);
    });

    return coloredText;
};
