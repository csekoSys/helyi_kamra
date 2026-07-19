require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const dbUrl = 'postgresql://postgres.qimvfdeucdldaxjfxadu:Cs3K0-800923@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

const supabase = createClient(supabaseUrl, supabaseKey);

const usersToCreate = [
  {
    email: 'admin@helyikamra.hu',
    password: 'asdASD123',
    meta: { isAdmin: true, isBuyer: true, isProducer: false, name: 'Admin', acceptTerms: true, acceptGdpr: true }
  },
  {
    email: 'vasarlo1@helyikamra.hu',
    password: 'asdASD123',
    meta: { isBuyer: true, isProducer: false, name: 'Kovács Anna', phone: '+36301234567', acceptTerms: true, acceptGdpr: true }
  },
  {
    email: 'vasarlo2@helyikamra.hu',
    password: 'asdASD123',
    meta: { isBuyer: true, isProducer: false, name: 'Nagy Péter', acceptTerms: true, acceptGdpr: true }
  },
  {
    email: 'termelo1@helyikamra.hu',
    password: 'asdASD123',
    meta: { isBuyer: false, isProducer: true, name: 'Szabó János', farmName: 'Szabó Családi Birtok', phone: '+36209876543', acceptTerms: true, acceptGdpr: true }
  },
  {
    email: 'termelo2@helyikamra.hu',
    password: 'asdASD123',
    meta: { isBuyer: false, isProducer: true, name: 'Tóth Mária', farmName: 'Tóth Kézműves Sajtok', phone: '+36701112222', acceptTerms: true, acceptGdpr: true }
  },
  {
    email: 'vegyes@helyikamra.hu',
    password: 'asdASD123',
    meta: { isBuyer: true, isProducer: true, name: 'Horváth Gábor', farmName: 'Horváth Méhészet', phone: '+36305554444', acceptTerms: true, acceptGdpr: true }
  }
];

async function seed() {
  console.log('🌱 Starting seed process...');
  
  // 1. Sign up users
  const createdUsers = [];
  for (const user of usersToCreate) {
    console.log(`Signing up ${user.email}...`);
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: user.meta
      }
    });
    
    if (error) {
      console.error(`Error signing up ${user.email}:`, error.message);
    } else {
      console.log(`✅ Signed up ${user.email} (ID: ${data.user.id})`);
      createdUsers.push(data.user);
    }
  }

  // 2. Connect to PG to confirm emails and setup dummy data
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  console.log('✅ Connected to database');

  try {
    // Confirm emails
    console.log('Confirming emails...');
    await client.query(`UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL`);
    
    // Auto-approve all producers for demo purposes
    await client.query(`UPDATE public.profiles SET is_approved_by_admin = true WHERE is_producer = true`);
    console.log('✅ Emails confirmed and producers approved');

    // 3. Create Categories
    console.log('Creating categories...');
    const categories = ['Zöldségek', 'Gyümölcsök', 'Tejtermékek', 'Hús és Készítmények', 'Pékáruk', 'Méz és Lekvár'];
    for (const cat of categories) {
      await client.query(`
        INSERT INTO public.categories (name, description, icon_name) 
        VALUES ($1, $2, 'carrot') 
        ON CONFLICT (name) DO NOTHING
      `, [cat, `${cat} kategória termékei`]);
    }
    
    const catResult = await client.query(`SELECT id, name FROM public.categories`);
    const categoryMap = {};
    catResult.rows.forEach(r => categoryMap[r.name] = r.id);
    console.log('✅ Categories created');

    // 4. Find producers
    const prod1 = createdUsers.find(u => u.email === 'termelo1@helyikamra.hu');
    const prod2 = createdUsers.find(u => u.email === 'termelo2@helyikamra.hu');
    const prod3 = createdUsers.find(u => u.email === 'vegyes@helyikamra.hu');

    // 5. Create dummy products
    if (prod1 && prod2 && prod3) {
      console.log('Creating products...');
      
      const products = [
        { producer_id: prod1.id, category_id: categoryMap['Zöldségek'], name: 'Bio Paradicsom', description: 'Friss, vegyszermentes paradicsom egyenesen a kertből.', price: 1500, unit: 'kg', stock_quantity: 50, is_active: true },
        { producer_id: prod1.id, category_id: categoryMap['Gyümölcsök'], name: 'Ropogós Alma', description: 'Idared alma, vegyszermentes.', price: 800, unit: 'kg', stock_quantity: 100, is_active: true },
        { producer_id: prod2.id, category_id: categoryMap['Tejtermékek'], name: 'Házi Tehénsajt', description: 'Kézműves tehénsajt fokhagymás és natúr ízekben.', price: 4500, unit: 'kg', stock_quantity: 15, is_active: true },
        { producer_id: prod2.id, category_id: categoryMap['Tejtermékek'], name: 'Kézműves Vaj', description: 'Frissen köpült házivaj, kb 250g/db', price: 2000, unit: 'db', stock_quantity: 20, is_active: true },
        { producer_id: prod3.id, category_id: categoryMap['Méz és Lekvár'], name: 'Akácméz', description: 'Idei pörgetésű termelői akácméz.', price: 3500, unit: 'üveg', stock_quantity: 30, is_active: true },
        { producer_id: prod3.id, category_id: categoryMap['Gyümölcsök'], name: 'Szamóca', description: 'Frissen szedett édes szamóca', price: 2500, unit: 'kg', stock_quantity: 10, is_active: true }
      ];

      for (const p of products) {
        await client.query(`
          INSERT INTO public.products (producer_id, category_id, name, description, price, unit, stock_quantity, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [p.producer_id, p.category_id, p.name, p.description, p.price, p.unit, p.stock_quantity, p.is_active]);
      }
      console.log('✅ Products created');
    }

  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.end();
    console.log('🎉 Seed complete!');
  }
}

seed();
