(function() {
  'use strict';

  function updateProgressBar() {
    const progressBar = document.querySelector('.reading-progress-bar');
    if (!progressBar) return;

    // Calculate scroll progress
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (docHeight <= 0) {
      progressBar.style.setProperty('--progress', '0%');
      return;
    }

    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.setProperty('--progress', scrollPercent + '%');
  }

  function initProgressBar() {
    const progressBar = document.querySelector('.reading-progress-bar');
    if (!progressBar) return;

    // Update on scroll
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          updateProgressBar();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Initial update
    updateProgressBar();
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProgressBar);
  } else {
    initProgressBar();
  }

  // Re-initialize on InstantClick page changes (if using InstantClick)
  if (typeof InstantClick !== 'undefined') {
    InstantClick.on('change', function() {
      setTimeout(initProgressBar, 100);
    });
  }
})();
