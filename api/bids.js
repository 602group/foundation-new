// api/bids.js - Vercel serverless function for bids data
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function ensureTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS epic_bids (
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
            // Can filter by auction_id if needed: /api/bids?auction_id=xyz
            const { auction_id } = req.query;
            let result;
            if (auction_id) {
                result = await client.query('SELECT data FROM epic_bids WHERE data->>\'auctionId\' = $1 ORDER BY created_at DESC', [auction_id]);
            } else {
                result = await client.query('SELECT data FROM epic_bids ORDER BY created_at DESC');
            }
            const bids = result.rows.map(r => r.data);
            return res.status(200).json(bids);
        }

        if (req.method === 'POST') {
            const bid = req.body;
            if (!bid || !bid.id) return res.status(400).json({ error: 'Missing bid id' });
            await client.query(
                `INSERT INTO epic_bids (id, data) VALUES ($1, $2)
                 ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
                [bid.id, JSON.stringify(bid)]
            );
            return res.status(200).json(bid);
        }

        if (req.method === 'PUT') {
            const bid = req.body;
            if (!bid || !bid.id) return res.status(400).json({ error: 'Missing bid id' });
            await client.query(
                'UPDATE epic_bids SET data = $1, updated_at = NOW() WHERE id = $2',
                [JSON.stringify(bid), bid.id]
            );
            return res.status(200).json(bid);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Missing id query param' });
            await client.query('DELETE FROM epic_bids WHERE id = $1', [id]);
            return res.status(200).json({ deleted: id });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('bids API error:', err);
        return res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};
