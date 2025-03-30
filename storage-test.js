const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();  // Load environment variables

// Get Supabase credentials from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Helper function for console output
const log = {
    step: (msg) => console.log('\n📋', msg),
    success: (msg) => console.log('✅', msg),
    error: (msg, error) => console.error('❌', msg, '\n   Error:', error?.message || error),
    info: (msg) => console.log('ℹ️ ', msg)
};

// Validate environment variables
log.step('Checking environment variables...');
if (!SUPABASE_URL || !SUPABASE_KEY) {
    log.error('Missing Supabase credentials in environment variables');
    process.exit(1);
}
log.info(`SUPABASE_URL: ${SUPABASE_URL}`);
log.info(`SUPABASE_KEY: ${SUPABASE_KEY.substring(0, 10)}...`);
log.success('Environment variables found');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test configuration
const TEST_USER_ID = 'test-user-123';
const TEST_FILE_NAME = 'test-file.txt';
const TEST_FILE_PATH = path.join(__dirname, TEST_FILE_NAME);
const STORAGE_PATH = `${TEST_USER_ID}/${TEST_FILE_NAME}`;

async function testNetworkConnectivity() {
    log.step('Testing network connectivity...');
    
    const sites = [
        'app.supabase.com',
        new URL(SUPABASE_URL).hostname
    ];

    for (const site of sites) {
        await new Promise((resolve) => {
            log.info(`Testing connection to ${site}...`);
            https.get(`https://${site}`, (res) => {
                log.success(`Connection to ${site} successful (status: ${res.statusCode})`);
                resolve(true);
            }).on('error', (err) => {
                log.error(`Connection to ${site} failed`, err);
                resolve(false);
            });
        });
        // Add a small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

async function runStorageTests() {
    try {
        // Test network connectivity first
        await testNetworkConnectivity();
        
        // Add a small delay before starting Supabase operations
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create a test file
        log.step('Setting up test file...');
        fs.writeFileSync(TEST_FILE_PATH, 'This is a test file for Supabase storage verification.');
        log.success('Test file created successfully');

        // Verify Supabase connection
        log.step('Verifying Supabase connection...');
        try {
            const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
            
            if (bucketsError) {
                throw bucketsError;
            }
            
            log.success(`Found ${buckets.length} buckets`);
            log.info(`Bucket names: ${buckets.map(b => b.name).join(', ')}`);
            
            // Check for documents bucket
            const documentsBucket = buckets.find(bucket => bucket.name === 'documents');
            if (!documentsBucket) {
                throw new Error('"documents" bucket not found');
            }
            log.success('"documents" bucket exists');

            // Add delay before file operations
            await new Promise(resolve => setTimeout(resolve, 500));

            // Try to upload a file
            log.step('Testing file upload...');
            const fileContent = fs.readFileSync(TEST_FILE_PATH);
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('documents')
                .upload(STORAGE_PATH, fileContent, {
                    contentType: 'text/plain',
                    upsert: true
                });

            if (uploadError) {
                throw uploadError;
            }
            log.success(`File uploaded successfully to ${uploadData.path}`);

            // Add delay before download
            await new Promise(resolve => setTimeout(resolve, 500));

            // Try to download the file
            log.step('Testing file download...');
            const { data: downloadData, error: downloadError } = await supabase.storage
                .from('documents')
                .download(STORAGE_PATH);

            if (downloadError) {
                throw downloadError;
            }
            log.success('File downloaded successfully');

            // Add delay before deletion
            await new Promise(resolve => setTimeout(resolve, 500));

            // Clean up the uploaded file
            log.step('Cleaning up test file from storage...');
            const { error: deleteError } = await supabase.storage
                .from('documents')
                .remove([STORAGE_PATH]);

            if (deleteError) {
                throw deleteError;
            }
            log.success('Test file deleted from storage');

        } catch (supabaseError) {
            throw new Error(`Supabase operation failed: ${supabaseError.message || supabaseError}`);
        }

        log.success('All storage tests completed successfully! 🎉');
        
    } catch (error) {
        log.error('Test failed', error);
        process.exit(1);
    } finally {
        // Clean up local test file
        if (fs.existsSync(TEST_FILE_PATH)) {
            fs.unlinkSync(TEST_FILE_PATH);
            log.info('Local test file cleaned up');
        }
    }
}

// Run the tests
log.step('Starting Supabase Storage Tests...');
runStorageTests(); 