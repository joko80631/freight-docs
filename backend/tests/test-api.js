import fetch from 'node-fetch';

const BASE_URL = 'https://freight-docs.onrender.com';

async function testHealthCheck() {
  try {
    console.log('Testing health check endpoint...');
    const response = await fetch(`${BASE_URL}/healthz`);
    const data = await response.json();
    console.log('Health check response:', JSON.stringify(data, null, 2));
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

async function testLoadsEndpoint() {
  try {
    console.log('\nTesting loads endpoint (should return 401 Unauthorized)...');
    const response = await fetch(`${BASE_URL}/api/loads`);
    const data = await response.json();
    console.log('Loads endpoint response:', JSON.stringify(data, null, 2));
    return response.status === 401; // We expect a 401 for unauthorized access
  } catch (error) {
    console.error('Loads endpoint failed:', error);
    return false;
  }
}

async function testCreateLoad() {
  try {
    console.log('\nTesting create load endpoint (should return 401 Unauthorized)...');
    const loadData = {
      load_number: 'TEST-001',
      carrier_name: 'Test Carrier',
      delivery_date: new Date().toISOString(),
      broker_name: 'Test Broker',
      origin: 'Test Origin',
      destination: 'Test Destination'
    };
    
    const response = await fetch(`${BASE_URL}/api/loads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth, but we want to see the response
      },
      body: JSON.stringify(loadData)
    });
    
    const data = await response.json();
    console.log('Create load response:', JSON.stringify(data, null, 2));
    return response.status === 401; // We expect a 401 for unauthorized access
  } catch (error) {
    console.error('Create load failed:', error);
    return false;
  }
}

async function testDocumentsEndpoint() {
  try {
    console.log('\nTesting documents endpoint (should return 401 Unauthorized)...');
    const response = await fetch(`${BASE_URL}/api/documents`);
    const data = await response.json();
    console.log('Documents endpoint response:', JSON.stringify(data, null, 2));
    return response.status === 401; // We expect a 401 for unauthorized access
  } catch (error) {
    console.error('Documents endpoint failed:', error);
    return false;
  }
}

async function runTests() {
  console.log('Starting API tests...\n');
  
  const healthCheckPassed = await testHealthCheck();
  console.log(`Health check ${healthCheckPassed ? 'passed' : 'failed'}`);
  
  const loadsEndpointPassed = await testLoadsEndpoint();
  console.log(`Loads endpoint ${loadsEndpointPassed ? 'passed' : 'failed'}`);
  
  const createLoadPassed = await testCreateLoad();
  console.log(`Create load ${createLoadPassed ? 'passed' : 'failed'}`);
  
  const documentsEndpointPassed = await testDocumentsEndpoint();
  console.log(`Documents endpoint ${documentsEndpointPassed ? 'passed' : 'failed'}`);
}

runTests(); 