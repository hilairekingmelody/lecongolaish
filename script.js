let articles = [];
let isSearching = false;
let visibleCount = Infinity; // ✅ affiche tous les articles
const step = 6;       // nombre d’articles à ajouter à chaque clic


// 🔧 Nettoyer le HTML
function stripHTML(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

// 🔗 Charger les articles depuis Actualite.CD
async function fetchActualiteArticles() {
  try {
    const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://actualite.cd/rss.xml');
    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) return [];

    return data.items.map(item => ({
      title: item.title,
      description: stripHTML(item.description),
      url: item.link,
      image: extractImageFromHTML(item.description), // ✅ extrait l’image depuis le HTML
      source: { name: "Actualite.cd" }
    }));
  } catch (error) {
    console.error("Erreur Actualite.CD :", error);
    return [];
  }
}
function extractImageFromHTML(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const img = tempDiv.querySelector('img');
  return img ? img.src : 'images/default.jpg';
}

// 🔗 Charger tes articles depuis articles.json
async function fetchLocalArticles() {
  try {
    const response = await fetch('articles.json');
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error("Erreur articles.json :", error);
    return [];
  }
}

// 🧩 Afficher les articles
function displayArticles() {
  const container = document.getElementById('articlesContainer');
  container.innerHTML = '';

  const toDisplay = articles.slice(0, visibleCount);
  if (toDisplay.length === 0) {
    container.innerHTML = '<p>Aucun article à afficher.</p>';
    return;
  }

  toDisplay.forEach(article => {
    const div = document.createElement('div');
    div.className = 'article';
    div.innerHTML = `
      <img src="${article.image}" alt="${article.title}">
      <h2>${article.title}</h2>
      <p>${article.description}</p>
      <small>Source : ${article.source.name}</small>
      <div class="copy-link">
        <button onclick="copyToClipboard('${article.url}')">🔗 Copier le lien</button>
      </div>
    `;
    container.appendChild(div);
  });

 const loadMoreBtn = document.getElementById('loadMoreBtn');
if (isSearching || visibleCount >= articles.length) {
  loadMoreBtn.style.display = 'none';
} else {
  loadMoreBtn.style.display = 'inline-block';
}
}

// 🔍 Barre de recherche
function setupSearch() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const container = document.getElementById('articlesContainer');

  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();

    if (query === '') {
      isSearching = false;
      visibleCount = 6;
      displayArticles();
      return;
    }

    isSearching = true;
    const filtered = articles.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.description.toLowerCase().includes(query)
    );

    container.innerHTML = '';

    if (filtered.length === 0) {
      container.innerHTML = '<p>Aucun article trouvé.</p>';
    } else {
      filtered.forEach(article => {
        const div = document.createElement('div');
        div.className = 'article';
        div.innerHTML = `
          <img src="${article.image}" alt="${article.title}">
          <h2>${article.title}</h2>
          <p>${article.description}</p>
          <a href="${article.url}" target="_blank">Lire plus</a>
          <small>Source : ${article.source.name}</small>
        `;
        container.appendChild(div);
      });
    }

    // ✅ Cacher le bouton "Voir plus" pendant la recherche
    document.getElementById('loadMoreBtn').style.display = 'none';
  });
}

// 🔄 Scroll infini
//window.addEventListener('scroll', () => {
//if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
//visibleCount += 5;
//displayArticles();
//}
//});

// 🚀 Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  const localArticles = await fetchLocalArticles();
  const actualiteArticles = await fetchActualiteArticles();
  articles = [...localArticles, ...actualiteArticles];

  console.log("Articles chargés :", articles); // ✅ vérifie ici

  displayArticles();
  setupSearch();
  setupArticleForm();

document.getElementById('loadMoreBtn').addEventListener('click', () => {
  visibleCount += step;
  displayArticles();
});
});

function copyToClipboard(text) {
  if (!navigator.clipboard) {
    // Fallback pour anciens navigateurs
    const tempInput = document.createElement("input");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    alert("Lien copié !");
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert("Lien copié !");
    }).catch(err => {
      console.error("Erreur de copie :", err);
      alert("Impossible de copier le lien.");
    });
  }
}

