(() => {
  const controls = document.getElementById('builder-controls');
  const lab = window.blogDesignLab;
  if (!controls || !lab || controls.dataset.bound) return;
  controls.dataset.bound = 'true';
  const { styles, comparisonPairs, bodyFonts, headingFonts, headingWeights, monoFonts, themes, accents, pageLayouts, pageSamples, pageDefaults, homeControls, homeDefaults, homeSections, defaults, navbars, logoMarks, footerTreatments, searchPopups } = lab.builderCatalog;
  const draftKey = 'blog-design-builder-draft';
  let stored = null;
  try { stored = JSON.parse(localStorage.getItem(draftKey)); } catch (_) {}
  const hasDraft = stored && typeof stored === 'object' && !Array.isArray(stored) && stored.choices && typeof stored.choices === 'object' && !Array.isArray(stored.choices);
  let draft = lab.validateBuilder(hasDraft ? stored.choices : lab.getAppliedBuilder() || defaults);
  let sample = hasDraft && stored.workbench === 1 && typeof stored.sample === 'string' && Object.hasOwn(pageSamples, stored.sample) ? stored.sample : 'home';
  let mode = (hasDraft ? stored.mode : document.documentElement.dataset.mode) === 'dark' ? 'dark' : 'light';
  const frame = document.getElementById('builder-frame');
  const sampleSelect = document.getElementById('builder-sample');
  const fields = document.getElementById('builder-fields');
  const overall = document.getElementById('builder-overall');
  const status = document.getElementById('builder-status');
  const appliedLinks = document.getElementById('builder-applied');
  const reset = document.getElementById('builder-reset');
  const fieldBindings = [];
  let pageBindings = [];
  let sectionList = null;
  let requestedURL = '';
  let loadedDocument = null;
  const selectedKind = () => pageSamples[sample].kind || (sample === 'categories' || sample === 'series' ? 'topics' : sample);
  const optionName = info => typeof info === 'string' ? info : info.name;
  const themeName = id => themes[id].name.replace(/ · (Mauve|Teal|Peach)$/, '');
  const themeOptions = dark => Object.fromEntries(Object.entries(themes)
    .filter(([id, info]) => info.dark === dark && (!id.startsWith('cat-') || id.endsWith('-mauve')))
    .map(([id]) => [id, { name: themeName(id) }]));

  function saveDraft() {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ choices: draft, sample, mode, workbench: 1 }));
      return true;
    } catch (_) { return false; }
  }
  function draftChanged(message = 'Draft saved. The blog is unchanged until you apply it.') {
    appliedLinks.hidden = true;
    status.textContent = saveDraft() ? message : message + ' Browser storage is unavailable; this draft lasts only for this visit.';
  }
  function change(value, message) {
    draft = lab.validateBuilder(value);
    syncControls();
    draftChanged(message);
    updatePreview();
  }
  function fieldset(parent, name) {
    const group = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = name;
    group.append(legend);
    parent.append(group);
    return group;
  }
  function addField(parent, key, info, readValue, setValue, bindings) {
    const label = document.createElement('label');
    label.className = 'builder-field';
    const text = document.createElement('span');
    text.textContent = info.label;
    const input = document.createElement(info.type === 'checkbox' || info.type === 'number' ? 'input' : 'select');
    input.id = 'builder-choice-' + key;
    if (key === 'style') input.id = 'builder-style';
    if (info.type === 'checkbox') {
      input.type = 'checkbox';
      label.classList.add('builder-checkbox');
    } else if (info.type === 'number') {
      input.type = 'number';
      input.min = info.min;
      input.max = info.max;
      input.step = '1';
      input.required = true;
    } else {
      Object.entries(info.options).forEach(([id, option]) => input.add(new Option(optionName(option), id)));
    }
    label.htmlFor = input.id;
    label.append(text, input);
    parent.append(label);
    // Keep native controls mounted while editing, including partial number input.
    input.addEventListener('change', () => {
      if (!input.checkValidity()) { input.reportValidity(); return; }
      setValue(info.type === 'checkbox' ? input.checked : info.type === 'number' ? Number(input.value) : input.value);
    });
    bindings.push({ input, info, readValue });
    return input;
  }
  function syncControls() {
    const maxWeight = headingFonts[draft.heading].maxWeight || 800;
    [...fieldBindings, ...pageBindings].forEach(({ input, info, readValue }) => {
      const value = readValue();
      if (input.id === 'builder-choice-headingWeight') {
        Array.from(input.options).forEach(option => { option.disabled = Number(option.value) > maxWeight; });
      }
      if (info.type === 'checkbox') input.checked = value;
      else {
        if (input.tagName === 'SELECT' && !Array.from(input.options).some(option => option.value === String(value))) {
          input.add(new Option(themes[value] ? themes[value].name + ' (saved palette)' : String(value), value));
        }
        input.value = value;
      }
    });
    if (sectionList) {
      draft.home.order.forEach((id, index) => {
        const row = Array.from(sectionList.children).find(item => item.dataset.section === id);
        if (sectionList.children[index] !== row) sectionList.insertBefore(row, sectionList.children[index]);
        row.querySelector('[data-move="-1"]').disabled = index === 0;
        row.querySelector('[data-move="1"]').disabled = index === draft.home.order.length - 1;
      });
    }
  }
  function renderSections(parent) {
    const group = fieldset(parent, 'Supporting sections');
    const help = document.createElement('p');
    help.textContent = 'Default follows the overall structure. The introduction stays first. Custom order stacks Home sections in this reading order without changing your saved overall structure.';
    group.append(help);
    sectionList = document.createElement('ol');
    sectionList.className = 'builder-section-list';
    group.append(sectionList);
    draft.home.order.forEach(id => {
      const row = document.createElement('li');
      row.dataset.section = id;
      const select = addField(row, 'section-' + id, { label: homeSections[id].name, options: { default: { name: 'Default' }, show: { name: 'Show' }, hide: { name: 'Hide' } } },
        () => draft.home.sections[id], value => change({ ...draft, home: { ...draft.home, sections: { ...draft.home.sections, [id]: value } } }), pageBindings);
      const moves = document.createElement('div');
      moves.className = 'builder-section-moves';
      [-1, 1].forEach(direction => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.move = direction;
        button.textContent = direction === -1 ? 'Move up' : 'Move down';
        button.setAttribute('aria-label', button.textContent + ': ' + homeSections[id].name);
        button.onclick = () => {
          const order = [...draft.home.order];
          const index = order.indexOf(id);
          const next = index + direction;
          if (next < 0 || next >= order.length) return;
          [order[index], order[next]] = [order[next], order[index]];
          change({ ...draft, home: { ...draft.home, order } }, homeSections[id].name + ' moved to position ' + (next + 1) + ' of ' + order.length + '. Draft only.');
          // Moving DOM nodes can drop focus; use a valid control in the moved row.
          const fallback = row.querySelector('button:not(:disabled)') || select;
          (button.disabled ? fallback : button).focus({ preventScroll: true });
        };
        moves.append(button);
      });
      row.append(moves);
      sectionList.append(row);
    });
  }
  function renderPage() {
    fields.replaceChildren();
    pageBindings = [];
    sectionList = null;
    const kind = selectedKind();
    document.getElementById('builder-title').textContent = pageSamples[sample].name;
    document.getElementById('builder-help').textContent = sample === 'home'
      ? 'Tune Home without changing your fonts, colours, code or other page layouts. Default follows your existing overall structure and style.'
      : 'Choose this page type’s layout. Detailed controls for this page will come later; your other choices stay unchanged.';
    reset.textContent = sample === 'home' ? 'Reset Home tweaks' : 'Reset current page layout';
    reset.hidden = sample !== 'home' && !pageLayouts[kind];
    if (sample === 'home') {
      const groups = new Map();
      Object.entries(homeControls).forEach(([key, info]) => {
        if (!groups.has(info.group)) groups.set(info.group, fieldset(fields, info.group));
        addField(groups.get(info.group), 'home-' + key, info, () => draft.home[key], value => change({ ...draft, home: { ...draft.home, [key]: value } }), pageBindings);
      });
      renderSections(fields);
    } else if (pageLayouts[kind]) {
      addField(fieldset(fields, 'Page layout'), 'page-layout', { label: pageLayouts[kind].name + ' layout', options: pageLayouts[kind].options },
        () => draft.pages[kind], value => change({ ...draft, pages: { ...draft.pages, [kind]: value } }), pageBindings);
    }
    syncControls();
  }
  function renderSummary() {
    const summary = document.getElementById('builder-summary');
    summary.replaceChildren();
    const pair = lab.activeBuilderPair(draft);
    const entries = [
      ['Style', styles[draft.style].name], ['Comparison', pair ? comparisonPairs[pair].name : 'Custom palettes'],
      ['Body', bodyFonts[draft.body].name], ['Headings', headingFonts[draft.heading].name + ' · ' + headingWeights[draft.headingWeight].name],
      ['Monospace', monoFonts[draft.mono].name], ['Code', draft.code === 'neovim' ? 'Neovim framing' : 'Plain code'],
      ['Navbar', navbars[draft.navbar].name], ['Logo', logoMarks[draft.logo].name], ['Footer', footerTreatments[draft.footer].name], ['Search popup', searchPopups[draft.searchPopup].name],
      ['Light', themeName(draft.lightTheme) + ' / ' + optionName(accents[draft.lightAccent])],
      ['Dark', themeName(draft.darkTheme) + ' / ' + optionName(accents[draft.darkAccent])],
      ...Object.entries(pageLayouts).map(([kind, info]) => [info.name, info.options[draft.pages[kind]].name]),
      ...Object.entries(homeControls).map(([key, info]) => [info.label, info.type === 'checkbox' ? (draft.home[key] ? 'On' : 'Off') : info.options ? optionName(info.options[draft.home[key]]) : String(draft.home[key])]),
      ['Home section order', draft.home.order.map(id => homeSections[id].name + ' (' + draft.home.sections[id] + ')').join(' → ')]
    ];
    entries.forEach(([label, value]) => {
      const term = document.createElement('dt'); term.textContent = label;
      const detail = document.createElement('dd'); detail.textContent = value;
      summary.append(term, detail);
    });
  }
  function updatePreview() {
    const pair = lab.activeBuilderPair(draft);
    controls.querySelectorAll('button[data-builder-pair]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.builderPair === pair)));
    controls.querySelectorAll('button[data-builder-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.builderMode === mode)));
    document.getElementById('builder-pair-note').textContent = pair ? comparisonPairs[pair].name + ': ' + themes[draft.lightTheme].name + ' / ' + themes[draft.darkTheme].name + '. Each pair remembers its own accents.' : 'Custom or mixed palettes. Your saved Catppuccin and Fireside pairs are kept.';
    sampleSelect.value = sample;
    const info = pageSamples[sample];
    document.getElementById('builder-preview-label').textContent = info.name + ' · ' + (pair ? comparisonPairs[pair].name : 'Custom') + ' · ' + (mode === 'dark' ? 'Dark' : 'Light');
    const openPage = document.getElementById('builder-open-page');
    openPage.href = info.path;
    openPage.textContent = 'Open current page: ' + info.name + ' ↗';
    frame.title = 'Draft preview: ' + info.name + ' — selected page controls and overall design';
    renderSummary();
    const url = new URL(info.path, location.origin);
    url.searchParams.set('lab-preview', '1');
    url.hash = '';
    if (url.origin !== location.origin) return;
    if (requestedURL !== url.href) {
      requestedURL = url.href;
      loadedDocument = null;
      frame.src = url.href;
      return;
    }
    try {
      const preview = frame.contentWindow;
      const doc = frame.contentDocument;
      // Ignore anchors, but never update a stale document from a previous route.
      if (!preview || preview.location.href.split('#')[0] !== requestedURL || doc !== loadedDocument || !preview.blogDesignLab || !doc.body) return;
      doc.documentElement.setAttribute('data-builder-preview', '');
      preview.blogDesignLab.previewBuilder(draft, mode);
      doc.querySelectorAll('a[href]').forEach(link => {
        link.setAttribute('data-no-instant', '');
        if (!link.getAttribute('href').startsWith('#')) { link.target = '_blank'; link.rel = 'noopener'; }
      });
    } catch (_) { /* A navigated, cross-origin frame is not a draft target. */ }
  }

  const typography = fieldset(overall, 'Typography and style');
  const chrome = fieldset(overall, 'Site chrome');
  const colours = fieldset(overall, 'Light and dark colours');
  const overallFields = {
    style: { label: 'Style · visual treatment', options: styles },
    body: { label: 'Body font', options: bodyFonts },
    heading: { label: 'Heading font', options: headingFonts },
    headingWeight: { label: 'Heading weight', options: headingWeights },
    mono: { label: 'Monospace font', options: monoFonts },
    code: { label: 'Code presentation', options: { plain: { name: 'Plain code block' }, neovim: { name: 'Neovim · tab, gutter & status bar' } } },
    navbar: { label: 'Navbar treatment', options: navbars },
    logo: { label: 'Logo mark', options: logoMarks },
    footer: { label: 'Footer treatment', options: footerTreatments },
    searchPopup: { label: 'Search popup', options: searchPopups },
    lightTheme: { label: 'Light palette', options: themeOptions(false) },
    lightAccent: { label: 'Light accent', options: accents },
    darkTheme: { label: 'Dark palette', options: themeOptions(true) },
    darkAccent: { label: 'Dark accent', options: accents }
  };
  Object.entries(overallFields).forEach(([key, info]) => addField(key === 'navbar' || key === 'logo' || key === 'footer' || key === 'searchPopup' ? chrome : (key.startsWith('light') || key.startsWith('dark') ? colours : typography), key, info,
    () => draft[key], value => change({ ...draft, [key]: value }), fieldBindings));
  Object.entries(pageSamples).forEach(([id, info]) => sampleSelect.add(new Option(info.name, id)));
  sampleSelect.onchange = () => {
    if (!Object.hasOwn(pageSamples, sampleSelect.value)) return;
    sample = sampleSelect.value;
    renderPage();
    draftChanged('Preview page changed. All draft choices are kept and have not been applied.');
    updatePreview();
  };
  reset.onclick = () => {
    const kind = selectedKind();
    if (sample === 'home') {
      // Validation returns a fresh nested clone; never edit the catalogue defaults.
      change({ ...draft, home: lab.validateBuilder({ home: homeDefaults }).home }, 'Home tweaks reset. Overall design and other page choices are unchanged.');
    } else if (pageLayouts[kind]) {
      change({ ...draft, pages: { ...draft.pages, [kind]: pageDefaults[kind] } }, 'Current page layout reset. All other choices are unchanged.');
    }
  };
  controls.querySelectorAll('button[data-builder-pair]').forEach(button => {
    button.onclick = () => change(lab.selectBuilderPair(draft, button.dataset.builderPair));
  });
  controls.querySelectorAll('button[data-builder-mode]').forEach(button => {
    button.onclick = () => { mode = button.dataset.builderMode; saveDraft(); updatePreview(); };
  });
  document.getElementById('builder-apply').onclick = () => {
    const invalid = controls.querySelector('input:invalid, select:invalid');
    if (invalid) {
      invalid.reportValidity();
      invalid.focus();
      status.textContent = 'Check the highlighted value before applying. The blog is unchanged.';
      return;
    }
    const saved = lab.useBuilder(draft, mode);
    status.textContent = saved ? 'Applied. Your design is saved across the local demo; its appearance switch uses your light and dark colours.' : 'Applied for this page, but browser storage is unavailable. The design cannot persist across navigation.';
    appliedLinks.hidden = !saved;
  };
  frame.addEventListener('load', () => {
    try {
      if (frame.contentWindow.location.href.split('#')[0] !== requestedURL || frame.contentDocument.readyState !== 'complete') return;
      loadedDocument = frame.contentDocument;
      updatePreview();
    } catch (_) { /* Only same-origin preview routes receive the draft. */ }
  });
  controls.hidden = false;
  renderPage();
  saveDraft();
  updatePreview();
})();
