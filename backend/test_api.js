const axios = require('axios');
require('dotenv').config();

async function test() {
    const baseUrl = 'http://localhost:3000/api';
    try {
        // 1. Login to get token
        console.log("Logging in...");
        const loginRes = await axios.post(`${baseUrl}/auth/login`, {
            email: 'admin@admin.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log("Login successful, token retrieved.");

        // 2. Fetch suggestions
        const sugRes = await axios.get(`${baseUrl}/admin/suggestions`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('--- API RESPONSE (Suggestions) ---');
        console.log('Status:', sugRes.status);
        console.log('Count:', sugRes.data.length);
        console.log('Data:', JSON.stringify(sugRes.data, null, 2));

    } catch (err) {
        console.error('Test failed:', err.response ? err.response.data : err.message);
    }
}

test();
