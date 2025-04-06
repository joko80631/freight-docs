import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runTest(testFile) {
  return new Promise((resolve, reject) => {
    console.log(`\nRunning ${testFile}...\n`);
    
    const test = spawn('node', [join(__dirname, 'integration', testFile)], {
      stdio: 'inherit'
    });

    test.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Test failed with code ${code}`));
      }
    });

    test.on('error', (err) => {
      reject(err);
    });
  });
}

async function runAllTests() {
  try {
    // Run auth test
    await runTest('auth.test.js');
    
    // Run document upload test
    await runTest('documents.test.js');
    
    console.log('\n✨ All integration tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Integration tests failed:', error.message);
    process.exit(1);
  }
}

runAllTests(); 