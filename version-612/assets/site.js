(function() {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var nav = document.getElementById("site-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function() {
      nav.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    restart();
  }

  var form = document.getElementById("movie-search-form");
  var input = document.getElementById("movie-search-input");
  var results = document.getElementById("search-results");
  var title = document.getElementById("search-title");
  var subtitle = document.getElementById("search-subtitle");

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function(tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<article class="movie-card grid">" +
      "<a class="poster-wrap" href="" + escapeHtml(movie.url) + "">" +
      "<img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">" +
      "<span class="poster-badge">" + escapeHtml(movie.year) + "</span>" +
      "</a>" +
      "<div class="card-body">" +
      "<a class="card-title" href="" + escapeHtml(movie.url) + "">" + escapeHtml(movie.title) + "</a>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class="card-meta"><a href="" + escapeHtml(movie.categoryUrl) + "">" + escapeHtml(movie.categoryName) + "</a><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<div class="tag-row">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function runSearch(value) {
    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var query = String(value || "").trim().toLowerCase();
    if (!query) {
      return;
    }
    var words = query.split(/\s+/).filter(Boolean);
    var matched = window.MOVIE_SEARCH_INDEX.filter(function(movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        movie.categoryName,
        (movie.tags || []).join(" ")
      ].join(" ").toLowerCase();
      return words.every(function(word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);

    if (title) {
      title.textContent = "搜索结果";
    }
    if (subtitle) {
      subtitle.textContent = matched.length ? "已为你整理匹配影片。" : "没有匹配影片，可以尝试更换关键词。";
    }
    results.innerHTML = matched.map(renderCard).join("");
  }

  if (form && input && results) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (initialQuery) {
      input.value = initialQuery;
      runSearch(initialQuery);
    }

    form.addEventListener("submit", function(event) {
      event.preventDefault();
      runSearch(input.value);
      var nextUrl = window.location.pathname + "?q=" + encodeURIComponent(input.value.trim());
      window.history.replaceState(null, "", nextUrl);
    });

    input.addEventListener("input", function() {
      if (input.value.trim().length >= 2) {
        runSearch(input.value);
      }
    });
  }
}());
