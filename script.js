// 🔑 Clé API GNews
const apiKey = "303c134551af698a9165e9a6bff6bcb1";

// 🔍 Requête ciblée sur la RDC
const query = "RDC OR Congo";
const endpoint = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=fr&max=10&token=${apiKey}`;

// 📡 Récupération des actualités
fetch(endpoint)
  .then(response => response.json())
  .then(data => {
    console.log("Réponse API :", data); // Vérification dans la console
    afficherArticles(data.articles);    // Affichage dans le site
  })
  .catch(error => {
    console.error("Erreur lors de la récupération :", error);
    document.getElementById("articles").innerHTML = `
      <p style="color: red;">Impossible de charger les actualités. Vérifie ta connexion ou ta clé API.</p>
    `;
  });

// 🧱 Fonction d’affichage des articles
function afficherArticles(articles) {
  const container = document.getElementById("articles");
  container.innerHTML = ""; // Nettoyage

  if (!articles || articles.length === 0) {
    container.innerHTML = `<p>Aucune actualité trouvée pour le moment.</p>`;
    return;
  }

  articles.forEach(article => {
    const div = document.createElement("div");
    div.className = "article";
    div.innerHTML = `
      <h3>${article.title}</h3>
      <p>${article.description || "Pas de description disponible."}</p>
      <a href="${article.url}" target="_blank">Lire l’article</a>
    `;
    container.appendChild(div);
  });
}

// 🌙 Mode clair/sombre
document.getElementById("toggle-theme").onclick = () => {
  document.body.classList.toggle("dark");
};
