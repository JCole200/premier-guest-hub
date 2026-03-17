import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nzgbdjmskimcdhmdxoxw.supabase.co';
const supabaseKey = 'sb_publishable_LZ2rxLV8_TtsGyGcCf5ygA_f_gc4Dhn';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Connection Failed or Table Missing:', error.message);
  } else {
    console.log('✅ Connection Successful!');
    console.log('Database returned:', data);
  }
}

testConnection();
