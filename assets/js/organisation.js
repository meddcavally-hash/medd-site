// MEDD — page Organisation : listes des Secrétaires Généraux (régionaux, lycées et
// collèges, CAFOP, IEPP) lues automatiquement dans le registre des responsables
// de l'application MEDD (fonction publique responsables_publics : responsables
// actifs uniquement, sans matricule). Même balises et mêmes classes CSS que les
// listes écrites en dur dans organisation.html, qui restent affichées si la
// lecture échoue ou renvoie une liste vide pour une catégorie.
// Sécurité : aucun innerHTML — tout le texte reçu est inséré comme texte brut.

(function () {
  "use strict";

  var URL_RPC = "https://ekibvnhohngfxzorzqgt.supabase.co/rest/v1/rpc/responsables_publics";
  // Clé publique (anon) du projet : conçue pour être visible côté navigateur.
  var KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraWJ2bmhvaG5nZnh6b3J6cWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwODg4MDQsImV4cCI6MjA5NTY2NDgwNH0.QITDFpA20wrh5A6mQpEbI-PB_ZiYUSJ3dYlvy0xPtdY";
  var WA = "?text=Bonjour%2C%20je%20vous%20contacte%20depuis%20le%20site%20du%20MEDD%20%28www.medd.ci%29.";

  var CATS = {
    regional: { sel: '[data-roster="regional"]', h2: "regionaux" },
    lycee: { sel: '[data-roster="lycee"]', h2: "lycees" },
    cafop: { sel: '[data-roster="cafop"]', h2: "cafop" },
    iepp: { sel: '[data-roster="iepp"]', h2: "iepp" }
  };

  function str(v) {
    return typeof v === "string" ? v.trim() : "";
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function fmtTel(n) {
    return n.replace(/(\d\d)(?=\d)/g, "$1 ");
  }

  // Numéros valides : 10 chiffres ; plusieurs numéros séparés par « / ».
  function numeros(tel) {
    return str(tel).split("/").map(function (x) { return x.replace(/[\s.]/g, ""); })
      .filter(function (x) { return /^\d{10}$/.test(x); });
  }

  function telSpan(nums) {
    var span = el("span", "roster-tel");
    nums.forEach(function (n, i) {
      if (i > 0) span.appendChild(document.createTextNode(" · "));
      var a = el("a", "", fmtTel(n));
      a.href = "tel:+225" + n;
      span.appendChild(a);
      var w = el("a", "roster-wa", "WhatsApp");
      w.href = "https://wa.me/225" + n + WA;
      w.target = "_blank";
      w.rel = "noopener";
      w.setAttribute("aria-label", "Contacter par WhatsApp");
      span.appendChild(w);
    });
    return span;
  }

  function item(r) {
    var li = el("li");
    li.appendChild(el("strong", "", str(r.nom)));
    var terr = str(r.territoire);
    li.appendChild(document.createTextNode(" — " + str(r.poste) + (terr ? " " : "")));
    if (terr) li.appendChild(el("span", "roster-region", terr));
    var nums = numeros(r.tel);
    if (nums.length) li.appendChild(telSpan(nums));
    return li;
  }

  function valid(r) {
    return r && str(r.nom) && str(r.poste);
  }

  function setCount(h2id, n) {
    var h = document.getElementById(h2id);
    if (!h) return;
    h.textContent = h.textContent.replace(/\(\d+\)\s*$/, "(" + n + ")");
  }

  function renderList(box, rows) {
    while (box.firstChild) box.removeChild(box.firstChild);
    rows.forEach(function (r) { box.appendChild(item(r)); });
  }

  function renderIepp(box, rows) {
    var order = [], groups = {};
    rows.forEach(function (r) {
      var g = str(r.groupe) || "Autres";
      if (!groups[g]) { groups[g] = []; order.push(g); }
      groups[g].push(r);
    });
    while (box.firstChild) box.removeChild(box.firstChild);
    order.forEach(function (g) {
      var d = el("details", "iepp-group");
      var s = el("summary", "", g + " ");
      s.appendChild(el("span", "iepp-count", String(groups[g].length)));
      d.appendChild(s);
      var ul = el("ul", "roster-list");
      groups[g].forEach(function (r) { ul.appendChild(item(r)); });
      d.appendChild(ul);
      box.appendChild(d);
    });
  }

  function apply(data) {
    if (!Array.isArray(data)) return;
    Object.keys(CATS).forEach(function (c) {
      var box = document.querySelector(CATS[c].sel);
      if (!box) return;
      var rows = data.filter(function (r) { return r && r.categorie === c && valid(r); });
      if (!rows.length) return; // liste de secours conservée
      if (c === "iepp") renderIepp(box, rows); else renderList(box, rows);
      setCount(CATS[c].h2, rows.length);
    });
  }

  if (!document.querySelector("[data-roster]") || !window.fetch) return;

  fetch(URL_RPC, {
    method: "POST",
    headers: { "apikey": KEY, "Authorization": "Bearer " + KEY, "Content-Type": "application/json" },
    body: "{}"
  }).then(function (r) {
    if (!r.ok) throw new Error("http " + r.status);
    return r.json();
  }).then(apply).catch(function () { /* liste fixe conservée */ });
})();
