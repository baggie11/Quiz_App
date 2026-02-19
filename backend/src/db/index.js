import 'dotenv/config';
import {createClient} from '@supabase/supabase-js';

/**
 * Supabase connection
**/

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey){
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined in .env');
}

//create and export a singleton Supabase Client
export const supabase = createClient(supabaseUrl,supabaseKey);

/**
 * Helper to test connection
**/

export async function testConnection() {
  try {
    const { data, error } = await supabase.auth.getUser();
    console.log('Supabase connection OK');
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err.message);
    return false;
  }
}
