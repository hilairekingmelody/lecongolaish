// 🔐 Chargement des variables d'environnement
require('dotenv').config();

// 🛠️ Connexion à PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erreur de connexion PostgreSQL :', err);
  } else {
    console.log('✅ Connecté à PostgreSQL à :', res.rows[0].now);
  }
});

// 🚀 Configuration Express
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 📥 Publier un article
app.post('/articles', async (req, res) => {
  const { title, description, url, image, category } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO articles (title, description, url, image, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, url, image, category || 'Congo']
    );
    res.json({ message: "✅ Article publié", article: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur PostgreSQL :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔎 Rechercher des articles
app.get('/articles', async (req, res) => {
  const { q, limit } = req.query;
  let query = 'SELECT * FROM articles';
  let values = [];

  if (q) {
    query += ' WHERE LOWER(title) LIKE $1 OR LOWER(description) LIKE $1';
    values.push(`%${q.toLowerCase()}%`);
  }

  query += ' ORDER BY publishedAt DESC';

  if (limit) {
    query += ` LIMIT ${parseInt(limit)}`;
  }

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur PostgreSQL :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🗑️ Supprimer un article (admin uniquement)
app.delete('/articles/:title', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== 'congolais2025') {
    return res.status(403).json({ message: "Accès refusé" });
  }

  const title = decodeURIComponent(req.params.title);

  try {
    const result = await pool.query(
      'DELETE FROM articles WHERE title = $1 RETURNING *',
      [title]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Article non trouvé" });
    }

    res.json({ message: "✅ Article supprimé" });
  } catch (err) {
    console.error("❌ Erreur PostgreSQL :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🚀 Lancement du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
//Dashboard
app.get('/articles', async (req, res) => {
  const result = await pool.query('SELECT * FROM articles ORDER BY id DESC');
  res.json(result.rows);
});

app.delete('/articles/:id', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== 'congolais2025') return res.status(403).send("Accès refusé");

  const id = req.params.id;
  await pool.query('DELETE FROM articles WHERE id = $1', [id]);
  res.sendStatus(200);
});


