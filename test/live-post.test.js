const http = require('http');
const assert = require('assert');
const CompleteAutomationSystem = require('../index.js');

// Mock config for the test
const testConfig = {
  "githubToken": "ghp_TEST_TOKEN_12345",
  "usdtWallet": "0xTEST_WALLET_ADDRESS",
  "usdtNetwork": "BEP20",
  "dryRun": false // We need to be in "live" mode to test the posting function
};

console.log('Starting mock server test for posting comments...');

const server = http.createServer((req, res) => {
    console.log('Mock server received a request.');
    assert.strictEqual(req.method, 'POST', 'Request method should be POST');

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        console.log('--- Mock Server Verification ---');
        console.log('Received Headers:', req.headers);
        console.log('Received Body:', body);

        // Verify the authorization header and body content
        assert.strictEqual(req.headers['authorization'], `token ${testConfig.githubToken}`, 'Authorization header is incorrect or missing.');
        const parsedBody = JSON.parse(body);
        assert.strictEqual(parsedBody.body, 'This is a test comment.', 'Comment body does not match expected content.');

        console.log('✔ All assertions passed!');

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Comment created successfully' }));

        server.close(() => { console.log('Mock server closed.'); });
    });
});

server.listen(8080, async () => {
    console.log('Mock server listening on port 8080.');

    try {
        // We instantiate the system with our test config
        const system = new CompleteAutomationSystem(testConfig);
        const testUrl = 'http://localhost:8080/comments';
        const testBody = 'This is a test comment.';

        console.log('Attempting to post comment to mock server...');
        await system.postCommentToGithub(testUrl, testBody);
    } catch (error) {
        console.error('Test failed with an error:', error);
        server.close();
        process.exit(1);
    }
});
