import fetch from 'node-fetch';

// Test the documents endpoint
async function testDocumentsEndpoint() {
  try {
    console.log('Testing documents endpoint...');
    const response = await fetch('https://freight-docs.onrender.com/api/documents');
    const contentType = response.headers.get('content-type');
    
    console.log('Status:', response.status);
    console.log('Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response (JSON):', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('Response (non-JSON):', text.substring(0, 300) + '...');
    }
    
    return response.status === 401 && contentType && contentType.includes('application/json');
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Run the test
testDocumentsEndpoint().then(passed => {
  console.log(`Test ${passed ? 'PASSED' : 'FAILED'}`);
}); 