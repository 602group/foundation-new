// api/auctions.js - Vercel serverless function for auction data
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function ensureTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS epic_auctions (
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
            const result = await client.query('SELECT data FROM epic_auctions ORDER BY created_at ASC');
            const auctions = result.rows.map(r => r.data);
            return res.status(200).json(auctions);
        }

        if (req.method === 'POST') {
            const auction = req.body;
            if (!auction || !auction.id) return res.status(400).json({ error: 'Missing auction id' });
            // Upsert
            await client.query(
                `INSERT INTO epic_auctions (id, data) VALUES ($1, $2)
                 ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
                [auction.id, JSON.stringify(auction)]
            );
            return res.status(200).json(auction);
        }

        if (req.method === 'PUT') {
            const auction = req.body;
            if (!auction || !auction.id) return res.status(400).json({ error: 'Missing auction id' });
            await client.query(
                'UPDATE epic_auctions SET data = $1, updated_at = NOW() WHERE id = $2',
                [JSON.stringify(auction), auction.id]
            );
            return res.status(200).json(auction);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Missing id query param' });
            await client.query('DELETE FROM epic_auctions WHERE id = $1', [id]);
            return res.status(200).json({ deleted: id });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('auctions API error:', err);
        return res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};
