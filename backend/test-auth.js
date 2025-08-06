// Simple test script to verify auth endpoints
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

const testAuth = async () => {
  try {
    console.log('🧪 Testing Art Studio API...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);

    // Test registration
    console.log('\n2. Testing registration...');
    const testUser = {
      username: 'testuser' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ Registration successful:', registerData.message);
      console.log('   User ID:', registerData.user.id);
      console.log('   Username:', registerData.user.username);
      console.log('   Token received:', registerData.token ? 'Yes' : 'No');

      // Test login
      console.log('\n3. Testing login...');
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log('✅ Login successful:', loginData.message);
        console.log('   Token received:', loginData.token ? 'Yes' : 'No');
      } else {
        console.log('❌ Login failed:', loginData.message);
      }

    } else {
      console.log('❌ Registration failed:', registerData.message);
      console.log('   Error:', registerData.error || 'No additional error info');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n🔍 Possible issues:');
    console.log('   - Server not running (npm run dev in backend folder)');
    console.log('   - MongoDB not connected');
    console.log('   - Environment variables not set');
    console.log('   - CORS configuration issues');
  }
};

testAuth();