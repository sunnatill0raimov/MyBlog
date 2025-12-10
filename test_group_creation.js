import fetch from 'node-fetch';

// Test script to verify group creation functionality
const testGroupCreation = async () => {
    console.log('Testing group creation functionality...');

    try {
        // Test 1: Create a group
        console.log('\\n1. Testing group creation...');
        const createResponse = await fetch('http://localhost:3003/api/chat/group', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token' // This will fail auth, but we're testing the endpoint
            },
            body: JSON.stringify({
                name: 'Test Group'
            })
        });

        console.log('Create group response status:', createResponse.status);
        const createData = await createResponse.json().catch(() => ({}));
        console.log('Create group response:', createData);

        // Test 2: Search for groups
        console.log('\\n2. Testing group search...');
        const searchResponse = await fetch('http://localhost:3003/api/chat/search?search=test', {
            headers: {
                'Authorization': 'Bearer test-token'
            }
        });

        console.log('Search groups response status:', searchResponse.status);
        const searchData = await searchResponse.json().catch(() => ({}));
        console.log('Search groups response:', searchData);

        console.log('\\nTest completed. Check the console output for any errors.');

    } catch (error) {
        console.error('Test error:', error.message);
    }
};

// Run the test
testGroupCreation();
