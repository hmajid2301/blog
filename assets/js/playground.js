(() => {
  if (window.blogDesignLab) return;
  const root = document.documentElement;
  if (new URLSearchParams(location.search).get('lab-preview') === '1') root.setAttribute('data-builder-preview', '');
  const storageKey = 'blog-design-lab';
  const designs = {
    editorial: { name: 'Editorial', note: 'Schibsted Grotesk · IBM Plex Mono / bold, open editorial type' },
    journal: { name: 'Literary Journal', note: 'Newsreader · Instrument Sans / literary headlines, generous rhythm' },
    workshop: { name: 'Technical Workshop', note: 'Space Grotesk · IBM Plex Sans · JetBrains Mono / structured, technical' },
    notebook: { name: 'Quiet Notebook', note: 'Literata / narrow, restrained, reading first' },
    swiss: { name: 'Swiss Grid', note: 'Manrope · IBM Plex Mono / strong grid and crisp rules' },
    studio: { name: 'Soft Studio', note: 'Fraunces · DM Sans / expressive titles and soft framing' },
    nord: { name: 'Fieldnotes', note: 'Newsreader · IBM Plex Sans / quiet headlines and fine rules' },
    gruvbox: { name: 'Bookish Almanac', note: 'Literata · DM Sans / bookish titles and measured spacing' },
    terminal: { name: 'Monospace Log', note: 'JetBrains Mono / square edges and dashed rules' },
    ink: { name: 'Bold Headlines', note: 'Schibsted Grotesk · IBM Plex Mono / heavy headlines and strong rules' },
    fireside: { name: 'Serif & Sans', note: 'Radio Canada Big · Source Serif 4 · Geist Mono / typography from the Python talk' },
    reading: { name: 'Reading Room', note: 'Newsreader · IBM Plex Sans / calmer titles and comfortable reading' },
    humanist: { name: 'Humanist Notes', note: 'IBM Plex Sans · IBM Plex Mono / friendly sans-serif, relaxed spacing' },
    contrast: { name: 'Serif Contrast', note: 'Source Serif 4 · Instrument Sans / large serif titles, crisp sans-serif body' },
    compact: { name: 'Compact Reference', note: 'Manrope · IBM Plex Sans / compact headings and scannable lists' },
    essay: { name: 'Airy Essay', note: 'Literata · Newsreader / book typography, breathing room, understated metadata' },
    'profile-journal': { name: 'Literary Profile', note: 'Newsreader · Instrument Sans / shaded journal cards and highlighted section headings' },
    'profile-humanist': { name: 'Humanist Profile', note: 'IBM Plex Sans / inset panels, friendly type, and accent rails' },
    'profile-serif': { name: 'Serif Profile', note: 'Source Serif 4 · DM Sans / outlined cards and framed section headings' },
    'profile-bold': { name: 'Bold Profile', note: 'Manrope · Schibsted Grotesk / strong panel edges and section bands' },
    'profile-calm': { name: 'Quiet Profile', note: 'Literata · IBM Plex Sans / soft cards, gentle section tints, and measured type' }
  };
  const themes = {
    editorial: { name: 'Paper & Rose', dark: false },
    journal: { name: 'Latte Plum', dark: false },
    workshop: { name: 'Mocha Green', dark: true },
    notebook: { name: 'Sage Paper', dark: false },
    swiss: { name: 'Clean Blue', dark: false },
    studio: { name: 'Soft Peach', dark: false },
    nord: { name: 'Nord', dark: true },
    gruvbox: { name: 'Gruvbox', dark: true },
    terminal: { name: 'Forest Terminal', dark: true },
    ink: { name: 'Ink & Signal', dark: false },
    'fireside-light': { name: 'Fireside Light', dark: false },
    'fireside-dark': { name: 'Fireside Dark', dark: true }
  };
  const fonts = { default: 'Style default', grotesk: 'Schibsted Grotesk', literary: 'Newsreader + Instrument', technical: 'Space Grotesk + Plex', book: 'Literata + Plex Sans', geometric: 'Manrope', expressive: 'Fraunces + DM Sans', mono: 'JetBrains Mono' };
  const artStyles = { line: 'Original linework', blueprint: 'Drafting blueprint', print: 'Bold screen-print', mono: 'One-ink monochrome' };
  const navbars = {
    pill: { name: 'Pill', note: 'Rounded pill links with an accent active pill.' },
    underline: { name: 'Underline', note: 'Bare links with an animated accent underline.' },
    floating: { name: 'Floating bar', note: 'A rounded, bordered bar floating apart from the page.' },
    centered: { name: 'Centered', note: 'Logo and links stacked and centred like a masthead.' },
    minimal: { name: 'Minimal', note: 'Flat and borderless; logo left, links right.' },
    'pill-outline': { name: 'Pill outline', note: 'Outlined pill links; the active page fills with the accent.' },
    'pill-active': { name: 'Pill active', note: 'Bare links; only the active page becomes a filled pill.' },
    dock: { name: 'Dock', note: 'A centred floating capsule holding the links.' },
    ruler: { name: 'Ruler', note: 'Links separated by fine vertical rules.' }
  };
  const logoMarks = {
    none: { name: 'None', svg: '' },
    monogram: { name: 'Monogram', svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><rect x="7" y="5" width="5" height="22" rx="2.5"/><rect x="20" y="5" width="5" height="22" rx="2.5"/><rect x="7" y="13.5" width="18" height="5" rx="2.5"/></svg>' },
    terminal: { name: 'Terminal', svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 9l8 7-8 7"/><path d="M21 23h5"/></svg>' },
    badge: { name: 'Badge', svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="currentColor" fill-rule="evenodd"><path d="M8 1h16a7 7 0 0 1 7 7v16a7 7 0 0 1-7 7H8a7 7 0 0 1-7-7V8a7 7 0 0 1 7-7Zm0 7h5v5.5h6v-5.5h5v16h-5v-5.5h-6v5.5h-5Z"/></svg>' },
    hex: { name: 'Hex node', svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3l11 6.5v13L16 29 5 22.5v-13Z"/><circle cx="16" cy="16" r="3.5" fill="currentColor" stroke="none"/></svg>' },
    code: { name: 'Code', svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10l-7 6 7 6"/><path d="M20 10l7 6-7 6"/><path d="M18 7l-4 18"/></svg>' },
    prompt: { name: 'Prompt', svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="24" height="22" rx="6"/><path d="M10 12l3 4-3 4"/><path d="M15 20h9"/></svg>' },
    'h-line': { name: 'H outline', svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="4" y="4" width="24" height="24" rx="7"/><path d="M11 11v10M21 11v10M11 16h10"/></svg>' },
    slash: { name: 'Comment', svg: '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M9 8l10 16"/><path d="M22 8l-10 16"/></svg>' }
  };
  const footerTreatments = {
    rule: { name: 'Rule', note: 'Centred single line above a fine rule.' },
    split: { name: 'Split', note: 'Copyright left, licence centre, credits right.' },
    minimal: { name: 'Minimal', note: 'Quiet centred text, no rule.' },
    boxed: { name: 'Boxed', note: 'Footer inside a rounded, bordered surface.' },
    stacked: { name: 'Stacked', note: 'Copy, licence and credits stacked in a column.' }
  };
  const searchPopups = {
    spotlight: { name: 'Spotlight', note: 'Fade in and gently scale up.' },
    dropdown: { name: 'Drop down', note: 'Fade in and slide down from the top.' },
    riseup: { name: 'Rise up', note: 'Slide up from the bottom.' },
    fade: { name: 'Fade', note: 'A quiet opacity fade with no movement.' },
    scaleblur: { name: 'Scale + blur', note: 'Backdrop blurs in as the modal scales up.' },
    sidebar: { name: 'Side drawer', note: 'A full-height panel that slides in from the right.' },
    glass: { name: 'Frosted glass', note: 'A translucent card with a frosted backdrop.' },
    fullscreen: { name: 'Fullscreen', note: 'Search takes over the whole viewport.' },
    command: { name: 'Command bar', note: 'A compact palette bar near the top.' }
  };
  const layouts = {
    profile: { name: 'Profile + writing', note: 'Lead with a personal introduction, then recent writing and talks.', source: 'https://jpanther.github.io/congo/docs/homepage-layout/', reference: 'Congo profile reference' },
    writing: { name: 'Writing first', note: 'Small introduction, chronological titles, no hero or cards. Least visual machinery.', source: 'https://janraasch.github.io/hugo-bearblog/', reference: 'Bear Blog reference' },
    sidebar: { name: 'Sidebar notebook', note: 'Persistent author and topic navigation beside the content. A custom layout experiment.', source: '/design-lab/#page-structures', reference: 'About this structure' },
    magazine: { name: 'Magazine', note: 'One featured article, a story grid, and a separate talks column.', source: 'https://blowfish.page/docs/homepage-layout/', reference: 'Blowfish layout reference' },
    library: { name: 'Topic library', note: 'Browse topics and series before the timeline. Sidebar navigation follows you into articles.', source: 'https://imfing.github.io/hextra/docs/guide/organize-files/', reference: 'Hextra structure reference' },
    split: { name: 'Split editorial', note: 'A personal introduction on the left; writing scrolls on the right. A custom layout experiment.', source: 'https://www.davideimola.dev/about', reference: 'Davide editorial reference' }
  };
  const presets = {
    minimal: { layout: 'writing' },
    personal: { layout: 'profile' },
    magazine: { layout: 'magazine' },
    library: { layout: 'library' },
    sidebar: { layout: 'sidebar' },
    split: { layout: 'split' },
    'soft-panels': { design: 'studio', layout: 'profile', font: 'default' },
    'literary-profile': { design: 'profile-journal', layout: 'profile', font: 'default' },
    'humanist-profile': { design: 'profile-humanist', layout: 'profile', font: 'default' },
    'serif-profile': { design: 'profile-serif', layout: 'profile', font: 'default' },
    'bold-profile': { design: 'profile-bold', layout: 'profile', font: 'default' },
    'quiet-profile': { design: 'profile-calm', layout: 'profile', font: 'default' }
  };
  const catppuccinFlavours = { latte: 'Latte', frappe: 'Frappé', macchiato: 'Macchiato', mocha: 'Mocha' };
  const catppuccinAccents = { mauve: 'Mauve', teal: 'Teal', peach: 'Peach' };
  Object.entries(catppuccinFlavours).forEach(([flavour, name]) => {
    Object.entries(catppuccinAccents).forEach(([accent, mood]) => {
      const id = `cat-${flavour}-${accent}`;
      themes[id] = { name: `Catppuccin ${name} · ${mood}`, dark: flavour !== 'latte' };
    });
  });
  const accents = { default: 'Theme default', rose: 'Rose', blue: 'Blue', green: 'Green', peach: 'Peach', mauve: 'Mauve', teal: 'Teal' };
  const bodyFonts = {
    jost: { name: 'Jost (live blog)', family: "'Jost', serif" },
    system: { name: 'System sans (live blog UI)', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif' },
    source: { name: 'Source Sans 3', family: "'Source Sans 3', sans-serif" },
    lato: { name: 'Lato', family: "'Lato', sans-serif" },
    noto: { name: 'Noto Sans', family: "'Noto Sans', sans-serif" },
    newsreader: { name: 'Newsreader', family: "'Newsreader', Georgia, serif" },
    serif: { name: 'Source Serif 4', family: "'Source Serif 4', Georgia, serif" },
    plex: { name: 'IBM Plex Sans', family: "'IBM Plex Sans', sans-serif" },
    instrument: { name: 'Instrument Sans', family: "'Instrument Sans', sans-serif" },
    dm: { name: 'DM Sans', family: "'DM Sans', sans-serif" },
    literata: { name: 'Literata', family: "'Literata', Georgia, serif" },
    grotesk: { name: 'Schibsted Grotesk', family: "'Schibsted Grotesk', sans-serif" },
    radio: { name: 'Radio Canada Big', family: "'Radio Canada Big', sans-serif" }
  };
  const headingFonts = {
    serif: { name: 'Source Serif 4', family: "'Source Serif 4', Georgia, serif" },
    newsreader: { name: 'Newsreader', family: "'Newsreader', Georgia, serif" },
    grotesk: { name: 'Schibsted Grotesk', family: "'Schibsted Grotesk', sans-serif" },
    space: { name: 'Space Grotesk', family: "'Space Grotesk', sans-serif", maxWeight: 700 },
    manrope: { name: 'Manrope', family: "'Manrope', sans-serif" },
    fraunces: { name: 'Fraunces', family: "'Fraunces', Georgia, serif" },
    radio: { name: 'Radio Canada Big', family: "'Radio Canada Big', sans-serif", maxWeight: 700 }
  };
  const headingWeights = { '500': { name: 'Medium (500)' }, '600': { name: 'Semibold (600)' }, '700': { name: 'Bold (700)' }, '800': { name: 'Extra Bold (800)' } };
  const monoFonts = {
    monolisa: { name: 'MonoLisa (installed locally)', family: "'MonoLisa', monospace" },
    geist: { name: 'Geist Mono', family: "'Geist Mono', monospace" },
    plex: { name: 'IBM Plex Mono', family: "'IBM Plex Mono', monospace" },
    jetbrains: { name: 'JetBrains Mono', family: "'JetBrains Mono', monospace" }
  };
  const pageLayouts = {
    talks: { name: 'Talks', options: { original: { name: 'Original' }, programme: { name: 'Yearly programme' }, featured: { name: 'Featured talk + timeline' }, library: { name: 'Talk library' }, timeline: { name: 'Timeline' }, milestone: { name: 'Milestone cards' }, rail: { name: 'Year rail' }, poster: { name: 'Poster wall' } } },
    writing: { name: 'Writing', options: { original: { name: 'Original' }, editorial: { name: 'Editorial index' }, magazine: { name: 'Magazine' }, compact: { name: 'Compact reading list' } } },
    uses: { name: 'Uses', options: { original: { name: 'Original' }, inventory: { name: 'Categorised inventory' }, story: { name: 'Setup story' }, reference: { name: 'Compact reference' } } },
    archive: { name: 'Archive', options: { original: { name: 'Original' }, months: { name: 'Year navigation + months' }, compact: { name: 'Compact yearly index' } } },
    topics: { name: 'Topics / categories / series', options: { original: { name: 'Original' }, directory: { name: 'Counted directory' }, alphabetical: { name: 'Alphabetical index' } } },
    talk: { name: 'Individual talk', options: { original: { name: 'Original' }, briefing: { name: 'Resource-first briefing' }, watch: { name: 'Watch-first presentation' } } },
    article: { name: 'Article', options: { original: { name: 'Original' }, reading: { name: 'Reading-focused' }, contents: { name: 'Contents rail' }, editorial: { name: 'Editorial header' } } }
  };
  const homeControls = {
    heroLayout: { label: 'Introduction layout', group: 'Introduction & portrait', options: { default: { name: 'Follow overall structure' }, side: { name: 'Side by side' }, stacked: { name: 'Stacked' } } },
    portraitVisibility: { label: 'Portrait', group: 'Introduction & portrait', options: { default: { name: 'Follow overall structure' }, show: { name: 'Show' }, hide: { name: 'Hide' } } },
    portraitSize: { label: 'Portrait size', group: 'Introduction & portrait', options: { default: { name: 'Style default' }, small: { name: 'Small · 160px' }, medium: { name: 'Medium · 220px' }, large: { name: 'Large · 280px' } } },
    portraitShape: { label: 'Portrait shape', group: 'Introduction & portrait', options: { default: { name: 'Style default' }, arch: { name: 'Arch' }, rounded: { name: 'Rounded' }, circle: { name: 'Circle' }, square: { name: 'Square' } } },
    sectionGap: { label: 'Section gap', group: 'Spacing & panels', options: { default: { name: 'Style default' }, compact: { name: 'Compact · 24px' }, comfortable: { name: 'Comfortable · 48px' }, airy: { name: 'Airy · 72px' } } },
    cardPadding: { label: 'Card padding', group: 'Spacing & panels', options: { default: { name: 'Style default' }, compact: { name: 'Compact · 16px' }, comfortable: { name: 'Comfortable · 24px' }, spacious: { name: 'Spacious · 32px' } } },
    corners: { label: 'Panel corners', group: 'Spacing & panels', options: { default: { name: 'Style default' }, square: { name: 'Square · 0px' }, soft: { name: 'Soft · 12px' }, round: { name: 'Round · 24px' } } },
    writingCount: { label: 'Number of posts', group: 'Recent writing', type: 'number', min: 1, max: 12 },
    writingSummaries: { label: 'Post summaries', group: 'Recent writing', options: { default: { name: 'Follow overall structure' }, full: { name: 'Full excerpts' }, short: { name: 'Short · two lines' }, off: { name: 'Hidden' } } },
    writingDates: { label: 'Show post dates', group: 'Recent writing', type: 'checkbox' },
    talkCount: { label: 'Number of talks', group: 'Speaking preview', type: 'number', min: 1, max: 6 },
    talkDates: { label: 'Show publication dates', group: 'Speaking preview', type: 'checkbox' },
    talkDetails: { label: 'Talk details', group: 'Speaking preview', options: { titles: { name: 'Titles only' }, event: { name: 'Titles + event' }, resources: { name: 'Event + slides / recordings' } } }
  };
  const homeSections = { featured: { name: 'Featured article' }, discover: { name: 'Explore topics' }, writing: { name: 'Recent writing' }, talks: { name: 'Speaking' }, bottom: { name: 'Setup & archive links' } };
  const homeDefaults = { heroLayout: 'default', portraitVisibility: 'default', portraitSize: 'default', portraitShape: 'default', sectionGap: 'default', cardPadding: 'default', corners: 'default', writingCount: 6, writingSummaries: 'default', writingDates: true, talkCount: 3, talkDates: true, talkDetails: 'titles', sections: Object.fromEntries(Object.keys(homeSections).map(id => [id, 'default'])), order: Object.keys(homeSections) };
  function validateHome(value) {
    const valid = { ...homeDefaults, sections: { ...homeDefaults.sections }, order: [...homeDefaults.order] };
    if (!value || typeof value !== 'object' || Array.isArray(value)) return valid;
    Object.entries(homeControls).forEach(([key, control]) => {
      const choice = value[key];
      if (control.options && typeof choice === 'string' && Object.hasOwn(control.options, choice)) valid[key] = choice;
      if (control.type === 'checkbox' && typeof choice === 'boolean') valid[key] = choice;
      if (control.type === 'number' && Number.isInteger(choice)) valid[key] = Math.min(control.max, Math.max(control.min, choice));
    });
    if (value.sections && typeof value.sections === 'object' && !Array.isArray(value.sections)) {
      Object.keys(homeSections).forEach(id => { if (['default', 'show', 'hide'].includes(value.sections[id])) valid.sections[id] = value.sections[id]; });
    }
    if (Array.isArray(value.order)) {
      const order = [...new Set(value.order.filter(id => typeof id === 'string' && Object.hasOwn(homeSections, id)))];
      valid.order = [...order, ...homeDefaults.order.filter(id => !order.includes(id))];
    }
    return valid;
  }
  const pageSamples = {
    home: { name: 'Home', path: '/' },
    talks: { name: 'Talks', path: '/talks/' }, writing: { name: 'Writing', path: '/posts/' },
    uses: { name: 'Uses', path: '/uses/' }, archive: { name: 'Archive', path: '/archive/' },
    topics: { name: 'Tags', path: '/tags/' },
    categories: { name: 'Categories', path: '/categories/', kind: 'topics' },
    series: { name: 'Series', path: '/series/', kind: 'topics' }, talk: { name: 'Individual talk · Go + HTMX', path: '/talks/go-labs-htmx-go-web-app/' },
    article: { name: 'Article', path: '/posts/2026-08-15-how-i-implemented-authorization-in-my-go-app-with-rls-postgres/' }
  };
  const pageDefaults = Object.fromEntries(Object.keys(pageLayouts).map(kind => [kind, kind === 'talks' ? 'programme' : 'original']));
  function validatePages(value) {
    const valid = { ...pageDefaults };
    if (!value || typeof value !== 'object' || Array.isArray(value)) return valid;
    Object.entries(pageLayouts).forEach(([kind, info]) => {
      if (typeof value[kind] === 'string' && Object.hasOwn(info.options, value[kind])) valid[kind] = value[kind];
    });
    return valid;
  }
  const pairFields = ['lightTheme', 'lightAccent', 'darkTheme', 'darkAccent'];
  const comparisonPairs = {
    catppuccin: { name: 'Catppuccin', defaults: { lightTheme: 'cat-latte-mauve', lightAccent: 'teal', darkTheme: 'cat-mocha-mauve', darkAccent: 'teal' } },
    fireside: { name: 'Fireside', defaults: { lightTheme: 'fireside-light', lightAccent: 'default', darkTheme: 'fireside-dark', darkAccent: 'default' } }
  };
  function activeBuilderPair(value) {
    if (value.lightTheme.startsWith('cat-') && value.darkTheme.startsWith('cat-')) return 'catppuccin';
    if (value.lightTheme === 'fireside-light' && value.darkTheme === 'fireside-dark') return 'fireside';
    return '';
  }
  function validateColourPair(value, id) {
    const valid = { ...comparisonPairs[id].defaults };
    if (!value || typeof value !== 'object' || Array.isArray(value)) return valid;
    pairFields.forEach(key => {
      const choice = value[key];
      if (typeof choice !== 'string') return;
      if (key.endsWith('Accent')) {
        if (Object.hasOwn(accents, choice)) valid[key] = choice;
      } else if (Object.hasOwn(themes, choice) && themes[choice].dark === key.startsWith('dark')) {
        if (id === 'catppuccin' ? choice.startsWith('cat-') : choice === comparisonPairs[id].defaults[key]) valid[key] = choice;
      }
    });
    return valid;
  }
  const builderDefaults = { pages: { ...pageDefaults }, style: 'studio', body: 'plex', heading: 'serif', headingWeight: '500', mono: 'geist', code: 'neovim', navbar: 'pill', logo: 'none', footer: 'rule', searchPopup: 'spotlight', ...comparisonPairs.catppuccin.defaults };
  function validateBuilder(value) {
    const valid = { ...builderDefaults };
    if (!value || typeof value !== 'object' || Array.isArray(value)) value = {};
    const choices = { style: designs, body: bodyFonts, heading: headingFonts, headingWeight: headingWeights, mono: monoFonts, code: { plain: true, neovim: true }, navbar: navbars, logo: logoMarks, footer: footerTreatments, searchPopup: searchPopups, lightTheme: themes, darkTheme: themes, lightAccent: accents, darkAccent: accents };
    Object.entries(choices).forEach(([key, options]) => {
      if (typeof value[key] === 'string' && Object.hasOwn(options, value[key])) valid[key] = value[key];
    });
    valid.headingWeight = String(Math.min(Number(valid.headingWeight), headingFonts[valid.heading].maxWeight || 800));
    valid.pages = validatePages(value.pages);
    valid.home = validateHome(value.home);
    if (themes[valid.lightTheme].dark) valid.lightTheme = builderDefaults.lightTheme;
    if (!themes[valid.darkTheme].dark) valid.darkTheme = builderDefaults.darkTheme;
    const savedPairs = value.pairs && typeof value.pairs === 'object' && !Array.isArray(value.pairs) ? value.pairs : {};
    valid.pairs = Object.fromEntries(Object.keys(comparisonPairs).map(id => [id, validateColourPair(savedPairs[id], id)]));
    const currentPair = activeBuilderPair(valid);
    if (currentPair) valid.pairs[currentPair] = Object.fromEntries(pairFields.map(key => [key, valid[key]]));
    return valid;
  }
  function selectBuilderPair(value, id) {
    const valid = validateBuilder(value);
    return Object.hasOwn(comparisonPairs, id) ? validateBuilder({ ...valid, ...valid.pairs[id] }) : valid;
  }
  const isBuilderPreview = root.hasAttribute('data-builder-preview');
  const defaults = { design: 'editorial', theme: 'editorial', layout: 'profile', font: 'default', mode: 'default', accent: 'default', artStyle: 'line', navbar: 'pill', logo: 'none', footer: 'rule', searchPopup: 'spotlight', width: 760, size: 19, collapsed: false, builderEnabled: false, builder: null, pages: { ...pageDefaults } };
  let settings = { ...defaults };
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      for (const key of ['design', 'theme', 'layout', 'font', 'mode', 'accent', 'artStyle', 'navbar', 'logo', 'footer', 'searchPopup']) {
        if (typeof stored[key] === 'string') settings[key] = stored[key];
      }
      for (const key of ['width', 'size']) {
        if (typeof stored[key] === 'number' && Number.isFinite(stored[key])) settings[key] = stored[key];
      }
      settings.pages = validatePages(stored.pages);
      settings.collapsed = stored.collapsed === true;
      if (stored.builder && typeof stored.builder === 'object' && !Array.isArray(stored.builder)) {
        settings.builder = validateBuilder(stored.builder);
        settings.builderEnabled = stored.builderEnabled === true;
      }
      // Older sessions stored palette and typography together as design.
      if (typeof stored.theme !== 'string' && typeof stored.design === 'string') {
        if (Object.hasOwn(themes, stored.design)) {
          settings.theme = stored.design;
          if (stored.design.startsWith('cat-')) settings.design = 'reading';
          if (stored.design.startsWith('fireside-')) settings.design = 'fireside';
        }
      }
    }
  } catch (_) {}
  if (!Object.hasOwn(designs, settings.design)) settings.design = defaults.design;
  if (!Object.hasOwn(themes, settings.theme)) settings.theme = defaults.theme;
  if (!Object.hasOwn(fonts, settings.font)) settings.font = defaults.font;
  if (!Object.hasOwn(layouts, settings.layout)) settings.layout = defaults.layout;
  if (!Object.hasOwn(artStyles, settings.artStyle)) settings.artStyle = defaults.artStyle;
  if (!Object.hasOwn(navbars, settings.navbar)) settings.navbar = defaults.navbar;
  if (!Object.hasOwn(logoMarks, settings.logo)) settings.logo = defaults.logo;
  if (!Object.hasOwn(footerTreatments, settings.footer)) settings.footer = defaults.footer;
  if (!Object.hasOwn(searchPopups, settings.searchPopup)) settings.searchPopup = defaults.searchPopup;
  if (!['default', 'light', 'dark'].includes(settings.mode)) settings.mode = defaults.mode;
  if (!Object.hasOwn(accents, settings.accent)) settings.accent = defaults.accent;
  settings.width = Math.min(960, Math.max(620, Number(settings.width) || defaults.width));
  settings.size = Math.min(24, Math.max(16, Number(settings.size) || defaults.size));
  settings.collapsed = settings.collapsed === true;

  function apply(persist = !isBuilderPreview) {
    const dark = settings.mode === 'dark' || (settings.mode === 'default' && themes[settings.theme].dark);
    const custom = settings.builderEnabled ? settings.builder : null;
    if (custom) settings.design = custom.style;
    const theme = custom ? custom[dark ? 'darkTheme' : 'lightTheme'] : settings.theme;
    const accent = custom ? custom[dark ? 'darkAccent' : 'lightAccent'] : settings.accent;
    root.dataset.design = settings.design;
    root.dataset.theme = theme;
    root.dataset.layout = settings.layout;
    root.dataset.font = custom ? 'custom' : settings.font;
    root.dataset.mode = dark ? 'dark' : 'light';
    root.dataset.accent = accent;
    root.dataset.neovim = String(custom ? custom.code === 'neovim' : theme === 'cat-mocha-teal');
    root.dataset.builderActive = String(Boolean(custom));
    root.dataset.builderPair = custom ? activeBuilderPair(custom) || 'custom' : '';
    document.querySelectorAll('[data-lab-builder-pair]').forEach(button => {
      button.setAttribute('aria-pressed', String(Boolean(custom) && button.dataset.labBuilderPair === root.dataset.builderPair));
    });
    const chosenFonts = custom ? { body: bodyFonts[custom.body].family, heading: headingFonts[custom.heading].family, mono: monoFonts[custom.mono].family } : null;
    for (const key of ['body', 'heading', 'mono']) {
      if (chosenFonts) root.style.setProperty('--lab-' + key, chosenFonts[key]);
      else root.style.removeProperty('--lab-' + key);
    }
    if (custom) root.style.setProperty('--lab-heading-weight', custom.headingWeight);
    else root.style.removeProperty('--lab-heading-weight');
    root.dataset.artStyle = settings.artStyle;
    root.dataset.navbar = custom ? custom.navbar : settings.navbar;
    root.dataset.footer = custom ? custom.footer : settings.footer;
    root.dataset.searchPopup = custom ? custom.searchPopup : settings.searchPopup;
    const markId = custom ? custom.logo : settings.logo;
    root.dataset.logo = markId;
    const logoLink = document.querySelector('.logo a');
    if (logoLink) {
      let mark = logoLink.querySelector('.lab-mark');
      if (!mark) {
        mark = document.createElement('span');
        mark.className = 'lab-mark';
        mark.setAttribute('aria-hidden', 'true');
        logoLink.prepend(mark);
      }
      mark.innerHTML = markId && markId !== 'none' ? logoMarks[markId].svg : '';
      mark.hidden = !markId || markId === 'none';
    }
    root.style.colorScheme = dark ? 'dark' : 'light';
    root.style.setProperty('--lab-reading-width', settings.width + 'px');
    root.style.setProperty('--lab-text-size', settings.size + 'px');
    if (document.body) document.body.classList.toggle('dark', dark);
    document.querySelectorAll('[data-lab-setting]').forEach(control => {
      const key = control.dataset.labSetting;
      control.value = key === 'theme' ? theme : key === 'accent' ? accent : settings[key];
    });
    document.querySelectorAll('[data-lab-design]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.labDesign === settings.design));
      button.title = custom ? designs[button.dataset.labDesign].name + ' treatment; keeps your builder fonts and heading weight.' : designs[button.dataset.labDesign].note;
    });
    const styledPreset = Object.entries(presets).find(([, preset]) => !custom && preset.design === settings.design && preset.layout === settings.layout && preset.font === settings.font);
    const activePreset = styledPreset ? styledPreset[0] : Object.keys(presets).find(key => !presets[key].design && presets[key].layout === settings.layout);
    document.querySelectorAll('[data-lab-preset]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.labPreset === activePreset));
    });
    const panel = document.getElementById('lab-panel');
    if (panel) panel.hidden = settings.collapsed;
    const toggle = document.getElementById('lab-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(!settings.collapsed));
      toggle.textContent = settings.collapsed ? 'Customise design' : 'Hide controls';
    }
    const name = document.getElementById('lab-current');
    if (name) name.textContent = (custom ? 'Builder · ' + designs[custom.style].name : designs[settings.design].name) + ' / ' + themes[theme].name + ' / ' + layouts[settings.layout].name;
    const note = document.getElementById('lab-note');
    if (note) note.textContent = (custom ? bodyFonts[custom.body].name + ' body · ' + headingFonts[custom.heading].name + ' ' + headingWeights[custom.headingWeight].name + ' headings · ' + monoFonts[custom.mono].name + ' code' : designs[settings.design].note) + ' · Palette: ' + themes[theme].name;
    const builderNotice = document.getElementById('lab-builder-active');
    if (builderNotice) builderNotice.hidden = !custom;
    const styleLabel = document.getElementById('lab-style-label');
    if (styleLabel) styleLabel.textContent = custom ? 'Style · visual treatment · preserves your builder fonts and heading weight' : 'Style · fonts, typography & visual treatment · does not change colours';
    const layoutNote = document.getElementById('lab-layout-note');
    if (layoutNote) layoutNote.textContent = layouts[settings.layout].note;
    const reference = document.getElementById('lab-layout-source');
    if (reference) {
      reference.href = layouts[settings.layout].source;
      reference.textContent = layouts[settings.layout].reference + ' ↗';
    }
    const width = document.getElementById('lab-width-value');
    if (width) width.value = settings.width + 'px';
    const size = document.getElementById('lab-size-value');
    if (size) size.value = settings.size + 'px';
    if (document.body) { applyPageLayout(); applyHome(custom ? custom.home : homeDefaults); bindCodePreview(); }
    if (persist) {
      try { localStorage.setItem(storageKey, JSON.stringify(settings)); return true; } catch (_) { return false; }
    }
    return false;
  }
  function applyHome(home) {
    Object.keys(homeControls).forEach(key => { root.dataset['home' + key[0].toUpperCase() + key.slice(1)] = String(home[key]); });
    root.dataset.homeCustomOrder = String(home.order.join('|') !== homeDefaults.order.join('|'));
    const main = document.querySelector('body.kind-home main.main');
    if (!main) return;
    main.querySelectorAll('[data-home-post]').forEach((entry, index) => { entry.hidden = index >= home.writingCount; });
    main.querySelectorAll('[data-home-talk]').forEach((entry, index) => { entry.hidden = index >= home.talkCount; });
    const sections = [...main.querySelectorAll(':scope > [data-home-section]')];
    sections.forEach(section => {
      const visibility = home.sections[section.dataset.homeSection] || 'default';
      section.dataset.homeVisibility = visibility;
      section.hidden = visibility === 'hide';
    });
    const current = sections.map(section => section.dataset.homeSection);
    const order = home.order.filter(id => current.includes(id));
    if (current.join('|') !== order.join('|')) order.forEach(id => main.append(sections.find(section => section.dataset.homeSection === id)));
  }
  function applyPageLayout() {
    const kind = document.body.dataset.labPage;
    const info = pageLayouts[kind];
    const variant = info ? settings.pages[kind] : 'original';
    root.dataset.pageVariant = variant;
    const main = document.querySelector('main.main');
    if (main) {
      const alternatives = main.querySelectorAll('[data-page-variant]');
      alternatives.forEach(section => { section.hidden = section.dataset.pageVariant !== variant; });
      main.querySelectorAll('[data-page-original]').forEach(section => {
        section.hidden = variant !== 'original' && alternatives.length > 0;
      });
    }
    const control = document.getElementById('lab-page-layout');
    if (control) {
      const label = control.closest('label');
      label.hidden = !info || isBuilderPreview;
      if (info) {
        if (control.dataset.pageKind !== kind) {
          control.replaceChildren();
          Object.entries(info.options).forEach(([id, option]) => control.add(new Option(option.name, id)));
          control.dataset.pageKind = kind;
        }
        control.value = variant;
        control.oninput = () => {
          settings.pages = { ...settings.pages, [kind]: control.value };
          if (settings.builderEnabled) settings.builder = { ...settings.builder, pages: { ...settings.pages } };
          apply();
          const status = document.getElementById('lab-page-status');
          if (status) status.textContent = info.name + ' layout: ' + info.options[control.value].name;
        };
      }
    }
  }
  function leaveBuilder() {
    if (!settings.builderEnabled) return;
    settings.theme = root.dataset.theme;
    settings.accent = root.dataset.accent;
    settings.builderEnabled = false;
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const supportsArtMotion = typeof Element.prototype.animate === 'function' && typeof Element.prototype.getAnimations === 'function';
  const playedArt = new WeakSet();
  let artObserver;

  function playArtwork(figure) {
    figure.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
    if (reducedMotion.matches) return;
    const strokes = [...figure.querySelectorAll('svg path, svg rect, svg circle')].filter(shape => {
      const style = getComputedStyle(shape);
      return typeof shape.getTotalLength === 'function' && style.stroke !== 'none' &&
        style.strokeDasharray === 'none' && !shape.closest('[data-art-accent]') && !shape.hasAttribute('data-art-on-accent');
    });
    strokes.forEach((shape, index) => {
      const length = shape.getTotalLength();
      if (!length) return;
      shape.animate([
        { strokeDasharray: `${length} ${length}`, strokeDashoffset: length },
        { strokeDasharray: `${length} ${length}`, strokeDashoffset: 0 }
      ], { duration: 900, delay: Math.min(index * 18, 400), easing: 'ease-out', fill: 'backwards' });
    });
    figure.querySelectorAll('[data-art-accent] > *, [data-art-on-accent]').forEach((shape, index) => {
      shape.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 280, delay: 850 + index * 80, easing: 'ease-out', fill: 'backwards'
      });
    });
  }

  function bindArtwork() {
    if (!supportsArtMotion) return;
    if (artObserver) artObserver.disconnect();
    const figures = document.querySelectorAll('.lab-art');
    figures.forEach(figure => {
      const button = figure.querySelector('.lab-art-replay');
      if (button) {
        button.hidden = false;
        button.disabled = reducedMotion.matches;
        button.title = reducedMotion.matches ? 'Animation disabled by your reduced-motion preference' : 'Replay this drawing';
        button.onclick = () => { playedArt.add(figure); playArtwork(figure); };
      }
      if (reducedMotion.matches) figure.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
    });
    if (reducedMotion.matches || !window.IntersectionObserver) return;
    artObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        playedArt.add(entry.target);
        playArtwork(entry.target);
        artObserver.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    figures.forEach(figure => { if (!playedArt.has(figure)) artObserver.observe(figure); });
  }

  function bindCodePreview() {
    document.querySelectorAll('.lab-neovim').forEach(block => {
      if (settings.builderEnabled || block.closest('[data-lab-neovim]')) return;
      block.querySelectorAll(':scope > .lab-code-tab, :scope > .lab-code-status').forEach(chrome => chrome.remove());
      block.classList.remove('lab-neovim');
    });
    const selector = settings.builderEnabled ? '.post-content .highlight' : '[data-lab-neovim] .post-content .highlight';
    document.querySelectorAll(selector).forEach((block, index) => {
      if (block.classList.contains('lab-neovim')) return;
      const code = block.querySelector('pre > code[data-lang]');
      const lines = code ? code.querySelectorAll(':scope > .line').length : 0;
      if (!lines || block.querySelector('table')) return;
      const language = code.dataset.lang;
      const label = `${language.toUpperCase()} · snippet ${String(index + 1).padStart(2, '0')}`;
      const tab = document.createElement('div');
      tab.className = 'lab-code-tab';
      tab.setAttribute('aria-hidden', 'true');
      tab.textContent = label;
      const status = document.createElement('div');
      status.className = 'lab-code-status';
      status.setAttribute('aria-hidden', 'true');
      const mode = document.createElement('strong');
      mode.textContent = 'NORMAL';
      const filetype = document.createElement('span');
      filetype.className = 'lab-code-language';
      filetype.textContent = language;
      const summary = document.createElement('span');
      summary.textContent = `${lines} ${lines === 1 ? 'line' : 'lines'} · read only`;
      status.append(mode, filetype, summary);
      block.classList.add('lab-neovim');
      block.prepend(tab);
      block.append(status);
    });
  }

  function bind() {
    const styles = document.getElementById('lab-styles');
    if (styles && !styles.children.length) {
      Object.entries(designs).forEach(([id, info]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.labDesign = id;
        button.title = info.note;
        const swatch = document.createElement('span');
        swatch.className = 'lab-swatch lab-swatch-' + id;
        swatch.setAttribute('aria-hidden', 'true');
        swatch.textContent = 'Aa';
        button.append(swatch, info.name);
        styles.append(button);
      });
    }
    const theme = document.getElementById('lab-theme');
    if (theme && !theme.options.length) {
      Object.entries(themes).forEach(([id, info]) => theme.add(new Option(info.name, id)));
    }
    const font = document.getElementById('lab-font');
    if (font && !font.options.length) {
      Object.entries(fonts).forEach(([value, label]) => font.add(new Option(label, value)));
    }
    const layout = document.getElementById('lab-layout');
    if (layout && !layout.options.length) {
      Object.entries(layouts).forEach(([value, info]) => layout.add(new Option(info.name, value)));
    }
    const artwork = document.getElementById('lab-art-style');
    if (artwork && !artwork.options.length) {
      Object.entries(artStyles).forEach(([value, label]) => artwork.add(new Option(label, value)));
    }
    document.querySelectorAll('[data-lab-preset]').forEach(button => {
      button.onclick = () => {
        const preset = presets[button.dataset.labPreset];
        if (preset.design) leaveBuilder();
        settings = { ...settings, ...preset };
        apply();
      };
    });
    document.querySelectorAll('[data-lab-setting]').forEach(control => {
      control.oninput = () => {
        const key = control.dataset.labSetting;
        if (['font', 'theme', 'accent'].includes(key)) leaveBuilder();
        settings[key] = control.type === 'range' ? Number(control.value) : control.value;
        apply();
      };
    });
    document.querySelectorAll('[data-lab-design]').forEach(button => {
      button.onclick = () => {
        if (settings.builderEnabled) settings.builder = { ...settings.builder, style: button.dataset.labDesign };
        else settings.design = button.dataset.labDesign;
        apply();
      };
    });
    document.querySelectorAll('[data-lab-builder-pair]').forEach(button => {
      button.onclick = () => {
        if (!settings.builderEnabled) return;
        settings.builder = selectBuilderPair(settings.builder, button.dataset.labBuilderPair);
        const saved = apply();
        const status = document.getElementById('lab-builder-pair-status');
        if (status) status.textContent = comparisonPairs[button.dataset.labBuilderPair].name + (saved ? ' pair saved. Fonts and layouts unchanged.' : ' pair selected for this visit. Storage is unavailable.');
      };
    });
    const toggle = document.getElementById('lab-toggle');
    if (toggle) toggle.onclick = () => { settings.collapsed = !settings.collapsed; apply(); };
    const builderExit = document.getElementById('lab-builder-exit');
    if (builderExit) builderExit.onclick = () => { leaveBuilder(); apply(); };
    const reset = document.getElementById('lab-reset');
    if (reset) reset.onclick = () => { settings = { ...defaults }; apply(); };
    apply();
    bindArtwork();
    bindCodePreview();
  }
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    bind();
    reducedMotion.addEventListener('change', bindArtwork);
    // The existing header dispatches this event after toggling its body class.
    window.addEventListener('toggle-theme', () => {
      settings.mode = document.body.classList.contains('dark') ? 'dark' : 'light';
      apply();
    });
    if (window.InstantClick) window.InstantClick.on('change', bind);
  });
  window.blogDesignLab = {
    bind,
    builderCatalog: { styles: designs, comparisonPairs, bodyFonts, headingFonts, headingWeights, monoFonts, themes, accents, homeControls, homeDefaults, homeSections, pageLayouts, pageSamples, pageDefaults, defaults: builderDefaults, navbars, logoMarks, footerTreatments, searchPopups },
    validateBuilder,
    getAppliedBuilder() { return settings.builderEnabled ? validateBuilder(settings.builder) : null; },
    selectBuilderPair,
    activeBuilderPair,
    previewBuilder(value, mode) {
      settings = { ...settings, font: 'default', builder: validateBuilder(value), pages: validatePages(value && value.pages), builderEnabled: true, mode: mode === 'dark' ? 'dark' : 'light' };
      return apply(false);
    },
    useBuilder(value, mode) {
      settings = { ...settings, font: 'default', builder: validateBuilder(value), pages: validatePages(value && value.pages), builderEnabled: true, mode: mode === 'dark' ? 'dark' : 'light', collapsed: true };
      return apply();
    }
  };
})();
