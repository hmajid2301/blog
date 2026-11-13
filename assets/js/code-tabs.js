(() => {
  function enhanceCodeTabs() {
    document.querySelectorAll('[data-code-tabs]').forEach((group, groupIndex) => {
      if (group.dataset.tabsReady) return;
      const panels = Array.from(group.children);
      // Leave mixed content and single-file groups as ordinary, fully visible fences.
      if (panels.length < 2 || panels.some(panel => !panel.matches('.lab-neovim'))) return;
      const list = document.createElement('div');
      list.className = 'lab-code-tablist';
      list.setAttribute('role', 'tablist');
      list.setAttribute('aria-label', group.getAttribute('aria-label'));
      const tabs = panels.map((panel, index) => {
        const id = `code-tabs-${groupIndex}-${index}`;
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.id = `${id}-tab`;
        tab.textContent = panel.dataset.codeFilename;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', `${id}-panel`);
        panel.id = `${id}-panel`;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tab.id);
        panel.tabIndex = 0;
        list.appendChild(tab);
        return tab;
      });
      function activate(index) {
        tabs.forEach((tab, i) => {
          tab.setAttribute('aria-selected', String(i === index));
          tab.tabIndex = i === index ? 0 : -1;
          panels[i].hidden = i !== index;
        });
      }
      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activate(index));
        tab.addEventListener('keydown', event => {
          let next;
          if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
          else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = tabs.length - 1;
          else return;
          event.preventDefault();
          activate(next);
          tabs[next].focus();
        });
      });
      group.prepend(list);
      group.dataset.tabsReady = 'true';
      activate(0);
    });
  }
  enhanceCodeTabs();
  if (window.InstantClick && !window.codeTabsListening) {
    window.InstantClick.on('change', enhanceCodeTabs);
    window.codeTabsListening = true;
  }
})();
