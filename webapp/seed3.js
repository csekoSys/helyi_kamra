const { Client } = require('pg');

const dbUrl = 'postgresql://postgres.qimvfdeucdldaxjfxadu:Cs3K0-800923@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

async function seedMore() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  
  try {
    console.log('Inserting Markets...');
    const markets = [
      { name: 'Fény utcai Piac', address: 'Budapest, Fény u. 20-22, 1024', lng: 19.025, lat: 47.508, schedule: 'H-P: 6:00-18:00, Szo: 6:00-14:00' },
      { name: 'Lehel Csarnok', address: 'Budapest, Váci út 9-15, 1134', lng: 19.060, lat: 47.518, schedule: 'H-P: 6:00-18:00, Szo: 6:00-14:00' },
      { name: 'Debreceni Nagypiac', address: 'Debrecen, Vár u. 3, 4024', lng: 21.627, lat: 47.531, schedule: 'H-P: 6:00-17:00, Szo: 6:00-14:00' },
      { name: 'Szegedi Mars téri Piac', address: 'Szeged, Mars tér, 6724', lng: 20.141, lat: 46.256, schedule: 'H-P: 5:00-16:00, Szo: 5:00-14:00' }
    ];

    for (const m of markets) {
      await client.query(`
        INSERT INTO public.markets (name, address, location, schedule) 
        VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5)
        ON CONFLICT DO NOTHING
      `, [m.name, m.address, m.lng, m.lat, m.schedule]);
    }
    console.log('✅ Markets inserted');

    console.log('Fetching users...');
    const usersRes = await client.query('SELECT id, email FROM auth.users');
    const users = usersRes.rows;

    const prod1_id = users.find(u => u.email === 'termelo1@helyikamra.hu')?.id;
    const prod2_id = users.find(u => u.email === 'termelo2@helyikamra.hu')?.id;
    const prod3_id = users.find(u => u.email === 'vegyes@helyikamra.hu')?.id;

    if (prod1_id && prod2_id && prod3_id) {
      console.log('Inserting Producer Locations...');
      const locations = [
        { producer_id: prod1_id, type: 'farm', address: 'Szentendre, Dózsa György út 10', lng: 19.076, lat: 47.669, radius: 0, delivery: '', sched: 'H-P: 8:00-16:00' },
        { producer_id: prod1_id, type: 'delivery_zone', address: 'Budapest, Északi agglomeráció', lng: 19.05, lat: 47.55, radius: 15.5, delivery: '2000 Ft felett ingyenes, egyébként 1500 Ft.', sched: 'Szerda és Szombat' },
        { producer_id: prod2_id, type: 'market', address: 'Fény utcai Piac (földszint)', lng: 19.025, lat: 47.508, radius: 0, delivery: '', sched: 'Szombat: 6:00-13:00' },
        { producer_id: prod3_id, type: 'farm', address: 'Kecskemét, Tanya 123', lng: 19.692, lat: 46.908, radius: 0, delivery: '', sched: 'Előzetes egyeztetés alapján' }
      ];

      for (const l of locations) {
        await client.query(`
          INSERT INTO public.producer_locations (producer_id, location_type, address, location, radius_km, delivery_text, schedule_info)
          VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, $7, $8)
        `, [l.producer_id, l.type, l.address, l.lng, l.lat, l.radius, l.delivery, l.sched]);
      }
      console.log('✅ Producer Locations inserted');
      
      console.log('Inserting more products...');
      // Fetch categories
      const catResult = await client.query(`SELECT id, name FROM public.categories`);
      const catMap = {};
      catResult.rows.forEach(r => catMap[r.name] = r.id);
      
      const moreProducts = [
        { producer_id: prod1_id, category_id: catMap['Zöldségek'], name: 'Fürtös Uborka', description: 'Kovászolni vagy salátának kiváló uborka.', price: 900, unit: 'kg', is_active: true },
        { producer_id: prod1_id, category_id: catMap['Zöldségek'], name: 'Lilahagyma', description: 'Makói típusú erős lilahagyma.', price: 650, unit: 'kg', is_active: true },
        { producer_id: prod2_id, category_id: catMap['Tejtermékek'], name: 'Füstölt Parenyica', description: 'Hagyományos füstölésű parenyica sajt.', price: 1200, unit: 'db', is_active: true },
        { producer_id: prod2_id, category_id: catMap['Tejtermékek'], name: 'Kecskesajt', description: 'Natúr, félérett kecskesajt, 100% tiszta kecsketejből.', price: 5500, unit: 'kg', is_active: true },
        { producer_id: prod3_id, category_id: catMap['Méz és Lekvár'], name: 'Virágpor', description: 'Szárított virágpor.', price: 4000, unit: 'üveg', is_active: true },
        { producer_id: prod3_id, category_id: catMap['Méz és Lekvár'], name: 'Eperlekvár', description: 'Nagymama receptje alapján, tartósítószer mentesen.', price: 1800, unit: 'üveg', is_active: true },
        { producer_id: prod3_id, category_id: catMap['Gyümölcsök'], name: 'Málna', description: 'Édes, lédús málna.', price: 3000, unit: 'kg', is_active: true }
      ];

      for (const p of moreProducts) {
        if (!p.category_id) continue;
        await client.query(`
          INSERT INTO public.products (producer_id, category_id, name, description, price, unit, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [p.producer_id, p.category_id, p.name, p.description, p.price, p.unit, p.is_active]);
      }
      console.log('✅ More products inserted');
    }
    
    console.log('Inserting Blog Posts...');
    const posts = [
      { title: 'Miért válasszuk a helyi termelőket?', content: 'A helyi termelők támogatása nem csak a gazdaságnak jó, hanem a környezetünket is óvjuk vele. Kisebb ökológiai lábnyom, frissebb és ízletesebb zöldségek és gyümölcsök. \n\nEbben a cikkben megvizsgáljuk, milyen jótékony hatásai vannak a helyi élelmiszer vásárlásának.', is_sponsored: false },
      { title: 'Tavaszi Zöldségkalauz: Mi terem most?', content: 'Tavasszal a természet felébred, és ezzel együtt megjelennek az első friss zöldségek is. A retek, az újhagyma és a zsenge borsó igazi kincsek ilyenkor. \n\nKeresd őket a HelyiKamra piacain és termelőinél!', is_sponsored: false },
      { title: 'Hogyan készítsünk tökéletes kovászos uborkát?', content: 'A nyár közeledtével eljön a kovászos uborka ideje. Egy jó recept és minőségi alapanyagok (amit megtalálsz nálunk a termelőktől) a titka a ropogós, ízletes uborkának.', is_sponsored: true }
    ];
    
    for (const p of posts) {
      await client.query(`
        INSERT INTO public.blog_posts (title, content, is_sponsored)
        VALUES ($1, $2, $3)
      `, [p.title, p.content, p.is_sponsored]);
    }
    console.log('✅ Blog posts inserted');

  } catch(e) {
    console.error('Error:', e);
  } finally {
    client.end();
    console.log('🎉 Seed3 complete!');
  }
}

seedMore();
