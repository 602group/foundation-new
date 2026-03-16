// api/events.js - Vercel serverless function for event data
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function ensureTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS epic_events (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const client = await pool.connect();
    try {
        await ensureTable(client);

        if (req.method === 'GET') {
            const result = await client.query('SELECT data FROM epic_events ORDER BY created_at ASC');
            const events = result.rows.map(r => r.data);
            return res.status(200).json(events);
        }

        if (req.method === 'POST') {
            const event = req.body;
            if (!event || !event.id) return res.status(400).json({ error: 'Missing event id' });
            await client.query(
                `INSERT INTO epic_events (id, data) VALUES ($1, $2)
                 ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
                [event.id, JSON.stringify(event)]
            );
            return res.status(200).json(event);
        }

        if (req.method === 'PUT') {
            const event = req.body;
            if (!event || !event.id) return res.status(400).json({ error: 'Missing event id' });
            await client.query(
                'UPDATE epic_events SET data = $1, updated_at = NOW() WHERE id = $2',
                [JSON.stringify(event), event.id]
            );
            return res.status(200).json(event);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('events API error:', err);
        return res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};
