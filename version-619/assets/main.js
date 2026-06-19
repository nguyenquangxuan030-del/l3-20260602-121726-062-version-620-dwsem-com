(function () {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-nav]');
    if (button && nav) {
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var search = document.querySelector('[data-card-search]');
    var list = document.querySelector('[data-card-list]');
    if (search && list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        search.addEventListener('input', function () {
            var keyword = search.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-year')).toLowerCase();
                card.style.display = haystack.indexOf(keyword) === -1 ? 'none' : '';
            });
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer;

        function setSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }

        function restart() {
            window.clearInterval(timer);
            start();
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                setSlide(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(current + 1);
                restart();
            });
        }

        start();
    }
}());
