const supabase = require('./supabase');
const fs = require('fs');
const path = require('path');
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
require('dotenv').config({ path: '.env.test' });

// Mock fetch globally
global.fetch = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Supabase Storage Configuration', () => {
    const TEST_USER_ID = 'test-user-123';
    const TEST_FILE_NAME = 'test-file.txt';
    const TEST_FILE_PATH = path.join(__dirname, TEST_FILE_NAME);
    const STORAGE_PATH = `${TEST_USER_ID}/${TEST_FILE_NAME}`;

    beforeAll(() => {
        // Create a test file
        fs.writeFileSync(TEST_FILE_PATH, 'This is a test file for Supabase storage verification.');
    });

    afterAll(() => {
        // Clean up local test file
        if (fs.existsSync(TEST_FILE_PATH)) {
            fs.unlinkSync(TEST_FILE_PATH);
        }
    });

    test('should have access to Supabase client', () => {
        expect(supabase).toBeDefined();
        expect(supabase.storage).toBeDefined();
    });

    test('should be able to list buckets', async () => {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        expect(error).toBeNull();
        expect(buckets).toBeDefined();
        expect(Array.isArray(buckets)).toBe(true);
    });

    test('should have "documents" bucket', async () => {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        expect(error).toBeNull();
        const documentsBucket = buckets.find(bucket => bucket.name === 'documents');
        expect(documentsBucket).toBeDefined();
        expect(documentsBucket.name).toBe('documents');
    });

    test('should be able to upload a file', async () => {
        const fileContent = fs.readFileSync(TEST_FILE_PATH);
        const { data, error } = await supabase.storage
            .from('documents')
            .upload(STORAGE_PATH, fileContent, {
                contentType: 'text/plain',
                upsert: true
            });

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.path).toBe(STORAGE_PATH);
    });

    test('should be able to download the uploaded file', async () => {
        const { data, error } = await supabase.storage
            .from('documents')
            .download(STORAGE_PATH);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data instanceof Blob).toBe(true);
        
        // Convert Blob to string and verify content
        const text = await data.text();
        expect(text).toBe('This is a test file for Supabase storage verification.');
    });

    test('should be able to delete the uploaded file', async () => {
        const { error } = await supabase.storage
            .from('documents')
            .remove([STORAGE_PATH]);

        expect(error).toBeNull();

        // Verify file is deleted by trying to download it
        const { data, error: downloadError } = await supabase.storage
            .from('documents')
            .download(STORAGE_PATH);

        expect(downloadError).toBeDefined();
        expect(data).toBeNull();
    });
});
