const axios = require('axios');
const { io } = require('socket.io-client');

const API_URL = 'http://localhost:3000/api/auth';
const SOCKET_URL = 'http://localhost:3000';

async function verifyBackend() {
    console.log("1. Testing Registration...");
    const username = `testuser_${Date.now()}`;
    const password = 'password123';
    let token;

    try {
        const regRes = await axios.post(`${API_URL}/register`, { username, password });
        if (regRes.status === 201 && regRes.data.token) {
            console.log("   ✅ Registration successful.");
            token = regRes.data.token;
        } else {
            console.error("   ❌ Registration failed:", regRes.data);
            return;
        }
    } catch (e) {
        console.error("   ❌ Registration error:", e.message);
        return;
    }

    console.log("2. Testing Login...");
    try {
        const loginRes = await axios.post(`${API_URL}/login`, { username, password });
        if (loginRes.status === 200 && loginRes.data.token) {
            console.log("   ✅ Login successful.");
        } else {
            console.error("   ❌ Login failed.");
        }
    } catch (e) {
        console.error("   ❌ Login error:", e.message);
    }

    console.log("3. Testing Socket Connection with Token...");
    const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket']
    });

    socket.on('connect', () => {
        console.log("   ✅ Socket connected successfully.");
        socket.disconnect();
        console.log("Verification Complete!");
    });

    socket.on('connect_error', (err) => {
        console.error("   ❌ Socket connection failed:", err.message);
    });
}

verifyBackend();
