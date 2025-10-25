import * as params from '@params';

var fuse;
var showButton = document.getElementById("search-button");
var showButtonMobile = document.getElementById("search-button-mobile");
var hideButton = document.getElementById("close-search-button");
var wrapper = document.getElementById("search-wrapper");
var modal = document.getElementById("search-modal");
var input = document.getElementById("search-query");
var output = document.getElementById("search-results");
var first = output.firstChild;
var last = output.lastChild;
var searchVisible = false;
var indexed = false;
var hasResults = false;


// Listen for events
showButton? showButton.addEventListener("click", displaySearch) : null;
showButtonMobile? showButtonMobile.addEventListener("click", displaySearch) : null;
hideButton.addEventListener("click", hideSearch);
wrapper.addEventListener("click", hideSearch);
modal.addEventListener("click", function (event) {
  event.stopPropagation();
  event.stopImmediatePropagation();
  return false;
});
document.addEventListener("keydown", function (event) {
  // Forward slash to open search wrapper
  if (event.key == "/") {
    if (!searchVisible) {
      event.preventDefault();
      displaySearch();
    }
  }

  // Esc to close search wrapper
  if (event.key == "Escape") {
    hideSearch();
  }

  // Down arrow to move down results list
  if (event.key == "ArrowDown") {
    if (searchVisible && hasResults) {
      event.preventDefault();
      if (document.activeElement == input) {
        first.focus();
      } else if (document.activeElement == last) {
        last.focus();
      } else {
        document.activeElement.parentElement.nextSibling.firstElementChild.focus();
      }
    }
  }

  // Up arrow to move up results list
  if (event.key == "ArrowUp") {
    if (searchVisible && hasResults) {
      event.preventDefault();
      if (document.activeElement == input) {
        input.focus();
      } else if (document.activeElement == first) {
        input.focus();
      } else {
        document.activeElement.parentElement.previousSibling.firstElementChild.focus();
      }
    }
  }
});

// Update search on each keypress
input.onkeyup = function (event) {
  executeQuery(this.value);
};

function displaySearch() {
  if (!indexed) {
    buildIndex();
  }
  if (!searchVisible) {
    document.body.style.overflow = "hidden";
    wrapper.style.visibility = "visible";
    input.focus();
    searchVisible = true;
  }
}

function hideSearch() {
  if (searchVisible) {
    document.body.style.overflow = "visible";
    wrapper.style.visibility = "hidden";
    input.value = "";
    output.innerHTML = "";
    document.activeElement.blur();
    searchVisible = false;
  }
}

function fetchJSON(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
      }
    }
  };
  httpRequest.open("GET", path);
  httpRequest.send();
}

function buildIndex() {
  var baseURL = wrapper.getAttribute("data-url");
  baseURL = baseURL.replace(/\/?$/, '/');
  fetchJSON(baseURL + "index.json", function (data) {
    var options = {
      shouldSort: true,
      ignoreLocation: true,
      threshold: 0.0,
      includeMatches: true,
      keys: [
        { name: "title", weight: 0.8 },
        { name: "section", weight: 0.2 },
        { name: "summary", weight: 0.6 },
        { name: "content", weight: 0.4 },
      ],
    };
    if (params.fuseOpts) {
      options = {
          isCaseSensitive: params.fuseOpts.iscasesensitive ?? false,
          includeScore: params.fuseOpts.includescore ?? false,
          includeMatches: params.fuseOpts.includematches ?? false,
          minMatchCharLength: params.fuseOpts.minmatchcharlength ?? 1,
          shouldSort: params.fuseOpts.shouldsort ?? true,
          findAllMatches: params.fuseOpts.findallmatches ?? false,
          location: params.fuseOpts.location ?? 0,
          threshold: params.fuseOpts.threshold ?? 0.4,
          distance: params.fuseOpts.distance ?? 100,
          ignoreLocation: params.fuseOpts.ignorelocation ?? true,
          keys: params.fuseOpts.keys ??
          [
            { name: "title", weight: 0.8 },
            { name: "section", weight: 0.2 },
            { name: "summary", weight: 0.6 },
            { name: "content", weight: 0.4 },
          ],
      }
    }
    fuse = new Fuse(data, options);
    indexed = true;
  });
}

function executeQuery(term) {
  let results = fuse.search(term);
  let resultsHTML = "";

  if (results.length > 0) {
    results.forEach(function (value, key) {
      resultsHTML =
        resultsHTML +
        `<li class="mb-2">
          <a class="search-item-link" href="${value.item.permalink}" tabindex="0">
            <div class="search-item">
              <div class="search-title">${value.item.title}</div>
              <div class="search-summary">${value.item.summary}</div>
            </div>
          </a>
        </li>`;
    });
    hasResults = true;
  } else {
    resultsHTML = "";
    hasResults = false;
  }

  output.innerHTML = resultsHTML;
  if (results.length > 0) {
    first = output.firstChild.firstElementChild;
    last = output.lastChild.firstElementChild;
  }
}
