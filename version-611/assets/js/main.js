(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var quickSearch = document.querySelector('[data-quick-search]');
  if (quickSearch) {
    quickSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = quickSearch.querySelector('input');
      var value = input ? input.value.trim() : '';
      var target = quickSearch.getAttribute('data-target') || 'search.html';
      if (value) {
        window.location.href = target + '?q=' + encodeURIComponent(value);
      } else {
        window.location.href = target;
      }
    });
  }

  var searchGrid = document.querySelector('[data-search-grid]');
  if (searchGrid) {
    var input = document.querySelector('[data-search-input]');
    var category = document.querySelector('[data-search-category]');
    var year = document.querySelector('[data-search-year]');
    var note = document.querySelector('[data-result-note]');
    var cards = Array.prototype.slice.call(searchGrid.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    var filter = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var categoryValue = category ? category.value : '';
      var yearValue = year ? year.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-category') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
        var okYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var ok = okKeyword && okCategory && okYear;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });

      if (note) {
        note.textContent = '共找到 ' + shown + ' 部影片';
      }
    };

    [input, category, year].forEach(function (el) {
      if (el) {
        el.addEventListener('input', filter);
        el.addEventListener('change', filter);
      }
    });

    filter();
  }
})();
