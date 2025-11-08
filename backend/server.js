const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const filePath = path.join(__dirname, 'articles.json');
let articles = [];

// Charger les articles au démarrage
if (fs.existsSync(filePath)) {
  try {
    const raw = fs.readFileSync(filePath);
    articles = JSON.parse(raw);
    console.log(`✅ ${articles.length} article(s) chargé(s)`);
  } catch (err) {
    console.error("❌ Erreur lecture fichier :", err);
  }
}

// Sauvegarder les articles
function saveArticles() {
  fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
}

// Routes
app.get('/articles', (req, res) => {
  const { q, limit } = req.query;
  let filtered = articles;

  if (q) {
    const keyword = q.toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(keyword) ||
      a.description.toLowerCase().includes(keyword)
    );
  }

  if (limit) {
    filtered = filtered.slice(0, parseInt(limit));
  }

  res.json(filtered);
});

app.post('/articles', (req, res) => {
  const article = req.body;
  article.publishedAt = new Date().toISOString();
  articles.unshift(article);
  saveArticles();
  res.json({ message: "✅ Article publié", article });
});

app.delete('/articles/:title', (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== 'congolais2025') {
    return res.status(403).json({ message: "Accès refusé" });
  }

  const title = decodeURIComponent(req.params.title);
  const initialLength = articles.length;
  articles = articles.filter(article => article.title !== title);

  if (articles.length === initialLength) {
    return res.status(404).json({ message: "Article non trouvé" });
  }

  saveArticles();
  res.json({ message: "✅ Article supprimé" });
});

// Routes API ici (GET, POST, DELETE, etc.)

app.listen(process.env.PORT || 3000, () => {
  console.log("✅ Serveur lancé sur Render");
});

