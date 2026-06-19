(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeHero = 0;

  function showHero(index) {
    if (!heroSlides.length) {
      return;
    }

    activeHero = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeHero);
    });

    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeHero);
    });
  }

  heroDots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHero(index);
    });
  });

  if (heroSlides.length > 1) {
    setInterval(function () {
      showHero(activeHero + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterRegion = document.querySelector('[data-filter-region]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    var keyword = normalize(filterInput && filterInput.value);
    var year = filterYear ? filterYear.value : '';
    var region = filterRegion ? filterRegion.value : '';

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year')
      ].join(' '));
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !year || card.getAttribute('data-year') === year;
      var matchRegion = !region || card.getAttribute('data-region') === region;
      card.style.display = matchKeyword && matchYear && matchRegion ? '' : 'none';
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', filterCards);
  }

  if (filterYear) {
    filterYear.addEventListener('change', filterCards);
  }

  if (filterRegion) {
    filterRegion.addEventListener('change', filterCards);
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  if (query && filterInput) {
    filterInput.value = query;
    filterCards();
  }
})();
