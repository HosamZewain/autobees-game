const axios = require('axios');

async function verifyAdmin() {
    try {
        const res = await axios.get('http://localhost:3000/api/admin/stats');
        console.log("Admin Stats Status:", res.status);
        console.log("Stats Data:", res.data);
    } catch (e) {
        console.error("Admin Verify Failed:", e.message);
    }
}

verifyAdmin();
