import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testStorage() {
  console.log('Starting storage tests...\n')

  try {
    // 1. Test bucket existence and permissions
    console.log('1. Checking bucket configuration...')
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()

    if (bucketsError) throw bucketsError

    const documentsBucket = buckets.find(b => b.name === 'documents')
    if (!documentsBucket) {
      throw new Error('Documents bucket not found')
    }

    console.log('✓ Documents bucket exists\n')

    // 2. Test file upload
    console.log('2. Testing file upload...')
    const testFile = path.join(__dirname, 'test.txt')
    fs.writeFileSync(testFile, 'Test content')

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload('test/test.txt', fs.createReadStream(testFile), {
        contentType: 'text/plain',
        upsert: true
      })

    if (uploadError) throw uploadError
    console.log('✓ File upload successful\n')

    // 3. Test file retrieval
    console.log('3. Testing file retrieval...')
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('documents')
      .download('test/test.txt')

    if (downloadError) throw downloadError
    console.log('✓ File retrieval successful\n')

    // 4. Test file listing
    console.log('4. Testing file listing...')
    const { data: files, error: listError } = await supabase
      .storage
      .from('documents')
      .list('test')

    if (listError) throw listError
    console.log('✓ File listing successful\n')

    // 5. Test file deletion
    console.log('5. Testing file deletion...')
    const { error: deleteError } = await supabase
      .storage
      .from('documents')
      .remove(['test/test.txt'])

    if (deleteError) throw deleteError
    console.log('✓ File deletion successful\n')

    // 6. Test RLS policies
    console.log('6. Testing RLS policies...')
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_storage_policies', { bucket_name: 'documents' })

    if (policiesError) throw policiesError

    const hasRLS = policies.some(p => p.policy_name.includes('RLS'))
    if (!hasRLS) {
      throw new Error('RLS policies not found')
    }

    console.log('✓ RLS policies verified\n')

    // Cleanup
    fs.unlinkSync(testFile)

    console.log('All storage tests passed successfully! 🎉')
  } catch (error) {
    console.error('❌ Storage test failed:', error.message)
    process.exit(1)
  }
}

testStorage() 