import "dotenv/config"
import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import pg from 'pg'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Config ────────────────────────────────────────────────────────────────────

const JSON_PATH = resolve(__dirname, '../packages/core/src/assets/locations/locations.json')
const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
    console.error('❌  DATABASE_URL env var is required.')
    process.exit(1)
}

// ── Read from JSON ────────────────────────────────────────────────────────────

type LocationEntry = {
    province: string
    city: string
}

type LocationRow = LocationEntry & {
    id: string
    created_at: Date
}

const raw: LocationEntry[] = JSON.parse(readFileSync(JSON_PATH, 'utf-8'))

const locations: LocationEntry[] = raw

console.log(`📦  Read ${locations.length} location rows from locations.json.`)

// ── Insert into PostgreSQL ────────────────────────────────────────────────────

const client = new pg.Client({ connectionString: DATABASE_URL })
await client.connect()

try {
    await client.query('BEGIN')

    // Drop and recreate to ensure correct schema
    await client.query(`DROP TABLE IF EXISTS locations`)
    await client.query(`
        CREATE TABLE locations (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            province    TEXT NOT NULL,
            city        TEXT NOT NULL,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT  locations_province_city_unique UNIQUE (province, city)
        )
    `)

    let inserted = 0
    for (const loc of locations) {
        await client.query(
            `INSERT INTO locations (id, province, city)
             VALUES ($1::uuid, $2, $3)
             ON CONFLICT (province, city) DO NOTHING`,
            [randomUUID(), loc.province, loc.city]
        )
        inserted++
    }

    console.log(`   ↳ Inserted ${inserted} rows.`)

    await client.query('COMMIT')
    console.log(`✅  Seed complete. ${locations.length} locations seeded.`)
} catch (err) {
    await client.query('ROLLBACK')
    console.error('❌  Seed failed, rolled back.', err)
    process.exit(1)
} finally {
    await client.end()
}
