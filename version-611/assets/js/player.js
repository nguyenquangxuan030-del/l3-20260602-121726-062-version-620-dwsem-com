import { H as Hls } from './hls-local.js';

function bindPlayer(video) {
  var source = video.getAttribute('data-src');
  var wrapper = video.closest('.video-box');
  var button = wrapper ? wrapper.querySelector('[data-player-start]') : null;

  if (!source) {
    return;
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  }

  if (button) {
    button.addEventListener('click', function () {
      button.classList.add('is-hidden');
      video.play().catch(function () {
        button.classList.remove('is-hidden');
      });
    });
  }

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });
}

document.querySelectorAll('video[data-src]').forEach(bindPlayer);
