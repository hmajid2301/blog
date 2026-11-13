(() => {
  function init() {
    document.querySelectorAll('.lite-youtube:not([data-ready])').forEach(video => {
      const button = video.querySelector('.lite-youtube-load');
      video.dataset.ready = 'true';
      button.hidden = false;
      button.addEventListener('click', () => {
        const player = document.createElement('iframe');
        player.title = video.dataset.videoTitle;
        const url = new URL(`https://www.youtube-nocookie.com/embed/${video.dataset.videoId}`);
        if (Number(video.dataset.videoStart) > 0) url.searchParams.set('start', video.dataset.videoStart);
        player.src = url.href;
        player.allow = 'encrypted-media; picture-in-picture; fullscreen';
        player.allowFullscreen = true;
        player.referrerPolicy = 'strict-origin-when-cross-origin';
        video.querySelector('.lite-youtube-shell').replaceChildren(player);
        video.querySelector('.lite-youtube-status').textContent = 'YouTube player requested. Use its controls to play, or open the video link.';
        player.focus();
      }, { once: true });
    });
  }
  init();
  if (window.InstantClick) window.InstantClick.on('change', init);
})();
