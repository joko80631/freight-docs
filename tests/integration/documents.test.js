import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.test') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testDocumentUpload() {
  console.log('Testing document upload and classification...\n');

  try {
    // 1. Create test user and sign in
    console.log('1. Creating test user...');
    const testEmail = `test-${Date.now()}@freighttracker.com`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'Test123!',
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });

    if (signUpError) {
      throw new Error(`Signup failed: ${signUpError.message}`);
    }
    console.log('✅ Test user created');

    // 2. Create test load
    console.log('\n2. Creating test load...');
    const { data: load, error: loadError } = await supabase
      .from('loads')
      .insert([{
        load_number: `TEST-${Date.now()}`,
        carrier_name: 'Test Carrier',
        broker_id: signUpData.user.id
      }])
      .select()
      .single();

    if (loadError) {
      throw new Error(`Load creation failed: ${loadError.message}`);
    }
    console.log('✅ Test load created');

    // 3. Create test document
    console.log('\n3. Creating test document...');
    const testDocPath = join(__dirname, 'test-document.pdf');
    const testDocContent = 'This is a test Bill of Lading document for load TEST-123.';
    await fs.writeFile(testDocPath, testDocContent);
    console.log('✅ Test document created');

    // 4. Upload document
    console.log('\n4. Uploading document...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(`${load.id}/test-document.pdf`, await fs.readFile(testDocPath), {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    console.log('✅ Document uploaded successfully');

    // 5. Create document record
    console.log('\n5. Creating document record...');
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert([{
        load_id: load.id,
        path: uploadData.path,
        uploaded_by: signUpData.user.id,
        original_name: 'test-document.pdf',
        file_type: 'application/pdf',
        file_size: testDocContent.length
      }])
      .select()
      .single();

    if (docError) {
      throw new Error(`Document record creation failed: ${docError.message}`);
    }
    console.log('✅ Document record created');

    // 6. Test document classification
    console.log('\n6. Testing document classification...');
    const { data: classification, error: classificationError } = await supabase
      .rpc('classify_document', {
        document_id: document.id
      });

    if (classificationError) {
      throw new Error(`Classification failed: ${classificationError.message}`);
    }
    console.log('✅ Document classified successfully');

    // 7. Verify classification result
    console.log('\n7. Verifying classification result...');
    const { data: updatedDoc, error: updateError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document.id)
      .single();

    if (updateError) {
      throw new Error(`Document fetch failed: ${updateError.message}`);
    }
    if (!updatedDoc.classification_type) {
      throw new Error('Document was not classified');
    }
    console.log('✅ Classification verified');

    // Cleanup
    console.log('\n8. Cleaning up...');
    await fs.unlink(testDocPath);
    await supabase.storage
      .from('documents')
      .remove([uploadData.path]);
    await supabase
      .from('documents')
      .delete()
      .eq('id', document.id);
    await supabase
      .from('loads')
      .delete()
      .eq('id', load.id);
    await supabase.auth.signOut();
    console.log('✅ Cleanup completed');

    console.log('\n✨ Document upload and classification test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testDocumentUpload(); 