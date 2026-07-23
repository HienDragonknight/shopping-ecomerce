import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ggcrcgczyoxigmmzhmrd.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_BMNfeAAjd3X9tCUGWDRAEg_LN6KoQ7R';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking Supabase connection...");
  const { data, error } = await supabase.from('site_visits').select('*').limit(1);
  if (error) {
    console.log("Error querying site_visits table:", error.message);
  } else {
    console.log("site_visits table exists! Sample data:", data);
  }
}

check();
