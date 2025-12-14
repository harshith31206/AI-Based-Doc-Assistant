const fs = require('fs');
// Let's use standard http or fetch if node 18+
// Node version seen in logs was v22.21.0, so global fetch is available.

const API = 'http://127.0.0.1:5000';
const FILE_PATH = String.raw`c:\Users\kolag\Desktop\ps_ui\backend\node_modules\pdf-parse\test\data\01-valid.pdf`;

async function run() {
    try {
        const username = 'test_' + Date.now();
        const password = 'password';

        // 1. Signup
        console.log('1. Signing up...');
        let res = await fetch(`${API}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email: `${username}@test.com`, password })
        });
        let data = await res.json();
        if (!res.ok) throw new Error(data.message);
        console.log('   Signup success');

        // 2. Login
        console.log('2. Logging in...');
        res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message);
        const token = data.token;
        console.log('   Login success');

        // 3. Upload
        console.log('3. Uploading file...');
        const fileBuffer = fs.readFileSync(FILE_PATH);
        const blob = new Blob([fileBuffer], { type: 'application/pdf' });
        const formData = new FormData();
        formData.append('file', blob, 'test.pdf');

        // Node's fetch with FormData is tricky without 'form-data' package if using raw Blob?
        // Actually Node 22 has native FormData.

        res = await fetch(`${API}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message);
        const fileId = data.id;
        console.log('   Upload success, File ID:', fileId);
        console.log('   Status:', data.status);

        // Poll for completion
        let attempts = 0;
        while (attempts < 20) {
            const statusRes = await fetch(`${API}/my-uploads`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statusData = await statusRes.json();
            const doc = statusData.uploads.find(d => d._id === fileId);

            if (doc && doc.status === 'completed') {
                console.log('   Processing Completed!');
                break;
            } else if (doc && doc.status === 'failed') {
                throw new Error('Processing failed');
            }

            console.log(`   Waiting for processing... (${doc ? doc.status : 'unknown'})`);
            await new Promise(r => setTimeout(r, 1000));
            attempts++;
        }

        // 4. Chat
        console.log('4. Chatting...');
        res = await fetch(`${API}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ question: 'Summarize the main points of the document in a concise but comprehensive way.', fileId })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message);
        console.log('   Chat Response:', data.answer);
        console.log('--- VERIFICATION SUCCESS ---');

    } catch (err) {
        console.error('FAILED:', err.message);
        if (err.cause) console.error(err.cause);
    }
}

run();
