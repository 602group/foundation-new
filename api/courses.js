// api/courses.js - Vercel serverless function for golf course data
const { Pool } = require('pg');

// Increase body size limit to 10MB to support base64-encoded course images
module.exports.config = { api: { bodyParser: { sizeLimit: '10mb' } } };

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function ensureTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS epic_courses (
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
            const result = await client.query('SELECT data FROM epic_courses ORDER BY created_at ASC');
            const courses = result.rows.map(r => r.data);
            return res.status(200).json(courses);
        }

        if (req.method === 'POST') {
            const course = req.body;
            if (!course || !course.id) return res.status(400).json({ error: 'Missing course id' });
            await client.query(
                `INSERT INTO epic_courses (id, data) VALUES ($1, $2)
                 ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
                [course.id, JSON.stringify(course)]
            );
            return res.status(200).json(course);
        }

        if (req.method === 'PUT') {
            const course = req.body;
            if (!course || !course.id) return res.status(400).json({ error: 'Missing course id' });
            await client.query(
                'UPDATE epic_courses SET data = $1, updated_at = NOW() WHERE id = $2',
                [JSON.stringify(course), course.id]
            );
            return res.status(200).json(course);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Missing id query param' });
            await client.query('DELETE FROM epic_courses WHERE id = $1', [id]);
            return res.status(200).json({ deleted: id });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('courses API error:', err);
        return res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};
