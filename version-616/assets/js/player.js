(function () {
  function attachStream(video, streamUrl) {
    if (!video || !streamUrl) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play]');
    var streamUrl = player.getAttribute('data-stream');

    attachStream(video, streamUrl);

    if (button && video) {
      button.addEventListener('click', function () {
        player.classList.add('playing');
        video.play();
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('playing');
      });

      video.addEventListener('pause', function () {
        player.classList.remove('playing');
      });
    }
  });
})();
