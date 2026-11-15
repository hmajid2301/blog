/* Pause autoplaying demo videos for visitors who prefer reduced motion.
   Deliberate playback (controls / click) is unaffected. */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const apply = () => {
    if (!reduceMotion.matches) return;
    document.querySelectorAll("video[autoplay]").forEach((video) => {
      // Remove the autoplay intent so a later media load cannot restart it,
      // then stop anything that already started before this script ran.
      video.removeAttribute("autoplay");
      video.pause();
    });
  };
  apply();
  reduceMotion.addEventListener("change", apply);
  document.addEventListener("DOMContentLoaded", apply);
  window.addEventListener("load", apply);
})();
