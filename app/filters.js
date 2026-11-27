// DealHound's search, filter and sort logic. Pure functions over the deal
// list: given the current filter state they return the deals to show, in the
// order the shopper asked for. No DOM here, so the rules are easy to test.

export const SORTS = {
  discount: { label: "Biggest discount first", key: "discount" },
  saving: { label: "Biggest saving ($) first", key: "saving" },
  price: { label: "Lowest price first", key: "price" },
  newlow: { label: "New lows first", key: "newlow" },
};

export function defaultFilters() {
  return { q: "", category: "All", store: "All", minOff: 0, sort: "discount" };
}

export function applyFilters(deals, f, percentOff, saved) {
  const q = f.q.trim().toLowerCase();
  const shown = deals.filter((d) => {
    if (q !== "" && !`${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)) return false;
    if (f.category !== "All" && d.category !== f.category) return false;
    if (f.store !== "All" && d.store !== f.store) return false;
    if (percentOff(d) < f.minOff) return false;
    return true;
  });
  const rank = { "new-low": 0, strong: 1, routine: 2 };
  const by = {
    discount: (a, b) => percentOff(b) - percentOff(a) || saved(b) - saved(a),
    saving: (a, b) => saved(b) - saved(a) || percentOff(b) - percentOff(a),
    price: (a, b) => a.price - b.price,
    newlow: (a, b) => rank[a.verdict] - rank[b.verdict] || percentOff(b) - percentOff(a),
  };
  return shown.sort(by[f.sort] ?? by.discount);
}

// Read filter state out of the location hash (#/?q=airpods&cat=Audio...), so a
// filtered view is a link you can share and a screenshot can open directly.
export function filtersFromHash(hash) {
  const f = defaultFilters();
  const query = hash.split("?")[1] ?? "";
  for (const [k, v] of new URLSearchParams(query)) {
    const value = decodeURIComponent(v);
    if (k === "q") f.q = value;
    if (k === "cat") f.category = value;
    if (k === "store") f.store = value;
    if (k === "min") f.minOff = Number(value) || 0;
    if (k === "sort" && SORTS[value]) f.sort = value;
  }
  return f;
}

export function filtersToHash(f) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.category !== "All") p.set("cat", f.category);
  if (f.store !== "All") p.set("store", f.store);
  if (f.minOff > 0) p.set("min", String(f.minOff));
  if (f.sort !== "discount") p.set("sort", f.sort);
  const s = p.toString();
  return s ? `#/?${s}` : "#/";
}
