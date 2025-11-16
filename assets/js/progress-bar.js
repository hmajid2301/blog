(function() {
  'use strict';

  function updateProgressBar() {
    const progressBar = document.querySelector('.reading-progress-bar');
    if (!progressBar) return;

    const progressFill = progressBar.querySelector('::before') || progressBar;

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

    // Use CSS custom property for smoother animation
    const style = document.createElement('style');
    style.textContent = `
      .reading-progress-bar::before {
        width: var(--progress, 0%);
      }
    `;
    document.head.appendChild(style);

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
