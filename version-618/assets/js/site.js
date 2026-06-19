(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }

    callback();
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
        startTimer();
      });
    });

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  function uniqueSorted(values) {
    return values
      .filter(Boolean)
      .filter(function (value, index, array) {
        return array.indexOf(value) === index;
      })
      .sort(function (a, b) {
        var numberA = Number(a);
        var numberB = Number(b);

        if (!Number.isNaN(numberA) && !Number.isNaN(numberB)) {
          return numberB - numberA;
        }

        return String(a).localeCompare(String(b), 'zh-CN');
      });
  }

  function populateSelect(select, values) {
    if (!select) {
      return;
    }

    uniqueSorted(values).forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    scopes.forEach(function (scope) {
      var section = scope.closest('section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]'));
      var search = scope.querySelector('[data-movie-search]');
      var yearFilter = scope.querySelector('[data-year-filter]');
      var typeFilter = scope.querySelector('[data-type-filter]');
      var categoryFilter = scope.querySelector('[data-category-filter]');
      var count = scope.querySelector('[data-result-count]');

      populateSelect(yearFilter, cards.map(function (card) {
        return card.getAttribute('data-year');
      }));

      populateSelect(typeFilter, cards.map(function (card) {
        return card.getAttribute('data-type');
      }));

      function update() {
        var keyword = search ? search.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var type = typeFilter ? typeFilter.value : '';
        var category = categoryFilter ? categoryFilter.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var cardCategory = card.getAttribute('data-category') || '';
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          if (type && cardType !== type) {
            matched = false;
          }

          if (category && cardCategory !== category) {
            matched = false;
          }

          card.classList.toggle('hidden-card', !matched);

          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
        }
      }

      [search, yearFilter, typeFilter, categoryFilter].forEach(function (control) {
        if (control) {
          control.addEventListener('input', update);
          control.addEventListener('change', update);
        }
      });

      update();
    });
  }

  function initVideoPlayers() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-play-video]'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var shell = button.closest('[data-video-shell]');
        var video = shell ? shell.querySelector('video') : null;
        var message = shell ? shell.querySelector('[data-player-message]') : null;
        var source = button.getAttribute('data-video-src');

        if (!video || !source) {
          if (message) {
            message.textContent = '当前播放源暂不可用。';
          }
          return;
        }

        button.classList.add('hidden');

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo(video, message);
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && message) {
              message.textContent = '播放源加载失败，请稍后重试。';
            }
          });
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          playVideo(video, message);
          return;
        }

        if (message) {
          message.textContent = '当前浏览器需要 HLS 支持后播放。';
        }
      });
    });
  }

  function playVideo(video, message) {
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (message) {
          message.textContent = '请点击播放器上的播放按钮继续。';
        }
      });
    }
  }

  ready(function () {
    initNavigation();
    initHeroCarousel();
    initFilters();
    initVideoPlayers();
  });
})();
