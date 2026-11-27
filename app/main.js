// DealHound's wiring: hash routes, the controls, and the render loop.
//
//   #/                 the board, with search and filters
//   #/deal/<id>        one deal, with its evidence
//
// Filter state lives in the hash (#/?q=...&cat=...), so a filtered view is a
// shareable link. window.__shotReady is false while a page renders and true
// once it is on screen, so a screenshot script knows when to capture.

import { CATEGORIES, STORES, deals } from "./deals.js";
import { checkTime, percentOff, saved } from "./format.js";
import { SORTS, applyFilters, defaultFilters, filtersFromHash, filtersToHash } from "./filters.js";
import { board, detail, missing } from "./views.js";

const app = document.getElementById("app");
const search = document.getElementById("search");
const category = document.getElementById("category");
const store = document.getElementById("store");
const minOff = document.getElementById("min-off");
const sort = document.getElementById("sort");
const totalSavings = document.getElementById("total-savings");

const allSavings = deals.reduce((sum, d) => sum + saved(d), 0);
totalSavings.textContent = `$${allSavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
document.getElementById("stat-deals").textContent = String(deals.length);
document.getElementById("stat-stores").textContent = String(new Set(deals.map((d) => d.store)).size);
document.getElementById("stat-newlows").textContent = String(deals.filter((d) => d.verdict === "new-low").length);

for (const c of CATEGORIES) {
  const o = document.createElement("option");
  o.value = c;
  o.textContent = c;
  category.appendChild(o);
}
for (const s of STORES) {
  const o = document.createElement("option");
  o.value = s;
  o.textContent = s;
  store.appendChild(o);
}
for (const [key, s] of Object.entries(SORTS)) {
  const o = document.createElement("option");
  o.value = key;
  o.textContent = s.label;
  sort.appendChild(o);
}
document.getElementById("checked-note").textContent = `All ${deals.length} prices checked ${checkTime(deals[0].checked)}.`;

function readControls() {
  return {
    q: search.value,
    category: category.value,
    store: store.value,
    minOff: Number(minOff.value),
    sort: sort.value,
  };
}

function writeControls(f) {
  search.value = f.q;
  category.value = CATEGORIES.includes(f.category) ? f.category : "All";
  store.value = STORES.includes(f.store) ? f.store : "All";
  minOff.value = String([0, 20, 30, 40, 50].includes(f.minOff) ? f.minOff : 0);
  sort.value = SORTS[f.sort] ? f.sort : "discount";
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : "Not found"} | DealHound`;
    if (found) {
      const same = deals.filter((d) => d.title === found.title);
      app.innerHTML = detail(found, same);
    } else {
      app.innerHTML = missing();
    }
  } else {
    const f = filtersFromHash(location.hash);
    writeControls(f);
    document.title = "DealHound — Black Friday Deal Finder";
    const shown = applyFilters(deals, f, percentOff, saved);
    app.innerHTML = board(shown, deals.length, { ...f, sortLabel: SORTS[f.sort]?.label ?? SORTS.discount.label });
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function pushFilters() {
  const next = filtersToHash(readControls());
  if (next !== location.hash) history.replaceState(null, "", next);
  render();
}

for (const el of [search, category, store, minOff, sort]) {
  el.addEventListener("input", pushFilters);
}

window.addEventListener("hashchange", render);
render();
