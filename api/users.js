// api/users.js - Vercel serverless function for user management
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function ensureTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS epic_users (
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
            // Return all users
            const result = await client.query('SELECT data FROM epic_users ORDER BY created_at ASC');
            const users = result.rows.map(r => r.data);
            return res.status(200).json(users);
        }

        if (req.method === 'POST') {
            const user = req.body;
            if (!user || !user.id || !user.email) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            // Check for duplicate email
            const existing = await client.query('SELECT id FROM epic_users WHERE data->>\'email\' = $1', [user.email.toLowerCase()]);
            if (existing.rows.length > 0) {
                return res.status(409).json({ error: 'An account with that email already exists.' });
            }
            await client.query(
                'INSERT INTO epic_users (id, data) VALUES ($1, $2)',
                [user.id, JSON.stringify(user)]
            );
            return res.status(201).json(user);
        }

        if (req.method === 'PUT') {
            const user = req.body;
            if (!user || !user.id) return res.status(400).json({ error: 'Missing user id' });
            await client.query(
                'UPDATE epic_users SET data = $1, updated_at = NOW() WHERE id = $2',
                [JSON.stringify(user), user.id]
            );
            return res.status(200).json(user);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('users API error:', err);
        return res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};
