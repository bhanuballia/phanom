const https = require('https');

const data = JSON.stringify({
    name: 'Hony Singh Khare',
    email: 'hony@astroconsult.com',
    password: 'password123',
    phone: '9876543210',
    dateOfBirth: '1990-01-01',
    timeOfBirth: '12:00',
    placeOfBirth: 'Delhi, India',
    role: 'astrologer',
    specialization: 'Vedic',
    experience: 5,
    pricing: 100
});

const options = {
    hostname: 'astrology-backend-pink.vercel.app',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Testing Registration on:', `https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('BODY:', body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
