(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = qs(".menu-toggle");
        var nav = qs(".mobile-nav");

        if (!button || !nav) {
            return;
        }

        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initBackTop() {
        var button = qs("#backTop");

        if (!button) {
            return;
        }

        window.addEventListener("scroll", function () {
            button.classList.toggle("visible", window.scrollY > 300);
        });

        button.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    function initHero() {
        var slides = qsa(".hero-slide");
        var dots = qsa(".hero-dot");
        var current = 0;

        if (!slides.length) {
            return;
        }

        function show(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });

        show(0);

        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    function initFilters() {
        var input = qs("#movieSearch");
        var category = qs("#categoryFilter");
        var year = qs("#yearFilter");
        var region = qs("#regionFilter");
        var cards = qsa(".filter-card");
        var empty = qs(".empty-result");

        if (!cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");

        if (query && input) {
            input.value = query;
        }

        function matches(card) {
            var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-desc") + " " + card.getAttribute("data-tags"));
            var cardCategory = normalize(card.getAttribute("data-category"));
            var cardYear = normalize(card.getAttribute("data-year"));
            var cardRegion = normalize(card.getAttribute("data-region"));
            var searchValue = input ? normalize(input.value) : "";
            var categoryValue = category ? normalize(category.value) : "";
            var yearValue = year ? normalize(year.value) : "";
            var regionValue = region ? normalize(region.value) : "";

            return (!searchValue || text.indexOf(searchValue) !== -1) &&
                (!categoryValue || cardCategory === categoryValue) &&
                (!yearValue || cardYear === yearValue) &&
                (!regionValue || cardRegion === regionValue);
        }

        function apply() {
            var visible = 0;

            cards.forEach(function (card) {
                var ok = matches(card);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        [input, category, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    function ensureHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        var existing = qs("script[data-hls-loader]");

        if (existing) {
            existing.addEventListener("load", callback, { once: true });
            return;
        }

        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
        script.async = true;
        script.setAttribute("data-hls-loader", "true");
        script.addEventListener("load", callback, { once: true });
        document.head.appendChild(script);
    }

    window.setupMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var cover = document.getElementById(options.coverId);
        var source = options.source;
        var attached = false;
        var hlsInstance = null;

        if (!video || !cover || !source) {
            return;
        }

        if (!video.canPlayType("application/vnd.apple.mpegurl")) {
            ensureHls(function () {});
        }

        function attach(callback) {
            if (attached) {
                callback();
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                callback();
                return;
            }

            ensureHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        backBufferLength: 30
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, callback);
                } else {
                    video.src = source;
                    callback();
                }
            });
        }

        function start() {
            cover.classList.add("is-hidden");
            attach(function () {
                var promise = video.play();

                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        cover.classList.remove("is-hidden");
                    });
                }
            });
        }

        cover.addEventListener("click", start);

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function () {
            cover.classList.add("is-hidden");
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initBackTop();
        initHero();
        initFilters();
    });
})();
