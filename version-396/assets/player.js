(function () {
  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector('[data-player]');
    var cover = document.querySelector('[data-player-cover]');
    var playButton = document.querySelector('[data-play-button]');
    var started = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function beginPlayback() {
      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;

      if (cover) {
        cover.classList.add('hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });

        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = streamUrl;
      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener('click', beginPlayback);
    }

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.stopPropagation();
        beginPlayback();
      });
    }

    video.addEventListener('click', function () {
      if (!started) {
        beginPlayback();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
