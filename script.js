// 🔑 Clé API GNews
const apiKey = "303c134551af698a9165e9a6bff6bcb1";

// Fonction principale pour charger les articles depuis articles.json
fetch("articles.json")
  .then(response => {
    if (!response.ok) {
      throw new Error(`Erreur de chargement : ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    afficherArticles(data.articles);
  })
  .catch(error => {
    console.error("Erreur lors du chargement des articles :", error);
    document.getElementById("articles").innerHTML = `
      <p style="color: red;">Impossible de charger les articles. Vérifiez le fichier articles.json.</p>
    `;
  });

function afficherArticles(articles) {
  const container = document.getElementById("articles");
  container.innerHTML = "";

  if (!articles || articles.length === 0) {
    container.innerHTML = "<p>Aucune actualité trouvée pour le moment.</p>";
    return;
  }

  articles.forEach(article => {
    const card = document.createElement("div");
    card.className = "article-card";

    card.innerHTML = `
      <img src="${article.image}" alt="${article.title}">
      <h3>${article.title}</h3>
      <p>${article.description}</p>
      <a href="${article.url}" target="_blank">Lire plus</a>
      <small>Source : ${article.source.name}</small>
    `;

    container.appendChild(card);
  });
}

let articles = [];

(async () => {
  const apiArticles = await fetchArticlesFromAPI();
  articles = [...manualArticles, ...apiArticles];
  displayArticles();
})();
 // Tous les articles (API + manuels)
let visibleCount = 10;

// 🔗 Charger les articles depuis l’API
async function fetchArticlesFromAPI() {
  try {
    const response = await fetch('https://api.exemple.com/articles'); // remplace par ton vrai lien
    const data = await response.json();
    return data.articles;
  } catch (error) {
    console.error('Erreur API :', error);
    return [];
  }
}

// 📝 Articles ajoutés manuellement
const manualArticles = [
  { title: "Santé féminine en RDC", content: "Les défis et les solutions locales..." },
  { title: "Éducation rurale", content: "Les écoles communautaires en action..." },
  // Ajoute ici tes articles manuels
];

// 🧩 Afficher les articles
function stripHTML(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const articlesContainer = document.getElementById('articlesContainer');

  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const query = searchInput.value.trim().toLowerCase();

    if (query === '') {
      displayArticles(); // Réaffiche tous les articles si la recherche est vide
      return;
    }

    const filteredArticles = articles.filter(article => {
      const cleanTitle = stripHTML(article.title).toLowerCase();
      const cleanContent = stripHTML(article.content).toLowerCase();
      return cleanTitle.includes(query) || cleanContent.includes(query);
    });

    articlesContainer.innerHTML = '';

    if (filteredArticles.length === 0) {
      articlesContainer.innerHTML = '<p>Aucun article trouvé.</p>';
    } else {
      filteredArticles.forEach(article => {
        const div = document.createElement('div');
        div.className = 'article';
        div.innerHTML = `<h2>${article.title}</h2><p>${article.content}</p>`;
        articlesContainer.appendChild(div);
      });
    }
  });
});


// 🔄 Scroll infini
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    visibleCount += 5;
    displayArticles();
  }
});

// 🚀 Initialisation
(async () => {
  const apiArticles = await fetchArticlesFromAPI();
  articles = [...manualArticles, ...apiArticles];
  displayArticles();
})();
