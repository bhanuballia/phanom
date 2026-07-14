/**
 * SIP Configuration Tester
 * Tests multiple WebSocket URLs to find the correct Mizu VoIP endpoint
 */

export const testWebSocketConnections = async (username, password, domain) => {
    const possibleUrls = [
        `wss://${domain}/ws`,
        `wss://${domain}`,
        `wss://${domain}:443`,
        `wss://${domain}:443/ws`,
        `wss://${domain}:8089`,
        `wss://${domain}:8089/ws`,
        `wss://${domain}:10081`,
        `wss://${domain}:5061`,
        `ws://${domain}:5060`,
    ];

    console.log('[SIP Tester] Testing WebSocket connections...');

    const results = [];

    for (const url of possibleUrls) {
        console.log(`[SIP Tester] Trying: ${url}`);

        try {
            const result = await testSingleConnection(url);
            results.push({ url, success: true, result });
            console.log(`[SIP Tester] ✓ ${url} - Connection successful!`);
            // Return first successful connection
            return { success: true, url, result };
        } catch (error) {
            results.push({ url, success: false, error: error.message });
            console.log(`[SIP Tester] ✗ ${url} - Failed: ${error.message}`);
        }
    }

    console.log('[SIP Tester] All connection attempts failed');
    return { success: false, results };
};

const testSingleConnection = (url) => {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(url);
        const timeout = setTimeout(() => {
            ws.close();
            reject(new Error('Connection timeout'));
        }, 5000);

        ws.onopen = () => {
            clearTimeout(timeout);
            ws.close();
            resolve('Connected');
        };

        ws.onerror = (error) => {
            clearTimeout(timeout);
            reject(new Error('Connection failed'));
        };

        ws.onclose = (event) => {
            clearTimeout(timeout);
            if (event.code === 1006) {
                reject(new Error(`Abnormal closure (code: ${event.code})`));
            }
        };
    });
};

/**
 * Get recommended WebSocket URL based on Mizu VoIP best practices
 */
export const getRecommendedWebSocketUrl = (domain) => {
    // According to Mizu VoIP documentation, the most common configurations are:
    // 1. wss://domain/ws (most common for WebRTC)
    // 2. wss://domain (simple configuration)
    // 3. wss://domain:8089 (alternative WebRTC port)

    return `wss://${domain}/ws`;
};
