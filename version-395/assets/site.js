(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            menuButton.classList.toggle('is-open', open);
            menuButton.setAttribute('aria-expanded', String(open));
        });
    }

    var filterInputs = document.querySelectorAll('[data-filter-input], [data-year-filter], [data-type-filter], [data-region-filter]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
        var keywordInput = document.querySelector('[data-filter-input]');
        var yearSelect = document.querySelector('[data-year-filter]');
        var typeSelect = document.querySelector('[data-type-filter]');
        var regionSelect = document.querySelector('[data-region-filter]');
        var keyword = normalize(keywordInput ? keywordInput.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var type = normalize(typeSelect ? typeSelect.value : '');
        var region = normalize(regionSelect ? regionSelect.value : '');
        var cards = document.querySelectorAll('[data-card-grid] .movie-card');
        var visibleCount = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags
            ].join(' '));
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchYear = !year || normalize(card.dataset.year) === year;
            var matchType = !type || normalize(card.dataset.type) === type;
            var matchRegion = !region || normalize(card.dataset.region) === region;
            var visible = matchKeyword && matchYear && matchType && matchRegion;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                visibleCount += 1;
            }
        });

        var emptyState = document.querySelector('[data-empty-state]');
        if (emptyState) {
            emptyState.classList.toggle('is-visible', visibleCount === 0);
        }
    }

    filterInputs.forEach(function (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
    });

    function initPlayer(shell) {
        var video = shell.querySelector('.video-player');
        var button = shell.querySelector('[data-player-start]');
        var source = video ? video.dataset.src : '';
        var hlsInstance = null;

        function bindSource() {
            if (!video || !source || video.dataset.ready === 'true') {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    maxBufferLength: 60
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }

            video.dataset.ready = 'true';
        }

        function playVideo() {
            bindSource();
            shell.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (video.currentTime === 0) {
                    shell.classList.remove('is-playing');
                }
            });

            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    }

    document.querySelectorAll('[data-player-shell]').forEach(initPlayer);
})();
