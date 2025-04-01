/**
 * Utility functions for testing Supabase connections and operations
 * @module supabase-test-utils
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Tests the Supabase connection by attempting to fetch data
 * @async
 * @function testSupabaseConnection
 * @returns {Promise<boolean>} True if connection is successful, false otherwise
 * @throws {Error} If environment variables are not properly configured
 */
export async function testSupabaseConnection() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase environment variables are not properly configured');
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Try to fetch a simple query
        const { data, error } = await supabase
            .from('documents')
            .select('count')
            .limit(1);
            
        if (error) {
            console.error('Supabase connection error:', error.message);
            return false;
        }
        
        console.log('✅ Supabase connection successful!');
        console.log('Data:', data);
        return true;
    } catch (error) {
        console.error('❌ Supabase connection failed:', error.message);
        return false;
    }
}

/**
 * Tests database access by attempting to perform basic CRUD operations
 * @async
 * @function testDatabaseAccess
 * @returns {Promise<boolean>} True if all operations are successful, false otherwise
 */
export async function testDatabaseAccess() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase environment variables are not properly configured');
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Test read operation
        const { data: readData, error: readError } = await supabase
            .from('documents')
            .select('*')
            .limit(1);
            
        if (readError) {
            console.error('Read operation failed:', readError.message);
            return false;
        }

        console.log('✅ Database access successful!');
        return true;
    } catch (error) {
        console.error('❌ Database access failed:', error.message);
        return false;
    }
} 