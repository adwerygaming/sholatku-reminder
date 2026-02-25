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

const locations: LocationRow[] = raw.map(entry => ({
    id: randomUUID(),
    province: entry.province,
    city: entry.city,
    created_at: new Date()
}))

console.log(`📦  Read ${locations.length} location rows from locations.json.`)

// ── Insert into PostgreSQL ────────────────────────────────────────────────────

const client = new pg.Client({ connectionString: DATABASE_URL })
await client.connect()

try {
    await client.query('BEGIN')

    // Insert in batches of 100
    const batchSize = 100
    let inserted = 0

    for (let i = 0; i < locations.length; i += batchSize) {
        const batch = locations.slice(i, i + batchSize)

        const values = batch
            .map((_, j) => {
                const base = i + j
                return `($${base * 4 + 1}, $${base * 4 + 2}, $${base * 4 + 3}, $${base * 4 + 4})`
            })
            .join(', ')

        const params = batch.flatMap(r => [r.id, r.province, r.city, r.created_at])

        await client.query(
            `INSERT INTO locations (id, province, city, created_at)
             VALUES ${values}
             ON CONFLICT (province, city) DO NOTHING`,
            params
        )

        inserted += batch.length
        console.log(`   ↳ Inserted ${inserted}/${locations.length}...`)
    }

    await client.query('COMMIT')
    console.log(`✅  Seed complete. ${locations.length} locations seeded.`)
} catch (err) {
    await client.query('ROLLBACK')
    console.error('❌  Seed failed, rolled back.', err)
    process.exit(1)
} finally {
    await client.end()
}
