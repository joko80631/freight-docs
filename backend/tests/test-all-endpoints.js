import fetch from 'node-fetch';

// Test health check endpoint
async function testHealthCheck() {
  try {
    console.log('\nTesting health check endpoint...');
    const response = await fetch('https://freight-docs.onrender.com/healthz');
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('Health check response:', JSON.stringify(data, null, 2));
    return response.status === 200;
  } catch (error) {
    console.error('Health check error:', error);
    return false;
  }
}

// Test documents endpoint
async function testDocuments() {
  try {
    console.log('\nTesting documents endpoint...');
    const response = await fetch('https://freight-docs.onrender.com/api/documents');
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    const data = await response.json();
    console.log('Documents response:', JSON.stringify(data, null, 2));
    return response.status === 401 && response.headers.get('content-type').includes('application/json');
  } catch (error) {
    console.error('Documents error:', error);
    return false;
  }
}

// Test loads endpoint
async function testLoads() {
  try {
    console.log('\nTesting loads endpoint...');
    const response = await fetch('https://freight-docs.onrender.com/api/loads');
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    const data = await response.json();
    console.log('Loads response:', JSON.stringify(data, null, 2));
    return response.status === 401 && response.headers.get('content-type').includes('application/json');
  } catch (error) {
    console.error('Loads error:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const healthCheckPassed = await testHealthCheck();
  const documentsPassed = await testDocuments();
  const loadsPassed = await testLoads();

  console.log('\nTest Results:');
  console.log('Health Check:', healthCheckPassed ? 'PASSED' : 'FAILED');
  console.log('Documents Endpoint:', documentsPassed ? 'PASSED' : 'FAILED');
  console.log('Loads Endpoint:', loadsPassed ? 'PASSED' : 'FAILED');
}

runAllTests(); 