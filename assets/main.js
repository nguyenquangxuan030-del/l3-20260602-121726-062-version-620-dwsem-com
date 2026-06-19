(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    start();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterCategory = document.querySelector('[data-filter-category]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterList = document.querySelector('[data-filter-list]');
  var emptyState = document.querySelector('[data-filter-empty]');

  if (filterList && (filterInput || filterCategory || filterYear)) {
    var items = Array.prototype.slice.call(filterList.querySelectorAll('.movie-filter-item'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalize(filterInput ? filterInput.value : '');
      var category = normalize(filterCategory ? filterCategory.value : '');
      var year = normalize(filterYear ? filterYear.value : '');
      var visible = 0;

      items.forEach(function (item) {
        var title = normalize(item.getAttribute('data-title'));
        var itemCategory = normalize(item.getAttribute('data-category'));
        var itemYear = normalize(item.getAttribute('data-year'));
        var tags = normalize(item.getAttribute('data-tags'));
        var text = title + ' ' + itemCategory + ' ' + itemYear + ' ' + tags;
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }

        if (category && itemCategory !== category) {
          matched = false;
        }

        if (year && itemYear !== year) {
          matched = false;
        }

        item.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('visible', visible === 0);
      }
    }

    [filterInput, filterCategory, filterYear].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('.player-card'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.play-overlay');
    var stream = player.getAttribute('data-stream');
    var attached = false;
    var hls = null;

    function attachStream() {
      if (!video || !stream || attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function beginPlay() {
      if (!video) {
        return;
      }

      attachStream();
      video.setAttribute('controls', 'controls');

      var playResult = video.play();

      if (overlay) {
        overlay.classList.add('hidden');
      }

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          if (overlay) {
            overlay.classList.remove('hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', beginPlay);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          beginPlay();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
