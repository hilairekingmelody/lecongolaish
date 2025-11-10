require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ✅ Route pour publier un article
app.post('/articles', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== 'congolais2025') return res.status(403).send("Accès refusé");

  const { title, description, category, image, url } = req.body;
  if (!title || !description || !category || !image || !url) {
    return res.status(400).send("Champs manquants");
  }

  try {
    await pool.query(
      `INSERT INTO articles (title, description, category, image, url) VALUES ($1, $2, $3, $4, $5)`,
      [title, description, category, image, url]
    );
    res.sendStatus(201);
  } catch (err) {
    console.error("❌ Erreur SQL :", err);
    res.status(500).send("Erreur serveur : " + err.message);
  }
});

// ✅ Route pour récupérer les articles
app.get('/articles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articles ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur SQL :", err);
    res.status(500).send("Erreur serveur");
  }
});

// ✅ Route pour supprimer un article
app.delete('/articles/:id', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== 'congolais2025') return res.status(403).send("Accès refusé");

  const id = req.params.id;
  try {
    await pool.query('DELETE FROM articles WHERE id = $1', [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Erreur SQL :", err);
    res.status(500).send("Erreur serveur");
  }
});

// ✅ Route pour afficher le dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ✅ Lancement du serveur
const PORT = process.env.PORT || 10000;
app.listen(PORT, async () => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM articles');
    console.log(`✅ ${result.rows[0].count} article(s) chargé(s)`);
  } catch (err) {
    console.error("❌ Erreur de connexion PostgreSQL :", err);
  }
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});