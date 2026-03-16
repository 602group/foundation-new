// api/tasks.js - Vercel serverless function for tasks data
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function ensureTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS epic_tasks (
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
            const result = await client.query('SELECT data FROM epic_tasks ORDER BY created_at ASC');
            const tasks = result.rows.map(r => r.data);
            return res.status(200).json(tasks);
        }

        if (req.method === 'POST') {
            const task = req.body;
            if (!task || !task.id) return res.status(400).json({ error: 'Missing task id' });
            await client.query(
                `INSERT INTO epic_tasks (id, data) VALUES ($1, $2)
                 ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
                [task.id, JSON.stringify(task)]
            );
            return res.status(200).json(task);
        }

        if (req.method === 'PUT') {
            const task = req.body;
            if (!task || !task.id) return res.status(400).json({ error: 'Missing task id' });
            await client.query(
                'UPDATE epic_tasks SET data = $1, updated_at = NOW() WHERE id = $2',
                [JSON.stringify(task), task.id]
            );
            return res.status(200).json(task);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Missing id query param' });
            await client.query('DELETE FROM epic_tasks WHERE id = $1', [id]);
            return res.status(200).json({ deleted: id });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('tasks API error:', err);
        return res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};
