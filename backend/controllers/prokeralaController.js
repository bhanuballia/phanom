const { prokeralaRequest } = require('../config/prokerala');

/**
 * Prokerala API Controller
 * Provides astrological calculations via Prokerala API
 */

exports.getAdvancedKundli = async (req, res) => {
    try {
        const { datetime, coordinates } = req.query;
        if (!datetime || !coordinates) {
            return res.status(400).json({ message: 'Datetime and coordinates are required' });
        }

        const response = await prokeralaRequest('/astrology/kundli/advanced', {
            datetime,
            coordinates
        });
        res.json(response.data);
    } catch (error) {
        console.error('Advanced Kundli Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch Advanced Kundli',
            details: error.response?.data
        });
    }
};

exports.getChart = async (req, res) => {
    try {
        const { datetime, coordinates, chart_type, chart_style } = req.query;
        console.log('Generating Chart with params:', { datetime, coordinates, chart_type, chart_style });

        if (!datetime || !coordinates) {
            return res.status(400).json({ message: 'Datetime and coordinates are required' });
        }

        const response = await prokeralaRequest('/astrology/chart', {
            datetime,
            coordinates,
            chart_type: chart_type || 'rasi',
            chart_style: chart_style || 'north-indian'
        });
        console.log('Prokerala Chart Raw Response:', response); // Log exact data received

        if (!response || !response.data) {
            console.error('Prokerala returned no data for chart');
            return res.status(500).json({ message: 'No data received from astrology provider' });
        }

        console.log('Prokerala Chart Raw Response Type:', typeof response.data);
        // console.log('Content excerpt:', response.data ? response.data.toString().substring(0, 50) : 'null');

        // If response is a string (SVG), wrap it in an object for the frontend
        if (typeof response.data === 'string') {
            res.json({ svg: response.data });
        } else {
            // If it's already an object (maybe { data: "svg" } or similar), pass it
            // But check if it has 'svg' property expected by frontend, if not, try to adapt
            res.json(response.data);
        }
    } catch (error) {
        console.error('Chart Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch Chart',
            details: error.response?.data
        });
    }
};

exports.getAdvancedSadesati = async (req, res) => {
    try {
        const { datetime, coordinates } = req.query;
        if (!datetime || !coordinates) {
            return res.status(400).json({ message: 'Datetime and coordinates are required' });
        }

        const response = await prokeralaRequest('/astrology/sade-sati/advanced', {
            datetime,
            coordinates
        });
        res.json(response.data);
    } catch (error) {
        console.error('Advanced Sadesati Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch Advanced Sadesati report',
            details: error.response?.data
        });
    }
};

exports.getDashaPeriods = async (req, res) => {
    try {
        const { datetime, coordinates } = req.query;
        if (!datetime || !coordinates) {
            return res.status(400).json({ message: 'Datetime and coordinates are required' });
        }

        const response = await prokeralaRequest('/astrology/dasha-periods', {
            datetime,
            coordinates
        });
        res.json(response.data);
    } catch (error) {
        console.error('Dasha Periods Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch Dasha periods',
            details: error.response?.data
        });
    }
};

exports.getAdvancedMatching = async (req, res) => {
    try {
        const {
            girl_datetime, girl_coordinates,
            boy_datetime, boy_coordinates
        } = req.query;

        if (!girl_datetime || !girl_coordinates || !boy_datetime || !boy_coordinates) {
            return res.status(400).json({ message: 'Girl and Boy datetime/coordinates are required' });
        }

        const response = await prokeralaRequest('/astrology/nakshatra-porutham/advanced', {
            girl_datetime,
            girl_coordinates,
            boy_datetime,
            boy_coordinates
        });
        res.json(response.data);
    } catch (error) {
        console.error('Advanced Matching Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch Advanced Kundli Matching',
            details: error.response?.data
        });
    }
};
exports.getPersonalReport = async (req, res) => {
    try {
        const { datetime, coordinates, first_name, last_name, gender } = req.body;
        console.log('Generating Personal Report for:', { first_name, datetime, coordinates });

        if (!datetime || !coordinates || !first_name || !gender) {
            return res.status(400).json({ message: 'Required fields missing: datetime, coordinates, first_name, gender' });
        }

        // Fallback to /astrology/kundli as /report/personal seems to be invalid or premium-only
        // This endpoint provides the core personal horoscope data
        const response = await prokeralaRequest('/astrology/kundli', {
            datetime,
            coordinates,
            ayanamsa: 1,
            language: 'en'
        }, 'GET');

        res.json(response.data);
    } catch (error) {
        console.error('Personal Report Error Details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch Personal Reading Report',
            details: error.response?.data || error.message
        });
    }
};

exports.getKaalSarpDosha = async (req, res) => {
    try {
        const { datetime, coordinates } = req.query;
        if (!datetime || !coordinates) {
            return res.status(400).json({ message: 'Datetime and coordinates are required' });
        }

        const response = await prokeralaRequest('/astrology/kaal-sarp-dosha', {
            datetime,
            coordinates
        });
        res.json(response.data);
    } catch (error) {
        console.error('Kaal Sarp Dosha Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch Kaal Sarp Dosha report',
            details: error.response?.data
        });
    }
};

exports.getMangalDoshaAdvanced = async (req, res) => {
    try {
        const { datetime, coordinates } = req.query;
        if (!datetime || !coordinates) {
            return res.status(400).json({ message: 'Datetime and coordinates are required' });
        }

        const response = await prokeralaRequest('/astrology/mangal-dosha/advanced', {
            datetime,
            coordinates
        });
        res.json(response.data);
    } catch (error) {
        console.error('Advanced Mangal Dosha Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch Advanced Mangal Dosha report',
            details: error.response?.data
        });
    }
};

exports.getPlanetPosition = async (req, res) => {
    try {
        const { datetime, coordinates } = req.query;
        if (!datetime || !coordinates) {
            return res.status(400).json({ message: 'Datetime and coordinates are required' });
        }

        const response = await prokeralaRequest('/astrology/planet-position', {
            datetime,
            coordinates
        });
        res.json(response.data);
    } catch (error) {
        console.error('Planet Position Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch Planet Position report',
            details: error.response?.data
        });
    }
};

exports.getDailyPredictionAdvanced = async (req, res) => {
    try {
        const { datetime, coordinates, rasi } = req.query;
        if (!datetime || !rasi) {
            return res.status(400).json({ message: 'Datetime and rasi are required' });
        }

        const response = await prokeralaRequest('/horoscope/daily/advanced', {
            datetime,
            coordinates,
            rasi
        });
        res.json(response.data);
    } catch (error) {
        console.error('Daily Prediction Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch Daily Prediction report',
            details: error.response?.data
        });
    }
};

exports.getAdvancedPanchang = async (req, res) => {
    try {
        const { datetime, coordinates } = req.query;
        if (!datetime || !coordinates) {
            return res.status(400).json({ message: 'Datetime and coordinates are required' });
        }

        const response = await prokeralaRequest('/astrology/panchang/advanced', {
            datetime,
            coordinates
        });
        res.json(response.data);
    } catch (error) {
        console.error('Advanced Panchang Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch Advanced Panchang report',
            details: error.response?.data
        });
    }
};
