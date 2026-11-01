// MEDD — page Actualités
// Affiche, mélangées par date (la plus récente en premier) :
//  1. les actualités publiées depuis l'espace Communication de l'application MEDD
//     (lecture seule, clé publique, uniquement celles au statut « publiée ») ;
//  2. les actualités de content/actualites.json (modifiable via Pages CMS).
// Si la lecture de l'application échoue, la page affiche seulement le fichier JSON.
// Mêmes balises et mêmes classes CSS que la version écrite en dur.
// Sécurité : aucun innerHTML — tout le texte saisi est inséré comme texte brut.
// Mise en forme autorisée dans "texte" : ligne vide = nouveau paragraphe,
// ligne commençant par "- " = puce, **texte** = gras, retour à la ligne simple = saut de ligne.

(function () {
  "use strict";

  var list = document.getElementById("news-list");
  if (!list) return;

  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
    "août", "septembre", "octobre", "novembre", "décembre"];

  function str(v) {
    return typeof v === "string" ? v.trim() : "";
  }

  var SB = "https://ekibvnhohngfxzorzqgt.supabase.co";
  // Clé publique (anon) du projet : conçue pour être visible côté navigateur.
  var KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraWJ2bmhvaG5nZnh6b3J6cWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwODg4MDQsImV4cCI6MjA5NTY2NDgwNH0.QITDFpA20wrh5A6mQpEbI-PB_ZiYUSJ3dYlvy0xPtdY";
  var PHOTOS_PREFIX = SB + "/storage/v1/object/public/actualites/";

  // N'accepte que des chemins internes au site (ex. /assets/images/actualites/photo.jpg)
  // ou une photo du dossier public « actualites » de l'application.
  function safeSrc(v) {
    var s = str(v);
    if (/[\s"'<>]/.test(s)) return "";
    if (/^\/[^\/]/.test(s)) return s;
    if (s.indexOf(PHOTOS_PREFIX) === 0 && /^[A-Za-z0-9._\/-]+$/.test(s.slice(PHOTOS_PREFIX.length))) return s;
    return "";
  }

  // Identifiant YouTube valide (11 caractères) ou chaîne vide
  function ytId(v) {
    var s = str(v);
    return /^[A-Za-z0-9_-]{11}$/.test(s) ? s : "";
  }

  function dateFr(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(str(iso));
    if (!m) return "";
    var mois = MOIS[parseInt(m[2], 10) - 1];
    return mois ? parseInt(m[3], 10) + " " + mois + " " + m[1] : "";
  }

  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  // Ajoute du texte en convertissant **gras** en <strong>
  function appendInline(parent, text) {
    var parts = text.split(/\*\*(.+?)\*\*/);
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i]) continue;
      if (i % 2 === 1) {
        var b = el("strong");
        b.textContent = parts[i];
        parent.appendChild(b);
      } else {
        parent.appendChild(document.createTextNode(parts[i]));
      }
    }
  }

  function appendLines(parent, lines) {
    lines.forEach(function (line, i) {
      if (i > 0) parent.appendChild(el("br"));
      appendInline(parent, line);
    });
  }

  function renderTexte(body, texte) {
    var blocks = str(texte).replace(/\r\n?/g, "\n").split(/\n\s*\n/);
    blocks.forEach(function (block) {
      var lines = block.split("\n").map(function (l) { return l.trim(); })
        .filter(function (l) { return l; });
      var para = [], ul = null;
      function flushPara() {
        if (!para.length) return;
        var p = el("p");
        appendLines(p, para);
        body.appendChild(p);
        para = [];
      }
      lines.forEach(function (line) {
        if (/^- /.test(line)) {
          flushPara();
          if (!ul) {
            ul = el("ul", "list-plain");
            ul.style.marginTop = "0.75rem";
            body.appendChild(ul);
          }
          var li = el("li");
          appendInline(li, line.slice(2).trim());
          ul.appendChild(li);
        } else {
          ul = null;
          para.push(line);
        }
      });
      flushPara();
    });
  }

  function renderItem(it) {
    var titre = str(it.titre);
    if (!titre) return null; // entrée incomplète : ignorée plutôt que de casser la page

    var galerie = Array.isArray(it.galerie) ? it.galerie.filter(function (g) {
      return g && safeSrc(g.image);
    }) : [];

    var art = el("article", galerie.length ? "news-card news-card-gallery" : "news-card");

    var src = safeSrc(it.image);
    if (src) {
      var img = el("img");
      img.src = src;
      img.alt = str(it.image_alt) || titre;
      art.appendChild(img);
    }

    var body = el("div", "news-card-body");
    var mention = str(it.mention) || dateFr(it.date);
    if (mention) {
      var d = el("span", "news-date");
      d.textContent = mention;
      body.appendChild(d);
    }
    var h2 = el("h2");
    h2.textContent = titre;
    body.appendChild(h2);
    renderTexte(body, it.texte);
    var sig = str(it.signature);
    if (sig) {
      var ps = el("p");
      ps.style.marginTop = "0.75rem";
      ps.style.fontSize = "0.85rem";
      appendInline(ps, sig);
      body.appendChild(ps);
    }
    art.appendChild(body);

    if (galerie.length) {
      var grid = el("div", "news-gallery-grid");
      galerie.forEach(function (g) {
        var gi = el("img", g.en_avant === true ? "featured" : "");
        gi.src = safeSrc(g.image);
        gi.alt = str(g.description) || titre;
        grid.appendChild(gi);
      });
      art.appendChild(grid);
    }

    var videos = Array.isArray(it.videos) ? it.videos.map(ytId).filter(Boolean) : [];
    if (videos.length) {
      var vwrap = el("div", "news-videos");
      videos.forEach(function (id) {
        var box = el("div", "news-video");
        var fr = el("iframe");
        fr.src = "https://www.youtube-nocookie.com/embed/" + id;
        fr.title = "Vidéo : " + titre;
        fr.loading = "lazy";
        fr.setAttribute("allow", "accelerometer; encrypted-media; gyroscope; picture-in-picture");
        fr.setAttribute("allowfullscreen", "");
        fr.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        box.appendChild(fr);
        vwrap.appendChild(box);
        var lien = el("a", "news-video-link");
        lien.href = "https://www.youtube.com/watch?v=" + id;
        lien.target = "_blank";
        lien.rel = "noopener noreferrer";
        lien.textContent = "Voir la vidéo sur YouTube ↗";
        vwrap.appendChild(lien);
      });
      art.appendChild(vwrap);
    }
    return art;
  }

  // Convertit une actualité de l'application en entrée au format du fichier JSON
  function depuisApp(a) {
    a = a || {};
    var ph = (Array.isArray(a.photos) ? a.photos : []).map(function (p) {
      return p && safeSrc(p.url) ? safeSrc(p.url) : "";
    }).filter(Boolean);
    var it = {
      titre: a.titre, date: a.date_pub, texte: a.contenu,
      image: "", image_alt: "", signature: "", galerie: [],
      videos: (Array.isArray(a.videos) ? a.videos : []).map(function (v) { return v && v.id; })
    };
    if (ph.length === 1) { it.image = ph[0]; }
    else { it.galerie = ph.map(function (u) { return { image: u }; }); }
    return it;
  }

  function chargerApp() {
    var url = SB + "/rest/v1/actualites?select=id,titre,contenu,date_pub,photos,videos"
      + "&statut=eq.publiee&order=date_pub.desc,id.desc&limit=100";
    return fetch(url, { headers: { "apikey": KEY, "Authorization": "Bearer " + KEY } })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (d) { return Array.isArray(d) ? d.map(depuisApp) : []; })
      .catch(function () { return []; });
  }

  function chargerJson() {
    return fetch("/content/actualites.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (d) { if (!Array.isArray(d)) throw new Error("format inattendu"); return d; });
  }

  function showMessage(text) {
    list.textContent = "";
    var p = el("p");
    p.textContent = text;
    list.appendChild(p);
  }

  Promise.all([chargerApp(), chargerJson().catch(function () { return null; })])
    .then(function (res) {
      var app = res[0], json = res[1];
      if (json === null && !app.length) throw new Error("rien à afficher");
      var data = app.concat(json || []);
      // Plus récente en premier ; à date égale, l'ordre est conservé (tri stable)
      var items = data.map(function (it, i) { return { it: it || {}, i: i }; });
      items.sort(function (a, b) {
        var da = str(a.it.date), db = str(b.it.date);
        if (da !== db) return da < db ? 1 : -1;
        return a.i - b.i;
      });
      list.textContent = "";
      var n = 0;
      items.forEach(function (x) {
        var art = renderItem(x.it);
        if (art) { list.appendChild(art); n++; }
      });
      if (!n) showMessage("Aucune actualité pour le moment.");
    })
    .catch(function () {
      showMessage("Les actualités n'ont pas pu être chargées. Veuillez actualiser la page ou réessayer plus tard.");
    });
})();
