(function() {
  function setupPlayer(shell) {
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");

    if (!video) {
      return;
    }

    var sourceElement = video.querySelector("source");
    var sourceUrl = sourceElement ? sourceElement.getAttribute("src") : "";
    var initialized = false;

    function prepare() {
      if (initialized || !sourceUrl) {
        return;
      }

      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        shell.hlsPlayer = hls;
        return;
      }

      video.src = sourceUrl;
    }

    function start() {
      prepare();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function() {});
      }
    }

    shell.startPlayback = start;

    if (cover) {
      cover.addEventListener("click", start);
    }

    video.addEventListener("click", function() {
      if (!initialized || video.paused) {
        start();
      }
    });
  }

  function init() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    players.forEach(setupPlayer);

    Array.prototype.slice.call(document.querySelectorAll("[data-start-player]")).forEach(function(trigger) {
      trigger.addEventListener("click", function(event) {
        var firstPlayer = players[0];
        if (!firstPlayer || typeof firstPlayer.startPlayback !== "function") {
          return;
        }
        event.preventDefault();
        firstPlayer.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
        firstPlayer.startPlayback();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
