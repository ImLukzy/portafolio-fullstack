document.getElementById("year").textContent = new Date().getFullYear();

var burger = document.getElementById("burger");
var menu = document.getElementById("menu");
burger.addEventListener("click", function () {
  menu.classList.toggle("open");
});

var TABS = ["inicio", "perfil", "proyectos", "habilidades", "contacto"];

function paintTab(id) {
  document.querySelectorAll("main>section").forEach(function (s) {
    s.classList.toggle("active", s.id === id);
  });
  document.querySelectorAll(".top nav a, .side a").forEach(function (a) {
    a.classList.toggle("active", a.getAttribute("href") === "#" + id);
  });
  menu.classList.remove("open");
  var sec = document.getElementById(id);
  if (sec) {
    sec.querySelectorAll(".card").forEach(function (c) { c.classList.add("visible"); });
    sec.querySelectorAll(".ring").forEach(function (r) {
      r.style.setProperty("--p", r.getAttribute("data-p"));
    });
  }
}

function currentTab() {
  var h = (location.hash || "#inicio").replace("#", "");
  return TABS.indexOf(h) !== -1 ? h : "inicio";
}

document.addEventListener("click", function (e) {
  var a = e.target.closest('a[href^="#"]');
  if (!a) return;
  var id = a.getAttribute("href").replace("#", "");
  if (TABS.indexOf(id) === -1) return;
  e.preventDefault();
  if (currentTab() === id) {
    paintTab(id);
  } else {
    location.hash = id;
  }
});

window.addEventListener("hashchange", function () {
  paintTab(currentTab());
});

paintTab(currentTab());

var chips = document.querySelectorAll(".chip");
var cards = document.querySelectorAll("#proyectos .card");
chips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    chips.forEach(function (c) { c.classList.remove("active"); });
    chip.classList.add("active");
    var f = chip.getAttribute("data-filter");
    cards.forEach(function (card) {
      var cats = (card.getAttribute("data-cat") || "").split(" ");
      var show = (f === "all" || cats.indexOf(f) !== -1);
      card.style.display = show ? "" : "none";
      if (show) card.classList.add("visible");
    });
  });
});
