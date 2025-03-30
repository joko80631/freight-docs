const supabase = require('./supabase');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_USER_ID = 'test-user-123';
const TEST_FILE_NAME = 'test-file.txt';
const TEST_FILE_PATH = path.join(__dirname, TEST_FILE_NAME);
const STORAGE_PATH = `${TEST_USER_ID}/${TEST_FILE_NAME}`;

// Helper function to format console output
const log = {
    step: (msg) => console.log('\n📋', msg),
    success: (msg) => console.log('✅', msg),
    error: (msg, error) => console.error('❌', msg, '\n   Error:', error?.message || error),
    info: (msg) => console.log('ℹ️ ', msg)
};

async function runStorageTests() {
    try {
        // Create a test file
        log.step('Setting up test file...');
        fs.writeFileSync(TEST_FILE_PATH, 'This is a test file for Supabase storage verification.');
        log.success('Test file created successfully');

        // Check if Supabase client is initialized
        log.step('Checking Supabase client...');
        if (!supabase?.storage) {
            throw new Error('Supabase client or storage is not properly initialized');
        }
        log.success('Supabase client is properly initialized');

        // List buckets and check for documents bucket
        log.step('Checking for "documents" bucket...');
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        if (bucketsError) throw bucketsError;
        
        const documentsBucket = buckets.find(bucket => bucket.name === 'documents');
        if (!documentsBucket) {
            throw new Error('"documents" bucket not found');
        }
        log.success('"documents" bucket exists');
        log.info(`Found ${buckets.length} total buckets`);

        // Upload test file
        log.step('Uploading test file...');
        const fileContent = fs.readFileSync(TEST_FILE_PATH);
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(STORAGE_PATH, fileContent, {
                contentType: 'text/plain',
                upsert: true
            });
        
        if (uploadError) throw uploadError;
        log.success(`File uploaded successfully to ${uploadData.path}`);

        // Download and verify file
        log.step('Downloading file to verify...');
        const { data: downloadData, error: downloadError } = await supabase.storage
            .from('documents')
            .download(STORAGE_PATH);
        
        if (downloadError) throw downloadError;
        
        const downloadedText = await downloadData.text();
        if (downloadedText !== 'This is a test file for Supabase storage verification.') {
            throw new Error('Downloaded file content does not match original');
        }
        log.success('File downloaded and content verified');

        // Clean up - delete the file from storage
        log.step('Cleaning up - deleting test file...');
        const { error: deleteError } = await supabase.storage
            .from('documents')
            .remove([STORAGE_PATH]);
        
        if (deleteError) throw deleteError;
        log.success('Test file deleted from storage');

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

    log.success('All storage tests completed successfully! 🎉');
}

// Run the tests
log.step('Starting Supabase Storage Tests...');
runStorageTests(); 