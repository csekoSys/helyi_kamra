const { Client } = require('pg');

const dbUrl = 'postgresql://postgres.qimvfdeucdldaxjfxadu:Cs3K0-800923@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

const users = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@helyikamra.hu',
    password: 'asdASD123',
    meta: { isAdmin: true, isBuyer: true, isProducer: false, name: 'Admin', acceptTerms: true, acceptGdpr: true }
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'vasarlo1@helyikamra.hu',
    password: 'asdASD123',
    meta: { isBuyer: true, isProducer: false, name: 'Kovács Anna', phone: '+36301234567', acceptTerms: true, acceptGdpr: true }
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'vasarlo2@helyikamra.hu',
    password: 'asdASD123',
    meta: { isBuyer: true, isProducer: false, name: 'Nagy Péter', acceptTerms: true, acceptGdpr: true }
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'termelo1@helyikamra.hu',
    password: 'asdASD123',
    meta: { isBuyer: false, isProducer: true, name: 'Szabó János', farmName: 'Szabó Családi Birtok', phone: '+36209876543', acceptTerms: true, acceptGdpr: true }
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'termelo2@helyikamra.hu',
    password: 'asdASD123',
    meta: { isBuyer: false, isProducer: true, name: 'Tóth Mária', farmName: 'Tóth Kézműves Sajtok', phone: '+36701112222', acceptTerms: true, acceptGdpr: true }
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    email: 'vegyes@helyikamra.hu',
    password: 'asdASD123',
    meta: { isBuyer: true, isProducer: true, name: 'Horváth Gábor', farmName: 'Horváth Méhészet', phone: '+36305554444', acceptTerms: true, acceptGdpr: true }
  }
];

async function seed() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  
  try {
    console.log('Inserting users directly to auth.users...');
    
    // Enable pgcrypto if not enabled
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    
    for (const u of users) {
      await client.query(`
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
          raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        )
        VALUES (
          '00000000-0000-0000-0000-000000000000', $1, 'authenticated', 'authenticated', $2, 
          crypt($3, gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', $4, now(), now()
        )
        ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password
      `, [u.id, u.email, u.password, u.meta]);
      console.log(`Inserted ${u.email}`);
    }

    console.log('Approving producers...');
    await client.query(`UPDATE public.profiles SET is_approved_by_admin = true WHERE is_producer = true`);
    
    console.log('Creating categories...');
    const categories = ['Zöldségek', 'Gyümölcsök', 'Tejtermékek', 'Hús és Készítmények', 'Pékáruk', 'Méz és Lekvár'];
    for (const cat of categories) {
      await client.query(`
        INSERT INTO public.categories (name, icon_name) 
        VALUES ($1, 'carrot') 
        ON CONFLICT (name) DO NOTHING
      `, [cat]);
    }
    
    const catResult = await client.query(`SELECT id, name FROM public.categories`);
    const categoryMap = {};
    catResult.rows.forEach(r => categoryMap[r.name] = r.id);
    console.log('✅ Categories created');

    console.log('Creating products...');
    const prod1_id = users.find(u => u.email === 'termelo1@helyikamra.hu').id;
    const prod2_id = users.find(u => u.email === 'termelo2@helyikamra.hu').id;
    const prod3_id = users.find(u => u.email === 'vegyes@helyikamra.hu').id;
    
    const products = [
      { producer_id: prod1_id, category_id: categoryMap['Zöldségek'], name: 'Bio Paradicsom', description: 'Friss, vegyszermentes paradicsom egyenesen a kertből.', price: 1500, unit: 'kg', is_active: true },
      { producer_id: prod1_id, category_id: categoryMap['Gyümölcsök'], name: 'Ropogós Alma', description: 'Idared alma, vegyszermentes.', price: 800, unit: 'kg', is_active: true },
      { producer_id: prod2_id, category_id: categoryMap['Tejtermékek'], name: 'Házi Tehénsajt', description: 'Kézműves tehénsajt fokhagymás és natúr ízekben.', price: 4500, unit: 'kg', is_active: true },
      { producer_id: prod2_id, category_id: categoryMap['Tejtermékek'], name: 'Kézműves Vaj', description: 'Frissen köpült házivaj, kb 250g/db', price: 2000, unit: 'db', is_active: true },
      { producer_id: prod3_id, category_id: categoryMap['Méz és Lekvár'], name: 'Akácméz', description: 'Idei pörgetésű termelői akácméz.', price: 3500, unit: 'üveg', is_active: true },
      { producer_id: prod3_id, category_id: categoryMap['Gyümölcsök'], name: 'Szamóca', description: 'Frissen szedett édes szamóca', price: 2500, unit: 'kg', is_active: true }
    ];

    for (const p of products) {
      await client.query(`
        INSERT INTO public.products (producer_id, category_id, name, description, price, unit, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [p.producer_id, p.category_id, p.name, p.description, p.price, p.unit, p.is_active]);
    }
    console.log('✅ Products created');
    
  } catch(e) {
    console.error('Error:', e);
  } finally {
    client.end();
  }
}
seed();
