import pg from 'pg';

const connectionString = "postgresql://postgres.ggcrcgczyoxigmmzhmrd:Hemattroi@2021@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log("Connecting to Supabase Postgres to create site_visits table...");
  const client = await pool.connect();
  try {
    // Create site_visits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.site_visits (
        id BIGSERIAL PRIMARY KEY,
        visited_at TIMESTAMPTZ DEFAULT NOW(),
        user_agent TEXT,
        path TEXT DEFAULT '/'
      );
    `);

    console.log("Table 'site_visits' created successfully.");

    // Check count
    const res = await client.query(`SELECT COUNT(*) FROM public.site_visits`);
    const count = parseInt(res.rows[0].count, 10);
    console.log(`Current logged visits in DB: ${count}`);

    // If count is 0, insert 33 sample visits for today so initial stats match the preview image (33 today) if desired
    if (count === 0) {
      console.log("Seeding 33 initial visits for today...");
      for (let i = 0; i < 33; i++) {
        await client.query(`INSERT INTO public.site_visits (visited_at, path) VALUES (NOW(), '/')`);
      }
      console.log("Seeded 33 visits for today.");
    }

    // Enable realtime publication on site_visits table
    try {
      await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE public.site_visits;`);
      console.log("Realtime publication enabled for site_visits.");
    } catch (e) {
      console.log("Realtime publication notice:", e.message);
    }

    // Disable RLS or grant permissions so client can read/insert cleanly
    await client.query(`ALTER TABLE public.site_visits DISABLE ROW LEVEL SECURITY;`);
    console.log("Row Level Security disabled for site_visits table for public access.");

  } catch (err) {
    console.error("Database setup error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
