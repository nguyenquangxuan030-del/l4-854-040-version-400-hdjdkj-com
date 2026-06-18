(function () {
  function attachVideo(video) {
    var stream = video.getAttribute('data-stream');
    if (!stream || video.getAttribute('data-ready') === '1') {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 60,
        backBufferLength: 30
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsController = hls;
      video.setAttribute('data-ready', '1');
    } else {
      video.src = stream;
      video.setAttribute('data-ready', '1');
    }
  }

  function playVideo(video) {
    var wrap = video.closest('[data-player-wrap]');
    attachVideo(video);
    var promise = video.play();
    if (wrap) {
      wrap.classList.add('playing');
    }
    if (promise && promise.catch) {
      promise.catch(function () {
        if (wrap) {
          wrap.classList.remove('playing');
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-stream]'));
    videos.forEach(function (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo(video);
        }
      });
      video.addEventListener('play', function () {
        var wrap = video.closest('[data-player-wrap]');
        if (wrap) {
          wrap.classList.add('playing');
        }
      });
      video.addEventListener('pause', function () {
        var wrap = video.closest('[data-player-wrap]');
        if (wrap) {
          wrap.classList.remove('playing');
        }
      });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-play-target]')).forEach(function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-play-target');
        var video = document.getElementById(id);
        if (video) {
          playVideo(video);
        }
      });
    });
  });
})();
