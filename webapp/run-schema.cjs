const fs = require('fs')
const dns = require('dns')
const { Client } = require('pg')

async function runSchema() {
  try {
    const password = 'Cs3K0-800923'
    // Session pooler (port 5432) is recommended for DDL (schema creation)
    const connectionString = `postgresql://postgres.qimvfdeucdldaxjfxadu:${password}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`
    
    console.log('🔗 Csatlakozás a Supabase adatbázishoz (eu-west-1 pooler)...')
    
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    })
    
    await client.connect()
    console.log('✅ Csatlakozva!')
    
    // Read the SQL schema file
    const sql = fs.readFileSync('../supabase_schema.sql', 'utf8')
    console.log(`📄 SQL fájl beolvasva (${sql.length} karakter)`)
    console.log('⏳ Séma futtatása... (ez eltarthat néhány másodpercig)')
    
    await client.query(sql)
    
    console.log('✅ Séma sikeresen lefutott!')
    
    // Verify tables
    const { rows } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    
    console.log('')
    console.log('📋 Létrehozott táblák:')
    rows.forEach(r => console.log(`   ✅ ${r.table_name}`))
    
    console.log('')
    console.log('🎉 Minden kész!')
    await client.end()
    
  } catch (err) {
    console.error('❌ Hiba:', err.message)
    if (err.message.includes('already exists')) {
      console.log('ℹ️  Lehet, hogy a séma már korábban le lett futtatva.')
    }
  }
}

runSchema()
