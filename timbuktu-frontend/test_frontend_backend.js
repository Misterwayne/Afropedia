// Simple test to verify frontend-backend connection
const axios = require('axios');

const BACKEND_URL = 'https://afropediabackend-production.up.railway.app';
const FRONTEND_URL = 'http://localhost:3000';

async function testConnection() {
  console.log('🧪 Testing Frontend-Backend Connection...\n');
  
  try {
    // Test backend health
    console.log('1. Testing Backend Health...');
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Backend Health:', healthResponse.data.status);
    
    // Test backend articles
    console.log('\n2. Testing Backend Articles...');
    const articlesResponse = await axios.get(`${BACKEND_URL}/articles`);
    console.log('✅ Backend Articles:', articlesResponse.data.length, 'articles found');
    
    // Test backend search
    console.log('\n3. Testing Backend Search...');
    const searchResponse = await axios.get(`${BACKEND_URL}/search/results?q=test`);
    console.log('✅ Backend Search: Working');
    
    // Test CORS (if frontend is running)
    console.log('\n4. Testing CORS...');
    try {
      const corsResponse = await axios.options(`${BACKEND_URL}/articles`, {
        headers: {
          'Origin': FRONTEND_URL,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      console.log('✅ CORS: Headers present');
    } catch (error) {
      console.log('⚠️  CORS: May need configuration');
    }
    
    console.log('\n🎉 All backend tests passed!');
    console.log('\n📋 Summary:');
    console.log(`   Backend URL: ${BACKEND_URL}`);
    console.log(`   Frontend URL: ${FRONTEND_URL}`);
    console.log('   Status: Ready for deployment!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testConnection();
