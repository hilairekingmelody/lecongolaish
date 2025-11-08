let adminKey = null;
let currentLimit = 5;

document.addEventListener('DOMContentLoaded', () => {
  setupArticleForm();
  setupSearchBar();
  setupSidebar();
  loadArticles();
  document.getElementById('loadMoreBtn').onclick = () => {
    currentLimit += 5;
    loadArticles();
  };
});

function askAdminKey() {
  if (!adminKey) {
    adminKey = prompt("🔐 Entrez votre mot de passe admin :");
  }
}

async function deleteArticle(title) {
  askAdminKey();
  if (!adminKey) return;

  try {
    const res = await fetch(`${window.location.origin}/articles/${encodeURIComponent(title)}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': adminKey }
    });
    const result = await res.json();
    alert(result.message);
    loadArticles();
  } catch (error) {
    console.error("❌ Erreur suppression :", error);
    alert("❌ Impossible de supprimer l’article.");
  }
}

function copyLink(url) {
  navigator.clipboard.writeText(url)
    .then(() => alert("📋 Lien copié !"))
    .catch(() => alert("❌ Échec copie"));
}

async function loadArticles() {
  const query = document.getElementById('searchInput')?.value || '';
  try {
    const res = await fetch(`${window.location.origin}/articles?q=${encodeURIComponent(query)}&limit=${currentLimit}`);
    const data = await res.json();

    const container = document.getElementById('articlesList');
    container.innerHTML = '';

    data.forEach(article => {
      const div = document.createElement('div');
      div.className = "article-card";

      const img = document.createElement('img');
      img.src = article.image;
      img.alt = article.title;

      const title = document.createElement('h3');
      title.textContent = article.title;

      const desc = document.createElement('p');
      desc.textContent = article.description;

      const link = document.createElement('a');
      link.href = article.url;
      link.target = "_blank";
      link.textContent = "🔗 Lire l'article";
      link.onclick = () => {
        fetch(`${window.location.origin}/articles/${encodeURIComponent(article.title)}/view`, { method: 'POST' });
      };

      const date = document.createElement('small');
      date.textContent = `🕓 Publié le ${new Date(article.publishedAt).toLocaleDateString()}`;

      const btns = document.createElement('div');
      btns.style.display = "flex";
      btns.style.gap = "10px";

      const copyBtn = document.createElement('button');
      copyBtn.textContent = "📋 Copier le lien";
      copyBtn.onclick = () => copyLink(article.url);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = "🗑️ Supprimer";
      deleteBtn.onclick = () => deleteArticle(article.title);

      btns.appendChild(copyBtn);
      btns.appendChild(deleteBtn);

      div.appendChild(img);
      div.appendChild(title);
      div.appendChild(desc);
      div.appendChild(link);
      div.appendChild(date);
      div.appendChild(btns);

      container.appendChild(div);
    });
  } catch (error) {
    console.error("❌ Erreur chargement articles :", error);
    alert("❌ Impossible de charger les articles.");
  }
}

function setupSearchBar() {
  const input = document.getElementById('searchInput');
  if (input) {
    input.oninput = () => {
      currentLimit = 5;
      loadArticles();
    };
  }
}

function setupSidebar() {
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('menuOverlay');

  if (toggle && sidebar && overlay) {
    toggle.onclick = () => {
      sidebar.classList.add('open');
      overlay.classList.add('active');
    };

    overlay.onclick = () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    };

    document.querySelectorAll('#sidebar a').forEach(link => {
      link.onclick = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      };
    });
  }
}

function setupArticleForm() {
  const form = document.getElementById('articleForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();

      const title = form.title.value.trim();
      const description = form.description.value.trim();
      const url = form.url.value.trim();
      const imageFile = form.imageFile?.files[0];
      const key = form.key?.value.trim();

      if (!title || !description || !url || !key) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
      }

      const sendArticle = async (imageData) => {
        const article = {
          title,
          description,
          url,
          image: imageData || "https://via.placeholder.com/300x180",
          source: "Le Congolais CD",
          key
        };

        try {
          const res = await fetch(`${window.location.origin}/articles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(article)
          });

          const result = await res.json();
          alert(result.message || "✅ Article publié !");
          form.reset();
          loadArticles();
        } catch (error) {
          console.error("❌ Erreur publication :", error);
          alert("❌ Impossible de publier l’article.");
        }
      };

      if (imageFile) {
        const reader = new FileReader();
        reader.onload = () => sendArticle(reader.result);
        reader.readAsDataURL(imageFile);
      } else {
        sendArticle(null);
      }
    };
  }
}

async function showDashboard() {
  try {
    const res = await fetch(`${window.location.origin}/articles`);
    const data = await res.json();

    const dash = document.getElementById('dashboard');
    if (!dash) return;

    dash.style.display = 'block';
    dash.innerHTML = `
      <h2>📊 Statistiques</h2>
      <p>Total d’articles : ${data.length}</p>
      <ul>
        ${data.map(a => `
          <li>
            <strong>${a.title}</strong><br>
            🕒 ${new Date(a.publishedAt).toLocaleDateString()}<br>
            👁️ ${a.views || 0} vues
          </li>
        `).join('')}
      </ul>
    `;
  } catch (error) {
    console.error("❌ Erreur dashboard :", error);
  }
}
