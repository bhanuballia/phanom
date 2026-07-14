const express = require('express');
const axios = require('axios');
const router = express.Router();

// NOTE: Using OpenStreetMap (Nominatim) and TimeAPI.io (Free)
// In production, consider caching these results (Redis or MongoDB) to avoid rate limits

router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 3) {
            return res.status(400).json({ message: 'Query must be at least 3 characters' });
        }

        // 1. Search Place (Nominatim)
        // User-Agent is required by Nominatim policy
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
        const placeResponse = await axios.get(nominatimUrl, {
            headers: {
                'User-Agent': 'VedAstro-App/1.0 (contact@vedastro.com)' // Replace with real contact info
            }
        });

        if (!placeResponse.data || placeResponse.data.length === 0) {
            return res.json({ results: [] });
        }

        // 2. Fetch Timezone for each result (Parallelly, but be careful with rate limits)
        // For efficiency, we will fetch timezone ONLY for the top result or do it lazily
        // But the requirement is "automatically detects ... timezone". 
        // Let's attach timezone to the results. To be safe with free APIs, let's just do it for the FIRST result
        // Or better: The Frontend will select a place, AND THEN we might need another call to get timezone?
        // Actually, let's keep it simple: Return places with Lat/Lon.
        // Frontend user clicks a place -> We already have Lat/Lon in the object.
        // Then we can assume the timezone or fetch it.
        // WAITING: The user said "detects ... timezone". 
        // Let's adding a `timezone` lookup to this endpoint might make it slow if we do it for all 5 suggestions.
        // STRATEGY: 
        // Return suggestions with Lat/Lon.
        // Add a NEW endpoint `/timezone?lat=x&lon=y` which the frontend calls immediately after selection.

        // However, I will map the Nominatim results to a cleaner format
        const results = placeResponse.data.map(item => ({
            display_name: item.display_name,
            place_name: item.name || item.display_name.split(',')[0],
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            country: item.address?.country,
            state: item.address?.state,
            city: item.address?.city || item.address?.town || item.address?.village
        }));

        res.json({ results });

    } catch (error) {
        console.error('Geo Search Error:', error.message);
        res.status(500).json({ message: 'Failed to search places' });
    }
});

router.get('/timezone', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ message: 'Latitude and Longitude required' });
        }

        // Using TimeAPI.io (Free, no key)
        const timeUrl = `https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lon}`;

        try {
            const timeResponse = await axios.get(timeUrl);
            // Response format: { timeZone: "Asia/Kolkata", currentLocalTime: "..." }
            res.json({
                timezone: timeResponse.data.timeZone,
                offset: timeResponse.data.currentUtcOffset
            });
        } catch (apiError) {
            // Fallback: Use a library if API fails? 
            // Ideally we'd use 'geo-tz' library but that requires large data files.
            // Let's try a backup API or just fail gracefully.
            console.error('TimeAPI Error:', apiError.message);
            // Backup: OpenMeteo (also free)
            // https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&timezone=auto&daily=sunrise
            // Actually OpenMeteo returns the timezone string in the header or config? No.

            res.status(503).json({ message: 'Could not determine timezone' });
        }

    } catch (error) {
        console.error('Timezone Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
