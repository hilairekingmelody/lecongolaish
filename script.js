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
