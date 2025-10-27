let articles = [];
let visibleCount = 10;

// 🔧 Nettoyer le HTML
function stripHTML(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

// 🔗 Charger les articles depuis l’API
async function fetchArticlesFromAPI() {
  try {
    const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://actualite.cd/rss.xml');
    const data = await response.json();
    return data.items.map(item => ({
      title: stripHTML(item.title),
      content: stripHTML(item.description)
    }));
  } catch (error) {
    console.error('Erreur API :', error);
    return [];
  }
}

// 📝 Articles manuels
const manualArticles = [
  { title: "Santé féminine en RDC", content: "Les défis et les solutions locales..." },
  { title: "Éducation rurale", content: "Les écoles communautaires en action..." },
  // Ajoute ici tes articles manuels
];

// 🧩 Afficher les articles
function displayArticles() {
  const container = document.getElementById('articlesContainer');
  container.innerHTML = '';

  articles.slice(0, visibleCount).forEach(article => {
    const div = document.createElement('div');
    div.className = 'article';
    div.innerHTML = `<h2>${article.title}</h2><p>${article.content}</p>`;
    container.appendChild(div);
  });
}

// 🔍 Recherche
function setupSearch() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const container = document.getElementById('articlesContainer');

  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();

    if (query === '') {
      visibleCount = 10;
      displayArticles();
      return;
    }

    const filtered = articles.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.content.toLowerCase().includes(query)
    );

    container.innerHTML = '';

    if (filtered.length === 0) {
      container.innerHTML = '<p>Aucun article trouvé.</p>';
    } else {
      filtered.forEach(article => {
        const div = document.createElement('div');
        div.className = 'article';
        div.innerHTML = `<h2>${article.title}</h2><p>${article.content}</p>`;
        container.appendChild(div);
      });
    }
  });
}

// 🔄 Scroll infini
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    visibleCount += 5;
    displayArticles();
  }
});

// 🚀 Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  const apiArticles = await fetchArticlesFromAPI();
  articles = [...manualArticles, ...apiArticles];
  displayArticles();
  setupSearch();
});
