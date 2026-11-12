// Self-hosted Fuse.js search over a slim JSON index, with a polished modal.
const fuseOptions = {
  shouldSort: true,
  ignoreLocation: true,
  findAllMatches: true,
  threshold: 0.3,
  minMatchCharLength: 3,
  includeMatches: true,
  keys: [
    { name: 'title', weight: 0.8 },
    { name: 'section', weight: 0.2 },
    { name: 'summary', weight: 0.6 },
    { name: 'tags', weight: 0.5 },
    { name: 'content', weight: 0.3 }
  ]
};

let fuse = null;
let indexed = false;
let searchVisible = false;
let resultLinks = [];

const showButton = document.getElementById('search-button');
const hideButton = document.getElementById('close-search-button');
const wrapper = document.getElementById('search-wrapper');
const modal = document.getElementById('search-modal');
const input = document.getElementById('search-query');
const output = document.getElementById('search-results');
const status = document.getElementById('search-status');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function highlightTerms(value, terms, maxMarks) {
  const text = String(value || '');
  if (!terms || !terms.length) return escapeHtml(text);
  const intervals = [];
  const lowerText = text.toLowerCase();
  terms.forEach(term => {
    if (!term) return;
    const lowerTerm = term.toLowerCase();
    let pos = 0;
    while ((pos = lowerText.indexOf(lowerTerm, pos)) !== -1) {
      let start = pos;
      let end = pos + lowerTerm.length;
      const wordCharacter = /[\p{L}\p{N}_]/u;
      while (start > 0 && wordCharacter.test(text[start - 1])) start--;
      while (end < text.length && wordCharacter.test(text[end])) end++;
      intervals.push([start, end]);
      pos += 1;
    }
  });
  if (!intervals.length) return escapeHtml(text);
  intervals.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged = [];
  let cur = intervals[0];
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] <= cur[1]) {
      cur[1] = Math.max(cur[1], intervals[i][1]);
    } else {
      merged.push(cur);
      cur = intervals[i];
    }
  }
  merged.push(cur);
  if (maxMarks && maxMarks > 0) merged.splice(maxMarks);
  let html = '';
  let cursor = 0;
  merged.forEach(([start, end]) => {
    html += escapeHtml(text.slice(cursor, start));
    html += '<mark>' + escapeHtml(text.slice(start, end)) + '</mark>';
    cursor = end;
  });
  html += escapeHtml(text.slice(cursor));
  return html;
}

function searchSnippet(value, terms) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  const positions = terms.map(term => text.toLowerCase().indexOf(term.toLowerCase())).filter(pos => pos >= 0);
  const match = positions.length ? Math.min(...positions) : 0;
  let start = Math.max(0, match - 60);
  if (start > 0) start = text.lastIndexOf(' ', start) + 1;
  let end = Math.min(text.length, start + 200);
  if (end < text.length) {
    const boundary = text.lastIndexOf(' ', end);
    if (boundary > start) end = boundary;
  }
  return (start > 0 ? '… ' : '') + text.slice(start, end) + (end < text.length ? ' …' : '');
}

function setStatus(message) {
  if (!status) return;
  status.textContent = message;
  status.hidden = !message;
}

function displaySearch() {
  if (!indexed) {
    buildIndex();
    setStatus('Indexing posts…');
  }
  if (searchVisible) return;
  document.body.style.overflow = 'hidden';
  wrapper.classList.add('search-open');
  searchVisible = true;
  requestAnimationFrame(() => input.focus());
}

function hideSearch() {
  if (!searchVisible) return;
  document.body.style.overflow = '';
  wrapper.classList.remove('search-open');
  searchVisible = false;
  input.value = '';
  output.innerHTML = '';
  resultLinks = [];
  setStatus('');
  if (showButton) showButton.focus();
}

function moveFocus(dir) {
  if (!searchVisible || !resultLinks.length) return;
  const index = resultLinks.indexOf(document.activeElement);
  const next = index === -1
    ? (dir === 1 ? 0 : resultLinks.length - 1)
    : Math.min(Math.max(index + dir, 0), resultLinks.length - 1);
  resultLinks[next].focus();
}

function trapFocus(event) {
  const focusables = Array.from(modal.querySelectorAll('input, button, a[href]')).filter(el => !el.disabled && el.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

function fetchJSON(path, callback) {
  const request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
      try { callback(JSON.parse(request.responseText)); } catch (_) { callback([]); }
    }
  };
  request.open('GET', path);
  request.send();
}

function buildIndex() {
  fetchJSON(wrapper.getAttribute('data-url') || '/index.json', function (data) {
    fuse = new Fuse(data, fuseOptions);
    indexed = true;
    setStatus('');
    if (searchVisible) executeQuery(input.value);
  });
}

function renderResults(results, term) {
  output.innerHTML = '';
  resultLinks = [];
  if (!results.length) {
    const empty = document.createElement('li');
    empty.className = 'search-empty';
    empty.textContent = term ? 'No results for “' + term + '”.' : 'Start typing to search.';
    output.appendChild(empty);
    setStatus('');
    return;
  }
  setStatus(results.length + (results.length === 1 ? ' result' : ' results'));
  const words = (term || '').trim().split(/\s+/).filter(Boolean);
  const highlightTermsList = words.filter(w => w.length >= 2);
  results.forEach(function (result) {
    const item = result.item;
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'search-item-link';
    link.href = item.permalink;
    link.setAttribute('tabindex', '0');

    const card = document.createElement('div');
    card.className = 'search-item';

    const title = document.createElement('div');
    title.className = 'search-title';
    title.innerHTML = highlightTerms(item.title, highlightTermsList);

    const meta = document.createElement('div');
    meta.className = 'search-meta';
    meta.textContent = [item.section, item.date].filter(Boolean).join(' · ');

    card.appendChild(title);
    card.appendChild(meta);

    if (item.content) {
      const summary = document.createElement('div');
      summary.className = 'search-summary';
      summary.innerHTML = highlightTerms(searchSnippet(item.content, highlightTermsList), highlightTermsList, 3);
      card.appendChild(summary);
    }

    link.appendChild(card);
    li.appendChild(link);
    output.appendChild(li);
    resultLinks.push(link);
  });
}

function executeQuery(term) {
  if (!indexed) return;
  const query = (term || '').trim();
  if (!query) {
    output.innerHTML = '';
    resultLinks = [];
    setStatus('');
    return;
  }
  const results = fuse.search(query);
  renderResults(results.slice(0, 20), query);
}

if (showButton) showButton.addEventListener('click', displaySearch);
if (hideButton) hideButton.addEventListener('click', hideSearch);
if (wrapper) wrapper.addEventListener('click', function (event) { if (event.target === wrapper) hideSearch(); });
if (modal) modal.addEventListener('click', function (event) { event.stopPropagation(); });
if (input) {
  input.addEventListener('input', function () { executeQuery(input.value); });
  input.form.addEventListener('submit', function (event) { event.preventDefault(); });
}

document.addEventListener('keydown', function (event) {
  const mod = event.metaKey || event.ctrlKey;
  if (event.key === '/' && !searchVisible) { event.preventDefault(); displaySearch(); return; }
  if (mod && (event.key === 'k' || event.key === 'K')) { event.preventDefault(); searchVisible ? hideSearch() : displaySearch(); return; }
  if (event.key === 'Escape') { hideSearch(); return; }
  if (!searchVisible) return;
  if (event.key === 'ArrowDown') { event.preventDefault(); moveFocus(1); return; }
  if (event.key === 'ArrowUp') { event.preventDefault(); moveFocus(-1); return; }
  if (event.key === 'Tab') { trapFocus(event); }
});
