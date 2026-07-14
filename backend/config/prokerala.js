const axios = require('axios');
require('dotenv').config();

let accessToken = null;
let tokenExpiry = null;

const getProkeralaToken = async () => {
    // If token exists and is not expired (with 1 min buffer), return it
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
        return accessToken;
    }

    try {
        const client_id = process.env.PROKERALA_CLIENT_ID;
        const client_secret = process.env.PROKERALA_CLIENT_SECRET;

        if (!client_id || !client_secret) {
            throw new Error('PROKERALA_CLIENT_ID or PROKERALA_CLIENT_SECRET is missing in .env');
        }

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', client_id);
        params.append('client_secret', client_secret);

        const response = await axios.post('https://api.prokerala.com/token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        accessToken = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in * 1000);
        return accessToken;
    } catch (error) {
        const errorData = error.response?.data;
        console.error('Error fetching Prokerala token:', errorData || error.message);
        throw new Error(`Failed to authenticate with Prokerala API: ${JSON.stringify(errorData) || error.message}`);
    }
};

const prokeralaRequest = async (endpoint, dataOrParams, method = 'GET') => {
    try {
        const token = await getProkeralaToken();

        const config = {
            method,
            url: `https://api.prokerala.com/v2${endpoint}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        };

        if (method === 'GET') {
            config.params = {
                ayanamsa: 1,
                ...dataOrParams
            };
        } else {
            config.data = dataOrParams;
        }

        const response = await axios(config);
        return response; // Return full response object to access headers/status if needed
    } catch (error) {
        const errorData = error.response?.data;
        console.error(`Prokerala API Error (${endpoint}):`, errorData || error.message);
        throw error;
    }
};

module.exports = { prokeralaRequest };
