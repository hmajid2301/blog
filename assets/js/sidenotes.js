/* Progressive enhancement: original endnotes remain the only source of note content. */
(() => {
  if (window.blogSidenotes) {
    window.blogSidenotes.init();
    return;
  }
  let dispose = () => {};
  let instantClick;
  const decode = hash => {
    try { return decodeURIComponent(hash.slice(1)); } catch { return ''; }
  };

  function init() {
    dispose();
    const content = document.querySelector('.post-single .post-content');
    const endnotes = content?.querySelector('.footnotes');
    if (!endnotes) return;
    const article = content.closest('.post-single');
    const body = content.closest('.post-body') || article;
    const controller = new AbortController();
    const on = (target, type, callback, capture = false) => target?.addEventListener(type, callback, { signal: controller.signal, capture });
    const records = [...endnotes.querySelectorAll(':scope > ol > li[id]')].map((note, index) => {
      const placeholder = document.createComment('Endnote position');
      note.before(placeholder);
      return { note, placeholder, number: note.value || index + 1, refs: [], group: null };
    });
    const byId = new Map(records.map(record => [record.note.id, record]));
    const refs = [...content.querySelectorAll('a.footnote-ref')].filter(ref => !endnotes.contains(ref));
    const paragraphs = new Map();
    for (const ref of refs) {
      const record = byId.get(decode(ref.hash));
      const paragraph = ref.closest('p, li, blockquote') || ref.closest('sup');
      if (!record || !paragraph) continue;
      record.refs.push(ref);
      const notes = paragraphs.get(paragraph) || new Set();
      notes.add(record);
      paragraphs.set(paragraph, notes);
    }
    // Connected groups keep same-paragraph notes together, including repeated references.
    let sets = [...paragraphs.values()];
    for (let i = 0; i < sets.length; i++) {
      for (let j = i + 1; j < sets.length;) {
        if ([...sets[j]].some(record => sets[i].has(record))) {
          sets[j].forEach(record => sets[i].add(record));
          sets.splice(j, 1);
          i = -1;
          break;
        } else j++;
      }
    }
    const groups = sets.map((set, index) => {
      const notes = [...set].sort((a, b) => a.number - b.number);
      const anchor = [...paragraphs].find(([, entries]) => [...entries].some(record => set.has(record)))[0];
      const panel = document.createElement('section');
      panel.className = 'sidenote-group';
      // Do not collide with author-provided IDs.
      let id = `sidenotes-${index + 1}`;
      while (document.getElementById(id)) id += '-note';
      panel.id = id;
      panel.setAttribute('aria-label', `Notes ${notes.map(record => record.number).join(', ')}`);
      const list = document.createElement('ol');
      panel.append(list);
      const group = { notes, anchor, panel, list, open: false };
      notes.forEach(record => { record.group = group; });
      return group;
    });
    if (!groups.length) {
      records.forEach(record => record.placeholder.remove());
      return;
    }
    let wide = false;
    let frame = 0;
    let disposed = false;
    const print = matchMedia('print');
    const oldMinHeight = content.style.minHeight;
    const oldHidden = endnotes.hidden;
    const attributes = new Map();
    for (const record of records) {
      attributes.set(record.note, { tabindex: record.note.getAttribute('tabindex'), value: record.note.getAttribute('value') });
      for (const ref of record.refs) attributes.set(ref, Object.fromEntries(['role', 'aria-controls', 'aria-expanded', 'data-no-instant'].map(name => [name, ref.getAttribute(name)])));
    }
    const restore = () => {
      records.forEach(({ note, placeholder }) => placeholder.after(note));
      groups.forEach(({ panel }) => panel.remove());
      endnotes.hidden = oldHidden;
      content.style.minHeight = oldMinHeight;
      content.classList.remove('sidenotes-enhanced');
      body.classList.remove('sidenotes-margin');
      for (const [element, attrs] of attributes) for (const [name, value] of Object.entries(attrs)) {
        if (value === null) element.removeAttribute(name); else element.setAttribute(name, value);
      }
    };
    const sync = () => {
      groups.forEach(group => {
        group.panel.hidden = !wide && !group.open;
        group.notes.forEach(({ refs }) => refs.forEach(ref => {
          ref.setAttribute('aria-controls', group.panel.id);
          ref.setAttribute('data-no-instant', '');
          if (wide) {
            ref.setAttribute('role', 'doc-noteref');
            ref.removeAttribute('aria-expanded');
          } else {
            ref.setAttribute('role', 'button');
            ref.setAttribute('aria-expanded', String(group.open));
          }
        }));
      });
    };
    function placePanel(anchor, panel) {
      // A section belongs inside a list item, never beside it under ul/ol.
      if (anchor.matches('li')) anchor.append(panel);
      else anchor.after(panel);
    }
    function layout() {
      if (disposed) return;
      if (print.matches) { restore(); return; }
      content.classList.add('sidenotes-enhanced');
      const bounds = content.getBoundingClientRect();
      const right = Math.min(article.getBoundingClientRect().right, document.documentElement.clientWidth - 16);
      wide = innerWidth >= 1200 && right - bounds.right >= 288;
      body.classList.toggle('sidenotes-margin', wide);
      for (const group of groups) {
        if (!group.panel.isConnected || wide) placePanel(group.anchor, group.panel);
        for (const record of group.notes) {
          group.list.append(record.note);
          record.note.value = record.number;
          record.note.tabIndex = -1;
        }
        group.panel.style.top = '';
      }
      endnotes.hidden = !records.some(record => !record.group);
      sync();
      content.style.minHeight = oldMinHeight;
      if (!wide) return;
      const origin = content.getBoundingClientRect();
      const toc = body.querySelector(':scope > .toc');
      let bottom = toc ? Math.max(0, toc.getBoundingClientRect().bottom - origin.top + 24) : 0;
      // Include rendered boxes (not scrollWidth) so overflow in code/media cannot cross notes.
      const obstacles = [...content.querySelectorAll('pre, table, img, video, iframe, .highlight, .lab-neovim, .wide')]
        .filter(element => !element.closest('.sidenote-group, .footnotes'))
        .map(element => element.getBoundingClientRect())
        .filter(box => box.right > origin.right + 24 && box.width && box.height);
      for (const group of groups) {
        let top = Math.max(group.anchor.getBoundingClientRect().top - origin.top, bottom);
        const height = group.panel.getBoundingClientRect().height;
        for (const obstacle of obstacles.sort((a, b) => a.top - b.top)) {
          if (top < obstacle.bottom - origin.top + 18 && top + height > obstacle.top - origin.top - 18) top = obstacle.bottom - origin.top + 18;
        }
        group.panel.style.top = `${Math.ceil(top)}px`;
        bottom = top + height + 18;
      }
      if (bottom > content.getBoundingClientRect().height) content.style.minHeight = `${Math.ceil(bottom)}px`;
    }
    function schedule() {
      if (!frame && !disposed) frame = requestAnimationFrame(() => { frame = 0; layout(); });
    }
    const revealHash = () => {
      const id = decode(location.hash);
      const target = document.getElementById(id);
      const record = byId.get(id) || records.find(record => record.note.contains(target));
      if (record?.group) { record.group.open = true; sync(); }
      if (target && (record || refs.some(ref => ref === target || target.contains(ref)))) {
        target.scrollIntoView({ block: 'center' });
        (target.matches('a') ? target : target.querySelector('a') || target).focus({ preventScroll: true });
      }
    };
    on(document, 'click', event => {
      const link = event.target.closest('a');
      const record = records.find(record => record.refs.includes(link));
      if (record?.group) {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        // Capture before the theme's generic smooth-scroll listener.
        event.preventDefault();
        event.stopImmediatePropagation();
        const group = record.group;
        if (wide) {
          history.pushState(null, '', link.hash);
          record.note.focus({ preventScroll: true });
          record.note.scrollIntoView({ block: 'nearest' });
        } else {
          const paragraph = link.closest('p, li, blockquote') || link.closest('sup');
          const samePlace = paragraph.matches('li')
            ? paragraph.lastElementChild === group.panel
            : paragraph.nextElementSibling === group.panel;
          group.open = !group.open || !samePlace;
          placePanel(paragraph, group.panel);
          sync();
        }
        return;
      }
      if (link?.classList.contains('footnote-backref') && content.contains(link)) {
        const target = document.getElementById(decode(link.hash));
        if (!target) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        history.pushState(null, '', link.hash);
        target.scrollIntoView({ block: 'center' });
        (target.matches('a') ? target : target.querySelector('a'))?.focus({ preventScroll: true });
      }
    }, true);
    on(document, 'keydown', event => {
      if (!wide && (event.key === ' ' || event.key === 'Enter') && refs.includes(event.target)) {
        event.preventDefault();
        event.target.click();
      }
    }, true);
    on(window, 'resize', schedule);
    on(window, 'hashchange', revealHash);
    on(window, 'popstate', revealHash);
    on(content, 'load', schedule, true);
    on(content, 'loadedmetadata', schedule, true);
    on(body, 'toggle', schedule, true);
    on(window, 'beforeprint', restore);
    on(window, 'afterprint', schedule);
    on(print, 'change', schedule);
    on(document.fonts, 'loadingdone', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(content);
    body.querySelectorAll('.toc, img, video, iframe, pre, table, .sidenote-group').forEach(element => observer.observe(element));
    // Group boxes are inserted by the first layout.
    groups.forEach(group => observer.observe(group.panel));
    layout();
    revealHash();
    document.fonts?.ready.then(() => { if (!disposed) { layout(); revealHash(); } });
    dispose = () => {
      disposed = true;
      controller.abort();
      observer.disconnect();
      cancelAnimationFrame(frame);
      restore();
      records.forEach(record => record.placeholder.remove());
    };
  }
  function connect() {
    if (window.InstantClick && instantClick !== window.InstantClick) {
      instantClick = window.InstantClick;
      instantClick.on('change', init);
    }
  }
  window.blogSidenotes = { init: () => { connect(); init(); } };
  connect();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.blogSidenotes.init, { once: true });
  else init();
  window.addEventListener('load', connect, { once: true });
})();
