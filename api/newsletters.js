// api/newsletters.js - Vercel serverless function for newsletters data
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function ensureTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS epic_newsletters (
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
            const result = await client.query('SELECT data FROM epic_newsletters ORDER BY created_at DESC');
            const newsletters = result.rows.map(r => r.data);
            return res.status(200).json(newsletters);
        }

        if (req.method === 'POST') {
            const item = req.body;
            if (item && !item.id && item.email) item.id = item.email;
            if (!item || !item.id) return res.status(400).json({ error: 'Missing newsletter id' });
            await client.query(
                `INSERT INTO epic_newsletters (id, data) VALUES ($1, $2)
                 ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
                [item.id, JSON.stringify(item)]
            );
            return res.status(200).json(item);
        }

        if (req.method === 'PUT') {
            const item = req.body;
            if (item && !item.id && item.email) item.id = item.email;
            if (!item || !item.id) return res.status(400).json({ error: 'Missing newsletter id' });
            await client.query(
                'UPDATE epic_newsletters SET data = $1, updated_at = NOW() WHERE id = $2',
                [JSON.stringify(item), item.id]
            );
            return res.status(200).json(item);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Missing id query param' });
            await client.query('DELETE FROM epic_newsletters WHERE id = $1', [id]);
            return res.status(200).json({ deleted: id });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('newsletters API error:', err);
        return res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};
