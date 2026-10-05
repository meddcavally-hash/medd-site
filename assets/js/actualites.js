// MEDD — page Actualités
// Lit content/actualites.json (modifiable via Pages CMS) et affiche les cartes
// avec exactement les mêmes balises et classes CSS que la version écrite en dur.
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

  // N'accepte que des chemins internes au site (ex. /assets/images/actualites/photo.jpg)
  function safeSrc(v) {
    var s = str(v);
    return /^\/[^\/]/.test(s) && !/[\s"'<>]/.test(s) ? s : "";
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
    return art;
  }

  function showMessage(text) {
    list.textContent = "";
    var p = el("p");
    p.textContent = text;
    list.appendChild(p);
  }

  fetch("/content/actualites.json", { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      if (!Array.isArray(data)) throw new Error("format inattendu");
      // Plus récente en premier ; à date égale, l'ordre du fichier est conservé (tri stable)
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
